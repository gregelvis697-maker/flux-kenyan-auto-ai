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

  // User is authenticated but role/status not yet loaded - wait
  if (!userRole || !approvalStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to pending approval page if status is pending
  if (approvalStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Redirect to auth if rejected
  if (approvalStatus === 'rejected') {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(userRole as UserRole)) {
    // Redirect to unauthorized page for strict access control
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
