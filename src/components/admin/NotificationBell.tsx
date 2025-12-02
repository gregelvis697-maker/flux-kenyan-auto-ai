import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PendingApplication {
  id: string;
  role: string;
  created_at: string;
  email: string;
}

interface NotificationBellProps {
  onNavigate: (tab: string) => void;
}

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState<PendingApplication[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch initial pending count and recent applications
  const fetchPendingData = async () => {
    try {
      // Get pending count
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .in('role', ['dealer', 'importer']);

      setPendingCount(count || 0);

      // Get recent pending applications
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .eq('status', 'pending')
        .in('role', ['dealer', 'importer'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (userRoles && userRoles.length > 0) {
        // Fetch profiles for emails
        const userIds = userRoles.map(ur => ur.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.email]));

        const applications: PendingApplication[] = userRoles.map(ur => ({
          id: ur.id,
          role: ur.role,
          created_at: ur.created_at,
          email: profileMap.get(ur.user_id) || 'Unknown',
        }));

        setRecentApplications(applications);
      }
    } catch (error) {
      console.error('Error fetching pending data:', error);
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchPendingData();

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_roles',
          filter: 'status=eq.pending',
        },
        () => {
          fetchPendingData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_roles',
        },
        () => {
          fetchPendingData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNavigate = (role: string) => {
    const tab = role === 'dealer' ? 'pending-dealers' : 'pending-importers';
    onNavigate(tab);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {pendingCount > 9 ? '9+' : pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Pending Applications</span>
          {pendingCount > 0 && (
            <Badge variant="secondary">{pendingCount}</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentApplications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No pending applications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {recentApplications.map((app) => (
              <DropdownMenuItem
                key={app.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => handleNavigate(app.role)}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-medium capitalize">{app.role}</span>
                  <Badge variant="outline" className="text-xs">
                    New
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">{app.email}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(app.created_at).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        {pendingCount > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center justify-center text-primary cursor-pointer"
              onClick={() => {
                onNavigate('pending-dealers');
                setIsOpen(false);
              }}
            >
              View All Applications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
