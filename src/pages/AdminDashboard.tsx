import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MetricCard } from '@/components/admin/MetricCard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { UserTable } from '@/components/admin/UserTable';
import { InsightsPanel } from '@/components/admin/InsightsPanel';
import { DemandPanel } from '@/components/admin/DemandPanel';
import { EmailLogsPanel } from '@/components/admin/EmailLogsPanel';
import { EmailTemplatesPanel } from '@/components/admin/EmailTemplatesPanel';
import { AuditTrailViewer } from '@/components/admin/AuditTrailViewer';
import { VehicleVerificationPanel } from '@/components/admin/VehicleVerificationPanel';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  BarChart3,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type UserRole = 'buyer' | 'dealer' | 'importer' | 'admin';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface Metrics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  dealers: number;
  importers: number;
  activeImports: number;
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

interface UserRecord {
  id: string;
  user_id: string;
  role: UserRole;
  status: ApprovalStatus;
  created_at: string;
  email: string;
  full_name?: string;
  approved_at?: string;
  rejected_at?: string;
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
    dealers: 0,
    importers: 0,
    activeImports: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [pendingDealers, setPendingDealers] = useState<UserRecord[]>([]);
  const [pendingImporters, setPendingImporters] = useState<UserRecord[]>([]);
  const [verifiedUsers, setVerifiedUsers] = useState<UserRecord[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<UserRecord[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Bulk actions state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkApproveDialogOpen, setBulkApproveDialogOpen] = useState(false);
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);
  const [bulkRejectionReason, setBulkRejectionReason] = useState('');

