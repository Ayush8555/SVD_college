import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

/**
 * Middleware to protect routes and ensure user is authenticated
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      // We attach the user object to the request for use in controllers
      req.user = await Admin.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      // Check strictly if the role in token matches 'admin'
      if (decoded.role !== 'admin') {
         return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to restrict access to specific designations
 * Usage: authorize('Principal', 'Exam Controller')
 */
export const authorizeDesignation = (...designations) => {
    return (req, res, next) => {
        if (!designations.includes(req.user.designation)) {
            return res.status(403).json({ 
                success: false, 
                message: `User designation ${req.user.designation} is not authorized to access this route`
            });
        }
        next();
    }
}
// ... (existing code)

/**
 * Middleware to protect routes for STUDENTS
 */
export const protectStudent = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check strictly if the role in token matches 'student'
      if (decoded.role !== 'student') {
          return res.status(403).json({ success: false, message: 'Access denied: Student role required' });
      }

      // Get student from token (exclude password)
      // Dynamic import to avoid circular dependency if any (though unlikely here)
      const Student = (await import('../models/Student.js')).default;
      req.user = await Student.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ success: false, message: 'Not authorized, student not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};
