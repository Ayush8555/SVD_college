import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a notice title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide notice content']
  },
  type: {
    type: String,
    enum: ['General', 'Urgent', 'Holiday', 'Exam', 'Event'],
    default: 'General'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying of active notices
noticeSchema.index({ isActive: 1, createdAt: -1 });

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;
