import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Notice from '../models/Notice.js';
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

describe('Notice Board API Routes', () => {
    let adminToken;
    let adminId;

    // Connect to in-memory/test database before running tests
    beforeAll(async () => {
        // Connect to a specific test database to avoid wiping production data
        const testURI = process.env.MONGODB_URI.replace('college_results', 'college_results_test');
        await mongoose.connect(testURI);
    });

    // Clear notices before each test
    beforeEach(async () => {
        await Notice.deleteMany({});
        
        // Create a test admin for authentication
        await Admin.deleteMany({ email: 'test_admin@college.edu' });
        const admin = await Admin.create({
            firstName: 'Test',
            lastName: 'Admin',
            employeeId: 'ADM001',
            username: 'test_admin',
            password: 'password123',
            email: 'test_admin@college.edu',
            role: 'admin',
            designation: 'System Admin',
            department: 'Administration'
        });
        adminId = admin._id;
        
        // Generate JWT token
        adminToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Test GET /api/notices (Public)
    describe('GET /api/notices', () => {
        it('should return empty list when no notices exist', async () => {
            const res = await request(app).get('/api/notices');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
        });

        it('should return only active notices for public', async () => {
            // Create one active and one inactive notice
            await Notice.create({
                title: 'Active Notice',
                content: 'This is active',
                type: 'General',
                priority: 'Low',
                isActive: true,
                createdBy: adminId
            });
            
            await Notice.create({
                title: 'Inactive Notice',
                content: 'This is inactive',
                type: 'General',
                priority: 'Low',
                isActive: false,
                createdBy: adminId
            });

            const res = await request(app).get('/api/notices');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].title).toBe('Active Notice');
        });
    });

    // Test POST /api/notices (Admin)
    describe('POST /api/notices', () => {
        it('should create a new notice when authorized', async () => {
            const newNotice = {
                title: 'Exam Schedule',
                content: 'Final exams start next week',
                type: 'Exam',
                priority: 'High'
            };

            const res = await request(app)
                .post('/api/notices')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newNotice);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.title).toBe(newNotice.title);
            expect(res.body.data.type).toBe(newNotice.type);
            expect(res.body.data.isActive).toBe(true); // Default
        });

        it('should reject unauthorized creation', async () => {
            const res = await request(app)
                .post('/api/notices')
                .send({ title: 'Hacked Notice' });
            
            expect(res.statusCode).toBe(401);
        });
    });

    // Test PUT /api/notices/:id/toggle (Admin)
    describe('PUT /api/notices/:id/toggle', () => {
        it('should toggle notice status', async () => {
            const notice = await Notice.create({
                title: 'Toggle Me',
                content: 'Content',
                type: 'General',
                isActive: true,
                createdBy: adminId
            });

            const res = await request(app)
                .put(`/api/notices/${notice._id}/toggle`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.isActive).toBe(false);

            // Toggle back
            const res2 = await request(app)
                .put(`/api/notices/${notice._id}/toggle`)
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res2.statusCode).toBe(200);
            expect(res2.body.data.isActive).toBe(true);
        });
    });

    // Test DELETE /api/notices/:id (Admin)
    describe('DELETE /api/notices/:id', () => {
        it('should delete a notice', async () => {
            const notice = await Notice.create({
                title: 'Delete Me',
                content: 'Content',
                type: 'General',
                createdBy: adminId
            });

            const res = await request(app)
                .delete(`/api/notices/${notice._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            
            const found = await Notice.findById(notice._id);
            expect(found).toBeNull();
        });
    });
});
