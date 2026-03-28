import { upload } from '../config/cloudinary.js';

export const uploadNoticeImage = upload.single('image');

export default uploadNoticeImage;
