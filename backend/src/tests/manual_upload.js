import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from '../models/Student.js';
import StudentFee from '../models/StudentFee.js';
import FeeStructure from '../models/FeeStructure.js'; // Ensure model is registered

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find a student with pending fees
        // We might need to populate 'feeStructure' too if not strictly required by model/controller logic but good to have context
        const fee = await StudentFee.findOne({ status: 'Pending' }).populate('student');
        if (!fee) {
            console.log('No pending fees found');
            process.exit(0);
        }

        const student = fee.student;
        console.log(`Using student: ${student.firstName} (${student.rollNumber})`);

        // Generate Token
        // payload matches authMiddleware: decoded.id
        const token = jwt.sign({ id: student._id, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Use pre-created valid 1x1 PNG file
        const filePath = path.join(__dirname, 'test_receipt.png');
        if (!fs.existsSync(filePath)) {
            // Create a valid 1x1 pixel PNG from base64
            const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
            fs.writeFileSync(filePath, pngBuffer);
        }
        console.log('Test file size:', fs.statSync(filePath).size, 'bytes');

        // Form Data
        const form = new FormData();
        form.append('studentFeeId', fee._id.toString());
        form.append('amount', '100'); // Partial payment
        form.append('paymentMode', 'Cash');
        form.append('receipt', fs.createReadStream(filePath)); // Field name 'receipt' matches route and controller

        // Axios Call to local server
        const config = {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        };

        const PORT = process.env.PORT || 5001;
        console.log(`Sending request to http://127.0.0.1:${PORT}/api/fees/student-pay ...`);
        const response = await axios.post(`http://127.0.0.1:${PORT}/api/fees/student-pay`, form, config);
        console.log('Upload Success:', response.data);

        // Clean up
        fs.unlinkSync(filePath);

    } catch (err) {
        console.error('Upload Failed Raw Error:', err);
        if (err.response) {
             console.error('Response Status:', err.response.status);
             console.error('Response Data:', err.response.data);
        }
    } finally {
        await mongoose.disconnect();
        // process.exit(); // Let it exit naturally to ensure logs flush
    }
};

console.log('Checking Env:', {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
    API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
    API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});

run();
