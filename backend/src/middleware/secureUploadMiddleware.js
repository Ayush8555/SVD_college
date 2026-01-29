import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

/**
 * Secure Document Upload Middleware
 * 
 * Security features:
 * - MIME type validation
 * - Magic byte verification
 * - File size limits
 * - Filename sanitization
 * - Anti-path traversal
 * - Unique file naming with UUIDs
 */

// Configuration
const CONFIG = {
  UPLOAD_DIR: 'uploads/documents',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],
};

// Magic bytes for file type verification
const MAGIC_BYTES = {
  'application/pdf': {
    bytes: [0x25, 0x50, 0x44, 0x46], // %PDF
    offset: 0
  },
  'image/jpeg': {
    bytes: [0xFF, 0xD8, 0xFF],
    offset: 0
  },
  'image/png': {
    bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    offset: 0
  }
};

// Ensure upload directory exists
const ensureUploadDir = () => {
  if (!fs.existsSync(CONFIG.UPLOAD_DIR)) {
    fs.mkdirSync(CONFIG.UPLOAD_DIR, { recursive: true, mode: 0o750 });
  }
};

ensureUploadDir();

/**
 * Sanitize filename to prevent path traversal and injection
 */
const sanitizeFilename = (filename) => {
  // Remove path separators and null bytes
  let sanitized = filename
    .replace(/[/\\]/g, '')
    .replace(/\0/g, '')
    .replace(/\.\./g, '');
  
  // Limit length
  if (sanitized.length > 100) {
    const ext = path.extname(sanitized);
    sanitized = sanitized.substring(0, 100 - ext.length) + ext;
  }
  
  // Remove any remaining dangerous characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  return sanitized || 'unnamed';
};

/**
 * Generate secure unique filename
 */
const generateSecureFilename = (originalname) => {
  const uuid = crypto.randomUUID();
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  
  return `${uuid}-${timestamp}${ext}`;
};

/**
 * Verify file magic bytes match claimed MIME type
 */
export const verifyMagicBytes = (buffer, mimeType) => {
  const magicConfig = MAGIC_BYTES[mimeType];
  
  if (!magicConfig) {
    return false;
  }
  
  const { bytes, offset } = magicConfig;
  
  if (buffer.length < offset + bytes.length) {
    return false;
  }
  
  for (let i = 0; i < bytes.length; i++) {
    if (buffer[offset + i] !== bytes[i]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Multer storage configuration
 * Uses memory storage since files are encrypted before disk write
 */
const storage = multer.memoryStorage();

/**
 * File filter with comprehensive validation
 */
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(`Invalid file type. Allowed types: ${CONFIG.ALLOWED_MIME_TYPES.join(', ')}`),
      false
    );
  }
  
  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(`Invalid file extension. Allowed extensions: ${CONFIG.ALLOWED_EXTENSIONS.join(', ')}`),
      false
    );
  }
  
  // Sanitize original filename
  file.sanitizedName = sanitizeFilename(file.originalname);
  file.secureFilename = generateSecureFilename(file.originalname);
  
  cb(null, true);
};

/**
 * Configure multer instance
 */
const uploadConfig = multer({
  storage,
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE,
    files: 1, // One file at a time
  },
  fileFilter
});

/**
 * Middleware to validate magic bytes after upload
 */
export const validateMagicBytes = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  const { buffer, mimetype } = req.file;
  
  if (!verifyMagicBytes(buffer, mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'File content does not match declared type. Possible spoofing detected.'
    });
  }
  
  next();
};

/**
 * Middleware to check file size precisely
 */
export const validateFileSize = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  if (req.file.size > CONFIG.MAX_FILE_SIZE) {
    return res.status(400).json({
      success: false,
      message: `File too large. Maximum size is ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
    });
  }
  
  next();
};

/**
 * Middleware to require consent
 */
export const requireConsent = (req, res, next) => {
  const { consent } = req.body;
  
  if (consent !== 'true' && consent !== true) {
    return res.status(400).json({
      success: false,
      message: 'You must provide consent to upload documents'
    });
  }
  
  // Store consent info for audit
  req.consentInfo = {
    given: true,
    timestamp: new Date(),
    ip: req.ip || req.connection.remoteAddress
  };
  
  next();
};

/**
 * Middleware to validate document type
 */
export const validateDocumentType = (req, res, next) => {
  const validTypes = [
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
  ];
  
  const { documentType } = req.body;
  
  if (!documentType || !validTypes.includes(documentType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid document type. Valid types: ${validTypes.join(', ')}`
    });
  }
  
  next();
};

/**
 * File filter for pre-encrypted uploads (doesn't check MIME type since it's encrypted)
 */
const encryptedFileFilter = (req, file, cb) => {
  // For encrypted uploads, we just verify it's a binary file
  // The original file type is sent in form data
  
  // Sanitize original filename (original name comes from form data)
  file.sanitizedName = sanitizeFilename(file.originalname);
  file.secureFilename = generateSecureFilename(file.originalname);
  
  cb(null, true);
};

/**
 * Configure multer instance for encrypted document uploads
 */
const encryptedUploadConfig = multer({
  storage,
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE + 1024, // Slightly larger for encryption overhead
    files: 1,
  },
  fileFilter: encryptedFileFilter
});

/**
 * Validate original MIME type from form data (not the encrypted file's MIME)
 */
export const validateOriginalMimeType = (req, res, next) => {
  const { originalMimeType } = req.body;
  
  if (!originalMimeType) {
    return res.status(400).json({
      success: false,
      message: 'Original MIME type is required'
    });
  }
  
  if (!CONFIG.ALLOWED_MIME_TYPES.includes(originalMimeType)) {
    return res.status(400).json({
      success: false,
      message: `Invalid file type. Allowed types: ${CONFIG.ALLOWED_MIME_TYPES.join(', ')}`
    });
  }
  
  next();
};

/**
 * Complete upload middleware chain for encrypted document upload
 * (skips magic bytes validation since file is encrypted)
 */
export const secureDocumentUpload = [
  encryptedUploadConfig.single('document'),
  validateFileSize,
  validateOriginalMimeType,
  requireConsent,
  validateDocumentType
];

/**
 * Get upload directory path
 */
export const getUploadDir = () => CONFIG.UPLOAD_DIR;

/**
 * Save encrypted file to disk
 */
export const saveEncryptedFile = async (encryptedBuffer, filename) => {
  ensureUploadDir();
  
  const filePath = path.join(CONFIG.UPLOAD_DIR, filename);
  
  await fs.promises.writeFile(filePath, encryptedBuffer, { mode: 0o640 });
  
  return filePath;
};

/**
 * Read encrypted file from disk
 */
export const readEncryptedFile = async (filePath) => {
  return fs.promises.readFile(filePath);
};

/**
 * Delete encrypted file from disk
 */
export const deleteEncryptedFile = async (filePath) => {
  if (fs.existsSync(filePath)) {
    // Overwrite with random data before deleting (secure delete)
    const fileSize = (await fs.promises.stat(filePath)).size;
    const randomData = crypto.randomBytes(fileSize);
    await fs.promises.writeFile(filePath, randomData);
    await fs.promises.unlink(filePath);
  }
};

export default {
  secureDocumentUpload,
  validateMagicBytes,
  validateFileSize,
  validateOriginalMimeType,
  requireConsent,
  validateDocumentType,
  verifyMagicBytes,
  saveEncryptedFile,
  readEncryptedFile,
  deleteEncryptedFile,
  getUploadDir
};
