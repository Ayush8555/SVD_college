import mongoose from 'mongoose';

// Subject Schema (Embedded in Result)
const subjectResultSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    uppercase: true,
  },
  course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
  },
  courseName: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    // required: true, // Made optional for Marks Only mode
    default: 0,
    min: 0,
  },
  marks: {
    internal: {
      type: Number,
      default: 0,
      min: 0,
    },
    external: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: { // Added per user request
      type: Number,
      default: 100,
      min: 1
    }
  },
  grade: {
    type: String,
    required: true,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'AB', 'NA'], // AB = Absent, NA = Not Applied
  },
  gradePoint: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  status: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true,
  },
});

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      uppercase: true,
      index: true, // Important for fast retrieval
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    academicYear: {
      type: String,
      required: true, // e.g., "2024-25"
    },
    examType: {
      type: String,
      enum: ['Regular', 'Backlog', 'Revaluation'],
      default: 'Regular',
    },
    
    // Performance
    subjects: [subjectResultSchema],
    
    sgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    cgpa: {
      type: Number,
      default: 0, // Calculated/Updated
      min: 0,
      max: 10,
    },
    totalCredits: {
      type: Number,
      required: true,
    },
    creditsEarned: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number, // Optional, but good for display
    },
    
    result: {
      type: String,
      enum: ['Pass', 'Fail', 'ATKT', 'Withheld'],
      required: true,
    },
    
    isPublished: {
      type: Boolean,
      default: false, // Default to draft mode
      index: true,
    },
    declaredDate: {
      type: Date,
      default: Date.now,
    },
    remarks: String,
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one result per student per semester per exam type
resultSchema.index({ student: 1, semester: 1, examType: 1 }, { unique: true });
// Index for semester-based queries (merit list, gazette)
resultSchema.index({ semester: 1, isPublished: 1 });

// Pre-save hook to calculate/verify SGPA (Optional validation)
resultSchema.pre('save', async function () {
  // Calculate total credits earned
  let earned = 0;
  if(this.subjects) {
      this.subjects.forEach(sub => {
        if (sub.status === 'Pass') {
          earned += sub.credits;
        }
      });
  }
  this.creditsEarned = earned;
});

// Methods to calculate SGPA
resultSchema.methods.calculateSGPA = function () {
  let totalPoints = 0;
  let totalCredits = 0;

  this.subjects.forEach((subject) => {
    totalPoints += subject.gradePoint * subject.credits;
    totalCredits += subject.credits;
  });

  this.totalCredits = totalCredits;
  this.sgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  return this.sgpa;
};

// Method to determine overall result
resultSchema.methods.determineResult = function () {
  const failedSubjects = this.subjects.filter((sub) => sub.status === 'Fail' || sub.grade === 'F' || sub.grade === 'AB');
  
  if (failedSubjects.length === 0) {
    this.result = 'Pass';
  } else if (failedSubjects.length <= 3) {
    // Arbitrary rule: <= 3 backlogs = ATKT (Allowed To Keep Terms)
    this.result = 'ATKT';
  } else {
    this.result = 'Fail';
  }
  return this.result;
};

const Result = mongoose.model('Result', resultSchema);

export default Result;
