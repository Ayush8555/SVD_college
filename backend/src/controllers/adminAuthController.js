import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Auth Admin & Get Token
 * @route   POST /api/admin/login
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { employeeId, password } = req.body;

  try {
    // Check if admin exists
    const admin = await Admin.findOne({ employeeId }).select('+password');

    if (!admin) {
      console.log(`Admin Login Failed: Admin not found for ${employeeId}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Admin ID not found.',
      });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Update last login
    admin.lastLogin = Date.now();
    await admin.save();

    // Create Token
    const payload = {
      id: admin._id,
      role: 'admin',
      email: admin.email, // Useful for frontend display
      name: `${admin.firstName} ${admin.lastName}`,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: 'admin',
        designation: admin.designation,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current logged in admin
 * @route   GET /api/admin/me
 * @access  Private
 */
// ...existing code...
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    
    if (!admin) {
        return res.status(404).json({
            success: false,
            message: 'Admin not found'
        });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

/**
 * @desc    Register First Admin (Setup)
 * @route   POST /api/admin/auth/register
 * @access  Public (Only if 0 admins)
 */
export const registerFirstAdmin = async (req, res) => {
    try {
        const count = await Admin.countDocuments();
        if (count > 0) {
             return res.status(403).json({
                success: false,
                message: 'System already setup. Admin registration disabled.'
            });
        }

        const { firstName, lastName, email, password, employeeId } = req.body;

        const admin = await Admin.create({
            firstName,
            lastName,
            email,
            password,
            employeeId,
            role: 'admin',
            designation: 'System Admin'
        });

        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });

         res.status(201).json({
            success: true,
            token,
            admin: {
                 id: admin._id,
                 email: admin.email,
                 role: 'admin'
            }
        });

    } catch (error) {
         res.status(500).json({
            success: false,
            message: 'Setup failed',
            error: error.message
        });
    }
};

/**
 * @desc    Change Admin Password
 * @route   PUT /api/admin/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'New password and confirm password do not match'
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    try {
        // Get admin with password
        const admin = await Admin.findById(req.user.id).select('+password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Verify current password
        const isMatch = await admin.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (pre-save hook will hash it)
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

