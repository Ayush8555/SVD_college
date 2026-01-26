import express from 'express';
import { signupStudent, loginStudent, verifyOTP, getStudentProfile } from '../controllers/studentAuthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupStudent);
router.post('/login', loginStudent);
router.post('/verify', verifyOTP);
router.get('/me', protect, getStudentProfile);

export default router;
