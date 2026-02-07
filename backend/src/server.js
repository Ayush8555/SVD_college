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

// Initialize Express app
const app = express();

// Connect to database (unless in test mode)
if (process.env.NODE_ENV !== 'test') {
  connectDatabase();
}

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

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

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
import inquiryRoutes from './routes/inquiryRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';

// Import Admin Routes
import adminRoutes from './routes/adminRoutes.js';
import adminResultRoutes from './routes/adminResultRoutes.js';
import adminStudentRoutes from './routes/adminStudentRoutes.js';

// API routes
app.use('/api/admin', adminRoutes); // Admin Auth Routes (includes /login, /change-password)
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

// Document Verification Routes (Secure Document Upload System)
import documentRoutes from './routes/documentRoutes.js';
import adminDocumentRoutes from './routes/adminDocumentRoutes.js';
import { initEncryptionService } from './services/encryptionService.js';

// Initialize services
initEncryptionService().catch(err => {
  console.error('⚠️ Encryption service failed to initialize:', err.message);
  console.log('Document upload features will be unavailable until keys are configured.');
});

app.use('/api/documents', documentRoutes);
app.use('/api/admin/documents', adminDocumentRoutes);

// Sitemap.xml route for SEO
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://svdgurukul.edu.in/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://svdgurukul.edu.in/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://svdgurukul.edu.in/courses</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://svdgurukul.edu.in/admissions</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://svdgurukul.edu.in/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://svdgurukul.edu.in/results</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://svdgurukul.edu.in/student/login</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`);
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  // Serve static files from frontend/dist
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle Client-side routing: return index.html for all non-API routes
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
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

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health\n`);
  });

  // Graceful Shutdown Logic
  const gracefulShutdown = () => {
    console.log('🔄 Received kill signal, shutting down gracefully');
    server.close(() => {
      console.log('✅ Closed out remaining connections');
      process.exit(0);
    });

    // Force close if it takes too long
    setTimeout(() => {
      console.error('🔴 Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

// Handle unhandled promise rejections (log but don't crash)
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  // In production, we log and continue rather than crash
  // This prevents a single bad request from taking down the entire server
});

// Handle uncaught exceptions (log but don't crash for non-critical errors)
process.on('uncaughtException', (err) => {
  console.error(`💥 Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  // For truly critical errors, you might want to gracefully shutdown
  // But for most cases, logging and continuing is safer
});

export default app;

