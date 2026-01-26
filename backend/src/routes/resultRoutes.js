import express from 'express';
import { checkResult } from '../controllers/publicResultController.js';
import { getMyResults, getSingleMyResult } from '../controllers/resultController.js'; 
import { protectStudent } from '../middleware/authMiddleware.js';
import { strictResultLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

/**
 * @route   GET /api/results/my
 * @desc    Get logged in student's results
 * @access  Private (Student)
 */
router.get('/my', protectStudent, getMyResults);

/**
 * @route   GET /api/results/my/:id
 * @desc    Get specific result for logged in student
 * @access  Private (Student)
 */
router.get('/my/:id', protectStudent, getSingleMyResult);

/**
 * @route   POST /api/results/check
 * @desc    Public endpoint to check results with Roll No + DOB
 * @access  Public (Rate Limited)
 */
router.post('/check', strictResultLimiter, checkResult);

export default router;
