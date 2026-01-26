import express from 'express';
import { login, logout, getMe, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/me', getMe);
router.post('/logout', logout);
router.put('/change-password', changePassword);

export default router;
