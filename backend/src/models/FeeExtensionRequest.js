import mongoose from 'mongoose';

const feeExtensionRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    studentFee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentFee',
        required: true
    },
    currentDueDate: {
        type: Date,
        required: true
    },
    requestedDueDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for the extension request'],
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminRemarks: {
        type: String,
        trim: true
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    }
}, { timestamps: true });

// Index for quick lookup
feeExtensionRequestSchema.index({ student: 1, status: 1 });
feeExtensionRequestSchema.index({ status: 1, createdAt: -1 });

const FeeExtensionRequest = mongoose.model('FeeExtensionRequest', feeExtensionRequestSchema);
export default FeeExtensionRequest;
