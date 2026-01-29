import Document from '../models/Document.js';
import encryptionService from '../services/encryptionService.js';
import { saveEncryptedFile } from '../middleware/secureUploadMiddleware.js';

/**
 * Document Controller (Student-facing)
 * Handles secure document upload and status checking
 */

/**
 * @desc    Upload encrypted document (received pre-encrypted from client)
 * @route   POST /api/documents/upload
 * @access  Private (Student)
 */
export const uploadDocument = async (req, res) => {
  try {
    const { 
      documentType, 
      consent,
      wrappedKey,      // AES DEK wrapped with RSA public key (base64)
      iv,              // AES-GCM IV (base64)
      checksum,        // SHA-256 checksum of encrypted data
      originalMimeType,
      originalSize,
      originalName
    } = req.body;
    
    const studentId = req.user._id;
    const file = req.file; // This contains the encrypted file from client
    
    // Validate required encryption metadata
    if (!wrappedKey || !iv || !checksum) {
      return res.status(400).json({
        success: false,
        message: 'Missing encryption metadata. Please ensure client-side encryption is working.'
      });
    }
    
    // Check if document type already exists for this student
    const existingDoc = await Document.findOne({
      studentId,
      documentType,
      isDeleted: false,
      status: { $ne: 'rejected' }  // Allow re-upload if rejected
    });
    
    if (existingDoc) {
      return res.status(400).json({
        success: false,
        message: `You have already uploaded a ${documentType.replace(/_/g, ' ')}. Please wait for verification or contact admin to update.`
      });
    }
    
    // Generate nonce for anti-replay
    const uploadNonce = encryptionService.generateNonce();
    
    // Save encrypted file (already encrypted by client)
    const secureFilename = `${uploadNonce}.enc`;
    const encryptedFileLocation = await saveEncryptedFile(file.buffer, secureFilename);
    
    // Create document record with client-provided encryption metadata
    const document = await Document.create({
      studentId,
      documentType,
      originalFileName: originalName || file.originalname,
      mimeType: originalMimeType || 'application/octet-stream',
      fileSize: parseInt(originalSize) || file.size,
      encryptedFileLocation,
      encryptedDEK: wrappedKey,  // Client-wrapped DEK
      iv,                        // Client-generated IV
      authTag: 'client-side',    // Marker for client-side encryption (GCM includes auth in ciphertext)
      checksum,                  // Client-calculated checksum
      uploadNonce,
      consentGiven: consent === 'true' || consent === true,
      consentTimestamp: new Date(),
      consentIP: req.ip || req.connection?.remoteAddress,
      status: 'pending',
      // Set expiry to 5 years from now
      expiresAt: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)
    });
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentId: document._id,
        documentType: document.documentType,
        status: document.status,
        uploadedAt: document.createdAt
      }
    });
    
  } catch (error) {
    console.error('Document upload error:', error);
    
    // Generic error message to prevent info leakage
    res.status(500).json({
      success: false,
      message: 'Failed to upload document. Please try again.'
    });
  }
};

/**
 * @desc    Get student's documents status
 * @route   GET /api/documents/my
 * @access  Private (Student)
 */
export const getMyDocuments = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const documents = await Document.find({
      studentId,
      isDeleted: false
    })
      .select('documentType originalFileName status verificationNote createdAt verifiedAt')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents.map(doc => ({
        id: doc._id,
        documentType: doc.documentType,
        fileName: doc.originalFileName,
        status: doc.status,
        verificationNote: doc.status === 'rejected' ? doc.verificationNote : undefined,
        uploadedAt: doc.createdAt,
        verifiedAt: doc.verifiedAt
      }))
    });
    
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve documents'
    });
  }
};

/**
 * @desc    Get specific document status
 * @route   GET /api/documents/:id/status
 * @access  Private (Student)
 */
export const getDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;
    
    const document = await Document.findOne({
      _id: id,
      studentId,
      isDeleted: false
    }).select('documentType status verificationNote createdAt verifiedAt');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: document._id,
        documentType: document.documentType,
        status: document.status,
        verificationNote: document.status === 'rejected' ? document.verificationNote : undefined,
        uploadedAt: document.createdAt,
        verifiedAt: document.verifiedAt
      }
    });
    
  } catch (error) {
    console.error('Get document status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document status'
    });
  }
};

/**
 * @desc    Get required document types for student
 * @route   GET /api/documents/required
 * @access  Private (Student)
 */
export const getRequiredDocuments = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Define all required document types
    const allRequiredTypes = [
      { type: 'aadhaar', label: 'Aadhaar Card' },
      { type: 'marksheet_10th', label: '10th Marksheet' },
      { type: 'marksheet_12th', label: '12th Marksheet' },
      { type: 'transfer_certificate', label: 'Transfer Certificate' },
      { type: 'character_certificate', label: 'Character Certificate' },
      { type: 'passport_photo', label: 'Passport Photo' },
      { type: 'signature', label: 'Signature' }
    ];
    
    // Get student's uploaded documents
    const uploadedDocs = await Document.find({
      studentId,
      isDeleted: false
    }).select('documentType status');
    
    const uploadedMap = new Map(
      uploadedDocs.map(d => [d.documentType, d.status])
    );
    
    // Build response with status for each required type
    const documents = allRequiredTypes.map(req => ({
      ...req,
      uploaded: uploadedMap.has(req.type),
      status: uploadedMap.get(req.type) || 'not_uploaded'
    }));
    
    const completedCount = documents.filter(d => d.status === 'verified').length;
    const pendingCount = documents.filter(d => d.status === 'pending').length;
    
    res.status(200).json({
      success: true,
      data: {
        documents,
        summary: {
          total: allRequiredTypes.length,
          completed: completedCount,
          pending: pendingCount,
          remaining: allRequiredTypes.length - uploadedDocs.length
        }
      }
    });
    
  } catch (error) {
    console.error('Get required documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get required documents'
    });
  }
};

/**
 * @desc    Get public key for client-side encryption
 * @route   GET /api/documents/public-key
 * @access  Private (Student)
 */
export const getPublicKey = async (req, res) => {
  try {
    const publicKey = encryptionService.getPublicKeyForClient();
    
    res.status(200).json({
      success: true,
      data: {
        publicKey,
        algorithm: 'RSA-OAEP',
        keySize: 4096
      }
    });
    
  } catch (error) {
    console.error('Get public key error:', error);
    res.status(500).json({
      success: false,
      message: 'Encryption service not available'
    });
  }
};

// @desc    Delete student's own document (only if pending)
// @route   DELETE /api/documents/:id
// @access  Private (Student)
export const deleteMyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Verify ownership
    if (document.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own documents'
      });
    }
    
    // Only allow deletion of pending documents
    if (document.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You can only delete documents that are still pending verification'
      });
    }
    
    // Hard delete the document (since it's pending and owned by student)
    await Document.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
};

export default {
  uploadDocument,
  getMyDocuments,
  getDocumentStatus,
  getRequiredDocuments,
  getPublicKey,
  deleteMyDocument
};
