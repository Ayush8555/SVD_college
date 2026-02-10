import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', 'Cheque', 'DD', 'Scholarship'],
    required: true
  },
  referenceId: {
    type: String, // Transaction ID or Cheque No
    trim: true
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  remarks: {
    type: String,
    trim: true
  }
});

const studentFeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure', // Link to the original fee definition
    required: true
  },
  totalAmount: {
    type: Number,
    required: true, 
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueAmount: {
    type: Number,
    default: function() {
        return this.totalAmount - this.paidAmount;
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid'],
    default: 'Pending'
  },
  transactions: [transactionSchema] // History of payments
}, { timestamps: true });

// Ensure one fee structure is assigned to a student only once
studentFeeSchema.index({ student: 1, feeStructure: 1 }, { unique: true });

// Middleware to update status and dueAmount before saving
studentFeeSchema.pre('save', function(next) {
  this.dueAmount = this.totalAmount - this.paidAmount;
  
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else {
    this.status = 'Pending';
  }
  next();
});

const StudentFee = mongoose.model('StudentFee', studentFeeSchema);
export default StudentFee;
