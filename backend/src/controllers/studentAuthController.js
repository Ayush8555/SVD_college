import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id, role: 'student' }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Student Signup / Account Activation
 * @route   POST /api/student/auth/signup
 * @access  Public
 */
export const signupStudent = async (req, res) => {
    try {
        const { rollNumber, email, password } = req.body;
        
        // 1. Check if student exists (must be pre-loaded via Admin result upload or created manually first? 
        // OR allow fresh create if not exists? Protocol: Roll number must exist in DB (uploaded by Admin or pre-seeded). 
        // If we allow open signup, anyone can create fake roll numbers.
        // Rule: Student record MUST exist (created by Admin upload). They just "Activate" it.
        
        let student = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });

        if (!student) {
            // Option 2: Allow creation if strictly controlling via Email domain or something. 
            // For this project, let's allow Fresh Signup if not exists, but mark unverified.
            // Requirement says "If student does not have account -> Signup". 
            // We will create new record.
             student = await Student.create({
                 rollNumber: rollNumber.toUpperCase(),
                 firstName: 'Student', // Placeholder
                 lastName: rollNumber,
                 email,
                 password,
                 dateOfBirth: new Date('2000-01-01'), // Valid date
                 gender: 'Male', // Default, can be updated
                 department: 'Science', // Valid enum from Schema
                 currentSemester: 1,
                 batch: new Date().getFullYear().toString(),
                 admissionYear: new Date().getFullYear(),
                 isVerified: false
             });
        } else {
            // If exists, check if already registered/active
            if (student.password) {
                return res.status(400).json({ success: false, message: 'Account already exists. Please login.' });
            }
            // Activate existing record
            student.email = email;
            student.password = password;
        }

        // Generate Random OTP
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        student.otp = {
            code: otpCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        };
        
        await student.save();

        // TODO: Send Email via Nodemailer
        console.log(`[Mock Email] OTP for ${email}: ${otpCode}`);

        res.status(201).json({
            success: true,
            message: 'OTP sent to email. Please verify.',
            email: student.email
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Signup failed', error: error.message });
    }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/student/auth/verify
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const student = await Student.findOne({ email });

        if (!student || !student.otp || student.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (new Date() > student.otp.expiresAt) {
             return res.status(400).json({ success: false, message: 'OTP Expired' });
        }

        student.isVerified = true;
        student.otp = undefined; // Clear OTP
        await student.save();

        const token = generateToken(student._id);

        res.json({
            success: true,
            token,
            student: {
                id: student._id,
                rollNumber: student.rollNumber,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                program: student.program,
                department: student.department,
                currentSemester: student.currentSemester,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                batch: student.batch
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};

/**
 * @desc    Student Login
 * @route   POST /api/student/auth/login
 * @access  Public
 */
export const loginStudent = async (req, res) => {
    try {
        const { identifier, rollNumber, password } = req.body; // rollNumber or Email
        const loginId = identifier || rollNumber;

        if (!loginId || !password) {
            return res.status(400).json({ success: false, message: 'Please provide Roll Number/Email and Password' });
        }

        const student = await Student.findOne({
            $or: [{ email: loginId }, { rollNumber: loginId.toUpperCase() }]
        }).select('+password');

        if (!student) {
            console.log(`[LOGIN FAILED] Student not found: ${loginId}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if verify required? For now relaxed.
        // if (!student.isVerified) return res.status(401).json({ message: 'Please verify email first' });

        if (!student.password) {
             return res.status(400).json({ success: false, message: 'Account not activated. Please Signup/Register first.' });
        }

        const isMatch = await student.matchPassword(password);
        console.log(`[LOGIN DEBUG] Roll: ${student.rollNumber}, InputPW: ${password}, Match: ${isMatch}`);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(student._id);

        res.json({
            success: true,
            token,
            student: {
                id: student._id,
                rollNumber: student.rollNumber,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                program: student.program,
                department: student.department,
                currentSemester: student.currentSemester,
                dateOfBirth: student.dateOfBirth,
                gender: student.gender,
                batch: student.batch
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};

/**
 * @desc    Get Current Student Profile
 * @route   GET /api/student/me
 * @access  Private
 */
export const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
