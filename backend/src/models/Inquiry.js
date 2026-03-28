import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  fatherName: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  courseOfInterest: {
    type: String,
    required: true,
    trim: true
  },
  previousQualification: {
    type: String,
    trim: true
  },
  previousMarks: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Admitted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Optimized for sorting
  }
});

// Compound index for faster searching
inquirySchema.index({ email: 1 });
inquirySchema.index({ phone: 1 });

export default mongoose.model('Inquiry', inquirySchema, 'admission_inquiry');
