import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Re-use Cloudinary config if possible, or just re-import from main config
// Ideally we should export cloudinary from config/cloudinary.js
import { cloudinary as cloudinaryConfig } from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'college_result_system/fee_receipts',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: isPdf ? 'raw' : 'image',
      access_mode: 'public',
      // Unique filename including timestamp and a random string to prevent dupes
      public_id: `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      format: isPdf ? 'pdf' : undefined // Helps cloudinary handle pdfs
    };
  },
});

const feeUpload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default feeUpload;
