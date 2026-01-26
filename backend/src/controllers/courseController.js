import Course from '../models/Course.js';

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private (Admin)
 */
export const createCourse = async (req, res) => {
    try {
        const { courseCode, courseName, department, semester, credits, maxMarks, passingMarks, type } = req.body;
        
        const courseExists = await Course.findOne({ courseCode: courseCode.toUpperCase() });
        if (courseExists) {
            return res.status(400).json({ success: false, message: 'Course with this code already exists' });
        }

        const course = await Course.create({
            courseCode: courseCode.toUpperCase(),
            courseName,
            department,
            semester,
            credits,
            maxMarks: maxMarks || 100,
            passingMarks: passingMarks || 33,
            type 
        });

        res.status(201).json({ success: true, message: 'Course created successfully', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get all courses with filtering
 * @route   GET /api/courses
 * @access  Private (Admin)
 */
export const getAllCourses = async (req, res) => {
    try {
        const { department, semester, keyword } = req.query;
        let query = {};

        if (department) query.department = department;
        if (semester) query.semester = semester;
        if (keyword) {
             query.$or = [
                 { courseCode: { $regex: keyword, $options: 'i' } },
                 { courseName: { $regex: keyword, $options: 'i' } }
             ];
        }

        const courses = await Course.find(query).sort({ department: 1, semester: 1, courseCode: 1 });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private (Admin)
 */
export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
             return res.status(404).json({ success: false, message: 'Course not found' });
        }

        Object.assign(course, req.body);
        if(req.body.courseCode) course.courseCode = req.body.courseCode.toUpperCase();
        
        await course.save();
        res.status(200).json({ success: true, message: 'Course updated', data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private (Admin)
 */
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
             return res.status(404).json({ success: false, message: 'Course not found' });
        }

        await course.deleteOne();
        res.status(200).json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
