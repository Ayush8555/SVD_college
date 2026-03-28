import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';

describe('Authentication API', () => {
    // Setup Admin
    const adminData = {
        firstName: 'Auth',
        lastName: 'Admin',
        employeeId: 'AUTH_ADMIN_001',
        username: 'auth_admin',
        password: 'password123',
        email: 'auth_admin@college.edu',
        role: 'admin',
        designation: 'System Admin',
        department: 'Administration'
    };

    // Setup Student
    const studentData = {
        rollNumber: 'AUTH2023CS001',
        firstName: 'Test',
        lastName: 'Student',
        email: 'test_student@college.edu',
        password: 'password123',
        dateOfBirth: '2000-01-01',
        gender: 'Male',
        department: 'Science',
        program: 'B.Sc',
        currentSemester: 1,
        batch: '2023'
    };

    beforeAll(async () => {
        const testURI = process.env.MONGODB_URI.replace('college_results', 'college_results_test');
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testURI);
        }
    });
    
    beforeEach(async () => {
        await Admin.deleteMany({ email: adminData.email });
        await Student.deleteMany({ rollNumber: studentData.rollNumber });
        
        await Admin.create(adminData);
        await Student.create(studentData);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/admin/login', () => {
        it('should login admin with valid credentials', async () => {
            const res = await request(app)
                .post('/api/admin/login')
                .send({
                    employeeId: adminData.employeeId,
                    password: adminData.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/admin/login')
                .send({
                    employeeId: adminData.employeeId,
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/student/auth/login', () => {
        it('should login student with valid credentials', async () => {
            const res = await request(app)
                .post('/api/student/auth/login')
                .send({
                    rollNumber: studentData.rollNumber,
                    password: studentData.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('should reject invalid roll number', async () => {
            const res = await request(app)
                .post('/api/student/auth/login')
                .send({
                    rollNumber: 'INVALID',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