  // Redirect non-admins
  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/dashboard/buyer');
    }
  }, [userRole, loading, navigate]);

  // Fetch all data
  useEffect(() => {
    if (userRole === 'admin') {
      fetchAllData();
    }
  }, [userRole]);

  // Set up realtime subscription
  useEffect(() => {
    if (userRole !== 'admin') return;

    const channel = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => fetchAllData()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'approval_audit' },
        () => {
          fetchActivities();
          toast({ title: 'New Activity', description: 'The activity log has been updated' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, toast]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchMetrics(),
      fetchActivities(),
      fetchPendingDealers(),
      fetchPendingImporters(),
      fetchVerifiedUsers(),
      fetchRejectedUsers(),
    ]);
    setLoading(false);
  };

  const fetchMetrics = async () => {
    try {
      // Fetch user role counts
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('status, role')
        .in('role', ['dealer', 'importer']);

      // Fetch active imports count
      const { count: activeImportsCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['requested', 'accepted', 'in_transit', 'cleared']);

      const metrics: Metrics = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
        dealers: 0,
        importers: 0,
        activeImports: activeImportsCount || 0,
      };

      roleData?.forEach((record) => {
        metrics[record.status as keyof Pick<Metrics, 'pending' | 'approved' | 'rejected'>]++;
        metrics.total++;
        if (record.status === 'approved') {
          if (record.role === 'dealer') metrics.dealers++;
          if (record.role === 'importer') metrics.importers++;
        }
      });

      setMetrics(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
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
          user_id,
          performed_by
        `)
        .order('performed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch profile data separately
      const userIds = [...new Set((data || []).flatMap(r => [r.user_id, r.performed_by]))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.email]));

      const formattedActivities: Activity[] = (data || []).map((record) => ({
        id: record.id,
        action: record.action as 'approved' | 'rejected',
        user_email: profileMap.get(record.user_id) || 'Unknown',
        role: record.role,
        performed_at: record.performed_at,
        performed_by_email: profileMap.get(record.performed_by),
        rejection_reason: record.rejection_reason,
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchUsersByStatus = async (status: ApprovalStatus, role?: UserRole): Promise<UserRecord[]> => {
    try {
      let query = supabase
        .from('user_roles')
        .select('id, user_id, role, status, created_at, approved_at, rejected_at, rejection_reason')
        .eq('status', status)
        .in('role', ['dealer', 'importer'])
        .order('created_at', { ascending: false });

      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately
      const userIds = (data || []).map(u => u.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      return (data || []).map((u) => ({
        ...u,
        email: profileMap.get(u.user_id)?.email || 'Unknown',
        full_name: profileMap.get(u.user_id)?.full_name,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const fetchPendingDealers = async () => {
    const users = await fetchUsersByStatus('pending', 'dealer');
    setPendingDealers(users);
  };

  const fetchPendingImporters = async () => {
    const users = await fetchUsersByStatus('pending', 'importer');
    setPendingImporters(users);
  };

  const fetchVerifiedUsers = async () => {
    const users = await fetchUsersByStatus('approved');
    setVerifiedUsers(users);
  };

  const fetchRejectedUsers = async () => {
    const users = await fetchUsersByStatus('rejected');
    setRejectedUsers(users);
  };

  const sendVerificationEmail = async (
    email: string, 
    name: string, 
    userId: string, 
    role: UserRole, 
    action: 'approved' | 'rejected',
    reason?: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          recipientEmail: email,
          recipientName: name || email.split('@')[0],
          recipientUserId: userId,
          role,
          action,
          rejectionReason: reason,
        },
      });

      if (error) throw error;
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Don't throw - email failure shouldn't block the approval
    }
  };

  const handleApprove = async (pendingUser: UserRecord) => {
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

      // Send verification email
      await sendVerificationEmail(
        pendingUser.email,
        pendingUser.full_name || '',
        pendingUser.user_id,
        pendingUser.role,
        'approved'
      );

      toast({
        title: '✅ Account Approved',
        description: `${pendingUser.email} has been approved as ${pendingUser.role}`,
      });

      fetchAllData();
    } catch (error: any) {
      console.error('Approval error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (pendingUser: UserRecord) => {
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

    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: trimmedReason,
        })
        .eq('user_id', selectedUser.user_id);

      if (updateError) throw updateError;

      const { error: auditError } = await supabase.from('approval_audit').insert({
        user_id: selectedUser.user_id,
        action: 'rejected',
        performed_by: user.id,
        role: selectedUser.role,
        rejection_reason: trimmedReason,
      });

      if (auditError) throw auditError;

      // Send rejection email
      await sendVerificationEmail(
        selectedUser.email,
        selectedUser.full_name || '',
        selectedUser.user_id,
        selectedUser.role,
        'rejected',
        trimmedReason
      );

      toast({
        title: '❌ Account Rejected',
        description: `${selectedUser.email} has been rejected`,
      });

      setRejectDialogOpen(false);
      setSelectedUser(null);
      setRejectionReason('');
      fetchAllData();
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk approval handler
  const handleBulkApprove = async () => {
    if (!user || selectedUsers.length === 0) return;

    setActionLoading(true);
    setBulkApproveDialogOpen(false);

    try {
      // Get full user records for selected users
      const usersToApprove = [...pendingDealers, ...pendingImporters].filter(u => 
        selectedUsers.includes(u.user_id)
      );

      let successCount = 0;
      let failCount = 0;

      // Process each approval
      for (const pendingUser of usersToApprove) {
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

          await supabase.from('approval_audit').insert({
            user_id: pendingUser.user_id,
            action: 'approved',
            performed_by: user.id,
            role: pendingUser.role,
          });

          // Send verification email
          await sendVerificationEmail(
            pendingUser.email,
            pendingUser.full_name || '',
            pendingUser.user_id,
            pendingUser.role,
            'approved'
          );

          successCount++;
        } catch (error) {
          console.error(`Failed to approve ${pendingUser.email}:`, error);
          failCount++;
        }
      }

      toast({
        title: '✅ Bulk Approval Complete',
        description: `Successfully approved ${successCount} user${successCount !== 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}`,
      });

      setSelectedUsers([]);
      fetchAllData();
    } catch (error: any) {
      console.error('Bulk approval error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete bulk approval',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk rejection handler
  const handleBulkReject = async () => {
    if (!user || selectedUsers.length === 0 || !bulkRejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Rejection reason is required',
        variant: 'destructive',
      });
      return;
    }

    const trimmedReason = bulkRejectionReason.trim();
    if (trimmedReason.length < 10) {
      toast({
        title: 'Error',
        description: 'Rejection reason must be at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(true);
    setBulkRejectDialogOpen(false);

    try {
      const usersToReject = [...pendingDealers, ...pendingImporters].filter(u => 
        selectedUsers.includes(u.user_id)
      );

      let successCount = 0;
      let failCount = 0;

      for (const pendingUser of usersToReject) {
        try {
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({
              status: 'rejected',
              rejected_by: user.id,
              rejected_at: new Date().toISOString(),
              rejection_reason: trimmedReason,
            })
            .eq('user_id', pendingUser.user_id);

          if (updateError) throw updateError;

          await supabase.from('approval_audit').insert({
            user_id: pendingUser.user_id,
            action: 'bulk_rejected',
            performed_by: user.id,
            role: pendingUser.role,
            rejection_reason: trimmedReason,
          });

          await sendVerificationEmail(
            pendingUser.email,
            pendingUser.full_name || '',
            pendingUser.user_id,
            pendingUser.role,
            'rejected',
            trimmedReason
          );

          successCount++;
        } catch (error) {
          console.error(`Failed to reject ${pendingUser.email}:`, error);
          failCount++;
        }
      }

      toast({
        title: '❌ Bulk Rejection Complete',
        description: `Successfully rejected ${successCount} user${successCount !== 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}`,
      });

      setSelectedUsers([]);
      setBulkRejectionReason('');
      fetchAllData();
    } catch (error: any) {
      console.error('Bulk rejection error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete bulk rejection',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter users based on search
  const filterUsers = (users: UserRecord[]) => {
    if (!searchTerm) return users;
    const search = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        u.role.toLowerCase().includes(search) ||
        u.full_name?.toLowerCase().includes(search)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/65">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Metrics Grid */}
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Pending" value={metrics.pending} icon={Clock} />
              <MetricCard title="Approved" value={metrics.approved} icon={UserCheck} />
              <MetricCard title="Rejected" value={metrics.rejected} icon={UserX} />
              <MetricCard title="Total" value={metrics.total} icon={Users} />
            </div>
            
            {/* Recent Activity */}
            <Card className="border-border/50 bg-gradient-card shadow-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <ActivityFeed activities={activities.slice(0, 5)} loading={false} />
              </CardContent>
            </Card>
          </div>
        );

      case 'pending-dealers':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search dealers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              {selectedUsers.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setBulkApproveDialogOpen(true)}
                    disabled={actionLoading}
                    className="gap-2 flex-1 sm:flex-none h-11"
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Approve</span> ({selectedUsers.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setBulkRejectDialogOpen(true)}
                    disabled={actionLoading}
                    className="gap-2 flex-1 sm:flex-none h-11"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Reject</span> ({selectedUsers.length})
                  </Button>
                </div>
              )}
            </div>
            <UserTable
              users={filterUsers(pendingDealers)}
              type="pending"
              onApprove={handleApprove}
              onReject={handleRejectClick}
              actionLoading={actionLoading}
              selectedUsers={selectedUsers}
              onSelectionChange={setSelectedUsers}
              enableBulkActions={true}
            />
          </div>
        );

      case 'pending-importers':
        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search importers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              {selectedUsers.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setBulkApproveDialogOpen(true)}
                    disabled={actionLoading}
                    className="gap-2 flex-1 sm:flex-none h-11"
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Approve</span> ({selectedUsers.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setBulkRejectDialogOpen(true)}
                    disabled={actionLoading}
                    className="gap-2 flex-1 sm:flex-none h-11"
                    size="sm"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Reject</span> ({selectedUsers.length})
                  </Button>
                </div>
              )}
            </div>
            <UserTable
              users={filterUsers(pendingImporters)}
              type="pending"
              onApprove={handleApprove}
              onReject={handleRejectClick}
              actionLoading={actionLoading}
              selectedUsers={selectedUsers}
              onSelectionChange={setSelectedUsers}
              enableBulkActions={true}
            />
          </div>
        );

      case 'verified':
        return (
          <div className="space-y-4">
            <div className="relative max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search verified users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <UserTable users={filterUsers(verifiedUsers)} type="verified" />
          </div>
        );

      case 'rejected':
        return (
          <div className="space-y-4">
            <div className="relative max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rejected users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <UserTable users={filterUsers(rejectedUsers)} type="rejected" />
          </div>
        );

      case 'insights':
        return <InsightsPanel metrics={metrics} />;

      case 'demand':
        return <DemandPanel />;

      case 'activity':
        return <ActivityFeed activities={activities} loading={false} />;

      case 'email-logs':
        return <EmailLogsPanel />;

      case 'email-templates':
        return <EmailTemplatesPanel />;

      case 'audit-trail':
        return <AuditTrailViewer />;

      case 'vehicle-verification':
        return <VehicleVerificationPanel />;

      default:
        return null;
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      'overview': 'Dashboard Overview',
      'pending-dealers': 'Pending Dealer Applications',
      'pending-importers': 'Pending Importer Applications',
      'verified': 'Verified Users',
      'rejected': 'Rejected Applications',
      'vehicle-verification': 'Vehicle Verification',
      'insights': 'Analytics & Insights',
      'activity': 'Activity Log',
      'email-logs': 'Email Logs',
      'email-templates': 'Email Templates',
      'audit-trail': 'Audit Trail',
    };
    return titles[activeTab] || 'Admin Dashboard';
  };

  return (
    <div className="min-h-screen bg-background/65">
      <Navigation>
        <NotificationBell onNavigate={setActiveTab} />
      </Navigation>
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedUsers([]);
        }}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      <main className={cn(
        'transition-all duration-300 pt-24 pb-8 px-4',
        'ml-0 lg:ml-16',
        !sidebarCollapsed && 'lg:ml-64'
      )}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8 pl-14 lg:pl-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage user verification, view analytics, and monitor system activity
            </p>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </main>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this {selectedUser?.role} application.
              This will be recorded in the audit log and sent to the applicant.
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

      {/* Bulk Approve Dialog */}
      <AlertDialog open={bulkApproveDialogOpen} onOpenChange={setBulkApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bulk Approve Applications</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to approve {selectedUsers.length} application{selectedUsers.length !== 1 ? 's' : ''}. 
              All selected users will receive verification emails and gain access to their respective dashboards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkApprove}
              disabled={actionLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {actionLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              Approve {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Reject Dialog */}
      <Dialog open={bulkRejectDialogOpen} onOpenChange={setBulkRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Reject Applications</DialogTitle>
            <DialogDescription>
              You are about to reject {selectedUsers.length} application{selectedUsers.length !== 1 ? 's' : ''}.
              Please provide a shared rejection reason that will be sent to all selected applicants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="bulk-rejection-reason"
                placeholder="Enter detailed reason for rejection..."
                value={bulkRejectionReason}
                onChange={(e) => setBulkRejectionReason(e.target.value)}
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {bulkRejectionReason.length}/500 characters (minimum 10 required)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkRejectDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkReject}
              disabled={actionLoading || bulkRejectionReason.trim().length < 10}
            >
              {actionLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              Reject {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}