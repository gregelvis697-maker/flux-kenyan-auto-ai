import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
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

type UserRole = 'buyer' | 'dealer' | 'importer' | 'admin';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface PendingUser {
  id: string;
  user_id: string;
  role: UserRole;
  status: ApprovalStatus;
  created_at: string;
  email: string;
  full_name?: string;
}

export default function AdminApprovals() {
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Fetch pending users
  useEffect(() => {
    fetchPendingUsers();
  }, []);

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

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      // Fetch pending users with profiles joined
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

      // Map to PendingUser structure
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
      toast({
        title: 'Error',
        description: 'Failed to load pending users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pendingUser: PendingUser) => {
    if (!user) return;

    setActionLoading(true);
    try {
      // Update user_roles table
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('user_id', pendingUser.user_id);

      if (updateError) throw updateError;

      // Insert audit record
      const { error: auditError } = await supabase.from('approval_audit').insert({
        user_id: pendingUser.user_id,
        action: 'approved',
        performed_by: user.id,
        role: pendingUser.role,
      });

      if (auditError) throw auditError;

      toast({
        title: 'Success',
        description: `${pendingUser.role} account approved successfully`,
      });

      // Refresh list
      fetchPendingUsers();
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

    // Validate rejection reason length
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
      // Update user_roles table
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

      // Insert audit record
      const { error: auditError } = await supabase.from('approval_audit').insert({
        user_id: selectedUser.user_id,
        action: 'rejected',
        performed_by: user.id,
        role: selectedUser.role,
        rejection_reason: rejectionReason.trim(),
      });

      if (auditError) throw auditError;

      toast({
        title: 'Success',
        description: `${selectedUser.role} account rejected`,
      });

      setRejectDialogOpen(false);
      setSelectedUser(null);
      setRejectionReason('');

      // Refresh list
      fetchPendingUsers();
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Admin Verification Console</CardTitle>
            <CardDescription>
              Review and manage pending dealer and importer account approvals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              <div className="text-center py-12 text-muted-foreground">
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
          </CardContent>
        </Card>
      </main>

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
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
