import express from 'express';
import { check } from 'express-validator';
import { loginAdmin, getMe, registerFirstAdmin, changePassword } from '../controllers/adminAuthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  check('employeeId', 'Admin ID is required').not().isEmpty(),
  check('password', 'Password is required').exists(),
];

// Routes
router.post('/register', registerFirstAdmin);
router.post('/login', loginValidation, loginAdmin);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

export default router;

