import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy Loaded Pages to improve performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const StudentLogin = lazy(() => import('./pages/StudentLoginPage'));
const StudentLayout = lazy(() => import('./components/StudentLayout'));
const StudentOverview = lazy(() => import('./pages/StudentOverview'));
const StudentExamination = lazy(() => import('./pages/StudentExamination'));
const StudentResultView = lazy(() => import('./pages/StudentResultView'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const StudentHelpDesk = lazy(() => import('./pages/StudentHelpDesk'));
const AdminHelpDesk = lazy(() => import('./pages/AdminHelpDesk'));

// Loading Spinner Component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
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

              {/* Catch all - Redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
