import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Mail, Phone, Car, Calendar, MessageSquare, 
  Check, Eye, EyeOff, User 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ContactRequest {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  message: string;
  created_at: string;
  read_at: string | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
  };
}

interface ContactRequestsTabProps {
  onUpdate?: () => void;
}

export function ContactRequestsTab({ onUpdate }: ContactRequestsTabProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  useEffect(() => {
    fetchContactRequests();
  }, []);

  const fetchContactRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get dealer's vehicles
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('dealer_id', user.id);

      if (vehiclesError) throw vehiclesError;

      if (!vehicles || vehicles.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const vehicleIds = vehicles.map(v => v.id);

      // Then get contact requests for those vehicles
      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          vehicles (
            id,
            make,
            model,
            year,
            price
          )
        `)
        .in('vehicle_id', vehicleIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((req: any) => ({
        ...req,
        vehicle: req.vehicles,
      }));

      setRequests(formattedData);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (requestId: string, isCurrentlyRead: boolean) => {
    setMarkingRead(requestId);
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ read_at: isCurrentlyRead ? null : new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: isCurrentlyRead ? 'Marked as unread' : 'Marked as read',
      });

      fetchContactRequests();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating contact request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update',
        variant: 'destructive',
      });
    } finally {
      setMarkingRead(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const unreadCount = requests.filter(r => !r.read_at).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">Contact Requests</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'No unread requests'} • {requests.length} total
          </p>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="p-8 sm:p-12 bg-card/20 backdrop-blur-sm border-border/30 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No contact requests yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Buyers will reach out when interested in your vehicles
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card 
              key={request.id} 
              className={`p-4 sm:p-5 bg-card/30 backdrop-blur-sm border-border/30 transition-all ${
                !request.read_at ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Buyer Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{request.buyer_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={request.read_at ? "outline" : "default"}
                      className={!request.read_at ? "bg-primary/20 text-primary border-0" : ""}
                    >
                      {request.read_at ? 'Read' : 'New'}
                    </Badge>
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                    </span>
                    <span className="text-primary font-semibold">
                      {formatPrice(request.vehicle.price)}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{request.message}</p>
                  </div>

                  {/* Contact Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => window.location.href = `mailto:${request.buyer_email}?subject=Re: ${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {request.buyer_email}
                    </Button>
                    {request.buyer_phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.location.href = `tel:${request.buyer_phone}`}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {request.buyer_phone}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-2 ml-auto"
                      onClick={() => handleMarkRead(request.id, !!request.read_at)}
                      disabled={markingRead === request.id}
                    >
                      {request.read_at ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Mark Unread
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Mark Read
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
