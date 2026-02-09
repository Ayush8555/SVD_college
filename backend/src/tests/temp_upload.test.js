import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Admin from '../models/Admin.js';
import Notice from '../models/Notice.js';
import jwt from 'jsonwebtoken';
import path from 'path';

describe('Notice Upload - Temporary Test', () => {
    let adminToken;

    beforeAll(async () => {
        const testURI = process.env.MONGODB_URI.replace('college_results', 'college_results_upload_test');
        await mongoose.connect(testURI);
    });

    beforeEach(async () => {
        await Notice.deleteMany({});
        await Admin.deleteMany({ email: 'test_admin_upload@college.edu' });
        
        const admin = await Admin.create({
            firstName: 'Test',
            lastName: 'Admin',
            employeeId: 'ADM002',
            username: 'test_admin_upload',
            password: 'password123',
            email: 'test_admin_upload@college.edu',
            role: 'admin',
            designation: 'System Admin',
            department: 'Administration'
        });
        
        adminToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should upload an image notice successfully', async () => {
        const imagePath = path.resolve(process.cwd(), '../frontend/src/assets/notices-hero-bg.png');
        
        const res = await request(app)
            .post('/api/notices')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('title', 'Upload Test Notice')
            .field('content', 'Testing upload functionality')
            .field('category', 'General')
            .field('priority', 'High')
            .attach('image', imagePath);

        if (res.statusCode !== 201) {
            console.error('Upload Error Response:', res.body);
        }

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.imageUrl).toBeDefined();
        console.log('Uploaded Image URL:', res.body.data.imageUrl);
    }, 30000); // 30s timeout for Cloudinary upload
});
