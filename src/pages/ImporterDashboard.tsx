import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { roleHomePath } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, CheckCircle, FileText, Ship, MapPin, LayoutDashboard, Settings, Navigation2 } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { AvailableRequestsTab } from '@/components/importer/AvailableRequestsTab';
import { MyShipmentsTab } from '@/components/importer/MyShipmentsTab';
import { DeliveredTab } from '@/components/importer/DeliveredTab';
import { TrackingTab } from '@/components/importer/TrackingTab';
import { DashboardSidebar, MenuItem } from '@/components/dashboard/DashboardSidebar';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { cn } from '@/lib/utils';

const importerMenuItems: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'available', label: 'Assigned Requests', icon: FileText },
  { id: 'shipments', label: 'Active Imports', icon: Ship },
  { id: 'delivered', label: 'Completed Imports', icon: MapPin },
  { id: 'tracking', label: 'Vehicle Tracking', icon: Navigation2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ImporterDashboard() {
  const { user, userRole, approvalStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [metrics, setMetrics] = useState({
    available: 0,
    inProgress: 0,
    delivered: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (userRole && userRole !== 'importer') {
        navigate(roleHomePath(userRole), { replace: true });
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
      const { count: availableCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'requested');

      const { count: inProgressCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('importer_id', user?.id)
        .in('status', ['accepted', 'in_transit', 'cleared']);

      const { count: deliveredCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('importer_id', user?.id)
        .eq('status', 'delivered');

      setMetrics({
        available: availableCount || 0,
        inProgress: inProgressCount || 0,
        delivered: deliveredCount || 0,
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
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Available Requests
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.available}</div>
                  <p className="text-xs text-muted-foreground mt-1">Open for acceptance</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Shipments In Progress
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.inProgress}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active shipments</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Delivered
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.delivered}</div>
                  <p className="text-xs text-muted-foreground mt-1">Completed shipments</p>
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

      case 'tracking':
        return <TrackingTab />;

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
