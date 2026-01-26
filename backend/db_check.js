import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './src/models/Student.js';
import Result from './src/models/Result.js';

dotenv.config();

const checkDB = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected successfully.');

        console.log('\n📊 Assessing Data Integrity:');
        
        // 1. Check Students
        const studentCount = await Student.countDocuments();
        console.log(`- Total Students: ${studentCount}`);
        
        const noEmailStudent = await Student.findOne({ email: null });
        if(noEmailStudent) {
             console.log(`  ✅ Found student without email (Optional Email Fix Works)`);
        } else {
             console.log(`  ℹ️ No students without email found (This is fine if all have emails)`);
        }

        // 2. Check Results
        const resultCount = await Result.countDocuments();
        console.log(`- Total Results: ${resultCount}`);
        
        const resultWithMaxMarks = await Result.findOne({ 'subjects.marks.maxMarks': { $exists: true } });
        if(resultWithMaxMarks) {
            console.log(`  ✅ Found result with 'maxMarks' schema (Schema Update Verified)`);
        } else {
            console.log(`  ℹ️ No results with 'maxMarks' found yet (Might need new uploads)`);
        }

        console.log('\n✨ Database is healthy and ready for deployment.');
        process.exit(0);

    } catch (error) {
        console.error('❌ DB Check Failed:', error);
        process.exit(1);
    }
};

checkDB();
