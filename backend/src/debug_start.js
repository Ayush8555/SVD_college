import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import connectDatabase from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import studentRoutes from './routes/studentRoutes.js';
import resultRoutes from './routes/resultRoutes.js';

// Load environment variables
dotenv.config();

console.log('DEBUG: Env loaded');

// Initialize Express app
const app = express();

// Connect to database (unless in test mode)
if (process.env.NODE_ENV !== 'test') {
  console.log('DEBUG: calling connectDatabase');
  connectDatabase();
}

console.log('DEBUG: Middleware setup');

// Security middleware
app.use(helmet()); // Set security headers

// CORS configuration
app.use(
  cors({
    origin: true, // Reflect request origin to allow 5173, 5174, etc.
    credentials: true,
  })
);

import compression from 'compression';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased limit to support 500+ concurrent students (e.g. from same campus IP)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(compression()); // Compress all responses
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('DEBUG: Middleware done, routes');

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

import studentAuthRoutes from './routes/studentAuthRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';

import adminRoutes from './routes/adminRoutes.js';
import adminResultRoutes from './routes/adminResultRoutes.js';
import adminStudentRoutes from './routes/adminStudentRoutes.js';

console.log('DEBUG: Imports done');

// API routes
// API routes
console.log('DEBUG: Auth routes used');
app.use('/api/admin/auth', adminRoutes); // Admin Auth Routes
console.log('DEBUG: Admin Auth routes used');
app.use('/api/students', studentRoutes); // Protected by middleware inside routes
app.use('/api/results', resultRoutes); // Public Check Route inside, Public Controller inside
app.use('/api/admin/results', adminResultRoutes); // Admin Management Routes
app.use('/api/admin/students', adminStudentRoutes); // Admin Student Management
app.use('/api/courses', courseRoutes); // New Course Management API

// New Features
app.use('/api/student/auth', studentAuthRoutes);
app.use('/api/queries', queryRoutes); // /api/queries, /api/queries/my, /api/queries/admin/all
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/notices', noticeRoutes);

console.log('DEBUG: Routes set 1');

// Document Verification Routes (Secure Document Upload System)
import documentRoutes from './routes/documentRoutes.js';
import adminDocumentRoutes from './routes/adminDocumentRoutes.js';
import { initEncryptionService } from './services/encryptionService.js';

import { initRedis } from './config/redis.js';

// Initialize services
console.log('DEBUG: Init Redis');
initRedis();
console.log('DEBUG: Init Enc (start)');
initEncryptionService().catch(err => {
  console.error('⚠️ Encryption service failed to initialize:', err.message);
  console.log('Document upload features will be unavailable until keys are configured.');
});
console.log('DEBUG: Init Enc (call returned)');

app.use('/api/documents', documentRoutes);
app.use('/api/admin/documents', adminDocumentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

console.log('DEBUG: Routes set all');

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  console.log('DEBUG: Entering production block');
  const __dirname = path.resolve();
  console.log('DEBUG: __dirname resolved as:', __dirname);
  
  // Serve static files from frontend/dist
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  console.log('DEBUG: express.static setup done');

  // Handle Client-side routing: return index.html for all non-API routes
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
  console.log('DEBUG: Catch-all route setup done');
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

console.log('DEBUG: Checking PORT', PORT);

if (process.env.NODE_ENV !== 'test') {
    try {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/api/health\n`);
        });
        console.log('DEBUG: app.listen called');
    } catch (e) {
        console.error('DEBUG: app.listen Error', e);
    }
} else {
    console.log('DEBUG: In test mode, not listening');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

export default app;
