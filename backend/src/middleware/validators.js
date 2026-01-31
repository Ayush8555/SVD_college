/**
 * Request Validators
 * Common validation middleware for API routes using express-validator.
 */

import { body, param, validationResult } from 'express-validator';

/**
 * Validation Error Handler
 * Use after validation rules to check for errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Inquiry Form Validation Rules
 */
export const validateInquiry = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian mobile number'),
  
  body('fatherName')
    .trim()
    .notEmpty().withMessage("Father's name is required"),
  
  body('gender')
    .trim()
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender value'),
  
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format'),
  
  body('courseOfInterest')
    .trim()
    .notEmpty().withMessage('Course of interest is required'),
  
  body('previousQualification')
    .trim()
    .notEmpty().withMessage('Previous qualification is required'),
  
  handleValidationErrors
];

/**
 * Login Validation Rules  
 */
export const validateLogin = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email'),
  
  body('rollNumber')
    .optional()
    .trim()
    .isLength({ min: 4 }).withMessage('Roll number must be at least 4 characters'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

/**
 * MongoDB ObjectId Validation
 */
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

/**
 * Notice Creation Validation
 */
export const validateNotice = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title too long'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required'),
  
  body('category')
    .optional()
    .isIn(['Academic', 'Infrastructure', 'Admissions', 'Sports', 'Event', 'Urgent', 'General'])
    .withMessage('Invalid category'),
  
  handleValidationErrors
];

/**
 * Grievance Validation
 */
export const validateGrievance = [
  body('category')
    .trim()
    .isIn(['Academic', 'Fee', 'Result', 'Infrastructure', 'Other'])
    .withMessage('Invalid category'),
  
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 100 }).withMessage('Subject too long (max 100 chars)'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description too long (max 1000 chars)'),

  handleValidationErrors
];
