import FeeStructure from '../models/FeeStructure.js';
import StudentFee from '../models/StudentFee.js';
import Student from '../models/Student.js';
import FeeExtensionRequest from '../models/FeeExtensionRequest.js';

// @desc    Create a new fee structure
// @route   POST /api/fees/structure
// @access  Admin
export const createFeeStructure = async (req, res) => {
  try {
    const { name, amount, academicYear, department, category, semester, dueDate, description, month } = req.body;

    // Validate required fields explicitly for clearer error messages
    if (!name || !amount || !academicYear || !department || !semester || !dueDate) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields. Required: name, amount, academicYear, department, semester, dueDate. Received: ${JSON.stringify(req.body)}`
      });
    }

    // Drop old index if it exists (migration for month support)
    try {
      const collection = FeeStructure.collection;
      const indexes = await collection.indexes();
      // Drop any index on these fields that DOES NOT include 'month'
      const oldIndex = indexes.find(idx =>
        idx.key && idx.key.name === 1 && idx.key.academicYear === 1 &&
        idx.key.department === 1 && idx.key.semester === 1 &&
        !idx.key.month // Key check: if month is missing, it's the old index
      );
      if (oldIndex) {
        await collection.dropIndex(oldIndex.name);
        console.log(`Dropped old index ${oldIndex.name} to allow month-based uniqueness.`);
      }
    } catch (indexErr) {
      console.log('Index check skipped:', indexErr.message);
    }

    const feeStructure = await FeeStructure.create({
      name, amount, academicYear, department, category, semester, dueDate, description,
      month: month || 'N/A'
    });

    res.status(201).json({ success: true, data: feeStructure });
  } catch (err) {
    console.error('createFeeStructure ERROR:', err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A fee structure with these details already exists.' });
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
        const query = { 
            department: feeStructure.department, 
            status: 'Active' 
        };
        
        if (feeStructure.category !== 'All') {
            query.category = feeStructure.category;
        }
        
        const students = await Student.find(query);
        
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'No matching students found for this fee criteria' });
        }

        // Pre-filter: Find students who already have THIS specific fee structure assigned
        const existingAssignments = await StudentFee.find({
            feeStructure: feeStructure._id,
            student: { $in: students.map(s => s._id) }
        }).select('student');

        const alreadyAssignedIds = new Set(existingAssignments.map(a => a.student.toString()));
        
        // Only create fees for students who don't already have THIS fee structure
        const newStudents = students.filter(s => !alreadyAssignedIds.has(s._id.toString()));

        if (newStudents.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: `This fee is already assigned to all ${students.length} matching students` 
            });
        }

        const studentFees = newStudents.map(student => ({
            student: student._id,
            feeStructure: feeStructure._id,
            totalAmount: feeStructure.amount,
            dueAmount: feeStructure.amount,
            status: 'Pending',
            transactions: []
        }));

        const result = await StudentFee.insertMany(studentFees, { ordered: false });
        
        const alreadyCount = students.length - newStudents.length;
        const message = alreadyCount > 0
            ? `Fee assigned to ${result.length} new students. (${alreadyCount} already had this fee)`
            : `Fee assigned to ${result.length} students successfully`;

        res.status(201).json({ 
            success: true, 
            message,
            assignedCount: result.length
        });

    } catch (err) {
        console.error('assignFeeToStudents ERROR:', err);
        if (err.code === 11000) {
             // Race condition handling: Check if assignments now exist (idempotency)
             try {
                const count = await StudentFee.countDocuments({ 
                    feeStructure: feeStructure._id,
                    student: { $in: students.map(s => s._id) }
                });
                
                if (count > 0) {
                     return res.status(200).json({ 
                        success: true, 
                        message: `Fee verified for ${count} students. (Processed by concurrent request)`,
                        assignedCount: count
                     });
                }
             } catch (checkErr) {
                 console.error('Error verifying fee assignment:', checkErr);
             }

             return res.status(400).json({ success: false, message: 'Duplicate fee assignment detected. Please refresh to see current status.' });
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
            receiptNumber: `RCPT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            receiptUrl: req.file ? req.file.path : undefined,
            isVerified: false
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

// @desc    Get fee analysis stats (enhanced for dashboard)
// @route   GET /api/fees/stats
// @access  Admin
export const getFeeAnalysis = async (req, res) => {
    try {
        // Core aggregation
        const stats = await StudentFee.aggregate([
            {
                $group: {
                    _id: null,
                    totalExpected: { $sum: "$totalAmount" },
                    totalCollected: { $sum: "$paidAmount" },
                    totalPending: { $sum: "$dueAmount" },
                    count: { $sum: 1 },
                    uniqueStudents: { $addToSet: "$student" }
                }
            },
            {
                $project: {
                    totalExpected: 1,
                    totalCollected: 1,
                    totalPending: 1,
                    count: 1,
                    totalStudents: { $size: "$uniqueStudents" }
                }
            }
        ]);
        
        const statusStats = await StudentFee.aggregate([
            {
                $group: {
                     _id: "$status",
                     count: { $sum: 1 },
                     amount: { $sum: "$totalAmount" } 
                }
            }
        ]);

        // Count overdue students (status not Paid AND feeStructure dueDate < now)
        const overdueResult = await StudentFee.aggregate([
            { $match: { status: { $ne: 'Paid' } } },
            { $lookup: { from: 'feestructures', localField: 'feeStructure', foreignField: '_id', as: 'feeInfo' } },
            { $unwind: '$feeInfo' },
            { $match: { 'feeInfo.dueDate': { $lt: new Date() } } },
            { $group: { _id: '$student' } },
            { $count: 'overdueStudents' }
        ]);
        const overdueStudents = overdueResult[0]?.overdueStudents || 0;

        const overview = stats[0] || { totalExpected: 0, totalCollected: 0, totalPending: 0, count: 0, totalStudents: 0 };
        overview.overdueStudents = overdueStudents;

        res.status(200).json({ 
            success: true, 
            data: {
                overview,
                byStatus: statusStats
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get recent fee assignments
// @route   GET /api/fees/recent-assignments
// @access  Admin
export const getRecentAssignments = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const assignments = await StudentFee.find()
            .populate('student', 'firstName lastName rollNumber department')
            .populate('feeStructure', 'name amount dueDate')
            .sort({ createdAt: -1 })
            .limit(limit);
        res.status(200).json({ success: true, data: assignments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Search students by department/semester for fee assignment
// @route   GET /api/fees/students/search
// @access  Admin
export const searchStudentsByDept = async (req, res) => {
    try {
        const { department, semester, search } = req.query;
        const query = { status: 'Active' };
        if (department) query.department = department;
        if (semester) query.currentSemester = Number(semester);
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } }
            ];
        }
        const students = await Student.find(query)
            .select('firstName lastName rollNumber department currentSemester category')
            .sort({ rollNumber: 1 })
            .limit(200);
        res.status(200).json({ success: true, data: students, count: students.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify a fee payment transaction (Admin)
// @route   PUT /api/fees/verify-payment/:feeId/:txnId
// @access  Admin
export const verifyPayment = async (req, res) => {
    try {
        const { feeId, txnId } = req.params;
        const { isVerified, remarks } = req.body;

        const feeRecord = await StudentFee.findById(feeId);
        if (!feeRecord) {
            return res.status(404).json({ success: false, message: 'Fee record not found' });
        }

        const transaction = feeRecord.transactions.id(txnId);
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        transaction.isVerified = isVerified !== undefined ? isVerified : true;
        
        if (transaction.isVerified) {
             transaction.verificationDate = new Date();
        } else {
            transaction.verificationDate = null;
        }

        await feeRecord.save();

        res.status(200).json({ success: true, message: 'Payment verification status updated', data: feeRecord });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all student fee records with filters & pagination
// @route   GET /api/fees/student-records
// @access  Admin
export const getAllStudentFeeRecords = async (req, res) => {
    try {
        const { department, semester, status, academicYear, search, page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

        // Build StudentFee query
        const feeQuery = {};
        if (status) feeQuery.status = status;

        // Build FeeStructure filter for academic year
        let feeStructureIds = null;
        if (academicYear) {
            const matchingStructures = await FeeStructure.find({ academicYear }).select('_id');
            feeStructureIds = matchingStructures.map(s => s._id);
            feeQuery.feeStructure = { $in: feeStructureIds };
        }

        // Build Student filter for department, semester, search
        let studentIds = null;
        const studentQuery = { status: 'Active' };
        let needStudentFilter = false;

        if (department) { studentQuery.department = department; needStudentFilter = true; }
        if (semester) { studentQuery.currentSemester = Number(semester); needStudentFilter = true; }
        if (search) {
            studentQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } }
            ];
            needStudentFilter = true;
        }

        if (needStudentFilter) {
            const matchingStudents = await Student.find(studentQuery).select('_id');
            studentIds = matchingStudents.map(s => s._id);
            feeQuery.student = { $in: studentIds };
        }

        const total = await StudentFee.countDocuments(feeQuery);
        const pages = Math.ceil(total / limitNum);

        const records = await StudentFee.find(feeQuery)
            .populate('student', 'firstName lastName rollNumber department currentSemester email')
            .populate('feeStructure', 'name amount academicYear dueDate semester')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        res.status(200).json({
            success: true,
            data: {
                records,
                total,
                page: pageNum,
                pages,
                limit: limitNum
            }
        });
    } catch (err) {
        console.error('getAllStudentFeeRecords ERROR:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Assign a fee structure to a single student
// @route   POST /api/fees/assign-single
// @access  Admin
export const assignFeeToSingleStudent = async (req, res) => {
    try {
        const { studentId, feeStructureId } = req.body;

        if (!studentId || !feeStructureId) {
            return res.status(400).json({ success: false, message: 'Student ID and Fee Structure ID are required' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const feeStructure = await FeeStructure.findById(feeStructureId);
        if (!feeStructure) {
            return res.status(404).json({ success: false, message: 'Fee structure not found' });
        }

        // Check if already assigned
        const existing = await StudentFee.findOne({ student: studentId, feeStructure: feeStructureId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'This fee is already assigned to this student' });
        }

        const studentFee = await StudentFee.create({
            student: studentId,
            feeStructure: feeStructureId,
            totalAmount: feeStructure.amount,
            dueAmount: feeStructure.amount,
            status: 'Pending',
            transactions: []
        });

        res.status(201).json({
            success: true,
            message: `Fee "${feeStructure.name}" assigned to ${student.firstName} ${student.lastName}`,
            data: studentFee
        });
    } catch (err) {
        console.error('assignFeeToSingleStudent ERROR:', err);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'This fee is already assigned to this student' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};
