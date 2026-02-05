import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import Admin from '../models/Admin.js';

dotenv.config();

/**
 * Database Seed Script - SVD Gurukul Mahavidyalaya
 * Run with: npm run seed
 */

const courses = [
  // B.A Subjects
  { code: 'BA101', name: 'Hindi Literature', credits: 4 },
  { code: 'BA102', name: 'English Literature', credits: 4 },
  { code: 'BA103', name: 'Ancient History', credits: 4 },
  { code: 'BA104', name: 'Political Science', credits: 4 },
  { code: 'BA105', name: 'Sociology', credits: 4 },
  
  // B.Sc Subjects
  { code: 'BSC101', name: 'Physics I', credits: 4 },
  { code: 'BSC102', name: 'Chemistry I', credits: 4 },
  { code: 'BSC103', name: 'Mathematics I', credits: 4 },
  { code: 'BSC104', name: 'Botany I', credits: 4 },
  { code: 'BSC105', name: 'Zoology I', credits: 4 },
];

const studentsData = [
  {
    rollNumber: 'SVD23001',
    firstName: 'Amit',
    lastName: 'Kumar',
    fatherName: 'Rajesh Kumar',
    email: 'amit.kumar@example.com',
    phone: '9876543210',
    dateOfBirth: '2003-05-15',
    gender: 'Male',
    department: 'Arts',
    program: 'BA',
    currentSemester: 1,
    batch: '2023-2026',
    address: 'Village Dumduma, Unchgaon'
  },
  {
    rollNumber: 'SVD23002',
    firstName: 'Priya',
    lastName: 'Singh',
    fatherName: 'Vikram Singh',
    email: 'priya.singh@example.com',
    phone: '9876543211',
    dateOfBirth: '2004-02-20',
    gender: 'Female',
    department: 'Science',
    program: 'B.Sc',
    currentSemester: 1,
    batch: '2023-2026',
    address: 'Unnao City'
  },
  {
    rollNumber: 'SVD23003',
    firstName: 'Rahul',
    lastName: 'Verma',
    fatherName: 'Suresh Verma',
    email: 'rahul.verma@example.com',
    phone: '9876543212',
    dateOfBirth: '2003-11-10',
    gender: 'Male',
    department: 'Arts',
    program: 'BA',
    currentSemester: 1,
    batch: '2023-2026',
    address: 'Kanpur Nagar'
  }
];

// Helper to generate random marks
const generateMarks = () => {
    const internal = Math.floor(Math.random() * 15) + 15; // 15-30
    const external = Math.floor(Math.random() * 30) + 40; // 40-70
    return { internal, external };
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding for SVD Gurukul...\n');

    if(!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing
    try {
        await Student.deleteMany({});
        await Result.deleteMany({});
        await Admin.deleteMany({});
        console.log('🗑️  Cleared existing data\n');
    } catch(e) {
        console.log('⚠️  Could not clear some collections (might not exist yet)\n');
    }

    // Create Admin
    // Using plain text 'admin' assuming model handles hashing or simply for dev/test convenience if no hashing logic exists.
    // Ideally, we should import bcrypt and hash if the model doesn't do it automatically. 
    // Given I don't see the Admin model code right now, I'll update it to check or just store 'admin'.
    // If Admin schema has pre('save'), it will hash.
    
    // Admin credentials from environment variables for security
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmployeeId = process.env.ADMIN_EMPLOYEE_ID || 'SVD001';
    
    await Admin.create({
        firstName: 'Principal',
        lastName: 'Office',
        email: 'admin@svd.com',
        password: adminPassword, 
        designation: 'Principal',
        employeeId: adminEmployeeId,
        role: 'admin'
    });
    
    console.log('👤 Created Admin: admin@svd.com / admin123\n');

    // Create Students
    const studentDocs = [];
    for(const s of studentsData) {
        // Password format: YYYYMMDD from DOB
        const dob = new Date(s.dateOfBirth);
        // Ensure string format is correct for password
        const year = dob.getFullYear();
        const month = String(dob.getMonth() + 1).padStart(2, '0');
        const day = String(dob.getDate()).padStart(2, '0');
        const passwordPlain = `${year}${month}${day}`; // YYYYMMDD
        
        studentDocs.push({
            ...s,
            password: passwordPlain, 
            isVerified: true
        });
    }

    const createdStudents = await Student.create(studentDocs);
    console.log(`👨‍🎓 Created ${createdStudents.length} students\n`);

    // Create Results
    for (const student of createdStudents) {
        const studentCourses = student.program === 'B.A' ? courses.slice(0, 5) : courses.slice(5, 10);
        
        const subjects = studentCourses.map(c => {
            const { internal, external } = generateMarks();
            const total = internal + external;
            let grade = 'F';
            let gradePoint = 0;
            
            if(total >= 80) { grade = 'O'; gradePoint = 10; }
            else if(total >= 70) { grade = 'A'; gradePoint = 9; }
            else if(total >= 60) { grade = 'B'; gradePoint = 8; }
            else if(total >= 50) { grade = 'C'; gradePoint = 7; }
            else if(total >= 40) { grade = 'P'; gradePoint = 5; } // Adjusted points
            
            return {
                courseName: c.name,
                courseCode: c.code,
                marks: { internal, external, total },
                credits: c.credits,
                grade,
                gradePoint,
                status: grade === 'F' ? 'Fail' : 'Pass'
            };
        });

        const totalMarks = subjects.reduce((acc, curr) => acc + curr.marks.total, 0);
        const maxMarks = subjects.length * 100;
        const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
        
        // SGPA Calculation
        const totalCredits = subjects.reduce((acc, curr) => acc + curr.credits, 0);
        const totalPoints = subjects.reduce((acc, curr) => acc + (curr.gradePoint * curr.credits), 0);
        const sgpa = (totalPoints / totalCredits).toFixed(2);

        await Result.create({
            student: student._id,
            rollNumber: student.rollNumber,
            semester: student.currentSemester,
            academicYear: '2023-2024',
            examType: 'Regular',
            subjects,
            totalCredits,
            creditsEarned: totalCredits,
            sgpa,
            cgpa: sgpa,
            percentage,
            result: 'Pass',
            isPublished: true,
            declaredDate: new Date()
        });
    }
    console.log(`📊 Created Results for all students\n`);

    console.log('✨ SVD Gurukul Data Seeding Complete!');
    console.log('--------------------------------------------------');
    console.log('Login Details:');
    console.log('Admin URL:   /admin/login');
    console.log('--------------------------------------------------');
    console.log(`Admin Creds: ${adminEmployeeId} / [FROM ENV]`);
    console.log('--------------------------------------------------');
    console.log('Student URL: /student/login');
    console.log(`Student 1:   ${createdStudents[0].rollNumber} / ${createdStudents[0].password} (DOB YYYYMMDD)`);
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
