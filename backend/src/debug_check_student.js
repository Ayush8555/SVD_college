
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const studentSchema = new mongoose.Schema({
    rollNumber: String,
    firstName: String, 
    dateOfBirth: Date,
    password: { type: String, select: true }
});

const Student = mongoose.model('Student', studentSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        
        const students = await Student.find({}, 'rollNumber firstName dateOfBirth password').limit(5);
        
        console.log('--- STUDENT DEBUG DATA ---');
        students.forEach(s => {
            console.log(`Roll: ${s.rollNumber}`);
            console.log(`Name: ${s.firstName}`);
            console.log(`DOB Object: ${s.dateOfBirth}`);
            console.log(`DOB ISO: ${s.dateOfBirth?.toISOString()}`);
            console.log(`Password Hash: ${s.password}`);
            console.log('---------------------------');
        });
        
        console.log(`Total Students: ${await Student.countDocuments()}`);

        if (students.length > 0) {
            const sample = students[0];
            const y = sample.dateOfBirth.getFullYear();
            const m = String(sample.dateOfBirth.getMonth() + 1).padStart(2, '0');
            const d = String(sample.dateOfBirth.getDate()).padStart(2, '0');
            const expectedPass = `${y}/${m}/${d}`;
            console.log(`Expected Password for ${sample.rollNumber}: ${expectedPass}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
