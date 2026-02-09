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
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      access_mode: 'public',
      public_id: (req, file) => {
        // Generate custom filename: SVD_Gurukul_Notice_<Title>_<Timestamp>
        const title = req.body.title ? req.body.title.replace(/[^a-zA-Z0-9]/g, '_') : 'Notice';
        const timestamp = Date.now();
        let name = `SVD_Gurukul_Notice_${title}_${timestamp}`;
        
        // For raw files (PDFs), append extension manually
        if (file.mimetype === 'application/pdf') {
            name = `${name}.pdf`;
        }
        return name;
      },
      unique_filename: false, // Use our custom public_id exactly as is
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };

