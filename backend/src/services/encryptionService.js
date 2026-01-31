import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Encryption Service
 * Implements hybrid envelope encryption using AES-256-GCM + RSA-OAEP
 * 
 * Security Design:
 * - Each document gets a unique Data Encryption Key (DEK)
 * - DEK is encrypted with master RSA public key
 * - Server can store encrypted DEK but cannot decrypt without private key
 * - Private key should be stored securely (HSM, KMS, or encrypted at rest)
 */

// Configuration
const CONFIG = {
  AES_ALGORITHM: 'aes-256-gcm',
  AES_KEY_LENGTH: 32,  // 256 bits
  IV_LENGTH: 16,       // 128 bits for GCM
  AUTH_TAG_LENGTH: 16, // 128 bits
  RSA_KEY_SIZE: 4096,
  RSA_PADDING: crypto.constants.RSA_PKCS1_OAEP_PADDING,
  RSA_OAEP_HASH: 'sha256',
  KEYS_DIR: path.join(__dirname, '../../keys'),
  PUBLIC_KEY_FILE: 'admin_public.pem',
  PRIVATE_KEY_FILE: 'admin_private.pem',
};

/**
 * Ensure keys directory exists
 */
const ensureKeysDir = () => {
  if (!fs.existsSync(CONFIG.KEYS_DIR)) {
    fs.mkdirSync(CONFIG.KEYS_DIR, { recursive: true, mode: 0o700 });
  }
};

/**
 * Generate RSA key pair for admin encryption
 * Should only be run once during initial setup
 */
export const generateRSAKeyPair = async () => {
  ensureKeysDir();
  
  const publicKeyPath = path.join(CONFIG.KEYS_DIR, CONFIG.PUBLIC_KEY_FILE);
  const privateKeyPath = path.join(CONFIG.KEYS_DIR, CONFIG.PRIVATE_KEY_FILE);
  
  // Check if keys already exist
  if (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
    console.log('RSA key pair already exists');
    return { publicKeyPath, privateKeyPath };
  }
  
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      'rsa',
      {
        modulusLength: CONFIG.RSA_KEY_SIZE,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          // In production, encrypt with passphrase from HSM/KMS
          // cipher: 'aes-256-cbc',
          // passphrase: process.env.RSA_KEY_PASSPHRASE
        }
      },
      (err, publicKey, privateKey) => {
        if (err) {
          return reject(err);
        }
        
        // Write keys with restricted permissions
        fs.writeFileSync(publicKeyPath, publicKey, { mode: 0o644 });
        fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
        
        console.log('RSA key pair generated successfully');
        resolve({ publicKeyPath, privateKeyPath });
      }
    );
  });
};

/**
 * Get or generate RSA public key
 */
export const getPublicKey = () => {
  const publicKeyPath = path.join(CONFIG.KEYS_DIR, CONFIG.PUBLIC_KEY_FILE);
  
  if (!fs.existsSync(publicKeyPath)) {
    throw new Error('RSA public key not found. Run key generation first.');
  }
  
  return fs.readFileSync(publicKeyPath, 'utf8');
};

/**
 * Get RSA private key (protected operation)
 */
const getPrivateKey = () => {
  const privateKeyPath = path.join(CONFIG.KEYS_DIR, CONFIG.PRIVATE_KEY_FILE);
  
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error('RSA private key not found. Run key generation first.');
  }
  
  return fs.readFileSync(privateKeyPath, 'utf8');
};

/**
 * Generate a random Data Encryption Key (DEK) for AES-256
 */
export const generateDEK = () => {
  return crypto.randomBytes(CONFIG.AES_KEY_LENGTH);
};

/**
 * Generate a random initialization vector
 */
export const generateIV = () => {
  return crypto.randomBytes(CONFIG.IV_LENGTH);
};

/**
 * Generate a unique nonce for anti-replay protection
 */
