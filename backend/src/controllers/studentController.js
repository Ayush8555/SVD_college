import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get all students (with filters)
 * @route   GET /api/students
 * @access  Private (Admin)
 */
export const getAllStudents = async (req, res) => {
  try {
    const { department, batch, semester, status, search } = req.query;

    // Build query
    const query = {};

    if (department) query.department = department;
    if (batch) query.batch = batch;
    if (semester) query.currentSemester = parseInt(semester);
    if (status) query.status = status;

    // Search by name or roll number
    if (search) {
      query.$or = [
        { rollNumber: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query).sort({ rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 * @access  Private
 */
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message,
    });
  }
};

/**
 * @desc    Register a new student (Admin only)
 * @route   POST /api/admin/students/register
 * @access  Private/Admin
 */
export const registerStudent = async (req, res) => {
    try {
        const { 
            rollNumber, 
            email, 
            dateOfBirth, 
            firstName, 
            lastName,
            fatherName,
            motherName,
            category,
            gender,
            department,
            program,
            currentSemester,
            batch,
            phone
        } = req.body;

        // Sanitize optional unique fields
        const sanitize = (val) => (val && typeof val === 'string' && val.trim().length > 0 ? val.trim() : undefined);
        const safeEmail = sanitize(email);
        const safePhone = sanitize(phone);

        // Validation
        if (!rollNumber || !dateOfBirth || !firstName || !lastName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields: rollNumber, dateOfBirth, names' 
            });
        }

        // Check if student already exists
        const duplicateCheck = [{ rollNumber: rollNumber.toUpperCase() }];
        if (safeEmail) duplicateCheck.push({ email: safeEmail });
        
        const existingStudent = await Student.findOne({ 
            $or: duplicateCheck 
        });

        if (existingStudent) {
            return res.status(400).json({ 
                success: false, 
                message: existingStudent.rollNumber === rollNumber.toUpperCase() 
                    ? 'Roll number already exists' 
                    : 'Email already registered' 
            });
        }

        // Generate password from DOB (YYYY/MM/DD format)
        const dob = new Date(dateOfBirth);
        const year = dob.getFullYear();
        const month = String(dob.getMonth() + 1).padStart(2, '0');
        const day = String(dob.getDate()).padStart(2, '0');
        const generatedPassword = `${year}/${month}/${day}`;

        // Create student
        const student = await Student.create({
            rollNumber: rollNumber.toUpperCase(),
            email: safeEmail,
            dateOfBirth,
            firstName,
            lastName,
            fatherName,
            motherName,
            category: category || 'General',
            gender: gender || 'Male',
            department: department || 'General',
            program: program || 'BA',
            currentSemester: currentSemester || 1,
            batch: batch || `${new Date().getFullYear()}-${new Date().getFullYear() + 3}`,
            phone: safePhone,
            password: generatedPassword,
            isVerified: true // Admin-created students are auto-verified
        });

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: {
                _id: student._id,
                rollNumber: student.rollNumber,
                email: student.email,
                firstName: student.firstName,
                lastName: student.lastName,
                department: student.department,
                generatedPassword // Send password in response for admin to share
            }
        });
    } catch (error) {
        console.error('Student registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error registering student' 
        });
    }
};

/**
 * @desc    Get student by roll number
 * @route   GET /api/students/roll/:rollNumber
 * @access  Public (for result checking)
 */
