import mongoose from 'mongoose';

/**
 * Document Access Log Schema
 * Immutable audit trail for all document access and actions
 * 
 * Security Design:
 * - All admin interactions with documents are logged
 * - Logs are append-only (no updates or deletes)
 * - Used for compliance auditing and security monitoring
 */
const documentAccessLogSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true
    },
    
    action: {
      type: String,
      required: true,
      enum: {
        values: [
          'view_metadata',    // Admin viewed document info
          'decrypt',          // Admin decrypted and viewed document
          'verify',           // Admin approved document
          'reject',           // Admin rejected document
          'download',         // Admin downloaded document (if allowed)
          'delete',           // Admin deleted document
          'restore'           // Admin restored deleted document
        ],
        message: 'Invalid action type'
      },
      index: true
    },
    
    // Request context for forensics
    ipAddress: {
      type: String,
      required: true
    },
    
    userAgent: {
      type: String,
      maxlength: 500
    },
    
    // Session tracking
    sessionId: {
      type: String,
      // JWT token ID or session identifier
    },
    
    // Action result
    success: {
      type: Boolean,
      default: true,
      index: true
    },
    
    failureReason: {
      type: String,
      maxlength: 500
    },
    
    // Additional context
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      // Stores action-specific data like:
      // - verification status change
      // - rejection reason
      // - previous values for auditing
    },
    
    // Duration tracking (for decrypt/view actions)
    durationMs: {
      type: Number,
      // How long the decrypted document was viewed
    }
  },
  {
    timestamps: true,
    // Disable modifying logs after creation
    strict: true
  }
);

// Indexes for audit queries
documentAccessLogSchema.index({ documentId: 1, createdAt: -1 });
documentAccessLogSchema.index({ adminId: 1, createdAt: -1 });
documentAccessLogSchema.index({ action: 1, createdAt: -1 });
documentAccessLogSchema.index({ createdAt: -1 }); // Recent activity

// Compound index for security analysis
documentAccessLogSchema.index({ 
  adminId: 1, 
  action: 1, 
  success: 1, 
  createdAt: -1 
});

/**
 * Pre-save: Ensure logs are never modified after creation
 */
documentAccessLogSchema.pre('save', async function() {
  if (!this.isNew) {
    throw new Error('Audit logs cannot be modified');
  }
});

/**
 * Disable update operations on this collection
 */
documentAccessLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], async function() {
  throw new Error('Audit logs cannot be modified');
});

/**
 * Disable delete operations on this collection
 */
documentAccessLogSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], async function() {
  throw new Error('Audit logs cannot be deleted');
});

/**
 * Static method to log an action
 */
documentAccessLogSchema.statics.logAction = async function(data) {
  const log = new this({
    documentId: data.documentId,
    adminId: data.adminId,
    action: data.action,
    ipAddress: data.ipAddress || 'unknown',
    userAgent: data.userAgent,
    sessionId: data.sessionId,
    success: data.success !== false,
    failureReason: data.failureReason,
    metadata: data.metadata,
    durationMs: data.durationMs
  });
  
  return log.save();
};

/**
 * Static method to get logs for a specific document
 */
documentAccessLogSchema.statics.getLogsForDocument = function(documentId, options = {}) {
  const { limit = 100, skip = 0 } = options;
  
  return this.find({ documentId })
    .populate('adminId', 'name username designation')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Static method to get logs for a specific admin
 */
documentAccessLogSchema.statics.getLogsForAdmin = function(adminId, options = {}) {
  const { limit = 100, skip = 0, action } = options;
  
  const query = { adminId };
  if (action) query.action = action;
  
  return this.find(query)
    .populate('documentId', 'documentType originalFileName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Static method to get security alerts (failed actions, unusual patterns)
 */
documentAccessLogSchema.statics.getSecurityAlerts = function(options = {}) {
  const { hours = 24, limit = 50 } = options;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    createdAt: { $gte: since },
    success: false
  })
    .populate('adminId', 'name username')
    .populate('documentId', 'documentType')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static method to count actions by admin (for rate limiting / anomaly detection)
 */
documentAccessLogSchema.statics.countRecentActions = function(adminId, action, minutes = 60) {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  
  return this.countDocuments({
    adminId,
    action,
    createdAt: { $gte: since }
  });
};

const DocumentAccessLog = mongoose.model('DocumentAccessLog', documentAccessLogSchema);

export default DocumentAccessLog;
