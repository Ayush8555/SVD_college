import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    // courseCode: { ... } - Removed as per requirement
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    credits: {
        type: Number,
        required: true,
        min: 0,
        default: 4
    },
    department: {
        type: String,
        required: true,
        enum: [
            'LL.B',
            'D.El.Ed.(BTC)',
            'BA',
            'B.Sc' 
        ],
        index: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    type: {
        type: String,
        enum: ['Theory', 'Practical', 'Project', 'Seminar'],
        default: 'Theory'
    },
    maxMarks: {
        type: Number,
        required: true,
        default: 100
    },
    passingMarks: {
        type: Number,
        required: true,
        default: 33
    },
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index to quickly find courses for a specific semester and department
courseSchema.index({ department: 1, semester: 1 });

const Course = mongoose.model('Course', courseSchema);

export default Course;
