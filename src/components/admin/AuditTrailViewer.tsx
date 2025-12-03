import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Filter, CheckCircle, XCircle, Clock, Download } from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  performed_by: string;
  performed_at: string;
  role: string;
  action: string;
  rejection_reason?: string;
  admin_email?: string;
  target_email?: string;
}

export function AuditTrailViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    actionType: 'all',
    adminUser: 'all',
  });
  const [adminUsers, setAdminUsers] = useState<{ id: string; email: string }[]>([]);

  useEffect(() => {
    fetchLogs();
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .eq('status', 'approved');

    if (data) {
      const userIds = data.map(d => d.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (profiles) {
        setAdminUsers(profiles.map(p => ({ id: p.id, email: p.email })));
      }
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    
    let query = supabase
      .from('approval_audit')
      .select('*')
      .order('performed_at', { ascending: false });

    if (filters.dateFrom) {
      query = query.gte('performed_at', new Date(filters.dateFrom).toISOString());
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('performed_at', endDate.toISOString());
    }
    if (filters.actionType !== 'all') {
      query = query.eq('action', filters.actionType);
    }
    if (filters.adminUser !== 'all') {
      query = query.eq('performed_by', filters.adminUser);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching audit logs:', error);
    } else if (data) {
      // Fetch admin and target user emails
      const adminIds = [...new Set(data.map(d => d.performed_by))];
      const targetIds = [...new Set(data.map(d => d.user_id))];
      const allIds = [...new Set([...adminIds, ...targetIds])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', allIds);

      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      setLogs(data.map(log => ({
        ...log,
        admin_email: emailMap.get(log.performed_by) || 'Unknown',
        target_email: emailMap.get(log.user_id) || 'Unknown',
      })));
    }
    setLoading(false);
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      actionType: 'all',
      adminUser: 'all',
    });
    setTimeout(fetchLogs, 0);
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Admin', 'Action', 'Target User', 'Role', 'Rejection Reason'].join(','),
      ...logs.map(log => [
        new Date(log.performed_at).toLocaleString(),
        log.admin_email,
        log.action,
        log.target_email,
        log.role,
        log.rejection_reason || ''
      ].map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-600 gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case 'bulk_approved':
        return <Badge className="bg-blue-500/20 text-blue-600 gap-1"><CheckCircle className="h-3 w-3" />Bulk Approved</Badge>;
      case 'bulk_rejected':
        return <Badge className="bg-orange-500/20 text-orange-600 gap-1"><XCircle className="h-3 w-3" />Bulk Rejected</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select
                value={filters.actionType}
                onValueChange={(value) => setFilters(f => ({ ...f, actionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="bulk_approved">Bulk Approved</SelectItem>
                  <SelectItem value="bulk_rejected">Bulk Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Admin User</Label>
              <Select
                value={filters.adminUser}
                onValueChange={(value) => setFilters(f => ({ ...f, adminUser: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admins</SelectItem>
                  {adminUsers.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>{admin.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleApplyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button variant="outline" onClick={handleExport} className="ml-auto gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Audit Trail ({logs.length} records)</span>
            <Button variant="ghost" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.performed_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.admin_email}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>{log.target_email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{log.role}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {log.rejection_reason || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
