import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fee structure name is required'], // e.g., "B.Tech CS Year 1 Tuition"
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  academicYear: {
    type: String,
    required: true, // e.g., "2024-2025"
    trim: true
  },
  department: {
    type: String,
    required: true, // e.g., "Computer Science"
  },
  category: {
    type: String,
    default: 'All', // 'General', 'OBC', or 'All'
    enum: ['All', 'General', 'OBC', 'SC', 'ST', 'EWS']
  },
  semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
  },
  dueDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Composite index to prevent duplicates
feeStructureSchema.index({ name: 1, academicYear: 1, department: 1, semester: 1 }, { unique: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
export default FeeStructure;
