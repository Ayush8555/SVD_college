import express from 'express';
import {
  getAllStudents,
  getStudentById,
  getStudentByRollNumber,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
} from '../controllers/studentController.js';
import { protect, authorizeDesignation } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/roll/:rollNumber', getStudentByRollNumber);

// Protected routes (Admin only)
router.use(protect); // protect checks for admin role by default in authMiddleware
// router.use(authorize('admin')); // protect already handles this or use authorizeDesignation if needed


router.get('/', getAllStudents);
router.get('/stats/overview', getStudentStats);
router.get('/:id', getStudentById);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
