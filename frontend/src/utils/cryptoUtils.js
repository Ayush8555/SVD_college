/**
 * Client-side Crypto Utilities
 * Uses Web Crypto API for secure client-side encryption
 * 
 * Security Design:
 * - Documents are encrypted in the browser before upload
 * - Uses AES-256-GCM for symmetric encryption
 * - DEK (Data Encryption Key) is wrapped with admin's RSA public key
 * - Server never sees plaintext documents
 */

/**
 * Convert ArrayBuffer to Base64 string
 */
export const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Convert Base64 string to ArrayBuffer
 */
export const base64ToArrayBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Import RSA public key from PEM format
 */
export const importPublicKey = async (pemKey) => {
  // Remove PEM headers and whitespace
  const pemContents = pemKey
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
  
  const binaryKey = base64ToArrayBuffer(pemContents);
  
  return await crypto.subtle.importKey(
    'spki',
    binaryKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    ['encrypt']
  );
};

/**
 * Generate random AES-256 key for document encryption
 */
export const generateAESKey = async () => {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

/**
 * Generate random IV for AES-GCM
 */
export const generateIV = () => {
  return crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM
};

/**
 * Encrypt file with AES-GCM
 */
export const encryptFile = async (fileBuffer, aesKey, iv) => {
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    aesKey,
    fileBuffer
  );
  
  return new Uint8Array(encryptedBuffer);
};

/**
 * Export AES key as raw bytes
 */
export const exportAESKey = async (aesKey) => {
  const rawKey = await crypto.subtle.exportKey('raw', aesKey);
  return new Uint8Array(rawKey);
};

/**
 * Wrap (encrypt) AES key with RSA public key
 */
export const wrapKey = async (aesKey, rsaPublicKey) => {
  const rawKey = await exportAESKey(aesKey);
  
  const wrappedKey = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    rsaPublicKey,
    rawKey
  );
  
  return new Uint8Array(wrappedKey);
};

/**
 * Calculate SHA-256 checksum of data
 */
export const calculateChecksum = async (data) => {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Full client-side encryption of a file
 * @param {File} file - File to encrypt
 * @param {string} publicKeyPem - Admin's RSA public key in PEM format
 * @returns {Object} - { encryptedFile, wrappedKey, iv, checksum }
 */
export const encryptDocument = async (file, publicKeyPem) => {
  try {
    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Generate unique AES key for this document
    const aesKey = await generateAESKey();
    
    // Generate random IV
    const iv = generateIV();
    
    // Encrypt file with AES-GCM
    const encryptedData = await encryptFile(fileBuffer, aesKey, iv);
    
    // Import RSA public key
    const rsaPublicKey = await importPublicKey(publicKeyPem);
    
    // Wrap AES key with RSA public key
    const wrappedKey = await wrapKey(aesKey, rsaPublicKey);
    
    // Calculate checksum of encrypted data
    const checksum = await calculateChecksum(encryptedData);
    
    // Create encrypted file blob
    const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
    
    return {
      encryptedFile: new File([encryptedBlob], `${file.name}.enc`, { type: 'application/octet-stream' }),
      wrappedKey: arrayBufferToBase64(wrappedKey),
      iv: arrayBufferToBase64(iv),
      checksum,
      originalMimeType: file.type,
      originalSize: file.size,
      originalName: file.name
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt document. Please try again.');
  }
};

/**
 * Validate file before encryption
 */
export const validateFile = (file) => {
  const errors = [];
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size is 5MB, your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
  }
  
  // Check file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only PDF, JPEG, and PNG files are allowed.');
  }
  
  // Check file name
  if (!file.name || file.name.length > 100) {
    errors.push('Invalid file name.');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Check if Web Crypto API is available
 */
export const isCryptoAvailable = () => {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.subtle.encrypt === 'function';
};

export default {
  encryptDocument,
  validateFile,
  isCryptoAvailable,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  importPublicKey,
  generateAESKey,
  generateIV,
  encryptFile,
  wrapKey,
  calculateChecksum
};
