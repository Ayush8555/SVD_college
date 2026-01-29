import express from 'express';
import { protectStudent } from '../middleware/authMiddleware.js';
import { secureDocumentUpload } from '../middleware/secureUploadMiddleware.js';
import {
  uploadDocument,
  getMyDocuments,
  getDocumentStatus,
  getRequiredDocuments,
  getPublicKey,
  deleteMyDocument
} from '../controllers/documentController.js';

const router = express.Router();

/**
 * Student Document Routes
 * All routes require student authentication
 */

// Get public key for client-side encryption
router.get('/public-key', protectStudent, getPublicKey);

// Get required documents and their status
router.get('/required', protectStudent, getRequiredDocuments);

// Get all my documents
router.get('/my', protectStudent, getMyDocuments);

// Get specific document status
router.get('/:id/status', protectStudent, getDocumentStatus);

// Upload encrypted document (with all validation middleware)
router.post(
  '/upload',
  protectStudent,
  ...secureDocumentUpload,
  uploadDocument
);

// Delete own document (only if pending)
router.delete('/:id', protectStudent, deleteMyDocument);

export default router;
