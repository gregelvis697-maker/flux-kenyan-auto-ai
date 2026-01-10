import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Truck, Calendar, Car, ArrowRight, DollarSign, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Shipment {
  id: string;
  dealer_id: string;
  make: string;
  model: string;
  year: number;
  specs: string | null;
  budget: number;
  status: string;
  created_at: string;
  accepted_at: string | null;
  dealer_email?: string;
}

interface MyShipmentsTabProps {
  onUpdate: () => void;
}

const statusFlow = ['accepted', 'in_transit', 'cleared', 'delivered'];
const statusLabels: Record<string, string> = {
  accepted: 'Accepted',
  in_transit: 'In Transit',
  cleared: 'Cleared',
  delivered: 'Delivered',
};

const statusColors: Record<string, string> = {
  accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_transit: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  cleared: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function MyShipmentsTab({ onUpdate }: MyShipmentsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyShipments();
    }
  }, [user]);

  const fetchMyShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('dealer_import_requests')
        .select(`
          *,
          profiles:dealer_id(email)
        `)
        .eq('importer_id', user?.id)
        .in('status', ['accepted', 'in_transit', 'cleared'])
        .order('accepted_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((req: any) => ({
        ...req,
        dealer_email: req.profiles?.email,
      }));

      setShipments(formattedData);
    } catch (error: any) {
      console.error('Error fetching shipments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch shipments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const handleUpdateStatus = async (shipmentId: string, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;

    setUpdatingId(shipmentId);
    try {
      const updateData: any = { status: nextStatus };
      if (nextStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('dealer_import_requests')
        .update(updateData)
        .eq('id', shipmentId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: nextStatus === 'delivered' 
          ? 'Vehicle marked as delivered. Dealer will now receive notification to pick up.'
          : `Shipment status updated to ${statusLabels[nextStatus]}`,
      });

      fetchMyShipments();
      onUpdate();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update shipment status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (shipments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No active shipments</p>
        <p className="text-sm">Accept import requests to start tracking shipments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((shipment) => {
        const nextStatus = getNextStatus(shipment.status);
        const currentIndex = statusFlow.indexOf(shipment.status);
        
        return (
          <Card key={shipment.id} className="border-border/50 bg-card/30 overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      {shipment.year} {shipment.make} {shipment.model}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {shipment.dealer_email}
                    </p>
                  </div>
                </div>
                <Badge className={`${statusColors[shipment.status]} self-start sm:self-auto`}>
                  {statusLabels[shipment.status]}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">
                    ${shipment.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="truncate">
                    {shipment.accepted_at ? new Date(shipment.accepted_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Progress Steps - Mobile */}
              <div className="block sm:hidden mb-4">
                <div className="flex items-center justify-between mb-2">
                  {statusFlow.map((status, index) => (
                    <div key={status} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          currentIndex >= index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 text-center">
                        {statusLabels[status].split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / statusFlow.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Progress Steps - Desktop */}
              <div className="hidden sm:flex items-center gap-2 mb-4">
                {statusFlow.map((status, index) => (
                  <div key={status} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentIndex >= index
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`ml-2 text-sm ${
                      currentIndex >= index ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {statusLabels[status]}
                    </span>
                    {index < statusFlow.length - 1 && (
                      <div
                        className={`w-8 lg:w-12 h-0.5 mx-2 ${
                          currentIndex > index ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Action Button */}
              {nextStatus && (
                <Button
                  onClick={() => handleUpdateStatus(shipment.id, shipment.status)}
                  disabled={updatingId === shipment.id}
                  className="w-full sm:w-auto gap-2 h-11"
                >
                  {updatingId === shipment.id ? (
                    'Updating...'
                  ) : (
                    <>
                      Mark as {statusLabels[nextStatus]}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}