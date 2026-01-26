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
        if (department) {
             // We need to filter by students of this department
             // Since Result doesn't strict link department, it's better if we fetch student IDs first
             // Optimization: If results have department cache (not current schema), use that.
             // Else:
             const students = await Student.find({ department }).select('_id');
             const studentIds = students.map(s => s._id);
             query.student = { $in: studentIds };
        }
        if (academicYear) query.academicYear = academicYear;

        const isPublished = action === 'publish';
        
        // Update
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
