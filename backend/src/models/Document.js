import mongoose from 'mongoose';

/**
 * Document Schema
 * Stores encrypted student documents with envelope encryption metadata
 * 
 * Security Design:
 * - encryptedFileLocation points to AES-256-GCM encrypted blob
 * - encryptedDEK is the Data Encryption Key wrapped with RSA public key
 * - Server never stores or handles plaintext documents
 */
const documentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true
    },
    
    // Document metadata
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: [
          'aadhaar',
          'pan_card',
          'marksheet_10th',
          'marksheet_12th',
          'graduation_marksheet',
          'transfer_certificate',
          'migration_certificate',
          'character_certificate',
          'caste_certificate',
          'income_certificate',
          'domicile_certificate',
          'passport_photo',
          'signature',
          'other'
        ],
        message: 'Invalid document type'
      },
      index: true
    },
    
    originalFileName: {
      type: String,
      required: true,
      maxlength: [255, 'Filename too long'],
      // Sanitized on upload - no path characters allowed
    },
    
    mimeType: {
      type: String,
      required: true,
      enum: {
        values: ['application/pdf', 'image/jpeg', 'image/png', 'application/octet-stream'],
        message: 'Only PDF, JPEG, PNG files, or encrypted binary are allowed'
      }
    },
    
    fileSize: {
      type: Number,
      required: true,
      max: [5 * 1024 * 1024, 'File size cannot exceed 5MB']
    },
    
    // Encrypted storage location
    encryptedFileLocation: {
      type: String,
      required: true,
      select: false // Don't expose in queries by default
    },
    
    // Envelope encryption fields
    encryptedDEK: {
      type: String,
      required: true,
      select: false // Only retrieved during decryption
    },
    
    iv: {
      type: String,
      required: true,
      select: false // Initialization vector for AES-GCM
    },
    
    authTag: {
      type: String,
      required: true,
      select: false // GCM authentication tag
    },
    
    // Integrity verification
    checksum: {
      type: String,
      required: true,
      // SHA-256 hash of encrypted file for tamper detection
    },
    
    // Verification workflow
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
      index: true
    },
    
    verificationNote: {
      type: String,
      maxlength: 500,
      // Admin's rejection reason or verification notes
    },
    
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    
    verifiedAt: {
      type: Date
    },
    
    // Consent tracking (legal requirement)
    consentGiven: {
      type: Boolean,
      required: [true, 'Student consent is required'],
      default: false
    },
    
    consentTimestamp: {
      type: Date,
      required: true
    },
    
    consentIP: {
      type: String,
      // IP address when consent was given
    },
    
    // Anti-replay protection
    uploadNonce: {
      type: String,
      required: true,
      unique: true,
      // Random nonce to prevent replay attacks
    },
    
    // Auto-expiry (TTL)
    expiresAt: {
      type: Date,
      // Set based on retention policy, TTL index handles deletion
    },
    
    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    
    deletedAt: {
      type: Date
    },
    
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.encryptedFileLocation;
        delete ret.encryptedDEK;
        delete ret.iv;
        delete ret.authTag;
        delete ret.uploadNonce;
        return ret;
      }
    }
  }
);

// Compound indexes for efficient queries
documentSchema.index({ studentId: 1, documentType: 1 });
documentSchema.index({ status: 1, createdAt: -1 });
documentSchema.index({ verifiedBy: 1, verifiedAt: -1 });

// TTL index for auto-expiry
documentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Unique constraint on studentId + documentType (one doc per type per student)
documentSchema.index(
  { studentId: 1, documentType: 1, isDeleted: 1 },
  { 
    unique: true,
    partialFilterExpression: { isDeleted: false }
  }
);

/**
 * Pre-save middleware to set consent timestamp
 * Note: Mongoose 6+ supports returning from pre hooks instead of calling next()
 */
documentSchema.pre('save', function() {
  if (this.isNew && this.consentGiven && !this.consentTimestamp) {
    this.consentTimestamp = new Date();
  }
  // No need to call next() in Mongoose 6+ with synchronous hooks
});

/**
 * Static method to get documents for admin review queue
 */
documentSchema.statics.getVerificationQueue = function(options = {}) {
  const { status = 'pending', limit = 50, skip = 0 } = options;
  
  return this.find({ status, isDeleted: false })
    .populate('studentId', 'rollNumber firstName lastName department program')
    .select('-encryptedFileLocation -encryptedDEK -iv -authTag -uploadNonce')
    .sort({ createdAt: 1 }) // FIFO queue
    .skip(skip)
    .limit(limit);
};

/**
 * Static method to get document with decryption fields (admin only)
 */
documentSchema.statics.getForDecryption = function(documentId) {
  return this.findById(documentId)
    .select('+encryptedFileLocation +encryptedDEK +iv +authTag')
    .populate('studentId', 'rollNumber firstName lastName');
};

/**
 * Instance method to mark as verified
 */
documentSchema.methods.markVerified = async function(adminId, note = '') {
  this.status = 'verified';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNote = note;
  return this.save();
};

/**
 * Instance method to mark as rejected
 */
documentSchema.methods.markRejected = async function(adminId, reason) {
  if (!reason || reason.trim().length < 10) {
    throw new Error('Rejection reason must be at least 10 characters');
  }
  this.status = 'rejected';
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  this.verificationNote = reason;
  return this.save();
};

/**
 * Instance method for soft delete
 */
documentSchema.methods.softDelete = async function(adminId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = adminId;
  return this.save();
};

const Document = mongoose.model('Document', documentSchema);

export default Document;
