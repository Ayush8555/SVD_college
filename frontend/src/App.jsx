import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { UIIntelligenceProvider } from './context/UIIntelligenceContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import SmoothScroll from './components/SmoothScroll';
// CustomCursor removed for performance optimization

// Lazy Loaded Pages to improve performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NoticesPage = lazy(() => import('./pages/NoticesPage'));
const StudentLogin = lazy(() => import('./pages/student/StudentLogin'));
const StudentLayout = lazy(() => import('./components/StudentLayout'));
const StudentOverview = lazy(() => import('./pages/StudentOverview'));
const StudentExamination = lazy(() => import('./pages/StudentExamination'));
const StudentResultView = lazy(() => import('./pages/StudentResultView'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const StudentHelpDesk = lazy(() => import('./pages/StudentHelpDesk'));
const StudentFeePortal = lazy(() => import('./pages/student/StudentFeePortal'));
const AdminHelpDesk = lazy(() => import('./pages/AdminHelpDesk'));
const AdmissionInquiry = lazy(() => import('./pages/AdmissionInquiry'));
const AdminInquiries = lazy(() => import('./pages/AdminInquiries'));

// Document Verification System
const DocumentUpload = lazy(() => import('./components/documents/DocumentUpload'));
const AdminDocumentQueue = lazy(() => import('./pages/admin/AdminDocumentQueue'));
const AuditLogViewer = lazy(() => import('./components/admin/AuditLogViewer'));
const AdminNoticeManager = lazy(() => import('./pages/admin/AdminNoticeManager'));


// Premium Loading Spinner Component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
            {/* Outer ring */}
            <div className="w-14 h-14 rounded-full border-4 border-primary-100"></div>
            {/* Spinning segment */}
            <div className="absolute top-0 left-0 w-14 h-14 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
        </div>
    </div>
);

function App() {
  return (
    <UIIntelligenceProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <SmoothScroll />
            {/* Custom Cursor removed for performance */}
            <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admission-inquiry" element={<AdmissionInquiry />} />
              <Route path="/result" element={<ResultPage />} />
              
              {/* STUDENT PORTAL */}
              <Route path="/student/login" element={<StudentLogin />} />
              
              <Route
                path="/student"
                element={
                  <ProtectedRoute role="student">
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                  <Route path="dashboard" element={<StudentOverview />} />
                  <Route path="examination" element={<StudentExamination />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="queries" element={<StudentHelpDesk />} />
                  <Route path="fees" element={<StudentFeePortal />} />

                  <Route path="documents" element={<DocumentUpload />} />
                  {/* Default redirect */}
                  <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Standalone Route for Marksheet (New Tab Support) */}
              <Route 
                path="/student/result/:id" 
                element={
                    <ProtectedRoute role="student">
                        <StudentResultView />
                    </ProtectedRoute>
                } 
              />

              {/* ADMIN ROUTES */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
               {/* Redirect /admin/dashboard to /admin for backward compatibility */}
               <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
               
               <Route
                path="/admin/help-desk"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminHelpDesk />
                  </ProtectedRoute>
                }
              />
               
               <Route
                 path="/admin/inquiries"
                 element={
                   <ProtectedRoute adminOnly>
                     <AdminInquiries />
                   </ProtectedRoute>
                 }
               />
               
               {/* Document Verification System */}
               <Route
                 path="/admin/documents"
                 element={
                   <ProtectedRoute adminOnly>
                     <AdminDocumentQueue />
                   </ProtectedRoute>
                 }
               />
               <Route
                 path="/admin/documents/logs"
                 element={
                   <ProtectedRoute adminOnly>
                     <AuditLogViewer />
                   </ProtectedRoute>
                 }
               />



              {/* Catch all - Redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </UIIntelligenceProvider>
  );
}

export default App;

