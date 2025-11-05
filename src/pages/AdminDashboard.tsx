import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MetricCard } from '@/components/admin/MetricCard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  BarChart3,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UserRole = 'buyer' | 'dealer' | 'importer' | 'admin';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

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

interface PendingUser {
  id: string;
  user_id: string;
  role: UserRole;
  status: ApprovalStatus;
  created_at: string;
  email: string;
  full_name?: string;
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
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      fetchPendingUsers();
    }
  }, [userRole]);

  // Apply filters
  useEffect(() => {
    let filtered = [...pendingUsers];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          u.role.toLowerCase().includes(search)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, pendingUsers]);

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

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          status,
          created_at,
          profiles!inner(email, full_name)
        `)
        .eq('status', 'pending')
        .in('role', ['dealer', 'importer'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithEmails = (data || []).map((user: any) => ({
        id: user.id,
        user_id: user.user_id,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        email: user.profiles?.email || 'Unknown',
        full_name: user.profiles?.full_name,
      }));

      setPendingUsers(usersWithEmails);
      setFilteredUsers(usersWithEmails);
    } catch (error: any) {
      console.error('Error fetching pending users:', error);
    }
  };

  const handleApprove = async (pendingUser: PendingUser) => {
    if (!user) return;

    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('user_id', pendingUser.user_id);

      if (updateError) throw updateError;

      const { error: auditError } = await supabase.from('approval_audit').insert({
        user_id: pendingUser.user_id,
        action: 'approved',
        performed_by: user.id,
        role: pendingUser.role,
      });

      if (auditError) throw auditError;

      toast({
        title: '✅ Account Approved',
        description: `${pendingUser.email} has been approved as ${pendingUser.role}`,
      });

      fetchPendingUsers();
      fetchMetrics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to approve user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (pendingUser: PendingUser) => {
    setSelectedUser(pendingUser);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!user || !selectedUser || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Rejection reason is required',
        variant: 'destructive',
      });
      return;
    }

    const trimmedReason = rejectionReason.trim();
    if (trimmedReason.length < 10) {
      toast({
        title: 'Error',
        description: 'Rejection reason must be at least 10 characters',
        variant: 'destructive',
      });
      return;
    }
    if (trimmedReason.length > 500) {
      toast({
        title: 'Error',
        description: 'Rejection reason must not exceed 500 characters',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim(),
        })
        .eq('user_id', selectedUser.user_id);

      if (updateError) throw updateError;

      const { error: auditError } = await supabase.from('approval_audit').insert({
        user_id: selectedUser.user_id,
        action: 'rejected',
        performed_by: user.id,
        role: selectedUser.role,
        rejection_reason: rejectionReason.trim(),
      });

      if (auditError) throw auditError;

      toast({
        title: '❌ Account Rejected',
        description: `${selectedUser.email} has been rejected`,
      });

      setRejectDialogOpen(false);
      setSelectedUser(null);
      setRejectionReason('');

      fetchPendingUsers();
      fetchMetrics();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to reject user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
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

        {/* Tabs for Approvals and Activity */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="approvals" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by email or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="dealer">Dealer</SelectItem>
                      <SelectItem value="importer">Importer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pending Users List */}
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground p-6 rounded-lg border border-border/50 bg-gradient-card">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((pendingUser) => (
                      <Card key={pendingUser.id} className="border-2">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">
                                  {pendingUser.email}
                                  {pendingUser.full_name && (
                                    <span className="text-sm text-muted-foreground ml-2">
                                      ({pendingUser.full_name})
                                    </span>
                                  )}
                                </h3>
                                <Badge variant="secondary" className="capitalize">
                                  {pendingUser.role}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Requested: {new Date(pendingUser.created_at).toLocaleDateString()}{' '}
                                {new Date(pendingUser.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprove(pendingUser)}
                                disabled={actionLoading}
                                className="gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectClick(pendingUser)}
                                disabled={actionLoading}
                                variant="destructive"
                                className="gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats Sidebar */}
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
                        <p className="text-sm text-muted-foreground">
                          You have {metrics.pending} pending {metrics.pending === 1 ? 'approval' : 'approvals'} waiting for review.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed activities={activities} loading={false} />
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this {selectedUser?.role} application.
                This will be recorded in the audit log.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter detailed reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {rejectionReason.length}/500 characters (minimum 10 required)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectConfirm}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
