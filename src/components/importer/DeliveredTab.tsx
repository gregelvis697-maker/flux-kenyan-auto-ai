import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Calendar, Car, DollarSign, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
      if (!user?.id) {
        setShipments([]);
        setLoading(false);
        return;
      }

      // Fetch shipments without join to avoid RLS issues
      const { data, error } = await supabase
        .from('dealer_import_requests')
        .select('*')
        .eq('importer_id', user.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

      if (error) {
        console.error('Error fetching delivered shipments:', error);
        setShipments([]);
        setLoading(false);
        return;
      }

      // Fetch dealer emails separately (non-blocking)
      const dealerIds = [...new Set((data || []).map(r => r.dealer_id))];
      let emailMap: Record<string, string> = {};
      
      if (dealerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', dealerIds);
        
        if (profiles) {
          emailMap = profiles.reduce((acc: Record<string, string>, p) => {
            acc[p.id] = p.email;
            return acc;
          }, {});
        }
      }

      const formattedData = (data || []).map((req: any) => ({
        ...req,
        dealer_email: emailMap[req.dealer_id] || 'Contact via platform',
      }));

      setShipments(formattedData);
    } catch (error: any) {
      console.error('Error fetching delivered shipments:', error);
      setShipments([]);
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
    <div>
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {shipments.map((shipment) => (
          <Card key={shipment.id} className="border-border/50 bg-card/30">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                    <Car className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">
                      {shipment.make} {shipment.model}
                    </h3>
                    <p className="text-sm text-muted-foreground">{shipment.year}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Delivered
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-medium">
                    ${shipment.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="truncate">{shipment.dealer_email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div>
                  <span className="text-xs uppercase tracking-wider opacity-70">Accepted</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {shipment.accepted_at ? new Date(shipment.accepted_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider opacity-70">Delivered</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3" />
                    {shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
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
    </div>
  );
}