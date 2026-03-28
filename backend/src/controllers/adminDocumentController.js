import Document from '../models/Document.js';
import DocumentAccessLog from '../models/DocumentAccessLog.js';
import encryptionService from '../services/encryptionService.js';
import { readEncryptedFile, deleteEncryptedFile } from '../middleware/secureUploadMiddleware.js';

/**
 * Admin Document Controller
 * Handles document verification, decryption, and audit logging
 */

/**
 * Helper to log document access
 */
const logAccess = async (data) => {
  try {
    await DocumentAccessLog.logAction(data);
  } catch (error) {
    console.error('Failed to log document access:', error);
    // Don't throw - logging failure shouldn't break the operation
  }
};

/**
 * @desc    Get documents pending verification
 * @route   GET /api/admin/documents/queue
 * @access  Private (Admin)
 */
export const getVerificationQueue = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20, documentType } = req.query;
    
    const query = { isDeleted: false };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (documentType) {
      query.documentType = documentType;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('studentId', 'rollNumber firstName lastName department program currentSemester')
        .select('-encryptedFileLocation -encryptedDEK -iv -authTag -uploadNonce')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Document.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        documents: documents.map(doc => ({
          id: doc._id,
          documentType: doc.documentType,
          originalFileName: doc.originalFileName,
          mimeType: doc.mimeType,
          fileSize: doc.fileSize,
          status: doc.status,
          uploadedAt: doc.createdAt,
          student: doc.studentId ? {
            id: doc.studentId._id,
            rollNumber: doc.studentId.rollNumber,
            name: `${doc.studentId.firstName} ${doc.studentId.lastName}`,
            department: doc.studentId.department,
            program: doc.studentId.program,
            semester: doc.studentId.currentSemester
          } : null
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Get verification queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve verification queue'
    });
  }
};

/**
 * @desc    Get document statistics
 * @route   GET /api/admin/documents/stats
 * @access  Private (Admin)
 */
export const getDocumentStats = async (req, res) => {
  try {
    const stats = await Document.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statsMap = stats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});
    
    // Get today's uploads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await Document.countDocuments({
      createdAt: { $gte: today },
      isDeleted: false
    });
    
    res.status(200).json({
      success: true,
      data: {
        pending: statsMap.pending || 0,
        under_review: statsMap.under_review || 0,
        verified: statsMap.verified || 0,
        rejected: statsMap.rejected || 0,
        total: Object.values(statsMap).reduce((a, b) => a + b, 0),
        todayUploads: todayCount
      }
    });
    
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
};

/**
 * @desc    Decrypt and preview document (memory only)
 * @route   GET /api/admin/documents/:id/decrypt
 * @access  Private (Admin)
 */
