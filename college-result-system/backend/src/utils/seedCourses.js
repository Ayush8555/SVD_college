import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Result from '../models/Result.js';
import connectDatabase from '../config/database.js';

dotenv.config();

const courses = [
    { courseCode: 'BOT101', courseName: 'Diversity of Viruses', credits: 4, department: 'Science', semester: 1, maxMarks: 100 },
    { courseCode: 'ZOO101', courseName: 'Cytology, Genetics and Infectious Diseases', credits: 4, department: 'Science', semester: 1, maxMarks: 100 },
    { courseCode: 'CHE101', courseName: 'Fundamentals of Chemistry', credits: 4, department: 'Science', semester: 1, maxMarks: 100 },
    { courseCode: 'PHY101', courseName: 'Mathematical Physics & Newtonian Mechanics', credits: 4, department: 'Science', semester: 1, maxMarks: 100 },
    { courseCode: 'MAT101', courseName: 'Differential Calculus & Integral Calculus', credits: 4, department: 'Science', semester: 1, maxMarks: 100 },
    { courseCode: 'ENG101', courseName: 'English Communication', credits: 2, department: 'Science', semester: 1, maxMarks: 100 },
    { courseCode: 'FND101', courseName: 'Food, Nutrition and Hygiene', credits: 2, department: 'Science', semester: 1, maxMarks: 100, type: 'Theory' },
    // Add dummy courses for testing if needed
];

const seedCourses = async () => {
    try {
        await connectDatabase();
        
        console.log('🌱 Seeding Courses...');
        
        let createdCount = 0;
        for (const course of courses) {
            const exists = await Course.findOne({ courseCode: course.courseCode });
            if (!exists) {
                await Course.create(course);
                createdCount++;
            }
        }
        console.log(`✅ Created ${createdCount} new courses.`);

        console.log('🔄 Migrating Results to link Courses...');
        const results = await Result.find({});
        let updatedCount = 0;

        for (const result of results) {
            let modified = false;
            for (const sub of result.subjects) {
                if (!sub.course && sub.courseCode) {
                    const courseObj = await Course.findOne({ courseCode: sub.courseCode.toUpperCase() });
                    if (courseObj) {
                        sub.course = courseObj._id;
                        modified = true;
                    }
                }
            }
            if (modified) {
                await result.save();
                updatedCount++;
            }
        }
        console.log(`✅ Updated ${updatedCount} results with Course links.`);

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedCourses();
