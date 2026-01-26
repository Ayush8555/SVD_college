import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    createCourse, 
    getAllCourses, 
    updateCourse, 
    deleteCourse 
} from '../controllers/courseController.js';

const router = express.Router();

router.route('/')
    .post(protect, createCourse)
    .get(protect, getAllCourses);

router.route('/:id')
    .put(protect, updateCourse)
    .delete(protect, deleteCourse);

export default router;
