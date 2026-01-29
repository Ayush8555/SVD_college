import Inquiry from '../models/Inquiry.js';

// @desc    Submit a new inquiry
// @route   POST /api/inquiry
// @access  Public
export const createInquiry = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all inquiries
// @route   GET /api/inquiry
// @access  Private (Admin)
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiry/:id
// @access  Private (Admin)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Pending', 'Contacted', 'Admitted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry status updated',
      data: inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
