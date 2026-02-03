import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Car,
  Eye,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleRecord {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  verification_status: string | null;
  verification_notes: string | null;
  verified_at: string | null;
  photos: string[] | null;
  dealer_id: string;
  created_at: string;
  dealer_email?: string;
  dealer_name?: string;
}

export function VehicleVerificationPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | 'rollback'>('approve');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [filter]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vehicles')
        .select('id, make, model, year, price, verification_status, verification_notes, verified_at, photos, dealer_id, created_at')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.or('verification_status.is.null,verification_status.eq.pending');
      } else if (filter !== 'all') {
        query = query.eq('verification_status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch dealer profiles
      const dealerIds = [...new Set((data || []).map(v => v.dealer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', dealerIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      const vehiclesWithDealer: VehicleRecord[] = (data || []).map(v => ({
        ...v,
        dealer_email: profileMap.get(v.dealer_id)?.email || 'Unknown',
        dealer_name: profileMap.get(v.dealer_id)?.full_name || undefined,
      }));

      setVehicles(vehiclesWithDealer);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (vehicle: VehicleRecord, action: 'approve' | 'reject' | 'rollback') => {
    setSelectedVehicle(vehicle);
    setDialogAction(action);
    setVerificationNotes('');
    setDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedVehicle || !user) return;

    setActionLoading(true);
    try {
      let updateData: Record<string, unknown> = {};

      if (dialogAction === 'approve') {
        updateData = {
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          verification_notes: verificationNotes.trim() || null,
        };
      } else if (dialogAction === 'reject') {
        if (!verificationNotes.trim()) {
          toast({
            title: 'Error',
            description: 'Rejection reason is required',
            variant: 'destructive',
          });
          setActionLoading(false);
          return;
        }
        updateData = {
          verification_status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          verification_notes: verificationNotes.trim(),
        };
      } else if (dialogAction === 'rollback') {
        updateData = {
          verification_status: 'pending',
          verified_at: null,
          verified_by: null,
          verification_notes: verificationNotes.trim() || null,
        };
      }

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', selectedVehicle.id);

      if (error) throw error;

      toast({
        title: dialogAction === 'approve' ? '✅ Vehicle Verified' :
               dialogAction === 'reject' ? '❌ Vehicle Rejected' : '↩️ Verification Rolled Back',
        description: `${selectedVehicle.make} ${selectedVehicle.model} ${selectedVehicle.year}`,
      });

      setDialogOpen(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error: unknown) {
      console.error('Action error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update vehicle',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      v.make.toLowerCase().includes(search) ||
      v.model.toLowerCase().includes(search) ||
      v.dealer_email?.toLowerCase().includes(search) ||
      v.year.toString().includes(search)
    );
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>;
    }
  };

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex gap-2">
          {(['pending', 'verified', 'rejected', 'all'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{vehicles.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border/50 bg-card/60">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No vehicles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(vehicle.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(vehicle.price)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{vehicle.dealer_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.dealer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setPhotoDialogOpen(true);
                          }}
                          className="gap-1"
                        >
                          <ImageIcon className="h-4 w-4" />
                          {vehicle.photos.length}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(vehicle.verification_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {(!vehicle.verification_status || vehicle.verification_status === 'pending') && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(vehicle, 'approve')}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(vehicle, 'reject')}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {vehicle.verification_status === 'verified' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActionDialog(vehicle, 'rollback')}
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {vehicle.verification_status === 'rejected' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(vehicle, 'approve')}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openActionDialog(vehicle, 'rollback')}
                              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' && 'Verify Vehicle'}
              {dialogAction === 'reject' && 'Reject Vehicle'}
              {dialogAction === 'rollback' && 'Rollback Verification'}
            </DialogTitle>
            <DialogDescription>
              {selectedVehicle && `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verification-notes">
                {dialogAction === 'reject' ? 'Rejection Reason *' : 'Notes (optional)'}
              </Label>
              <Textarea
                id="verification-notes"
                placeholder={dialogAction === 'reject' ? 'Enter rejection reason...' : 'Enter notes...'}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant={dialogAction === 'reject' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={actionLoading || (dialogAction === 'reject' && !verificationNotes.trim())}
            >
              {actionLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              {dialogAction === 'approve' && 'Verify'}
              {dialogAction === 'reject' && 'Reject'}
              {dialogAction === 'rollback' && 'Rollback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Preview Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vehicle Photos</DialogTitle>
            <DialogDescription>
              {selectedVehicle && `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
            {selectedVehicle?.photos?.map((photo, index) => (
              <a
                key={index}
                href={photo}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video rounded-lg overflow-hidden bg-muted hover:ring-2 ring-primary transition-all"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
