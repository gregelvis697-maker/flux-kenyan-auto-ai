import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Activity {
  id: string;
  action: 'approved' | 'rejected';
  user_email: string;
  role: string;
  performed_at: string;
  performed_by_email?: string;
  rejection_reason?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

export const ActivityFeed = ({ activities, loading = false }: ActivityFeedProps) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Loading activity log...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest verification actions and system logs</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="mt-1">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`capitalize ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {activity.role}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {activity.user_email}
                    </p>
                    {activity.rejection_reason && (
                      <p className="text-xs text-muted-foreground italic mb-2 line-clamp-2">
                        "{activity.rejection_reason}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatTime(activity.performed_at)}</span>
                      {activity.performed_by_email && (
                        <>
                          <span>•</span>
                          <span>by {activity.performed_by_email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
