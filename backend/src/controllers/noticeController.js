import Notice from '../models/Notice.js';
import fs from 'fs';
import path from 'path';

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
export const getNotices = async (req, res) => {
  try {
    let query = { isActive: true };

    // If admin is requesting (based on some query param or if we separate routes), they might want all.
    // For simplicity, let's allow a query param 'all=true' if the user is an admin. 
    // But since this is a public route mostly, let's keep it simple: 
    // Public gets active only. Admin route will get all.
    
    // Actually, let's check req.user to decide? 
    // Or just have a separate route for admin. 
    // Let's implement filtering via query params.
    
    if (req.query.type) {
      query.type = req.query.type;
    }

    const notices = await Notice.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all notices (Admin)
// @route   GET /api/notices/admin
// @access  Private/Admin
export const getAdminNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private/Admin
export const createNotice = async (req, res) => {
  try {
    const { title, content, category, priority, eventDate } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    const notice = await Notice.create({
      title,
      content,
      category,
      priority,
      eventDate,
      imageUrl,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

import { cloudinary } from '../config/cloudinary.js';

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Delete image/file
    if (notice.imageUrl) {
      if (notice.imageUrl.startsWith('/uploads/')) {
        // Delete local file
        const filePath = path.join(process.cwd(), notice.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } else {
        // Delete from Cloudinary
        const parts = notice.imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = `college_result_system/notices/${filename.split('.')[0]}`;
        try {
          // Detect if it was a raw file (PDF) or image based on extension
          const isPdf = filename.toLowerCase().endsWith('.pdf');
          await cloudinary.uploader.destroy(publicId, { resource_type: isPdf ? 'raw' : 'image' });
        } catch (cloudinaryError) {
          console.error('Failed to delete old file from Cloudinary:', cloudinaryError);
        }
      }
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Toggle notice status (Active/Inactive)
// @route   PUT /api/notices/:id/toggle
// @access  Private/Admin
export const toggleNoticeStatus = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    notice.isActive = !notice.isActive;
    await notice.save();

    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Private/Admin
export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    const { title, content, category, priority, eventDate } = req.body;

    // Update text fields
    if (title) notice.title = title;
    if (content) notice.content = content;
    if (category) notice.category = category;
    if (priority) notice.priority = priority;
    if (eventDate) notice.eventDate = eventDate;

    // Handle file update
    if (req.file) {
      // Delete old file
      if (notice.imageUrl) {
        if (notice.imageUrl.startsWith('/uploads/')) {
           // Delete local file
           const oldPath = path.join(process.cwd(), notice.imageUrl);
           if (fs.existsSync(oldPath)) {
             fs.unlinkSync(oldPath);
           }
        } else {
           // Delete from Cloudinary
           const parts = notice.imageUrl.split('/');
           const filename = parts[parts.length - 1];
           const publicId = `college_result_system/notices/${filename.split('.')[0]}`;
           try {
             const isPdf = filename.toLowerCase().endsWith('.pdf');
             await cloudinary.uploader.destroy(publicId, { resource_type: isPdf ? 'raw' : 'image' });
           } catch (cloudinaryError) {
             console.error('Failed to delete old file from Cloudinary:', cloudinaryError);
           }
        }
      }
      
      // Set new Cloudinary URL
      notice.imageUrl = req.file.path;
    }

    await notice.save();

    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

