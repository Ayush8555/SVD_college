import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Admin from '../models/Admin.js';
import Course from '../models/Course.js';
import Result from '../models/Result.js';
import Student from '../models/Student.js';

describe('General Public APIs', () => {
    beforeAll(async () => {
        const testURI = process.env.MONGODB_URI.replace('college_results', 'college_results_test');
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testURI);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('Courses API', () => {
        let adminToken;
        
        beforeEach(async () => {
            await Admin.deleteMany({});
            await Course.deleteMany({});
            
            const admin = await Admin.create({
                firstName: 'Course',
                lastName: 'Admin',
                employeeId: 'COURSE_ADM',
                username: 'course_admin',
                password: 'password123',
                email: 'course_admin@college.edu',
                role: 'admin',
                designation: 'System Admin',
                department: 'Administration'
            });
            
            const login = await request(app)
                .post('/api/admin/auth/login')
                .send({ employeeId: 'COURSE_ADM', password: 'password123' });
            adminToken = login.body.token;

            await Course.create({
                courseName: 'Computer Science',
                department: 'B.Sc',
                semester: 1,
                credits: 4,
                maxMarks: 100,
                passingMarks: 33
            });
        });

        it('GET /api/courses should return list of courses (Authenticated)', async () => {
            const res = await request(app)
                .get('/api/courses')
                .set('Authorization', `Bearer ${adminToken}`);
                
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].courseName).toBe('Computer Science');
        });
    });

    describe('Results API', () => {
        beforeEach(async () => {
            await Student.deleteMany({ rollNumber: 'RES2023001' });
            await Result.deleteMany({ rollNumber: 'RES2023001' });

            const student = await Student.create({
                rollNumber: 'RES2023001',
                firstName: 'Result',
                lastName: 'Student',
                dateOfBirth: '2000-01-01',
                gender: 'Male',
                department: 'Science', // Valid Enum
                program: 'B.Sc',       // Valid Enum
                currentSemester: 1
            });

            await Result.create({
                student: student._id,
                rollNumber: 'RES2023001',
                semester: 1,
                academicYear: '2022-2023', // Required
                examType: 'Regular',
                sgpa: 9.5,
                cgpa: 9.5,
                totalCredits: 4,     // Required
                creditsEarned: 4,    // Required
                result: 'Pass',      // Required, enum: Pass, Fail, ATKT, Withheld
                subjects: [
                    { 
                        courseName: 'Maths', 
                        courseCode: 'M101', 
                        credits: 4,
                        marks: {
                            total: 90,
                            internal: 30,
                            external: 60,
                            maxMarks: 100
                        }, 
                        grade: 'A', // Enum: O, A+, A, B+, B, C, D, F, AB, NA
                        gradePoint: 9, 
                        status: 'Pass' // Enum: Pass, Fail
                    }
                ],
                isPublished: true
            });
        });

        it('POST /api/results/check should return result for valid student', async () => {
            const res = await request(app)
                .post('/api/results/check')
                .send({
                    rollNumber: 'RES2023001',
                    dateOfBirth: '2000-01-01' 
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.results[0].sgpa).toBe(9.5);
        });

        it('should verify DOB before showing result', async () => {
            const res = await request(app)
                .post('/api/results/check')
                .send({
                    rollNumber: 'RES2023001',
                    dateOfBirth: '1990-01-01' // Wrong DOB
                });

            // Expect failure, usually 401 or 400 or 404
            expect(res.body.success).toBe(false);
        });
    });
    
    describe('Health Check', () => {
         it('GET /api/health should return ok', async () => {
             const res = await request(app).get('/api/health');
             expect(res.statusCode).toBe(200);
             expect(res.body.message).toBe('Server is running');
         });
    });
});
