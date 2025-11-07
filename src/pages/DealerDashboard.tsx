import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Car } from 'lucide-react';
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
      // Count imports in progress
      const { count: inProgressCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['requested', 'accepted', 'in_transit', 'cleared']);

      // Count delivered imports
      const { count: deliveredCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      // Count inventory vehicles
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Dealer Dashboard</h1>
          <p className="text-muted-foreground">Manage your imports and inventory</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Imports In Progress
              </CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Delivered
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.delivered}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inventory Listed
              </CardTitle>
              <Car className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics.inventory}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
          <Tabs defaultValue="requests" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="bg-muted/50 backdrop-blur-sm">
                <TabsTrigger value="requests">Import Requests</TabsTrigger>
                <TabsTrigger value="imports">My Imports</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-0">
              <TabsContent value="requests" className="mt-0">
                <ImportRequestsTab onUpdate={fetchMetrics} />
              </TabsContent>
              <TabsContent value="imports" className="mt-0">
                <MyImportsTab onUpdate={fetchMetrics} />
              </TabsContent>
              <TabsContent value="inventory" className="mt-0">
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