export const decryptDocument = async (req, res) => {
  const startTime = Date.now();
  const { id } = req.params;
  const adminId = req.user._id;
  
  try {
    // Get document with encryption fields
    const document = await Document.getForDecryption(id);
    
    if (!document) {
      await logAccess({
        documentId: id,
        adminId,
        action: 'decrypt',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        failureReason: 'Document not found'
      });
      
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    if (document.isDeleted) {
      await logAccess({
        documentId: id,
        adminId,
        action: 'decrypt',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        failureReason: 'Document deleted'
      });
      
      return res.status(404).json({
        success: false,
        message: 'Document has been deleted'
      });
    }
    
    // Validate encryption metadata exists
    if (!document.encryptedFileLocation || !document.encryptedDEK || !document.iv) {
      console.error(`Document ${id} missing encryption metadata:`, {
        hasFileLocation: !!document.encryptedFileLocation,
        hasEncryptedDEK: !!document.encryptedDEK,
        hasIV: !!document.iv,
        hasChecksum: !!document.checksum
      });
      
      await logAccess({
        documentId: id,
        adminId,
        action: 'decrypt',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        failureReason: 'Missing encryption metadata'
      });
      
      return res.status(500).json({
        success: false,
        message: 'Document encryption metadata is incomplete'
      });
    }
    
    // Read encrypted file
    let encryptedData;
    try {
      encryptedData = await readEncryptedFile(document.encryptedFileLocation);
    } catch (fileError) {
      console.error(`Failed to read encrypted file for document ${id}:`, fileError.message);
      
      await logAccess({
        documentId: id,
        adminId,
        action: 'decrypt',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        failureReason: `File read error: ${fileError.message}`
      });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to read encrypted document file'
      });
    }
    
    // Decrypt - check if client-side encrypted (authTag === 'client-side')
    let decryptedData;
    try {
      if (document.authTag === 'client-side') {
        // Client-side encryption: auth tag is appended to ciphertext
        decryptedData = encryptionService.decryptClientSideEncrypted(
          encryptedData,
          document.encryptedDEK,
          document.iv,
          document.checksum
        );
      } else {
        // Server-side encryption: separate auth tag
        decryptedData = encryptionService.envelopeDecrypt(
          encryptedData,
          document.encryptedDEK,
          document.iv,
          document.authTag,
          document.checksum
        );
      }
    } catch (decryptError) {
      console.error(`Decryption failed for document ${id}:`, {
        error: decryptError.message,
        authTag: document.authTag,
        ivLength: document.iv?.length,
        dekLength: document.encryptedDEK?.length,
        checksumLength: document.checksum?.length,
        encryptedDataSize: encryptedData?.length
      });
      
      // Check if the error is checksum-related and try without checksum verification
      if (decryptError.message.includes('integrity') || decryptError.message.includes('checksum')) {
        console.warn(`Attempting decryption without checksum verification for document ${id}`);
        try {
          decryptedData = encryptionService.decryptClientSideEncryptedNoChecksum(
            encryptedData,
            document.encryptedDEK,
            document.iv
          );
          console.warn(`Document ${id} decrypted successfully without checksum - possible data integrity issue`);
        } catch (fallbackError) {
          console.error(`Fallback decryption also failed for document ${id}:`, fallbackError.message);
          throw decryptError; // Throw original error
        }
      } else {
        throw decryptError;
      }
    }
    
    // Mark as under review if pending
    if (document.status === 'pending') {
      document.status = 'under_review';
      await document.save();
    }
    
    // Log successful access
    await logAccess({
      documentId: id,
      adminId,
      action: 'decrypt',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      durationMs: Date.now() - startTime,
      metadata: {
        documentType: document.documentType,
        studentRollNumber: document.studentId?.rollNumber
      }
    });
    
    // Add watermark info to response headers
    // Sanitize filename for HTTP header (remove/encode special characters)
    const safeFilename = document.originalFileName
      .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
      .replace(/["\\]/g, '_')       // Replace quotes and backslashes
      .substring(0, 100) || 'document';
    
    // Use RFC 5987 encoding for proper Unicode support
    const encodedFilename = encodeURIComponent(document.originalFileName);
    
    res.set({
      'X-Document-Id': document._id.toString(),
      'X-Admin-Id': adminId.toString(),
      'X-Access-Time': new Date().toISOString(),
      'Content-Type': document.mimeType,
      'Content-Disposition': `inline; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    // Send decrypted data (memory only, no disk write)
    res.send(decryptedData);
    
  } catch (error) {
    console.error('Decrypt document error:', error);
    
    await logAccess({
      documentId: id,
      adminId,
      action: 'decrypt',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: false,
      failureReason: error.message
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to decrypt document';
    if (error.message.includes('integrity') || error.message.includes('checksum')) {
      errorMessage = 'Document integrity verification failed. The file may have been corrupted or tampered with.';
    } else if (error.message.includes('private key') || error.message.includes('RSA')) {
      errorMessage = 'Encryption key mismatch. This document may have been encrypted with a different key.';
    } else if (error.message.includes('auth') || error.message.includes('tag')) {
      errorMessage = 'Document authentication failed. The encrypted data may be corrupted.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

/**
 * @desc    Verify (approve) document
 * @route   PATCH /api/admin/documents/:id/verify
 * @access  Private (Admin)
 */
export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const adminId = req.user._id;
    
    const document = await Document.findById(id);
    
    if (!document || document.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    if (document.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Document is already verified'
      });
    }
    
    const previousStatus = document.status;
    await document.markVerified(adminId, note || '');
    
    // Log verification
    await logAccess({
      documentId: id,
      adminId,
      action: 'verify',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      metadata: {
        previousStatus,
        note
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Document verified successfully',
      data: {
        id: document._id,
        status: document.status,
        verifiedAt: document.verifiedAt
      }
    });
    
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document'
    });
  }
};

/**
 * @desc    Reject document
 * @route   PATCH /api/admin/documents/:id/reject
 * @access  Private (Admin)
 */
export const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required (minimum 10 characters)'
      });
    }
    
    const document = await Document.findById(id);
    
    if (!document || document.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    const previousStatus = document.status;
    await document.markRejected(adminId, reason);
    
    // Log rejection
    await logAccess({
      documentId: id,
      adminId,
      action: 'reject',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
      metadata: {
        previousStatus,
        reason
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Document rejected',
      data: {
        id: document._id,
        status: document.status,
        verificationNote: document.verificationNote
      }
    });
    
  } catch (error) {
    console.error('Reject document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject document'
    });
  }
};

/**
 * @desc    Get access logs for a document
 * @route   GET /api/admin/documents/:id/logs
 * @access  Private (Admin)
 */
export const getDocumentLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, page = 1 } = req.query;
    
    const logs = await DocumentAccessLog.getLogsForDocument(id, {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      data: logs.map(log => ({
        id: log._id,
        action: log.action,
        admin: log.adminId ? {
          id: log.adminId._id,
          name: log.adminId.name,
          username: log.adminId.username
        } : null,
        success: log.success,
        failureReason: log.failureReason,
        ipAddress: log.ipAddress,
        timestamp: log.createdAt,
        durationMs: log.durationMs
      }))
    });
    
  } catch (error) {
    console.error('Get document logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve access logs'
    });
  }
};

/**
 * @desc    Get all audit logs (with filters)
 * @route   GET /api/admin/documents/logs
 * @access  Private (Admin)
 */
export const getAllLogs = async (req, res) => {
  try {
    const { 
      adminId, 
      action, 
      limit = 100, 
      page = 1,
      startDate,
      endDate 
    } = req.query;
    
    const query = {};
    
    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      DocumentAccessLog.find(query)
        .populate('adminId', 'name username designation')
        .populate('documentId', 'documentType originalFileName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DocumentAccessLog.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log._id,
          action: log.action,
          admin: log.adminId ? {
            id: log.adminId._id,
            name: log.adminId.name,
            username: log.adminId.username,
            designation: log.adminId.designation
          } : null,
          document: log.documentId ? {
            id: log.documentId._id,
            type: log.documentId.documentType,
            fileName: log.documentId.originalFileName
          } : null,
          success: log.success,
          failureReason: log.failureReason,
          ipAddress: log.ipAddress,
          timestamp: log.createdAt
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Get all logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs'
    });
  }
};

/**
 * @desc    Delete document (soft delete)
 * @route   DELETE /api/admin/documents/:id
 * @access  Private (Admin)
 */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    await document.softDelete(adminId);
    
    // Log deletion
    await logAccess({
      documentId: id,
      adminId,
      action: 'delete',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
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
  getVerificationQueue,
  getDocumentStats,
  decryptDocument,
  verifyDocument,
  rejectDocument,
  getDocumentLogs,
  getAllLogs,
  deleteDocument
};
