import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Car, FileText, Truck, LayoutGrid, LayoutDashboard, Settings } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { ImportRequestsTab } from '@/components/dealer/ImportRequestsTab';
import { MyImportsTab } from '@/components/dealer/MyImportsTab';
import { InventoryTab } from '@/components/dealer/InventoryTab';
import { DashboardSidebar, MenuItem } from '@/components/dashboard/DashboardSidebar';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { cn } from '@/lib/utils';

const dealerMenuItems: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'requests', label: 'Import Requests', icon: FileText },
  { id: 'imports', label: 'My Imports', icon: Truck },
  { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DealerDashboard() {
  const { user, userRole, approvalStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    inProgress: 0,
    delivered: 0,
    inventory: 0,
    dealerOwned: 0,
    imported: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (userRole !== 'dealer') {
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
    if (user && userRole === 'dealer' && approvalStatus === 'approved') {
      fetchMetrics();
    }
  }, [user, userRole, approvalStatus]);

  const fetchMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all import requests count
      const { count: totalRequestsCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('dealer_id', user.id);

      const { count: inProgressCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('dealer_id', user.id)
        .in('status', ['requested', 'accepted', 'in_transit', 'cleared']);

      const { count: deliveredCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('dealer_id', user.id)
        .eq('status', 'delivered');

      // Fetch all inventory for breakdown
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, import_request_id, is_sold')
        .eq('dealer_id', user.id)
        .eq('is_sold', false);

      const inventoryCount = vehicles?.length || 0;
      const dealerOwnedCount = vehicles?.filter(v => !v.import_request_id).length || 0;
      const importedCount = vehicles?.filter(v => v.import_request_id !== null).length || 0;

      setMetrics({
        totalRequests: totalRequestsCount || 0,
        inProgress: inProgressCount || 0,
        delivered: deliveredCount || 0,
        inventory: inventoryCount,
        dealerOwned: dealerOwnedCount,
        imported: importedCount,
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Requests
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.totalRequests}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    In Progress
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.inProgress}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active imports</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Delivered
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.delivered}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for pickup</p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Inventory
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                    <Car className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.inventory}</div>
                  <p className="text-xs text-muted-foreground mt-1">Available vehicles</p>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Inventory Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm text-muted-foreground">Dealer-Owned</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{metrics.dealerOwned}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      <span className="text-sm text-muted-foreground">Imported via Flux</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{metrics.imported}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Import Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-sm text-muted-foreground">Pending/Active</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{metrics.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      <span className="text-sm text-muted-foreground">Ready for Pickup</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{metrics.delivered}</span>
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
                    onClick={() => setActiveTab('requests')}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <FileText className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-sm">New Import Request</p>
                    <p className="text-xs text-muted-foreground">Create a new vehicle import request</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('imports')}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <Truck className="h-6 w-6 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-sm">Track Shipments</p>
                    <p className="text-xs text-muted-foreground">Monitor your active imports</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <LayoutGrid className="h-6 w-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-sm">Manage Inventory</p>
                    <p className="text-xs text-muted-foreground">Update your vehicle listings</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'requests':
        return <ImportRequestsTab onUpdate={fetchMetrics} />;

      case 'imports':
        return <MyImportsTab onUpdate={fetchMetrics} />;

      case 'inventory':
        return <InventoryTab onUpdate={fetchMetrics} />;

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
        menuItems={dealerMenuItems}
        title="Dealer Dashboard"
        subtitle="Manage imports and inventory"
      />

      <main className={cn(
        'transition-all duration-300 pt-20 lg:pt-16',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Dealer Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Manage your imports and inventory
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
