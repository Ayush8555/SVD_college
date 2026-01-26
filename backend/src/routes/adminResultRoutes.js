import express from 'express';
import { protect, authorizeDesignation } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadResults } from '../controllers/resultUploadController.js';
// ...existing code...
import { 
    getAllResults, 
    getResultById, 
    deleteResult, 
    togglePublishResult,
    createResult,
    updateResult,
    getResultStats,
    getPublishedResults,
    getUnpublishedResults,
    getMeritList,
    getResultGazette,
    bulkPublishResults,
    getAdminActivity
} from '../controllers/resultController.js';

const router = express.Router();

// Stats Route (Place before :id routes)
router.get('/stats', protect, getResultStats);
router.get('/activity', protect, getAdminActivity);

// Reports Routes
router.get('/merit-list', protect, getMeritList);
router.get('/gazette', protect, getResultGazette);

// Publishing Management Routes
router.get('/published', protect, getPublishedResults);
router.get('/unpublished', protect, getUnpublishedResults);

// Bulk Actions
router.post('/publish/bulk', protect, authorizeDesignation('Exam Controller', 'System Admin', 'Principal'), bulkPublishResults);

// Router Config
// ... 

// Admin Routes (Upload/Create)
router.post(
    '/upload', 
    protect, 
    authorizeDesignation('Exam Controller', 'System Admin', 'Principal'), 
    upload.single('file'), 
    uploadResults
);

router.post(
    '/create',
    protect,
    authorizeDesignation('Exam Controller', 'System Admin', 'Principal'),
    createResult
);

// Admin Routes (Management)
router.get('/', protect, getAllResults);
router.get('/:id', protect, getResultById);
router.put('/:id', protect, authorizeDesignation('Exam Controller', 'System Admin', 'Principal'), updateResult); // Edit
router.delete('/:id', protect, authorizeDesignation('Exam Controller', 'System Admin', 'Principal'), deleteResult);
router.patch('/:id/publish', protect, authorizeDesignation('Exam Controller', 'System Admin', 'Principal'), togglePublishResult);

export default router;
