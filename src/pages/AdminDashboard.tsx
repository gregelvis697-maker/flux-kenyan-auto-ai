import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { MetricCard } from '@/components/admin/MetricCard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  BarChart3,
  Settings
} from 'lucide-react';

interface Metrics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface Activity {
  id: string;
  action: 'approved' | 'rejected';
  user_email: string;
  role: string;
  performed_at: string;
  performed_by_email?: string;
  rejection_reason?: string;
}

export default function AdminDashboard() {
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metrics>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/dashboard/buyer');
    }
  }, [userRole, loading, navigate]);

  // Fetch metrics and activities
  useEffect(() => {
    if (userRole === 'admin') {
      fetchMetrics();
      fetchActivities();
    }
  }, [userRole]);

  // Set up realtime subscription
  useEffect(() => {
    if (userRole !== 'admin') return;

    const channel = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          fetchMetrics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'approval_audit'
        },
        () => {
          fetchActivities();
          toast({
            title: 'New Activity',
            description: 'The activity log has been updated',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, toast]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('status, role')
        .in('role', ['dealer', 'importer']);

      if (error) throw error;

      const metrics: Metrics = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      };

      data?.forEach((record) => {
        metrics[record.status as keyof Omit<Metrics, 'total'>]++;
        metrics.total++;
      });

      setMetrics(metrics);
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_audit')
        .select(`
          id,
          action,
          role,
          performed_at,
          rejection_reason,
          profiles!approval_audit_user_id_fkey(email),
          performed_by:profiles!approval_audit_performed_by_fkey(email)
        `)
        .order('performed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedActivities: Activity[] = (data || []).map((record: any) => ({
        id: record.id,
        action: record.action,
        user_email: record.profiles?.email || 'Unknown',
        role: record.role,
        performed_at: record.performed_at,
        performed_by_email: record.performed_by?.email,
        rejection_reason: record.rejection_reason,
      }));

      setActivities(formattedActivities);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time verification metrics and activity monitoring
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/approvals">
                <UserCheck className="h-4 w-4" />
                Manage Approvals
              </Link>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Pending Approvals"
            value={metrics.pending}
            icon={Clock}
            className="animate-fade-in [animation-delay:0ms]"
          />
          <MetricCard
            title="Approved Accounts"
            value={metrics.approved}
            icon={UserCheck}
            className="animate-fade-in [animation-delay:100ms]"
          />
          <MetricCard
            title="Rejected Accounts"
            value={metrics.rejected}
            icon={UserX}
            className="animate-fade-in [animation-delay:200ms]"
          />
          <MetricCard
            title="Total Applications"
            value={metrics.total}
            icon={Users}
            className="animate-fade-in [animation-delay:300ms]"
          />
        </div>

        {/* Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityFeed activities={activities} loading={false} />
          </div>

          {/* Quick Actions Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border/50 bg-gradient-card shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Approval Rate</span>
                  <span className="text-sm font-semibold text-foreground">
                    {metrics.total > 0
                      ? `${Math.round((metrics.approved / metrics.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Rejection Rate</span>
                  <span className="text-sm font-semibold text-foreground">
                    {metrics.total > 0
                      ? `${Math.round((metrics.rejected / metrics.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Pending Rate</span>
                  <span className="text-sm font-semibold text-foreground">
                    {metrics.total > 0
                      ? `${Math.round((metrics.pending / metrics.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {metrics.pending > 0 && (
              <div className="p-6 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Action Required
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You have {metrics.pending} pending {metrics.pending === 1 ? 'approval' : 'approvals'} waiting for review.
                    </p>
                    <Button asChild size="sm" className="w-full">
                      <Link to="/admin/approvals">
                        Review Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
