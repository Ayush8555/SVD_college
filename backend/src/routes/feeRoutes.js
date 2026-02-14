
import express from 'express';
import { protect, protectStudent, authorizeDesignation as authorize } from '../middleware/authMiddleware.js';
import {
  createFeeStructure,
  getFeeStructures,
  deleteFeeStructure,
  assignFeeToStudents,
  getMyDues,
  getStudentDuesAdmin,
  recordPayment,
  studentPayFee,
  createExtensionRequest,
  getExtensionRequests,
  resolveExtensionRequest,
  getFeeAnalysis,
  verifyPayment
} from '../controllers/feeController.js';

import feeUpload from '../middleware/feeUploadMiddleware.js';

const router = express.Router();

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
router.post('/student-pay', protectStudent, feeUpload.single('receipt'), studentPayFee);

// Extension Request Routes (Student)
router.post('/extension-request', protectStudent, createExtensionRequest);

// Extension Request Routes (Admin)
router.get('/extension-requests', protect, authorize('Admin', 'Accountant', 'Principal'), getExtensionRequests);
router.put('/extension-request/:id', protect, authorize('Admin', 'Accountant', 'Principal'), resolveExtensionRequest);

// Admin Student Fee Routes
router.get('/student/:id', protect, authorize('Admin', 'Accountant', 'Principal'), getStudentDuesAdmin);
router.post('/pay', protect, authorize('Admin', 'Accountant', 'Principal'), recordPayment);
router.get('/stats', protect, authorize('Admin', 'Accountant', 'Principal'), getFeeAnalysis);

export default router;
