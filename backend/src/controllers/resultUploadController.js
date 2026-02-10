import fs from 'fs';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';

// Metadata keys to ignore when parsing subjects (extended for normalized keys)
const METADATA_KEYS = [
    'rollNumber', 'rollNo', 'roll number', 'id', 'student id', 'dbn', 'college id',
    'semester', 'sem', 'term', 'currentSemester',
    'academicYear', 'year', 'batch', 'session',
    'examType', 'type',
    'studentName', 'name', 'full name', 'fullname', 'candidate name', 'firstName', 'lastName',
    'total', 'cgpa', 'sgpa', 'result', 'status', 'credits', 'percentage', 'grade' 
];

/**
 * @desc    Upload results via JSON (Client-side parsed)
 * @route   POST /api/results/upload/json
 * @access  Private (Admin only)
 */
export const uploadResultsJSON = async (req, res) => {
    try {
        const { results, defaultSemester, defaultExamType, defaultAcademicYear, defaultDepartment } = req.body;

        if (!results || !Array.isArray(results) || results.length === 0) {
            return res.status(400).json({ success: false, message: 'No result data provided' });
        }

        const stats = await processResultData(results, { defaultSemester, defaultExamType, defaultAcademicYear, defaultDepartment });

        res.status(200).json({
            success: true,
            message: `Processed. Added/Updated: ${stats.added}, Failed: ${stats.failed}`,
            data: stats
        });

    } catch (error) {
        console.error('JSON Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Upload multiple results via CSV/Excel (File Upload)
 * @route   POST /api/results/upload
 * @access  Private (Admin only)
 */
export const uploadResults = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  const filePath = req.file.path;

  try {
    // 1. Parse File
    let data;
    if (req.file.mimetype === 'text/csv') {
      data = await parseCSV(filePath);
    } else {
      data = parseExcel(filePath);
    }

    // 2. Process Data
    const stats = await processResultData(data, {});
    
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: `Processed ${data.length} rows. Uploaded: ${stats.added}`,
      data: stats
    });

  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Core Processing Logic
const processResultData = async (data, defaults = {}) => {
    const resultsToInsert = [];
    const errors = [];
    let added = 0;
    let failed = 0;

    for (const [index, row] of data.entries()) {
        const rowNumber = index + 1;
        
        try {
            // Normalize Keys helper
            const getValue = (keys) => {
                for (const k of keys) {
                    // Check exact or fuzzy
                    if (row[k] !== undefined) return row[k];
                    const found = Object.keys(row).find(rk => rk.toLowerCase() === k.toLowerCase());
                    if (found) return row[found];
                }
                return undefined;
            };

            // Detect Fields
            const rollNumber = getValue(['rollNumber', 'Roll Number', 'Roll No', 'ID']) || row['rollNumber']; // Prioritize normalized
            
            if (!rollNumber) {
                throw new Error('Roll Number missing');
            }

            const semester = getValue(['semester', 'Sem', 'Term']) || defaults.defaultSemester || '1';
            const academicYear = getValue(['academicYear', 'Year', 'Batch']) || defaults.defaultAcademicYear || '2024-2025';
            const examType = getValue(['examType', 'Type']) || defaults.defaultExamType || 'Regular';

            // Find Student
            let student = await Student.findOne({ rollNumber: rollNumber.toString().toUpperCase() });
            
            // Auto-create Student if missing (Basic info)
            if (!student) {
                const name = getValue(['studentName', 'Name', 'firstName']) || 'Unknown Student';
                // Simple split logic
                const nameParts = name.toString().split(' ');
                
                try {
                     student = await Student.create({
                        rollNumber: rollNumber.toString().toUpperCase(),
                        firstName: nameParts[0],
                        lastName: nameParts.slice(1).join(' ') || '.',
                        dateOfBirth: new Date('2000-01-01'),
                        password: 'password123', // Default
                        department: defaults.defaultDepartment || 'General',
                        currentSemester: parseInt(semester),
                        gender: 'Male',
                        isVerified: true
                    });
                } catch (err) {
                     // If student creation fails (e.g. duplicate key race condition), try finding again
                     student = await Student.findOne({ rollNumber: rollNumber.toString().toUpperCase() });
                     if (!student) throw new Error(`Student not found and could not be created: ${err.message}`);
                }
            }

            // Check if Result Exists
            let existingResult = await Result.findOne({
                student: student._id,
                semester: parseInt(semester),
                examType: examType
            });

            if (existingResult) {
                // Should we skip or update? 
                // Creating new instance usually means overwrite for this logic
                await Result.findByIdAndDelete(existingResult._id);
            }

            // Extract Subjects
            const subjects = [];
            
            Object.keys(row).forEach(key => {
                // Skip Metadata
                const isMeta = METADATA_KEYS.some(m => {
                     const kLower = key.toLowerCase().trim();
                     const mLower = m.toLowerCase();
                     return kLower === mLower || kLower.startsWith(mLower + ' ') || kLower === mLower + '.'; 
                });
                
                if (isMeta) return;

                // Process Subject
                let val = row[key];
                if (val === undefined || val === null || val === '') return;
                
                // If val is object (already parsed JSON?), handle it? 
                // Assuming flat key-value: "Maths": "90"
                
                let marks = parseInt(String(val).replace('/100', ''));
                if (isNaN(marks)) return; // logic to skip non-marks columns
                
                // Basic Subject Object
                const courseName = key.trim();
                const courseCode = courseName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8) || 'SUB';
                
                subjects.push({
                    courseCode,
                    courseName,
                    credits: 4, // Default
                    marks: { internal: 0, external: marks, total: marks },
                    grade: 'NA',
                    gradePoint: 0,
                    status: marks >= 40 ? 'Pass' : 'Fail'
                });
            });

            if (subjects.length === 0) {
                throw new Error('No valid subject marks found');
            }

            const newResult = new Result({
                student: student._id,
                rollNumber: student.rollNumber,
                semester: parseInt(semester),
                academicYear,
                examType,
                subjects,
                totalCredits: subjects.length * 4,
                creditsEarned: subjects.filter(s => s.status === 'Pass').length * 4,
                sgpa: 0,
                isPublished: false,
                result: subjects.some(s => s.status === 'Fail') ? 'Fail' : 'Pass'
            });

            newResult.calculateSGPA();
            newResult.determineResult(); // Updates 'result' field
            
            resultsToInsert.push(newResult);
            added++;

        } catch (err) {
            failed++;
            errors.push({ 
                row: rowNumber, 
                rollNumber: row.rollNumber || row['Roll Number'], 
                message: err.message,
                isDuplicate: err.message.includes('exists') 
            });
        }
    }

    if (resultsToInsert.length > 0) {
        await Result.insertMany(resultsToInsert);
    }

    return { added, failed, errors };
};


// Helper: Parse CSV
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Helper: Parse Excel
const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
};