export const getStudentByRollNumber = async (req, res) => {
  try {
    const student = await Student.findOne({
      rollNumber: req.params.rollNumber.toUpperCase(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this roll number',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Private (Admin)
 */
export const createStudent = async (req, res) => {
  try {
    const studentData = req.body;

    // Create student
    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create student',
      error: error.message,
    });
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private (Admin)
 */
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private (Admin)
 */
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message,
    });
  }
};

/**
 * @desc    Get student statistics
 * @route   GET /api/students/stats/overview
 * @access  Private (Admin)
 */
export const getStudentStats = async (req, res) => {
  // ... existing code ...
};

/**
 * @desc    Promote students to next semester
 * @route   POST /api/students/promote
 * @access  Private (Admin)
 */
export const promoteStudents = async (req, res) => {
    try {
        const { department, currentSemester, targetSemester } = req.body;

        if (!department || !currentSemester || !targetSemester) {
            return res.status(400).json({ success: false, message: 'Please provide department, current semester and target semester' });
        }

        const result = await Student.updateMany(
            { department, currentSemester: parseInt(currentSemester) },
            { $set: { currentSemester: parseInt(targetSemester) } }
        );

        res.status(200).json({
            success: true,
            message: `Successfully promoted ${result.modifiedCount} students from Sem ${currentSemester} to Sem ${targetSemester}`,
            count: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Promotion failed', error: error.message });
    }
};
/**
 * @desc    Bulk upload students
 * @route   POST /api/students/bulk
 * @access  Private (Admin)
 */
export const bulkUploadStudents = async (req, res) => {
    try {
        const { students, defaultDepartment, defaultProgram, defaultSemester, defaultAdmissionYear } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ success: false, message: 'No student data provided' });
        }

        const validStudents = [];
        const errors = [];
        const processedRollNumbers = new Set();

        for (const studentData of students) {
            // Basic Validation
            if (!studentData.firstName || !studentData.lastName || !studentData.rollNumber) {
                errors.push({ 
                    rollNumber: studentData.rollNumber || 'Unknown', 
                    message: 'Missing Name or Roll Number' 
                });
                continue;
            }
            
            // Check for duplicates within the file itself
            const upperRoll = studentData.rollNumber.toUpperCase();
            if (processedRollNumbers.has(upperRoll)) {
                 errors.push({ rollNumber: upperRoll, message: 'Duplicate Roll Number in file' });
                 continue;
            }
            processedRollNumbers.add(upperRoll);

            let password = '2000/01/01';
            let dobDate;
             
            if (studentData.dateOfBirth) {
                // Try to parse DOB
                // Handle DD/MM/YYYY or DD-MM-YYYY manually
                let dateStr = String(studentData.dateOfBirth).trim();
                
                // Regex for DD/MM/YYYY or DD-MM-YYYY
                const dmy = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
                
                // Regex for Excel Serial Number (e.g., 38245 or 45201.5)
                const isExcelSerial = /^\d+(\.\d+)?$/.test(dateStr);

                if (dmy) {
                    // dmy[1] = Day, dmy[2] = Month, dmy[3] = Year
                    dobDate = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);
                } else if (isExcelSerial) {
                    // Convert Excel Serial to JS Date
                    // Excel base date: Dec 30, 1899. Unix epoch: Jan 1, 1970
                    // Diff: 25569 days
                    const serial = parseFloat(dateStr);
                    // Adjust for Excel leap year bug (1900 is not leap year but Excel thinks so) - usually negligible for modern dates
                    // Simple conversion: (Serial - 25569) * 86400 * 1000
                    const utc_days = Math.floor(serial - 25569);
                    const utc_value = utc_days * 86400;
                    dobDate = new Date(utc_value * 1000);
                    
                    // Adjust timezone offset if needed, but UTC date usually works. 
                    // However, we want the date part. 
                    // Often Excel dates are local. 
                    // Let's ensure we get the right YYYY-MM-DD
                } else {
                    dobDate = new Date(dateStr);
                }

                if (!isNaN(dobDate.getTime())) {
                     const y = dobDate.getFullYear();
                     const m = String(dobDate.getMonth() + 1).padStart(2, '0');
                     const d = String(dobDate.getDate()).padStart(2, '0');
                     password = `${y}/${m}/${d}`;
                } else {
                    console.log('Invalid DOB parsed:', studentData.dateOfBirth, 'Fallback to default');
                    dobDate = new Date('2000-01-01');
                    password = '2000/01/01';
                }
                console.log(`[DEBUG] Roll: ${studentData.rollNumber}, Raw DOB: ${studentData.dateOfBirth}, Parsed DOB: ${dobDate}, Generated PW: ${password}`);
            } else {
                dobDate = new Date('2000-01-01'); // Default DOB
            }

            validStudents.push({
                rollNumber: upperRoll,
                enrollmentNumber: studentData.enrollmentNumber,
                firstName: studentData.firstName,
                middleName: studentData.middleName,
                lastName: studentData.lastName,
                fatherName: studentData.fatherName,
                motherName: studentData.motherName,
                email: studentData.email,
                phone: studentData.phone,
                gender: studentData.gender || 'Male',
                category: studentData.category || 'General',
                
                // Academic Defaults
                department: studentData.department || defaultDepartment,
                program: (function() {
                    const rawProg = studentData.program || defaultProgram || 'BA';
                    // Map common frontend values to Schema Enum
                    const map = {
                        'B.T.C': 'D.El.Ed.(BTC)',
                        'BTC': 'D.El.Ed.(BTC)',
                        'D.El.Ed': 'D.El.Ed.(BTC)',
                        'B.A': 'BA',
                        'BA': 'BA',
                        'B.Sc': 'B.Sc',
                        'B.Com': 'B.Com',
                        'LL.B': 'LL.B',
                        'LLB': 'LL.B',
                        'B.Ed': 'B.Ed',
                        'M.A': 'M.A',
                        'M.Sc': 'M.Sc'
                    };
                    return map[rawProg] || rawProg;
                })(),
                currentSemester: studentData.currentSemester || defaultSemester || 1,
                admissionYear: studentData.admissionYear || defaultAdmissionYear || new Date().getFullYear(),
                batch: studentData.batch || `${new Date().getFullYear()}-${new Date().getFullYear() + 3}`,
                
                dateOfBirth: dobDate,
                password: password, // Plain text — pre('save') hook in Student model will hash via bcrypt
                isVerified: true
            });
        }

        if (validStudents.length === 0) {
             return res.status(400).json({ success: false, message: 'No valid students found to upload', errors });
        }

        // Bulk Insert
        // Using create loop instead of insertMany for better error handling and reliability
        let insertedCount = 0;
        let skippedCount = 0;
        
        for (const student of validStudents) {
            try {
                // Ensure unique roll number check happens at DB level
                await Student.create(student);
                insertedCount++;
            } catch (error) {
                let msg = 'Database Error';
                let isDuplicate = false;
                
                if (error.code === 11000) {
                    // Identify which field is duplicate
                    const field = Object.keys(error.keyPattern)[0];
                    const value = error.keyValue[field];
                    msg = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists: ${value}`;
                    isDuplicate = true;
                    skippedCount++;
                }
                else if (error.errors) msg = Object.values(error.errors).map(e => e.message).join(', ');
                
                errors.push({ 
                    rollNumber: student.rollNumber, 
                    message: msg,
                    isDuplicate
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Processed ${students.length} entries. Added: ${insertedCount}. Skipped: ${skippedCount}. Failed: ${students.length - insertedCount - skippedCount}`,
            data: {
                added: insertedCount,
                skipped: skippedCount,
                failed: students.length - insertedCount - skippedCount,
                errors: errors.slice(0, 50) 
            }
        });

    } catch (error) {
        console.error('Bulk Upload Error:', error);
        res.status(500).json({ success: false, message: 'Bulk Upload Failed', error: error.message });
    }
};
