import express from 'express';
import { protect, protectStudent, authorizeDesignation as authorize } from '../middleware/authMiddleware.js';
import {
  createFeeStructure,
  getFeeStructures,
  assignFeeToStudents,
  getMyDues,
  getStudentDuesAdmin,
  recordPayment,
  deleteFeeStructure
} from '../controllers/feeController.js';

const router = express.Router();

// Fee Structure Routes
// Fee Structure Routes
router.route('/structure')
  .post(protect, authorize('Admin', 'Accountant', 'Principal'), createFeeStructure)
  .get(protect, getFeeStructures);

router.route('/structure/:id')
  .delete(protect, authorize('Admin', 'Principal'), deleteFeeStructure);

// Assignment Route
router.post('/assign', protect, authorize('Admin', 'Accountant', 'Principal'), assignFeeToStudents);

// Student Routes
router.get('/my-dues', protectStudent, getMyDues);

// Admin Student Fee Routes
router.get('/student/:id', protect, authorize('Admin', 'Accountant', 'Principal'), getStudentDuesAdmin);
router.post('/pay', protect, authorize('Admin', 'Accountant', 'Principal'), recordPayment);

export default router;
