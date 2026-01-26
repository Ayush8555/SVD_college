import Result from '../models/Result.js';
import Student from '../models/Student.js';

/**
 * @desc    Check result (Public Access)
 * @route   POST /api/results/check
 * @access  Public
 */
export const checkResult = async (req, res) => {
  const { rollNumber, dateOfBirth, semester } = req.body;

  try {
    // 1. Validate Input
    if (!rollNumber || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Roll Number and Date of Birth',
      });
    }

    // 2. Find Student (to verify DOB)
    const student = await Student.findOne({ 
        rollNumber: rollNumber.toUpperCase() 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // 3. Verify Date of Birth
    const inputDOB = new Date(dateOfBirth).toISOString().split('T')[0];
    const studentDOB = new Date(student.dateOfBirth).toISOString().split('T')[0];

    if (inputDOB !== studentDOB) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Date of Birth',
      });
    }

    // 4. Find Results
    const query = { 
        student: student._id,
        isPublished: true // CRITICAL: Only fetch published results
    };
    
    // Optional: Filter by semester if provided
    if (semester) {
        query.semester = semester;
    }

    const results = await Result.find(query)
        .sort({ semester: -1 }) // Latest result first
        .lean(); // Optimize for read-only

    if (!results || results.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No published results found for this student',
        });
    }

    // 5. Structure Response
    // If specific semester requested, return single object or array
    // Here we return consistent structure
    
    res.status(200).json({
      success: true,
      data: {
          student: {
              name: `${student.firstName} ${student.lastName}`,
              rollNumber: student.rollNumber,
              department: student.department,
              batch: student.batch
          },
          results: results
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
