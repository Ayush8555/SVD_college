import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage with proper resource_type detection
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'college_result_system/notices',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: 'auto', // Auto-detect to allow PDF previews and image optimization
      access_mode: 'public',
      use_filename: true, // Use original filename for better SEO/UX
      unique_filename: true,
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };

