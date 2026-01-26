import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDatabase from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import resultRoutes from './routes/resultRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to database
connectDatabase();

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
  max: 1000, // Limit each IP to 1000 requests per windowMs (High concurrency mode)
  message: 'Too many requests from this IP, please try again later.',
});

app.use(compression()); // Compress all responses
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// New Routes
import studentAuthRoutes from './routes/studentAuthRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import courseRoutes from './routes/courseRoutes.js';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', (await import('./routes/adminRoutes.js')).default); // Admin Auth Routes
app.use('/api/students', studentRoutes); // Protected by middleware inside routes
app.use('/api/results', resultRoutes); // Public Check Route inside, Public Controller inside
app.use('/api/admin/results', (await import('./routes/adminResultRoutes.js')).default); // Admin Management Routes
app.use('/api/admin/students', (await import('./routes/adminStudentRoutes.js')).default); // Admin Student Management
app.use('/api/courses', courseRoutes); // New Course Management API

// New Features
app.use('/api/student/auth', studentAuthRoutes);
app.use('/api/queries', queryRoutes); // /api/queries, /api/queries/my, /api/queries/admin/all

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Government Engineering College - Result Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      results: '/api/results',
      health: '/api/health',
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health\n`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

export default app;
