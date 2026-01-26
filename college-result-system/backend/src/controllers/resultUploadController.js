import fs from 'fs';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import Course from '../models/Course.js';

/**
 * @desc    Upload multiple results via CSV/Excel
 * @route   POST /api/results/upload
 * @access  Private (Admin only)
 */
// Helper: Find column with fuzzy matching
const findColumn = (row, ...aliases) => {
    const keys = Object.keys(row);
    for (const alias of aliases) {
        // Exact match
        if (row[alias] !== undefined) return row[alias];
        
        // Case insensitive
        const key = keys.find(k => k.toLowerCase() === alias.toLowerCase());
        if (key) return row[key];
        
        // Partial match for some keys (be careful not to overmatch)
        if (alias.length > 3) {
             const partialKey = keys.find(k => k.toLowerCase().includes(alias.toLowerCase()));
             if (partialKey) return row[partialKey];
        }
    }
    return undefined;
};

/**
 * @desc    Upload multiple results via CSV/Excel
 * @route   POST /api/results/upload
 * @access  Private (Admin only)
 */
export const uploadResults = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  const resultsToProcess = [];
  const errors = [];
  const filePath = req.file.path;

  try {
    // 1. Parse File
    let data;
    if (req.file.mimetype === 'text/csv') {
      data = await parseCSV(filePath);
    } else {
      data = parseExcel(filePath);
    }

    // 2. Process each row
    for (const [index, row] of data.entries()) {
      const rowNumber = index + 2; 

      try {
        // Smart Column Detection
        const rollNumber = findColumn(row, 'Roll Number', 'Roll No', 'RollNo', 'ID', 'Student ID', 'DBN', 'College ID');
        const semester = findColumn(row, 'Semester', 'Sem', 'Term') || '1'; // Default to Sem 1
        const academicYear = findColumn(row, 'Academic Year', 'Year', 'Batch', 'Session') || '2023-2024';
        const examType = findColumn(row, 'Exam Type', 'Type') || 'Regular';
        
        // Validation: Minimal Required
        if (!rollNumber) {
            throw new Error(`Row ${rowNumber}: Could not detect Roll Number`);
        }

        // Student Detection/Creation
        let student = await Student.findOne({ rollNumber: rollNumber.toString().toUpperCase() });
        
        if (!student) {
            const nameRaw = findColumn(row, 'Student Name', 'Name', 'Full Name', 'Candidate Name') || 'Unknown Student';
            let fName = 'Unknown', lName = 'Student';
            
            if(nameRaw.includes(' ')) {
                const parts = nameRaw.split(' ');
                fName = parts[0];
                lName = parts.slice(1).join(' ');
            } else {
                fName = nameRaw;
            }

            // Fallbacks for missing details
            student = await Student.create({
                rollNumber: rollNumber.toString().toUpperCase(),
                firstName: fName,
                lastName: lName,
                // email: undefined, // Explicitly removed
                dateOfBirth: new Date('2000-01-01'), // Default DOB
                password: 'password123', // Default Password
                department: 'General', 
                currentSemester: parseInt(semester) || 1,
                gender: 'Male',
                isVerified: true
            });
        }

        // Check for duplicate
        const existingResult = await Result.findOne({
            student: student._id,
            semester: semester,
            examType: examType
        });

        if (existingResult) {
            // Option: Skip or Update? Let's Skip with error -> User knows
            // throw new Error(`Result already exists for ${rollNumber}`);
            // Actually, let's update if exists? For now, simple error.
            // errors.push({ row: rowNumber, error: 'Result already exists' });
            // continue;
             // Let's delete old and replace? Or just Error.
             // Given user request "take anytype", let's be forgiving.
             // If exists, we will UPDATE it (Delete old -> Create new is easiest fallback)
             await Result.findByIdAndDelete(existingResult._id);
        }

        // Dynamic Subject Parsing
        // Strategy: Iterate keys, ignore known metadata keys, treat rest as subjects if numeric
        const metadataKeys = [
            'Roll Number', 'Roll No', 'RollNo', 'ID', 'Student ID', 'DBN',
            'Semester', 'Sem', 'Term',
            'Academic Year', 'Year', 'Batch', 'Session',
            'Exam Type', 'Type',
            'Student Name', 'Name', 'Full Name', 'School Name', 'D.O.B', 'DOB'
        ];

        const rowKeys = Object.keys(row);
        const subjects = [];

        rowKeys.forEach(key => {
            // Check if key is metadata
            // Improved detection: Check if exact match OR starts with metakey (e.g., "Semester 5")
            const isMeta = metadataKeys.some(m => {
                const kLower = key.toLowerCase().trim();
                const mLower = m.toLowerCase();
                return kLower === mLower || kLower.startsWith(mLower + ' ') || kLower === mLower + '.' || kLower.includes(mLower);
            });
            
            if(isMeta) return;

            // Check if value is numeric marks
            let value = row[key];
            if(value === undefined || value === null || value === '') return; // Skip empty
            
            // Clean value (remove /100 etc if present)
            if(typeof value === 'string') value = value.replace('/100', '').trim();
            
            const marks = parseInt(value);
            
            // Allow 0 marks, but skip invalid numbers. Also check if key looks like subject code/name
            if (!isNaN(marks)) {
                 // Determine grade for this specific subject
                let grade = 'F', gradePoint = 0, status = 'Fail';
                const total = marks; 
                
                // Simple Grading Logic
                // Simple Grading Logic (DISABLED per user request)
                /*
                if (total >= 90) { grade = 'O'; gradePoint = 10; status = 'Pass'; }
                else if (total >= 80) { grade = 'A+'; gradePoint = 9; status = 'Pass'; }
                else if (total >= 70) { grade = 'A'; gradePoint = 8; status = 'Pass'; }
                else if (total >= 60) { grade = 'B+'; gradePoint = 7; status = 'Pass'; }
                else if (total >= 50) { grade = 'B'; gradePoint = 6; status = 'Pass'; }
                else if (total >= 40) { grade = 'P'; gradePoint = 4; status = 'Pass'; }
                */
               
                // Default fallback
                grade = 'NA';
                gradePoint = 0;
                status = total >= 40 ? 'Pass' : 'Fail'; // Keep basic pass/fail for now
                
                // Clean course name/code
                // Use the header as the course name
                const courseName = key.trim();
                // Generate a code: First 3 letters + last 3 chars of name + random if needed? 
                // Better: Just use first 8 chars alphanumeric capitalized
                const courseCode = courseName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8) || 'SUB101';

                subjects.push({
                    courseCode: courseCode, 
                    courseName: courseName,
                    credits: 4, 
                    marks: { internal: 0, external: total, total: total },
                    grade,
                    gradePoint,
                    status
                });
            }
        });

        if(subjects.length === 0) {
             throw new Error(`Row ${rowNumber}: No valid subject marks found. Columns detected: ${rowKeys.join(', ')}`);
        }

        // Create Result
        const newResult = new Result({
            student: student._id,
            rollNumber: student.rollNumber,
            semester: parseInt(semester) || 1,
            academicYear: academicYear,
            examType: examType,
            subjects: subjects,
            isPublished: false, // Default to Draft
            totalCredits: subjects.length * 4,
            creditsEarned: subjects.filter(s => s.status === 'Pass').length * 4,
            sgpa: 0 // Will calc
        });

        newResult.calculateSGPA();
        newResult.determineResult();

        resultsToProcess.push(newResult);

      } catch (err) {
        errors.push({ row: rowNumber, error: err.message });
      }
    }

    if (resultsToProcess.length > 0) {
        await Result.insertMany(resultsToProcess);
    }
    
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: `Processed ${data.length} rows. Uploaded: ${resultsToProcess.length}`,
      uploaded: resultsToProcess.length,
      errors: errors
    });

  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
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
