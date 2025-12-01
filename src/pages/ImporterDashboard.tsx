import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, Truck, CheckCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { AvailableRequestsTab } from '@/components/importer/AvailableRequestsTab';
import { MyShipmentsTab } from '@/components/importer/MyShipmentsTab';
import { DeliveredTab } from '@/components/importer/DeliveredTab';

export default function ImporterDashboard() {
  const { user, userRole, approvalStatus, loading } = useAuth();
  const navigate = useNavigate();
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
      // Count available requests
      const { count: availableCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'requested');

      // Count my in-progress shipments
      const { count: inProgressCount } = await supabase
        .from('dealer_import_requests')
        .select('*', { count: 'exact', head: true })
        .eq('importer_id', user?.id)
        .in('status', ['accepted', 'in_transit', 'cleared']);

      // Count delivered
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="py-8 px-4 pt-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Importer Dashboard</h1>
            <p className="text-muted-foreground">Manage import requests and track shipments</p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Requests
                </CardTitle>
                <Package className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics.available}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Shipments In Progress
                </CardTitle>
                <Truck className="h-5 w-5 text-secondary" />
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
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{metrics.delivered}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
            <Tabs defaultValue="available" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="bg-muted/50 backdrop-blur-sm">
                  <TabsTrigger value="available">Available Requests</TabsTrigger>
                  <TabsTrigger value="shipments">My Shipments</TabsTrigger>
                  <TabsTrigger value="delivered">Delivered</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-0">
                <TabsContent value="available" className="mt-0">
                  <AvailableRequestsTab onUpdate={fetchMetrics} />
                </TabsContent>
                <TabsContent value="shipments" className="mt-0">
                  <MyShipmentsTab onUpdate={fetchMetrics} />
                </TabsContent>
                <TabsContent value="delivered" className="mt-0">
                  <DeliveredTab />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}