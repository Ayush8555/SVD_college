
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Student from '../src/models/Student.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Student.countDocuments();
        console.log(`Total Students in DB: ${count}`);
        
        if (count > 0) {
            const last = await Student.findOne().sort({ createdAt: -1 });
            console.log('Last Student:', last.firstName, last.rollNumber);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
