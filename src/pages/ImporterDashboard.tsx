import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, FileText, Ship, MapPin, LayoutDashboard, Settings } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { AvailableRequestsTab } from '@/components/importer/AvailableRequestsTab';
import { MyShipmentsTab } from '@/components/importer/MyShipmentsTab';
import { DeliveredTab } from '@/components/importer/DeliveredTab';
import { DashboardSidebar, MenuItem } from '@/components/dashboard/DashboardSidebar';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { cn } from '@/lib/utils';

const importerMenuItems: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'available', label: 'Assigned Requests', icon: FileText },
  { id: 'shipments', label: 'Active Imports', icon: Ship },
  { id: 'delivered', label: 'Completed Imports', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ImporterDashboard() {
  const { user, userRole, approvalStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [metrics, setMetrics] = useState({
    available: 0,
    accepted: 0,
    inProgress: 0,
    delivered: 0,
    totalCompleted: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (userRole !== 'importer') {
        navigate(`/dashboard/${userRole}`);
        return;
      }
      if (approvalStatus !== 'approved') {
        navigate('/pending-approval');
        return;
      }
    }
  }, [user, userRole, approvalStatus, loading, navigate]);

  useEffect(() => {
    if (user && userRole === 'importer' && approvalStatus === 'approved') {
      fetchMetrics();
    }
  }, [user, userRole, approvalStatus]);

  const fetchMetrics = async () => {
    try {
      // Available requests (open for acceptance)
      const { count: availableCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'requested');

      // Accepted by this importer (just accepted)
      const { count: acceptedCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('importer_id', user?.id)
        .eq('status', 'accepted');

      // In progress (in_transit or cleared)
      const { count: inProgressCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('importer_id', user?.id)
        .in('status', ['in_transit', 'cleared']);

      // Delivered (awaiting dealer pickup)
      const { count: deliveredCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('importer_id', user?.id)
        .eq('status', 'delivered');

      // Total completed (received by dealer)
      const { count: completedCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('importer_id', user?.id)
        .eq('status', 'received');

      setMetrics({
        available: availableCount || 0,
        accepted: acceptedCount || 0,
        inProgress: inProgressCount || 0,
        delivered: deliveredCount || 0,
        totalCompleted: completedCount || 0,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent shadow-[0_0_20px_hsl(var(--primary)/0.5)]"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Primary Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Available
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{metrics.available}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Open requests</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Accepted
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{metrics.accepted}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Just accepted</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    In Transit
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                    <Ship className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{metrics.inProgress}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Shipping now</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Delivered
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{metrics.delivered}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Awaiting pickup</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group col-span-2 sm:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{metrics.totalCompleted}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Active Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-sm text-muted-foreground">Accepted</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{metrics.accepted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-sm text-muted-foreground">In Transit/Cleared</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{metrics.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-sm text-muted-foreground">Delivered</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{metrics.delivered}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    Performance Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Total Active</span>
                    <span className="text-lg font-semibold text-foreground">
                      {metrics.accepted + metrics.inProgress + metrics.delivered}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Completed Imports</span>
                    <span className="text-lg font-semibold text-emerald-400">{metrics.totalCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Open to Accept</span>
                    <span className="text-lg font-semibold text-primary">{metrics.available}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab('available')}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <FileText className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-sm">Browse Requests</p>
                    <p className="text-xs text-muted-foreground">View available import requests</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('shipments')}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <Ship className="h-6 w-6 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-sm">Track Shipments</p>
                    <p className="text-xs text-muted-foreground">Monitor your active imports</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('delivered')}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <MapPin className="h-6 w-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-sm">View Completed</p>
                    <p className="text-xs text-muted-foreground">Review delivered shipments</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'available':
        return <AvailableRequestsTab onUpdate={fetchMetrics} />;

      case 'shipments':
        return <MyShipmentsTab onUpdate={fetchMetrics} />;

      case 'delivered':
        return <DeliveredTab />;

      case 'settings':
        return <SettingsPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        menuItems={importerMenuItems}
        title="Importer Dashboard"
        subtitle="Manage import requests"
      />

      <main className={cn(
        'transition-all duration-300 pt-20 lg:pt-16',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Importer Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Manage import requests and track shipments
              </p>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
