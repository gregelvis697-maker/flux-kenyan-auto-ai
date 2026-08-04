import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'buyer' | 'dealer' | 'importer' | 'admin';

export const roleHomePath = (role?: UserRole | null) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'dealer') return '/dashboard/dealer';
  if (role === 'importer') return '/dashboard/importer';
  return '/dashboard/buyer';
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userRole, approvalStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to pending approval page if status is pending
  if (approvalStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  // Redirect to auth if rejected
  if (approvalStatus === 'rejected') {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={`/dashboard/${userRole}`} replace />;
  }

  return <>{children}</>;
};
