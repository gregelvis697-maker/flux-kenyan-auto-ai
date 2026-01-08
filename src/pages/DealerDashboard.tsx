import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Car, FileText, Truck, LayoutGrid } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { ImportRequestsTab } from '@/components/dealer/ImportRequestsTab';
import { MyImportsTab } from '@/components/dealer/MyImportsTab';
import { InventoryTab } from '@/components/dealer/InventoryTab';

export default function DealerDashboard() {
  const { user, userRole, approvalStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    inProgress: 0,
    delivered: 0,
    inventory: 0,
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
      const { count: inProgressCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['requested', 'accepted', 'in_transit', 'cleared']);

      const { count: deliveredCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      const { count: inventoryCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent shadow-[0_0_20px_hsl(var(--primary)/0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Dealer Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your imports and inventory
            </p>
          </div>

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

          {/* Tabs */}
          <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card overflow-hidden">
            <Tabs defaultValue="requests" className="w-full">
              <CardHeader className="pb-2 sm:pb-4 border-b border-border/30">
                <TabsList className="w-full sm:w-auto bg-muted/30 backdrop-blur-sm p-1 h-auto flex-wrap gap-1">
                  <TabsTrigger 
                    value="requests" 
                    className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm py-2 px-3 sm:px-4 gap-1.5 sm:gap-2"
                  >
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Import</span> Requests
                  </TabsTrigger>
                  <TabsTrigger 
                    value="imports" 
                    className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm py-2 px-3 sm:px-4 gap-1.5 sm:gap-2"
                  >
                    <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    My Imports
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inventory" 
                    className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm py-2 px-3 sm:px-4 gap-1.5 sm:gap-2"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Inventory
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <TabsContent value="requests" className="mt-0 focus-visible:outline-none">
                  <ImportRequestsTab onUpdate={fetchMetrics} />
                </TabsContent>
                <TabsContent value="imports" className="mt-0 focus-visible:outline-none">
                  <MyImportsTab onUpdate={fetchMetrics} />
                </TabsContent>
                <TabsContent value="inventory" className="mt-0 focus-visible:outline-none">
                  <InventoryTab onUpdate={fetchMetrics} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}