import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Truck, Calendar, Car, ArrowRight } from 'lucide-react';
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
  cleared: 'Cleared Customs',
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
        description: `Shipment status updated to ${statusLabels[nextStatus]}`,
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
        return (
          <Card key={shipment.id} className="border-border/50 bg-card/30">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      {shipment.year} {shipment.make} {shipment.model}
                    </h3>
                    <Badge className={statusColors[shipment.status]}>
                      {statusLabels[shipment.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dealer: {shipment.dealer_email}
                  </p>
                  {shipment.specs && (
                    <p className="text-sm text-muted-foreground">
                      Specs: {shipment.specs}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Budget: ${shipment.budget.toLocaleString()}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Accepted: {shipment.accepted_at ? new Date(shipment.accepted_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Status Progress */}
                <div className="flex items-center gap-2">
                  {statusFlow.map((status, index) => (
                    <div key={status} className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          statusFlow.indexOf(shipment.status) >= index
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`}
                      />
                      {index < statusFlow.length - 1 && (
                        <div
                          className={`w-8 h-0.5 ${
                            statusFlow.indexOf(shipment.status) > index
                              ? 'bg-primary'
                              : 'bg-muted'
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
                    className="gap-2"
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
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}