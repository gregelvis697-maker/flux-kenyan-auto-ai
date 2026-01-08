import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'buyer' | 'dealer' | 'importer' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, approvalStatus, loading } = useAuth();

  // Block UI until auth state is resolved
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated but role/status not yet loaded - show loading
  if (!userRole || !approvalStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check approval status first
  if (approvalStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (approvalStatus === 'rejected') {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access - redirect to correct dashboard if wrong role
  if (allowedRoles && !allowedRoles.includes(userRole as UserRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Helper function to get proper dashboard path for a role
export const getDashboardPath = (role: UserRole | null): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'dealer':
      return '/dashboard/dealer';
    case 'importer':
      return '/dashboard/importer';
    case 'buyer':
      return '/dashboard/buyer';
    default:
      return '/auth';
  }
};
