import Inquiry from '../models/Inquiry.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Submit a new inquiry
// @route   POST /api/inquiry
// @access  Public
export const createInquiry = asyncHandler(async (req, res) => {
  const { 
    name, email, phone, fatherName, gender, dateOfBirth,
    address, city, state, pincode,
    courseOfInterest, previousQualification, previousMarks, message 
  } = req.body;

  const newInquiry = new Inquiry({
    name,
    email,
    phone,
    fatherName,
    gender,
    dateOfBirth,
    address,
    city,
    state,
    pincode,
    courseOfInterest,
    previousQualification,
    previousMarks,
    message
  });

  await newInquiry.save();

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully',
    data: newInquiry
  });
});

// @desc    Get all inquiries
// @route   GET /api/inquiry
// @access  Private (Admin)
export const getAllInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: inquiries.length,
    data: inquiries
  });
});

// @desc    Update inquiry status
// @route   PUT /api/inquiry/:id
// @access  Private (Admin)
export const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const validStatuses = ['Pending', 'Contacted', 'Admitted', 'Rejected'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const inquiry = await Inquiry.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  res.status(200).json({
    success: true,
    message: 'Inquiry status updated',
    data: inquiry
  });
});

