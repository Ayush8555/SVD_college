import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false, role = null }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    if(adminOnly) return <Navigate to="/admin/login" replace />;
    return <Navigate to="/student/login" replace />;
  }

  // Admin Check
  if (adminOnly && user.role !== 'admin') {
      return <Navigate to="/" replace />;
  }

  // Specific Role Check (e.g., student)
  if (role && user.role !== role) {
      if(user.role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/" replace />;
  }

  return children;
};
