import Student from '../models/Student.js';

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

        // Generate password from DOB (YYYYMMDD format)
        const dob = new Date(dateOfBirth);
        const year = dob.getFullYear();
        const month = String(dob.getMonth() + 1).padStart(2, '0');
        const day = String(dob.getDate()).padStart(2, '0');
        const generatedPassword = `${year}${month}${day}`;

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
