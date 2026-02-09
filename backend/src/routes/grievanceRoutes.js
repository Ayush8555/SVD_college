import express from 'express';
import { 
    createGrievance, 
    getMyGrievances, 
    getAllGrievances, 
    getGrievanceById, 
    resolveGrievance 
} from '../controllers/grievanceController.js';
import { protect, protectStudent } from '../middleware/authMiddleware.js';
import { validateGrievance } from '../middleware/validators.js';

const router = express.Router();

// Student Routes
router.post('/', protectStudent, validateGrievance, createGrievance);
router.get('/my', protectStudent, getMyGrievances);

// Admin Routes
router.get('/', protect, getAllGrievances);
router.put('/:id/resolve', protect, resolveGrievance);

// Shared Route (must be last to avoid conflict with /my)
router.get('/:id', protect, getGrievanceById); 

export default router;
