import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from './MetricCard';
import { VerificationChart } from './VerificationChart';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Car,
  Truck,
  Package,
} from 'lucide-react';

interface InsightsPanelProps {
  metrics: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    dealers: number;
    importers: number;
    activeImports: number;
  };
}

export function InsightsPanel({ metrics }: InsightsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Verified Dealers"
          value={metrics.dealers}
          icon={Car}
          className="animate-fade-in"
        />
        <MetricCard
          title="Verified Importers"
          value={metrics.importers}
          icon={Truck}
          className="animate-fade-in [animation-delay:100ms]"
        />
        <MetricCard
          title="Pending Approvals"
          value={metrics.pending}
          icon={Clock}
          className="animate-fade-in [animation-delay:200ms]"
        />
        <MetricCard
          title="Active Imports"
          value={metrics.activeImports}
          icon={Package}
          className="animate-fade-in [animation-delay:300ms]"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VerificationChart 
          data={{
            pending: metrics.pending,
            approved: metrics.approved,
            rejected: metrics.rejected,
          }}
        />

        {/* Quick Stats */}
        <Card className="border-border/50 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Approval Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Applications</span>
                <span className="text-2xl font-bold text-foreground">{metrics.total}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${metrics.total > 0 ? (metrics.approved / metrics.total) * 100 : 0}%` }}
                  />
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{ width: `${metrics.total > 0 ? (metrics.pending / metrics.total) * 100 : 0}%` }}
                  />
                  <div 
                    className="bg-red-500 h-full" 
                    style={{ width: `${metrics.total > 0 ? (metrics.rejected / metrics.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">{metrics.approved}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{metrics.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{metrics.rejected}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Approval Rate</span>
                <span className="text-sm font-semibold text-green-500">
                  {metrics.total > 0 ? `${Math.round((metrics.approved / metrics.total) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rejection Rate</span>
                <span className="text-sm font-semibold text-red-500">
                  {metrics.total > 0 ? `${Math.round((metrics.rejected / metrics.total) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}