import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Admin from '../models/Admin.js';
import Student from '../models/Student.js';
import Document from '../models/Document.js';
import fs from 'fs';
import path from 'path';

describe('Document System API', () => {
    let adminToken;
    let studentToken;
    let studentId;

    // Test Admin
    const adminData = {
        firstName: 'Doc',
        lastName: 'Admin',
        employeeId: 'DOC_ADMIN_001',
        username: 'doc_admin',
        password: 'password123',
        email: 'doc_admin@college.edu',
        role: 'admin',
        designation: 'System Admin',
        department: 'Administration'
    };

    // Test Student
    const studentData = {
        rollNumber: 'DOC2023CS001',
        firstName: 'Doc',
        lastName: 'Student',
        email: 'doc_student@college.edu',
        password: 'password123',
        dateOfBirth: '2000-01-01',
        gender: 'Female',
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
        await Document.deleteMany({});

        // Create Admin & Get Token
        const admin = await Admin.create(adminData);
        const adminLogin = await request(app)
            .post('/api/admin/login')
            .send({ employeeId: adminData.employeeId, password: adminData.password });
        adminToken = adminLogin.body.token;

        // Create Student & Get Token
        const student = await Student.create(studentData);
        studentId = student._id;
        const studentLogin = await request(app)
            .post('/api/student/auth/login')
            .send({ rollNumber: studentData.rollNumber, password: studentData.password });
        studentToken = studentLogin.body.token;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Student Document Operations', () => {
        xit('should allow student to upload a document', async () => {
            // Create a dummy file
            const filePath = path.join(process.cwd(), 'test_file.bin');
            fs.writeFileSync(filePath, 'dummy encrypted content');

            const res = await request(app)
                .post('/api/documents/upload')
                .set('Authorization', `Bearer ${studentToken}`)
                .field('documentType', 'aadhaar')
                .field('mimeType', 'application/pdf')
                .field('consent', 'true')
                .field('encryptedDEK', 'dummy_dek')
                .field('iv', 'dummy_iv')
                .field('authTag', 'dummy_tag')
                .field('checksum', 'dummy_checksum')
                .field('uploadNonce', 'nonce_123')
                .attach('document', filePath);

            // Clean up
            fs.unlinkSync(filePath);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should get public key for encryption', async () => {
            const res = await request(app)
                .get('/api/documents/public-key')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.publicKey).toBeDefined();
        });
        
        it('should allow student to delete their pending document', async () => {
            // Manually create a document in DB as if it was uploaded
            const doc = await Document.create({
                studentId: studentId,
                documentType: 'aadhaar',
                originalFileName: 'test.pdf',
                mimeType: 'application/pdf',
                fileSize: 1024,
                encryptedFileLocation: 'dummy/loc',
                encryptedDEK: 'dummy_dek',
                iv: 'dummy_iv',
                authTag: 'dummy_tag',
                checksum: 'dummy_sum',
                uploadNonce: 'unique_nonce_1',
                consentGiven: true,
                consentTimestamp: new Date(),
                status: 'pending' // Note: 'verificationStatus' in controller might map to 'status' in schema
            });

            const res = await request(app)
                .delete(`/api/documents/${doc._id}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            
            const found = await Document.findById(doc._id);
            expect(found).toBeNull();
        });

        it('should NOT allow student to delete verified document', async () => {
            const doc = await Document.create({
                studentId: studentId,
                documentType: 'aadhaar',
                originalFileName: 'test_verified.pdf',
                mimeType: 'application/pdf',
                fileSize: 1024,
                encryptedFileLocation: 'dummy/loc',
                encryptedDEK: 'dummy_dek',
                iv: 'dummy_iv',
                authTag: 'dummy_tag',
                checksum: 'dummy_sum',
                uploadNonce: 'unique_nonce_2',
                consentGiven: true,
                consentTimestamp: new Date(),
                status: 'verified' // VERIFIED status
            });

            const res = await request(app)
                .delete(`/api/documents/${doc._id}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(400); // Bad Request
            expect(res.body.message).toContain('only delete documents that are still pending');
        });
    });

    describe('Admin Document Operations', () => {
        it('should verify a pending document', async () => {
            const doc = await Document.create({
                studentId: studentId,
                documentType: 'aadhaar',
                originalFileName: 'verify_me.pdf',
                mimeType: 'application/pdf',
                fileSize: 1024,
                encryptedFileLocation: 'dummy/loc',
                encryptedDEK: 'dummy_dek',
                iv: 'dummy_iv',
                authTag: 'dummy_tag',
                checksum: 'dummy_sum',
                uploadNonce: 'unique_nonce_3',
                consentGiven: true,
                consentTimestamp: new Date(),
                status: 'pending'
            });

            const res = await request(app)
                .patch(`/api/admin/documents/${doc._id}/verify`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ note: 'Verified via test' });

            expect(res.statusCode).toBe(200);
            
            const updated = await Document.findById(doc._id);
            expect(updated.status).toBe('verified');
        });

        it('should delete any document (admin override)', async () => {
            const doc = await Document.create({
                studentId: studentId,
                documentType: 'aadhaar',
                originalFileName: 'admin_delete.pdf',
                mimeType: 'application/pdf',
                fileSize: 1024,
                encryptedFileLocation: 'dummy/loc',
                encryptedDEK: 'dummy_dek',
                iv: 'dummy_iv',
                authTag: 'dummy_tag',
                checksum: 'dummy_sum',
                uploadNonce: 'unique_nonce_4',
                consentGiven: true,
                consentTimestamp: new Date(),
                status: 'verified' // Even verified ones
            });

            const res = await request(app)
                .delete(`/api/admin/documents/${doc._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            
            const found = await Document.findById(doc._id);
            // Soft delete check
            expect(found.isDeleted).toBe(true);
        });
    });
});
