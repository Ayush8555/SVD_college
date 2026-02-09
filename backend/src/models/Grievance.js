import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['Academic', 'Fee', 'Result', 'Infrastructure', 'Other'],
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
      index: true
    },
    adminReply: {
      type: String,
      trim: true
    },
    resolvedAt: Date,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster filtering
grievanceSchema.index({ createdAt: -1 });

const Grievance = mongoose.model('Grievance', grievanceSchema);

export default Grievance;
