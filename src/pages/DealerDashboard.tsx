import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { roleHomePath } from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Car, FileText, Truck, LayoutGrid, LayoutDashboard, Settings, CreditCard } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { ImportRequestsTab } from '@/components/dealer/ImportRequestsTab';
import { MyImportsTab } from '@/components/dealer/MyImportsTab';
import { InventoryTab } from '@/components/dealer/InventoryTab';
import { SubscriptionCard } from '@/components/dealer/SubscriptionCard';
import { DashboardSidebar, MenuItem } from '@/components/dashboard/DashboardSidebar';
import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { useSubscription } from '@/hooks/useSubscription';
import { verifyPaystackReference } from '@/services/paystackService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const dealerMenuItems: MenuItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'requests', label: 'Import Requests', icon: FileText },
  { id: 'imports', label: 'My Imports', icon: Truck },
  { id: 'inventory', label: 'Inventory', icon: LayoutGrid },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DealerDashboard() {
  const { user, userRole, approvalStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [metrics, setMetrics] = useState({
    inProgress: 0,
    delivered: 0,
    inventory: 0,
  });
  const subscription = useSubscription(user?.id);

  // Handle Paystack redirect callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('paystack_ref');
    if (!ref || !user) return;
    (async () => {
      try {
        const res = await verifyPaystackReference(ref);
        if (res.success) {
          toast.success(`Subscription activated${res.tier ? ` — ${res.tier} plan` : ''}`);
          await subscription.refresh();
        } else {
          toast.error(res.message ?? 'Payment could not be verified');
        }
      } catch (err) {
        console.error(err);
        toast.error('Payment verification failed');
      } finally {
        params.delete('paystack_ref');
        const next = params.toString();
        window.history.replaceState({}, '', `/dashboard/dealer${next ? `?${next}` : ''}`);
        setActiveTab('subscription');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (userRole && userRole !== 'dealer') {
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
    if (user && userRole === 'dealer' && approvalStatus === 'approved') {
      fetchMetrics();
    }
  }, [user, userRole, approvalStatus]);

  const fetchMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      const { count: inventoryCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('dealer_id', user.id)
        .eq('is_sold', false);

      setMetrics({
        inProgress: inProgressCount || 0,
        delivered: deliveredCount || 0,
        inventory: inventoryCount || 0,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/65">
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
                    Imports In Progress
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{metrics.inProgress}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active requests</p>
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
                    Inventory Listed
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

      case 'subscription':
        return <SubscriptionCard subscription={subscription} />;

      case 'settings':
        return <SettingsPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background/65">
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
