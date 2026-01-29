import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getVerificationQueue,
  getDocumentStats,
  decryptDocument,
  verifyDocument,
  rejectDocument,
  getDocumentLogs,
  getAllLogs,
  deleteDocument
} from '../controllers/adminDocumentController.js';

const router = express.Router();

/**
 * Admin Document Routes
 * All routes require admin authentication
 */

// Apply admin protection to all routes
router.use(protect);

// Get document statistics
router.get('/stats', getDocumentStats);

// Get verification queue
router.get('/queue', getVerificationQueue);

// Get all audit logs
router.get('/logs', getAllLogs);

// Get specific document's access logs
router.get('/:id/logs', getDocumentLogs);

// Decrypt document for preview (logged action)
router.get('/:id/decrypt', decryptDocument);

// Verify (approve) document
router.patch('/:id/verify', verifyDocument);

// Reject document
router.patch('/:id/reject', rejectDocument);

// Delete document (soft delete)
router.delete('/:id', deleteDocument);

export default router;
