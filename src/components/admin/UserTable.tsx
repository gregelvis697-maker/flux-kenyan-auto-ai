import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
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
  const someSelected = selectedUsers.length > 0 && !allSelected;

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
    <div className="overflow-x-auto rounded-lg border border-border/50">
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
            {type === 'pending' && !enableBulkActions && <TableHead>Actions</TableHead>}
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
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              {type === 'verified' && (
                <TableCell>
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
              {type === 'pending' && !enableBulkActions && onApprove && onReject && (
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
  );
}
