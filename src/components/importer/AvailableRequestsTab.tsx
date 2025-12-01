import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Package, Calendar, DollarSign, Car } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ImportRequest {
  id: string;
  dealer_id: string;
  make: string;
  model: string;
  year: number;
  specs: string | null;
  budget: number;
  status: string;
  created_at: string;
  dealer_email?: string;
}

interface AvailableRequestsTabProps {
  onUpdate: () => void;
}

export function AvailableRequestsTab({ onUpdate }: AvailableRequestsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableRequests();
  }, []);

  const fetchAvailableRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('dealer_import_requests')
        .select(`
          *,
          profiles:dealer_id(email)
        `)
        .eq('status', 'requested')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((req: any) => ({
        ...req,
        dealer_email: req.profiles?.email,
      }));

      setRequests(formattedData);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!user) return;
    
    setAcceptingId(requestId);
    try {
      const { error } = await supabase
        .from('dealer_import_requests')
        .update({
          status: 'accepted',
          importer_id: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request Accepted',
        description: 'You have successfully accepted this import request',
      });

      fetchAvailableRequests();
      onUpdate();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept request',
        variant: 'destructive',
      });
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No available import requests</p>
        <p className="text-sm">Check back later for new requests from dealers</p>
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
            <TableHead>Specs</TableHead>
            <TableHead>Dealer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  {request.make} {request.model}
                </div>
              </TableCell>
              <TableCell>{request.year}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-green-500">
                  <DollarSign className="h-4 w-4" />
                  {request.budget.toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {request.specs || 'No specific specs'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{request.dealer_email}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => handleAccept(request.id)}
                  disabled={acceptingId === request.id}
                >
                  {acceptingId === request.id ? 'Accepting...' : 'Accept'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}