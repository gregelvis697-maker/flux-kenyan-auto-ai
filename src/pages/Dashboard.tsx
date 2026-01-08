import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath } from '@/components/ProtectedRoute';

/**
 * Generic Dashboard component that redirects users to their role-specific dashboard.
 * This page should never be directly accessed - it's a fallback that ensures
 * proper routing for any edge cases.
 */
const Dashboard = () => {
  const { userRole, approvalStatus, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!userRole) {
      // No role - redirect to auth
      navigate('/auth', { replace: true });
      return;
    }

    if (approvalStatus === 'pending') {
      navigate('/pending-approval', { replace: true });
      return;
    }

    if (approvalStatus === 'approved') {
      // Redirect to proper role-specific dashboard
      const dashboardPath = getDashboardPath(userRole);
      navigate(dashboardPath, { replace: true });
    }
  }, [userRole, approvalStatus, loading, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default Dashboard;
