import FeeStructure from '../models/FeeStructure.js';
import StudentFee from '../models/StudentFee.js';
import Student from '../models/Student.js';
import FeeExtensionRequest from '../models/FeeExtensionRequest.js';

// @desc    Create a new fee structure
// @route   POST /api/fees/structure
// @access  Admin
export const createFeeStructure = async (req, res) => {
  try {
    const { name, amount, academicYear, department, category, semester, dueDate, description } = req.body;
    
    const feeStructure = await FeeStructure.create({
      name, amount, academicYear, department, category, semester, dueDate, description
    });

    res.status(201).json({ success: true, data: feeStructure });
  } catch (err) {
    console.error('createFeeStructure ERROR:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A fee structure with this name, academic year, department and semester already exists.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Soft delete a fee structure
// @route   DELETE /api/fees/structure/:id
// @access  Admin, Principal
export const deleteFeeStructure = async (req, res) => {
    try {
        const feeStructure = await FeeStructure.findById(req.params.id);

        if (!feeStructure) {
            return res.status(404).json({ success: false, message: 'Fee structure not found' });
        }

        const { cascade } = req.query;

        // If cascade is true, delete associated student fees (only if pending/partial?)
        // Requirement: "want to affect students who already have this fee assigned"
        // Safe approach: Delete Pending fees. Paid fees should probably be kept or flagged?
        // User asked: "affect students who already have this fee assigned"
        // Let's delete ALL StudentFee records for this structure if cascade is true.
        // But StudentFee has transactions, deleting them destroys financial records.
        // BETTER: Only delete fees that have NO payments (status 'Pending' and paidAmount 0).
        // Or if user strictly wants to remove it, we remove it.
        // Let's stick to safe defaults: Remove only if cascade=true. 
        // If cascade=true, we remove StudentFee records.
        
        let deletedCount = 0;
        if (cascade === 'true') {
            // Delete only unpaid fees to prevent financial discrepancy
            const result = await StudentFee.deleteMany({ 
                feeStructure: req.params.id,
                paidAmount: 0 
            });
            deletedCount = result.deletedCount;
        }

        // Soft delete the structure
        feeStructure.isActive = false;
        await feeStructure.save();

        res.status(200).json({ 
            success: true, 
            message: cascade === 'true' 
                ? `Fee structure removed and ${deletedCount} uncollected student assignments deleted.` 
                : 'Fee structure removed (Student assignments preserved).' 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all fee structures
// @route   GET /api/fees/structure
// @access  Admin, Student
export const getFeeStructures = async (req, res) => {
    try {
        const structures = await FeeStructure.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: structures });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Assign fee structure to students
// @route   POST /api/fees/assign
// @access  Admin
export const assignFeeToStudents = async (req, res) => {
    try {
        const { feeStructureId } = req.body;
        const feeStructure = await FeeStructure.findById(feeStructureId);
        
        if (!feeStructure) {
            return res.status(404).json({ success: false, message: 'Fee structure not found' });
        }

        // Find eligible students based on Department and Category
        // Note: Year/Semester logic can be complex, simplifying to Department for now based on Schema
        const query = { 
            department: feeStructure.department, 
            status: 'Active' 
        };
        
        if (feeStructure.category !== 'All') {
            query.category = feeStructure.category;
        }

        // Also simple check for semester if student has currentSemester field (assuming Student model has it or we deduce from year)
        // For this MVP, we will rely on admin selection or broadcast to department. 
        // Let's stick to the plan: Department + Category match.
        
        const students = await Student.find(query);
        
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'No matching students found for this fee criteria' });
        }

        const studentFees = students.map(student => ({
            student: student._id,
            feeStructure: feeStructure._id,
            totalAmount: feeStructure.amount,
            dueAmount: feeStructure.amount,
            status: 'Pending',
            transactions: []
        }));

        // Use insertedIds to avoid duplicates error or use ordered: false
        try {
            const result = await StudentFee.insertMany(studentFees, { ordered: false });
            res.status(201).json({ 
                success: true, 
                message: `Fee assigned to ${result.length} students successfully`,
                assignedCount: result.length
            });
        } catch (insertError) {
             // If some failed (likely duplicates), just report success count
             // insertMany with ordered:false throws error but continues
             const insertedCount = insertError.insertedDocs ? insertError.insertedDocs.length : 0;
             if(insertedCount > 0){
                 return res.status(201).json({ 
                    success: true, 
                    message: `Fee assigned to ${insertedCount} new students. (${students.length - insertedCount} already assigned)`,
                    assignedCount: insertedCount
                 });
             } else {
                 throw insertError; // If all failed, throw real error
             }
        }

    } catch (err) {
        // Validation error for duplicate assignment handles gracefully above if using insertMany
        if (err.code === 11000) {
             return res.status(400).json({ success: false, message: 'Fee already assigned to these students' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get student dues (For Student Portal)
// @route   GET /api/fees/my-dues
// @access  Student
export const getMyDues = async (req, res) => {
    try {
        const studentId = req.user._id; // from protect middleware
        const fees = await StudentFee.find({ student: studentId })
            .populate('feeStructure', 'name academicYear dueDate amount')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, data: fees });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get dues for a specific student (For Admin)
// @route   GET /api/fees/student/:id
// @access  Admin
export const getStudentDuesAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const fees = await StudentFee.find({ student: id })
            .populate('feeStructure', 'name academicYear dueDate amount');
        res.status(200).json({ success: true, data: fees });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Record a payment
// @route   POST /api/fees/pay
// @access  Admin (or Student Mock)
export const recordPayment = async (req, res) => {
    try {
        const { studentFeeId, amount, paymentMode, referenceId, remarks } = req.body;
        
        const feeRecord = await StudentFee.findById(studentFeeId);
        if (!feeRecord) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }

        if (feeRecord.status === 'Paid') {
            return res.status(400).json({ success: false, message: 'Fee already fully paid' });
        }
        
        if (amount <= 0) {
             return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        // Add transaction
        const newTransaction = {
            amount: Number(amount),
            paymentMode,
            referenceId,
            remarks,
            date: new Date(),
            receiptNumber: `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };

        feeRecord.transactions.push(newTransaction);
        feeRecord.paidAmount += Number(amount);
        
        // Due Amount and Status update handled by pre-save middleware in Model
        await feeRecord.save();

        res.status(200).json({ 
            success: true, 
            message: 'Payment recorded successfully', 
            data: feeRecord,
            receipt: newTransaction
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Student records a fee payment
// @route   POST /api/fees/student-pay
// @access  Student
export const studentPayFee = async (req, res) => {
    try {
        const { studentFeeId, amount, paymentMode, referenceId, remarks } = req.body;
        const studentId = req.user._id;

        const feeRecord = await StudentFee.findOne({ _id: studentFeeId, student: studentId });
        if (!feeRecord) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }

        if (feeRecord.status === 'Paid') {
            return res.status(400).json({ success: false, message: 'Fee already fully paid' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid payment amount' });
        }

        if (!paymentMode) {
            return res.status(400).json({ success: false, message: 'Payment mode is required' });
        }

        // Create transaction
        const newTransaction = {
            amount: Number(amount),
            paymentMode,
            referenceId: referenceId || '',
            remarks: remarks || `Student payment via ${paymentMode}`,
            date: new Date(),
            receiptNumber: `RCPT-${Date.now()}-${Math.floor(Math.random() * 10000)}`
        };

        feeRecord.transactions.push(newTransaction);
        feeRecord.paidAmount += Number(amount);

        // Status update handled by pre-save middleware
        await feeRecord.save();

        res.status(200).json({
            success: true,
            message: 'Payment recorded successfully',
            data: feeRecord,
            receipt: newTransaction
        });

    } catch (err) {
        console.error('studentPayFee ERROR:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Student creates a date extension request
// @route   POST /api/fees/extension-request
// @access  Student
export const createExtensionRequest = async (req, res) => {
    try {
        const { studentFeeId, requestedDueDate, reason } = req.body;
        const studentId = req.user._id;

        if (!studentFeeId || !requestedDueDate || !reason) {
            return res.status(400).json({ success: false, message: 'Please provide fee ID, requested date, and reason' });
        }

        const feeRecord = await StudentFee.findOne({ _id: studentFeeId, student: studentId })
            .populate('feeStructure', 'dueDate name');

        if (!feeRecord) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }

        if (feeRecord.status === 'Paid') {
            return res.status(400).json({ success: false, message: 'Fee is already paid, no extension needed' });
        }

        // Check if a pending request already exists
        const existing = await FeeExtensionRequest.findOne({
            student: studentId,
            studentFee: studentFeeId,
            status: 'Pending'
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'You already have a pending extension request for this fee' });
        }

        const request = await FeeExtensionRequest.create({
            student: studentId,
            studentFee: studentFeeId,
            currentDueDate: feeRecord.feeStructure.dueDate,
            requestedDueDate: new Date(requestedDueDate),
            reason
        });

        res.status(201).json({
            success: true,
            message: 'Extension request submitted successfully',
            data: request
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Admin gets all extension requests
// @route   GET /api/fees/extension-requests
// @access  Admin
export const getExtensionRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const requests = await FeeExtensionRequest.find(query)
            .populate('student', 'rollNumber firstName lastName department')
            .populate({
                path: 'studentFee',
                populate: { path: 'feeStructure', select: 'name dueDate academicYear' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Admin approves or rejects an extension request
// @route   PUT /api/fees/extension-request/:id
// @access  Admin
export const resolveExtensionRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminRemarks } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
        }

        const request = await FeeExtensionRequest.findById(id)
            .populate('studentFee');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Extension request not found' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Request already resolved' });
        }

        request.status = status;
        request.adminRemarks = adminRemarks || '';
        request.resolvedBy = req.user._id;
        request.resolvedAt = new Date();
        await request.save();

        // If approved, update the FeeStructure dueDate for this student's context
        // Since FeeStructure dueDate is shared, we don't change it globally.
        // Instead we note the approval. The admin can manually adjust if needed.

        res.status(200).json({
            success: true,
            message: `Extension request ${status.toLowerCase()} successfully`,
            data: request
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
