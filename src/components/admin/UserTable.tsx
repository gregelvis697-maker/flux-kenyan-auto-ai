import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Mail, Calendar, User as UserIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface User {
  id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
  email: string;
  full_name?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

interface UserTableProps {
  users: User[];
  type: 'pending' | 'verified' | 'rejected';
  onApprove?: (user: User) => void;
  onReject?: (user: User) => void;
  actionLoading?: boolean;
  selectedUsers?: string[];
  onSelectionChange?: (userIds: string[]) => void;
  enableBulkActions?: boolean;
}

const roleColors: Record<string, string> = {
  dealer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  importer: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  buyer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function UserTable({ 
  users, 
  type, 
  onApprove, 
  onReject, 
  actionLoading,
  selectedUsers = [],
  onSelectionChange,
  enableBulkActions = false,
}: UserTableProps) {
  const allSelected = users.length > 0 && users.every(u => selectedUsers.includes(u.user_id));

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(users.map(u => u.user_id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange?.(selectedUsers.filter(id => id !== userId));
    } else {
      onSelectionChange?.([...selectedUsers, userId]);
    }
  };

  if (users.length === 0) {
    const messages = {
      pending: { icon: Clock, text: 'No pending applications', sub: 'New applications will appear here' },
      verified: { icon: CheckCircle, text: 'No verified users', sub: 'Approved users will appear here' },
      rejected: { icon: XCircle, text: 'No rejected users', sub: 'Rejected applications will appear here' },
    };
    const { icon: Icon, text, sub } = messages[type];

    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">{text}</p>
        <p className="text-sm">{sub}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {enableBulkActions && type === 'pending' && (
          <div className="flex items-center gap-2 p-3 bg-card/50 rounded-lg border border-border/50">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
            />
            <span className="text-sm text-muted-foreground">
              Select all ({users.length})
            </span>
          </div>
        )}
        
        {users.map((user) => (
          <Card key={user.id} className="border-border/50 bg-card/30">
            <CardContent className="p-4 space-y-4">
              {enableBulkActions && type === 'pending' && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedUsers.includes(user.user_id)}
                    onCheckedChange={() => handleSelectUser(user.user_id)}
                    aria-label={`Select ${user.email}`}
                  />
                  <span className="text-xs text-muted-foreground">Select</span>
                </div>
              )}
              
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm break-all">{user.email}</span>
                  </div>
                  {user.full_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserIcon className="h-4 w-4 shrink-0" />
                      <span>{user.full_name}</span>
                    </div>
                  )}
                </div>
                <Badge className={`${roleColors[user.role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'} capitalize shrink-0`}>
                  {user.role}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Signed up: {new Date(user.created_at).toLocaleDateString()}</span>
              </div>

              {type === 'verified' && user.approved_at && (
                <div className="text-sm text-green-500 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Approved: {new Date(user.approved_at).toLocaleDateString()}
                </div>
              )}

              {type === 'rejected' && (
                <div className="space-y-2">
                  <div className="text-sm text-red-500 flex items-center gap-2">
                    <XCircle className="h-4 w-4 shrink-0" />
                    Rejected: {user.rejected_at ? new Date(user.rejected_at).toLocaleDateString() : 'N/A'}
                  </div>
                  {user.rejection_reason && (
                    <p className="text-sm text-muted-foreground bg-red-500/10 p-2 rounded">
                      {user.rejection_reason}
                    </p>
                  )}
                </div>
              )}

              {type === 'pending' && onApprove && onReject && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove(user)}
                    disabled={actionLoading}
                    className="flex-1 h-11 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(user)}
                    disabled={actionLoading}
                    className="flex-1 h-11 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              {enableBulkActions && type === 'pending' && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Signup Date</TableHead>
              {type === 'verified' && <TableHead>Approved Date</TableHead>}
              {type === 'rejected' && <TableHead>Rejection Reason</TableHead>}
              {type === 'pending' && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                {enableBulkActions && type === 'pending' && (
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.user_id)}
                      onCheckedChange={() => handleSelectUser(user.user_id)}
                      aria-label={`Select ${user.email}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>{user.full_name || '-'}</TableCell>
                <TableCell>
                  <Badge className={`${roleColors[user.role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'} capitalize`}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                {type === 'verified' && (
                  <TableCell className="text-green-500">
                    {user.approved_at ? new Date(user.approved_at).toLocaleDateString() : '-'}
                  </TableCell>
                )}
                {type === 'rejected' && (
                  <TableCell>
                    <span className="text-sm text-muted-foreground max-w-xs truncate block">
                      {user.rejection_reason || '-'}
                    </span>
                  </TableCell>
                )}
                {type === 'pending' && onApprove && onReject && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onApprove(user)}
                        disabled={actionLoading}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReject(user)}
                        disabled={actionLoading}
                        className="gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}