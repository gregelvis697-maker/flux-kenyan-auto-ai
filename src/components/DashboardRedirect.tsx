import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { roleHomePath } from '@/components/ProtectedRoute';

export const DashboardRedirect = () => {
  const { userRole } = useAuth();
  return <Navigate to={roleHomePath(userRole)} replace />;
};

export default DashboardRedirect;
