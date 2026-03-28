import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

dotenv.config();

const API_URL = 'http://localhost:5001/api';

const run = async () => {
    try {
        // Connect to DB to create/find an admin
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find existing admin or create one
        let admin = await Admin.findOne({ email: 'test_admin_manual@college.edu' });
        if (!admin) {
            admin = await Admin.create({
                firstName: 'Test',
                lastName: 'Manual',
                employeeId: 'ADM_MANUAL',
                username: 'test_admin_manual',
                password: 'password123',
                email: 'test_admin_manual@college.edu',
                role: 'admin',
                designation: 'System Admin',
                department: 'Administration'
            });
        }

        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        console.log('✅ Generated Admin Token');

        // Prepare file
        const filePath = path.resolve('../frontend/src/assets/notices-hero-bg.png');
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const form = new FormData();
        form.append('title', 'Manual Upload Test Notice');
        form.append('content', 'Testing upload via script');
        form.append('category', 'General');
        form.append('priority', 'High');
        form.append('image', fs.createReadStream(filePath));

        console.log('🚀 Uploading notice...');

        const res = await axios.post(`${API_URL}/notices`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Upload Success!');
        console.log('Status:', res.status);
        console.log('Data:', res.data);

        // Cleanup
        await Admin.deleteOne({ _id: admin._id });
        await mongoose.connection.close();

    } catch (err) {
        console.error('❌ Upload Failed!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

run();
