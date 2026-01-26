import Result from '../models/Result.js';
import Student from '../models/Student.js';

// ... (existing imports)

/**
 * @desc    Get Authenticated Student's Results
 * @route   GET /api/results/my
 * @access  Private (Student)
 */
export const getMyResults = async (req, res) => {
    try {
        const studentId = req.user._id;
        
        const results = await Result.find({ 
            student: studentId, 
            isPublished: true 
        })
        .sort({ semester: -1, createdAt: -1 })
        .lean();

        res.json({
            success: true,
            data: {
                student: req.user,
                results
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get Single Result for Logged in Student
 * @route   GET /api/results/my/:id
 * @access  Private (Student)
 */
export const getSingleMyResult = async (req, res) => {
    try {
        const result = await Result.findOne({
            _id: req.params.id,
            student: req.user._id,
            isPublished: true
        }).lean();

        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }

        // Return just the result, frontend can merge with student profile from context or fetch if needed
        // For standalone view, we might want student details too, but context usually has it.
        // Let's return consistent format.
        res.json({
            success: true,
            data: {
                student: req.user,
                result
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get all results (with pagination & filters)
 * @route   GET /api/results
 * @access  Private (Admin)
 */
export const getAllResults = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          rollNumber: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const count = await Result.countDocuments({ ...keyword });
    const results = await Result.find({ ...keyword })
      .populate('student', 'firstName lastName department')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: results, 
        page, 
        pages: Math.ceil(count / pageSize) 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get result by ID
 * @route   GET /api/results/:id
 * @access  Private
 */
export const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
        .populate('student', 'firstName lastName dateOfBirth department batch');

    if (result) {
      res.json({ success: true, data: result });
    } else {
      res.status(404).json({ success: false, message: 'Result not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Delete result
 * @route   DELETE /api/results/:id
 * @access  Private (Admin)
 */
export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (result) {
      await result.deleteOne();
      res.json({ success: true, message: 'Result removed' });
    } else {
      res.status(404).json({ success: false, message: 'Result not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Toggle Publish Status
 * @route   PATCH /api/results/:id/publish
 * @access  Private (Admin)
 */
// ... existing code ...

/**
 * @desc    Get Merit List (Top Rankers)
 * @route   GET /api/admin/results/merit-list
 * @access  Private (Admin)
 */
export const getMeritList = async (req, res) => {
    try {
        const { semester, department, limit = 10, academicYear } = req.query;

        if (!semester) {
            return res.status(400).json({ success: false, message: 'Semester is required' });
        }

        const query = { 
            semester: parseInt(semester),
            isPublished: true 
        };

        if(academicYear) query.academicYear = academicYear;

        // If department is specified, we need to filter students by department
        // Results don't directly have department, so we populate and filter
        // Optimized: Find students of dept first, then results for those students
        
        let studentIds = null;
        if (department) {
             const students = await Student.find({ department }).select('_id');
             studentIds = students.map(s => s._id);
             query.student = { $in: studentIds };
        }

        const results = await Result.find(query)
            .sort({ sgpa: -1 }) // Sort by SGPA desc
            .limit(parseInt(limit))
            .populate('student', 'firstName lastName rollNumber department program')
            .populate('subjects.course', 'maxMarks courseName credits');

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch merit list', error: error.message });
    }
};

/**
 * @desc    Get Result Gazette (Full Batch Result)
 * @route   GET /api/admin/results/gazette
 * @access  Private (Admin)
 */
export const getResultGazette = async (req, res) => {
    try {
        const { semester, department, academicYear } = req.query;
        
        if (!semester) {
             return res.status(400).json({ success: false, message: 'Semester is required' });
        }

        const query = { semester: parseInt(semester), isPublished: true };
        if(academicYear) query.academicYear = academicYear;

        let studentIds = null;
        if (department) {
             const students = await Student.find({ department }).select('_id');
             studentIds = students.map(s => s._id);
             query.student = { $in: studentIds };
        }

        const results = await Result.find(query)
             .populate('student', 'firstName lastName rollNumber department')
             .populate('subjects.course', 'maxMarks courseName credits')
             .sort({ 'student.rollNumber': 1 }); // Sort by Roll Number

        // Manual sort because deep sort isn't always reliable in simple find
        results.sort((a,b) => (a.student?.rollNumber || '').localeCompare(b.student?.rollNumber || ''));

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch gazette', error: error.message });
    }
};
export const togglePublishResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (result) {
      result.isPublished = !result.isPublished;
      if (result.isPublished) {
          result.declaredDate = Date.now();
      }
      const updatedResult = await result.save();
      res.json({ 
          success: true, 
          message: `Result ${updatedResult.isPublished ? 'Published' : 'Unpublished'}`, 
          data: updatedResult 
      });
    } else {
      res.status(404).json({ success: false, message: 'Result not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create manual result
 * @route   POST /api/results/manual
 * @access  Private (Admin)
 */
export const createResult = async (req, res) => {
    try {
        const { rollNumber, semester, academicYear, examType, subjects, dateOfBirth, studentName } = req.body;
        
        // Import Course model to link
        const Course = (await import('../models/Course.js')).default;

        // Find student
        const safeRollNumber = rollNumber.trim().toUpperCase();
        let student = await Student.findOne({ rollNumber: safeRollNumber });
        
        if (!student) {
             if (dateOfBirth) {
                 // Parse Name
                 let fName = 'Student', lName = rollNumber;
                 if (studentName && studentName.trim()) {
                     const parts = studentName.trim().split(' ');
                     fName = parts[0];
                     lName = parts.slice(1).join(' ') || '.';
                 }

                 // Auto-create student
                 student = await Student.create({
                    rollNumber: safeRollNumber,
                    firstName: fName, 
                    lastName: lName,
                    fatherName: 'Not Provided', // Default for auto-creation
                    // email: undefined, // Explicitly removed
                    dateOfBirth: new Date(dateOfBirth),
                    password: dateOfBirth.replaceAll('-', ''), // YYYYMMDD
                    department: 'Science', // Default valid enum
                    currentSemester: semester,
                    gender: 'Male',
                    isVerified: true
                 });
             } else {
                 return res.status(404).json({ success: false, message: 'Student not found. Please provide Date of Birth to auto-register.' });
             }
        }

        // Calculate SGPA/Stats
        let totalCredits = 0;
        let totalGradePoints = 0;
        let totalMarks = 0;
        let maxMarks = 0;
        let failedSubjects = 0;

        const processedSubjects = await Promise.all(subjects.map(async sub => {
            // Calculate total marks
            const internal = parseInt(sub.marks.internal) || 0;
            const external = parseInt(sub.marks.external) || 0;
            const subjectMax = parseInt(sub.marks.maxMarks) || 100; // Use input or default 100
            const total = internal + external;
            
            const status = total >= (subjectMax * 0.33) ? 'Pass' : 'Fail'; // Pass if >= 33% 
            if(status === 'Fail') failedSubjects++;
            
            // Grades/Credits removed per user request
            // We set default credits to 4 just to keep schema happy if required, or 0
            // But user said "no credits", so we assume 0 or dummy.
            // Let's use 0 to be safe, or just ignore.
            
            // Handle missing code safely
            const safeCode = sub.code ? sub.code.toUpperCase() : (sub.name ? sub.name.substring(0,3).toUpperCase() + Math.random().toString().substr(2,3) : 'SUB' + index);
            
            // No course lookup needed for credits as we don't track them visually
            // const finalCredits = 0; 
            // const finalMaxMarks = 100;

            totalMarks += total;
            maxMarks += subjectMax; 

            return {
                courseName: sub.name,
                courseCode: safeCode,
                credits: 0, // Explicitly 0
                marks: { 
                    internal,
                    external,
                    total,
                    maxMarks: subjectMax
                },
                grade: 'NA', // Placeholder
                gradePoint: 0,
                status
            };
        }));

        const sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
        const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;
        
        let resultStatus = 'Pass';
        if (failedSubjects > 0) resultStatus = 'Fail'; // Simplified

        const result = await Result.create({
            student: student._id,
            rollNumber,
            semester,
            academicYear,
            examType,
            subjects: processedSubjects,
            sgpa: parseFloat(sgpa),
            cgpa: parseFloat(sgpa), // Placeholder
            totalCredits,
            creditsEarned: resultStatus === 'Pass' ? totalCredits : 0, // Simplified
            percentage: parseFloat(percentage),
            result: resultStatus,
            isPublished: false 
        });

        res.status(201).json({ success: true, message: 'Result created successfully', data: result });

    } catch (error) {
         console.error(error);
         res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Update result
 * @route   PUT /api/results/:id
 * @access  Private (Admin)
 */
export const updateResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Result not found' });
        }

        // For simplicity, we might just update specific fields or logic similar to create
        // Here allowing partial updates
        Object.assign(result, req.body);
        const updatedResult = await result.save();
        
        res.json({ success: true, message: 'Result updated', data: updatedResult });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
}

/**
 * @desc    Get System Stats
 * @route   GET /api/results/stats/overview
 * @access  Private (Admin)
 */
export const getResultStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalResults = await Result.countDocuments();
        const publishedResults = await Result.countDocuments({ isPublished: true });
        const pendingResults = totalResults - publishedResults;

        res.json({
            success: true,
            data: {
                totalStudents,
                totalResults,
                publishedResults,
                pendingResults
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Stats error' });
    }
};

/**
 * @desc    Get published results
 * @route   GET /api/admin/results/published
 * @access  Private (Admin)
 */
export const getPublishedResults = async (req, res) => {
    try {
        const { semester, department, academicYear } = req.query;
        
        let query = { isPublished: true };
        if (semester) query.semester = semester;
        if (academicYear) query.academicYear = academicYear;
        
        const results = await Result.find(query)
            .populate('student', 'firstName lastName rollNumber department program')
            .sort({ declaredDate: -1 });

        // Filter by department if provided
        let filteredResults = results;
        if (department) {
            filteredResults = results.filter(r => r.student?.department === department);
        }

        res.json({
            success: true,
            count: filteredResults.length,
            data: filteredResults
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get unpublished results
 * @route   GET /api/admin/results/unpublished
 * @access  Private (Admin)
 */
export const getUnpublishedResults = async (req, res) => {
    try {
        const { semester, department, academicYear } = req.query;
        
        let query = { isPublished: false };
        if (semester) query.semester = semester;
        if (academicYear) query.academicYear = academicYear;
        
        const results = await Result.find(query)
            .populate('student', 'firstName lastName rollNumber department program')
            .sort({ createdAt: -1 });

        // Filter by department if provided
        let filteredResults = results;
        if (department) {
            filteredResults = results.filter(r => r.student?.department === department);
        }

        res.json({
            success: true,
            count: filteredResults.length,
            data: filteredResults
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Bulk Publish/Unpublish Results
 * @route   POST /api/admin/results/publish/bulk
 * @access  Private (Admin)
 */
export const bulkPublishResults = async (req, res) => {
    try {
        const { semester, department, academicYear, action } = req.body;

        if (!semester || !action) {
            return res.status(400).json({ success: false, message: 'Semester and Action are required' });
        }

        const query = { semester: parseInt(semester) };

        // Handle Department Filter
        if (department) {
             const Student = (await import('../models/Student.js')).default;
             const students = await Student.find({ department }).select('_id');
             const studentIds = students.map(s => s._id);
             query.student = { $in: studentIds };
        }
        
        if (academicYear) query.academicYear = academicYear;

        const isPublished = action === 'publish';
        
        const update = { 
            isPublished: isPublished,
            declaredDate: isPublished ? Date.now() : undefined
        };

        const result = await Result.updateMany(query, { $set: update });

        res.status(200).json({
            success: true,
            message: `Successfully ${isPublished ? 'Published' : 'Unpublished'} ${result.modifiedCount} results`,
            count: result.modifiedCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get Recent Admin Activity (Grouped by publishing events)
 * @route   GET /api/admin/results/activity
 * @access  Private (Admin)
 */
export const getAdminActivity = async (req, res) => {
    try {
        const activity = await Result.aggregate([
            { $match: { isPublished: true } },
            { $sort: { declaredDate: -1 } },
            { $limit: 200 }, // Optimization scope
            {
                $lookup: {
                    from: 'students',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            {
                $group: {
                    _id: {
                        semester: '$semester',
                        department: '$studentInfo.department',
                        academicYear: '$academicYear',
                        // Rounding to nearest hour/minute could be complex, assuming published in batches roughly same time
                        // Grouping by unique day/hour might be better, but for now exact same batch params is good.
                    },
                    timestamp: { $max: '$declaredDate' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { timestamp: -1 } },
            { $limit: 5 }
        ]);

        // Format for frontend
        const formattedActivity = activity.map(item => ({
            id: `${item._id.department}-${item._id.semester}-${item.timestamp}`,
            description: `Published ${item._id.department || 'General'} Results`,
            meta: `Semester ${item._id.semester} • ${item.count} Students`,
            timestamp: item.timestamp,
            type: 'publish'
        }));

        res.json({ success: true, data: formattedActivity });
    } catch (error) {
        console.error('Activity Fetch Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch activity' });
    }
};
