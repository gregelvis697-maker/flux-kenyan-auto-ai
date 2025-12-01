import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Calendar, Car, DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DeliveredShipment {
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
  delivered_at: string | null;
  dealer_email?: string;
}

export function DeliveredTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shipments, setShipments] = useState<DeliveredShipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDeliveredShipments();
    }
  }, [user]);

  const fetchDeliveredShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('dealer_import_requests')
        .select(`
          *,
          profiles:dealer_id(email)
        `)
        .eq('importer_id', user?.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((req: any) => ({
        ...req,
        dealer_email: req.profiles?.email,
      }));

      setShipments(formattedData);
    } catch (error: any) {
      console.error('Error fetching delivered shipments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch delivered shipments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No delivered shipments yet</p>
        <p className="text-sm">Completed deliveries will appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Dealer</TableHead>
            <TableHead>Accepted</TableHead>
            <TableHead>Delivered</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => (
            <TableRow key={shipment.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  {shipment.make} {shipment.model}
                </div>
              </TableCell>
              <TableCell>{shipment.year}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-green-500">
                  <DollarSign className="h-4 w-4" />
                  {shipment.budget.toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{shipment.dealer_email}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {shipment.accepted_at ? new Date(shipment.accepted_at).toLocaleDateString() : 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Delivered
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}