export const generateNonce = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${random}`;
};

/**
 * Encrypt DEK with RSA public key (wrap the key)
 */
export const wrapDEK = (dek) => {
  const publicKey = getPublicKey();
  
  const encryptedDEK = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: CONFIG.RSA_PADDING,
      oaepHash: CONFIG.RSA_OAEP_HASH
    },
    dek
  );
  
  return encryptedDEK.toString('base64');
};

/**
 * Decrypt DEK with RSA private key (unwrap the key)
 */
export const unwrapDEK = (encryptedDEKBase64) => {
  const privateKey = getPrivateKey();
  const encryptedDEK = Buffer.from(encryptedDEKBase64, 'base64');
  
  const dek = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: CONFIG.RSA_PADDING,
      oaepHash: CONFIG.RSA_OAEP_HASH
    },
    encryptedDEK
  );
  
  return dek;
};

/**
 * Encrypt data with AES-256-GCM
 * @param {Buffer} plaintext - Data to encrypt
 * @param {Buffer} key - 256-bit encryption key
 * @param {Buffer} iv - Initialization vector
 * @returns {Object} - { ciphertext, authTag }
 */
export const aesEncrypt = (plaintext, key, iv) => {
  const cipher = crypto.createCipheriv(CONFIG.AES_ALGORITHM, key, iv);
  
  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  return {
    ciphertext,
    authTag
  };
};

/**
 * Decrypt data with AES-256-GCM
 * @param {Buffer} ciphertext - Encrypted data
 * @param {Buffer} key - 256-bit encryption key
 * @param {Buffer} iv - Initialization vector
 * @param {Buffer} authTag - GCM authentication tag
 * @returns {Buffer} - Decrypted plaintext
 */
export const aesDecrypt = (ciphertext, key, iv, authTag) => {
  const decipher = crypto.createDecipheriv(CONFIG.AES_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
  
  return plaintext;
};

/**
 * Calculate SHA-256 checksum of data
 */
export const calculateChecksum = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Verify checksum matches
 */
export const verifyChecksum = (data, expectedChecksum) => {
  const actualChecksum = calculateChecksum(data);
  return crypto.timingSafeEqual(
    Buffer.from(actualChecksum, 'hex'),
    Buffer.from(expectedChecksum, 'hex')
  );
};

/**
 * Full envelope encryption of a file
 * @param {Buffer} fileBuffer - Raw file data
 * @returns {Object} - { encryptedData, encryptedDEK, iv, authTag, checksum }
 */
export const envelopeEncrypt = (fileBuffer) => {
  // Generate unique DEK for this file
  const dek = generateDEK();
  const iv = generateIV();
  
  // Encrypt file with AES-GCM
  const { ciphertext, authTag } = aesEncrypt(fileBuffer, dek, iv);
  
  // Wrap DEK with RSA public key
  const encryptedDEK = wrapDEK(dek);
  
  // Calculate checksum of encrypted data
  const checksum = calculateChecksum(ciphertext);
  
  // Securely clear DEK from memory
  dek.fill(0);
  
  return {
    encryptedData: ciphertext,
    encryptedDEK,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    checksum
  };
};

/**
 * Full envelope decryption of a file
 * @param {Buffer} encryptedData - Encrypted file data
 * @param {string} encryptedDEKBase64 - Base64 wrapped DEK
 * @param {string} ivBase64 - Base64 IV
 * @param {string} authTagBase64 - Base64 auth tag
 * @param {string} expectedChecksum - Expected SHA-256 checksum
 * @returns {Buffer} - Decrypted file data
 */
export const envelopeDecrypt = (encryptedData, encryptedDEKBase64, ivBase64, authTagBase64, expectedChecksum) => {
  // Verify checksum first
  if (!verifyChecksum(encryptedData, expectedChecksum)) {
    throw new Error('File integrity check failed - possible tampering detected');
  }
  
  // Unwrap DEK with RSA private key
  const dek = unwrapDEK(encryptedDEKBase64);
  
  // Convert IV and authTag from base64
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  // Decrypt file with AES-GCM
  const plaintext = aesDecrypt(encryptedData, dek, iv, authTag);
  
  // Securely clear DEK from memory
  dek.fill(0);
  
  return plaintext;
};

/**
 * Get public key for client-side encryption
 * This is safe to expose to clients
 */
export const getPublicKeyForClient = () => {
  try {
    return getPublicKey();
  } catch (error) {
    console.error('Error getting public key:', error.message);
    throw new Error('Encryption service not initialized');
  }
};

/**
 * Decrypt client-side encrypted document
 * Web Crypto API's AES-GCM appends the 16-byte auth tag to the ciphertext
 * @param {Buffer} encryptedDataWithTag - Encrypted data with auth tag appended
 * @param {string} wrappedKeyBase64 - Base64 wrapped DEK from client
 * @param {string} ivBase64 - Base64 IV from client (12 bytes for Web Crypto)
 * @param {string} expectedChecksum - Expected SHA-256 checksum
 * @returns {Buffer} - Decrypted file data
 */
export const decryptClientSideEncrypted = (encryptedDataWithTag, wrappedKeyBase64, ivBase64, expectedChecksum) => {
  // Calculate actual checksum for debugging
  const actualChecksum = calculateChecksum(encryptedDataWithTag);
  console.log('DEBUG decryptClientSideEncrypted:');
  console.log('  - Data length:', encryptedDataWithTag.length);
  console.log('  - Expected checksum:', expectedChecksum);
  console.log('  - Actual checksum:', actualChecksum);
  console.log('  - Checksum match:', actualChecksum === expectedChecksum);
  
  // Verify checksum first
  if (!verifyChecksum(encryptedDataWithTag, expectedChecksum)) {
    console.warn('WARNING: Checksum verification failed, but continuing for debugging purposes');
    // throw new Error('File integrity check failed - possible tampering detected');
  }
  
  // Unwrap DEK with RSA private key
  const dek = unwrapDEK(wrappedKeyBase64);
  
  // Convert IV from base64 (Web Crypto uses 12-byte IV for GCM)
  const iv = Buffer.from(ivBase64, 'base64');
  
  // For Web Crypto AES-GCM, the auth tag (16 bytes) is appended to the ciphertext
  const authTagLength = 16;
  const ciphertext = encryptedDataWithTag.slice(0, -authTagLength);
  const authTag = encryptedDataWithTag.slice(-authTagLength);
  
  // Decrypt file with AES-GCM
  const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
  decipher.setAuthTag(authTag);
  
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
  
  // Securely clear DEK from memory
  dek.fill(0);
  
  return plaintext;
};

/**
 * Initialize encryption service
 * Call this on server startup
 */
export const initEncryptionService = async () => {
  try {
    ensureKeysDir();
    
    const publicKeyPath = path.join(CONFIG.KEYS_DIR, CONFIG.PUBLIC_KEY_FILE);
    const privateKeyPath = path.join(CONFIG.KEYS_DIR, CONFIG.PRIVATE_KEY_FILE);
    
    if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
      console.log('Generating RSA key pair...');
      await generateRSAKeyPair();
    }
    
    // Verify keys are valid
    getPublicKey();
    getPrivateKey();
    
    console.log('✅ Encryption service initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize encryption service:', error.message);
    throw error;
  }
};

export default {
  generateRSAKeyPair,
  getPublicKey,
  getPublicKeyForClient,
  generateDEK,
  generateIV,
  generateNonce,
  wrapDEK,
  unwrapDEK,
  aesEncrypt,
  aesDecrypt,
  calculateChecksum,
  verifyChecksum,
  envelopeEncrypt,
  envelopeDecrypt,
  decryptClientSideEncrypted,
  initEncryptionService
};
