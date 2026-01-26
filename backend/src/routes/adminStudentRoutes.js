import express from 'express';
import { protect, authorizeDesignation } from '../middleware/authMiddleware.js';
import { 
    registerStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    promoteStudents
} from '../controllers/studentController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorizeDesignation('Principal', 'System Admin', 'Exam Controller'));

// Student Management Routes
router.post('/register', registerStudent);
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.post('/promote', promoteStudents); // Bulk Promotion

export default router;
