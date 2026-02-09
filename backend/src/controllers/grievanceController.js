import Grievance from '../models/Grievance.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * @desc    Create a new grievance
 * @route   POST /api/grievances
 * @access  Private (Student)
 */
export const createGrievance = asyncHandler(async (req, res) => {
  const { category, subject, description } = req.body;

  const grievance = await Grievance.create({
    student: req.user._id,
    category,
    subject,
    description
  });

  res.status(201).json({
    success: true,
    message: 'Grievance submitted successfully',
    data: grievance
  });
});

/**
 * @desc    Get my grievances
 * @route   GET /api/grievances/my
 * @access  Private (Student)
 */
export const getMyGrievances = asyncHandler(async (req, res) => {
  const grievances = await Grievance.find({ student: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: grievances.length,
    data: grievances
  });
});

/**
 * @desc    Get all grievance (Admin)
 * @route   GET /api/grievances
 * @access  Private (Admin)
 */
export const getAllGrievances = asyncHandler(async (req, res) => {
    const { status, category } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const grievances = await Grievance.find(query)
      .populate('student', 'firstName lastName rollNumber department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances
    });
});

/**
 * @desc    Get single grievance
 * @route   GET /api/grievances/:id
 * @access  Private (Admin/Student)
 */
export const getGrievanceById = asyncHandler(async (req, res) => {
    const grievance = await Grievance.findById(req.params.id)
        .populate('student', 'firstName lastName rollNumber email phone');

    if (!grievance) {
        res.status(404);
        throw new Error('Grievance not found');
    }

    // Authorization check
    // If student, must be owner
    if (req.user.role !== 'admin' && grievance.student._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this grievance');
    }

    res.status(200).json({
        success: true,
        data: grievance
    });
});

/**
 * @desc    Resolve/Reply to grievance
 * @route   PUT /api/grievances/:id/resolve
 * @access  Private (Admin)
 */
export const resolveGrievance = asyncHandler(async (req, res) => {
    const { status, adminReply } = req.body;

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
        res.status(404);
        throw new Error('Grievance not found');
    }

    grievance.status = status || grievance.status;
    grievance.adminReply = adminReply || grievance.adminReply;
    
    if (status === 'Resolved' || status === 'Rejected') {
        grievance.resolvedAt = Date.now();
        grievance.resolvedBy = req.user._id;
    }

    await grievance.save();

    res.status(200).json({
        success: true,
        message: 'Grievance updated',
        data: grievance
    });
});
