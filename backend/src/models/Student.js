import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true, // Indexed for fast search
      // Regex for generic Indian college roll no (e.g., GEC2023CS001)
      match: [/^[A-Z0-9\-_\/]+$/, 'Roll number must be alphanumeric (hyphens/underscores/slashes allowed)'],
    },
    enrollmentNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined to be unique (optional field)
      trim: true,
      uppercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    
    // Parent Details
    fatherName: {
        type: String,
        trim: true,
        uppercase: true
    },
    motherName: {
        type: String,
        trim: true,
        uppercase: true
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      // DOB is crucial for result verification
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    category: {
        type: String,
        enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
        default: 'General'
    },
    status: {
        type: String,
        enum: ['Active', 'Graduated', 'Dropped', 'Suspended'],
        default: 'Active'
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    email: {
      type: String,
      // required: [true, 'Email is required'], // Made optional for Result-based auto-creation
      unique: true,
      sparse: true, // Allows null/undefined to be unique
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    
    // Academic Details
    // Academic Details
    department: {
      type: String,
      required: true,
      enum: [
        'Arts',
        'Science',
        'Commerce',
        'Education',
        'Law',
        'Computer Application',
        'B.Ed',
        'B.T.C',
        'B.A',
        'LL.B'
      ],
    },
    program: {
      type: String,
      default: 'BA',
      enum: ['LL.B', 'D.El.Ed.(BTC)', 'BA', 'B.Sc', 'B.Com', 'B.Ed', 'M.A', 'M.Sc'],
    },
    batch: {
      type: String,
      // required: true, // Made optional/derived
    },
    currentSemester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    admissionYear: {
      type: Number,
      // required: true,
    },
    
    // Address Details
    address: {
      street: String,
      city: String,
      state: String,
      pincode: {
        type: String,
        match: [/^[1-9][0-9]{5}$/, 'Invalid Pincode'],
      },
    },

    // Guardian Details (Optional)
    guardianName: {
      type: String,
    },
    guardianPhone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Invalid mobile number'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Auth Fields
    password: {
      type: String,
      select: false, // Don't return by default
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
        code: String,
        expiresAt: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Encrypt password using bcrypt
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  // Only hash if password exists (might be created via Admin without password initially)
  if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
  }
});

// Match user entered password
studentSchema.methods.matchPassword = async function (enteredPassword) {
  if(!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};


// Virtual for full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes for common search queries
studentSchema.index({ department: 1, currentSemester: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ firstName: 'text', lastName: 'text', rollNumber: 'text' }); // Text search index

const Student = mongoose.model('Student', studentSchema);

export default Student;
