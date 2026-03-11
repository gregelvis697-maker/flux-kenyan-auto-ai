import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Car, Fuel, Settings, DollarSign, Gauge, Palette, Maximize2, Package, ShieldCheck, ShieldX, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PhotoUploader } from './PhotoUploader';
import { PhotoGallery } from './PhotoGallery';
import { PriceGuidance } from '@/components/marketplace/PriceGuidance';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  condition: string;
  fuel_type: string;
  engine_capacity: string;
  mileage: number | null;
  color: string | null;
  transmission: string | null;
  description: string | null;
  price: number;
  negotiable: boolean;
  is_sold: boolean;
  photos: string[];
  created_at: string;
  import_request_id: string | null;
  verification_status: string | null;
}

type InventorySource = 'all' | 'dealer_owned' | 'imported';

interface InventoryTabProps {
  onUpdate: () => void;
}

export function InventoryTab({ onUpdate }: InventoryTabProps) {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [sourceFilter, setSourceFilter] = useState<InventorySource>('all');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    condition: 'used',
    fuel_type: 'petrol',
    engine_capacity: '',
    mileage: '',
    color: '',
    transmission: 'automatic',
    description: '',
    price: '',
    negotiable: true,
    body_type: '',
    drive_type: '',
    seating_capacity: '',
    interior_color: '',
    location: '',
    features: [] as string[],
  });

  const openVehicleGallery = (vehiclePhotos: string[], startIndex = 0) => {
    setGalleryPhotos(vehiclePhotos);
    setGalleryIndex(startIndex);
    setGalleryOpen(true);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setVehicles([]);
        return;
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, condition, fuel_type, engine_capacity, mileage, color, transmission, description, price, negotiable, is_sold, photos, created_at, import_request_id, verification_status')
        .eq('dealer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
        return;
      }
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields before submission
    if (!formData.make?.trim() || !formData.model?.trim() || !formData.engine_capacity?.trim() || !formData.price) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to add vehicles',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const vehicleData = {
        dealer_id: user.id,
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year,
        condition: formData.condition as 'new' | 'used' | 'certified_pre_owned',
        fuel_type: formData.fuel_type as 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug_in_hybrid',
        engine_capacity: formData.engine_capacity.trim(),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        color: formData.color?.trim() || null,
        transmission: formData.transmission || null,
        description: formData.description?.trim() || null,
        price: priceValue,
        negotiable: formData.negotiable,
        photos: photos,
        body_type: formData.body_type || null,
        drive_type: formData.drive_type || null,
        seating_capacity: formData.seating_capacity ? parseInt(formData.seating_capacity) : null,
        interior_color: formData.interior_color?.trim() || null,
        location: formData.location?.trim() || null,
        features: formData.features.length > 0 ? formData.features : null,
      };

      let error;
      if (editingVehicle) {
        ({ error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id)
          .eq('dealer_id', user.id)); // Ensure ownership
      } else {
        ({ error } = await supabase.from('vehicles').insert(vehicleData));
      }

      if (error) {
        console.error('Database error:', error);
        toast({
          title: 'Error',
          description: 'Unable to save vehicle. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: editingVehicle ? 'Vehicle updated successfully' : 'Vehicle added successfully',
      });

      resetForm();
      fetchVehicles();
      onUpdate();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      // Silent fail - don't show toast for unexpected errors to avoid red toast spam
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setPhotos(vehicle.photos || []);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      condition: vehicle.condition,
      fuel_type: vehicle.fuel_type,
      engine_capacity: vehicle.engine_capacity,
      mileage: vehicle.mileage?.toString() || '',
      color: vehicle.color || '',
      transmission: vehicle.transmission || 'automatic',
      description: vehicle.description || '',
      price: vehicle.price.toString(),
      negotiable: vehicle.negotiable,
    });
    setShowForm(true);
  };

  const handleToggleSold = async (vehicleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_sold: !currentStatus })
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: currentStatus ? 'Vehicle marked as available' : 'Vehicle marked as sold',
      });

      fetchVehicles();
      onUpdate();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vehicle status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully',
      });

      fetchVehicles();
      onUpdate();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle',
        variant: 'destructive',
      });
    }
  };

  const handleRequestVerification = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ verification_status: 'pending' })
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: '✅ Verification Requested',
        description: 'Your vehicle has been submitted for verification.',
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to request verification',
        variant: 'destructive',
      });
    }
  };

  const getVerificationBadge = (status: string | null) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
            <ShieldCheck className="h-2.5 w-2.5" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="text-[10px] sm:text-xs bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
            <Shield className="h-2.5 w-2.5" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="text-[10px] sm:text-xs bg-red-500/20 text-red-400 border-red-500/30 gap-1">
            <ShieldX className="h-2.5 w-2.5" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      condition: 'used',
      fuel_type: 'petrol',
      engine_capacity: '',
      mileage: '',
      color: '',
      transmission: 'automatic',
      description: '',
      price: '',
      negotiable: true,
    });
    setPhotos([]);
    setShowForm(false);
    setEditingVehicle(null);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      used: 'Used',
      certified_pre_owned: 'Certified Pre-Owned',
    };
    return labels[condition] || condition;
  };

  const isImported = (vehicle: Vehicle) => vehicle.import_request_id !== null;

  const filteredVehicles = vehicles.filter(vehicle => {
    if (sourceFilter === 'all') return true;
    if (sourceFilter === 'imported') return isImported(vehicle);
    return !isImported(vehicle);
  });

  const dealerOwnedCount = vehicles.filter(v => !isImported(v)).length;
  const importedCount = vehicles.filter(v => isImported(v)).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">Vehicle Inventory</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your listed vehicles
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Source Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sourceFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSourceFilter('all')}
          className="gap-2"
        >
          All
          <Badge variant="secondary" className="ml-1">{vehicles.length}</Badge>
        </Button>
        <Button
          variant={sourceFilter === 'dealer_owned' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSourceFilter('dealer_owned')}
          className="gap-2"
        >
          <Car className="h-4 w-4" />
          Dealer-Owned
          <Badge variant="secondary" className="ml-1">{dealerOwnedCount}</Badge>
        </Button>
        <Button
          variant={sourceFilter === 'imported' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSourceFilter('imported')}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Imported via Flux
          <Badge variant="secondary" className="ml-1">{importedCount}</Badge>
        </Button>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/50 w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Photo Upload Section */}
            <PhotoUploader photos={photos} onPhotosChange={setPhotos} maxPhotos={10} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="make" className="text-xs sm:text-sm">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                  className="bg-background/50 h-9 sm:h-10 text-sm"
                  placeholder="Toyota"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs sm:text-sm">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="bg-background/50 h-9 sm:h-10 text-sm"
                  placeholder="Camry"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year" className="text-xs sm:text-sm">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  className="bg-background/50 h-9 sm:h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="condition" className="text-xs sm:text-sm">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger className="bg-background/50 h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="certified_pre_owned">Certified Pre-Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fuel_type" className="text-xs sm:text-sm">Fuel Type *</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                >
                  <SelectTrigger className="bg-background/50 h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="plug_in_hybrid">Plug-in Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="engine_capacity" className="text-xs sm:text-sm">Engine *</Label>
                <Input
                  id="engine_capacity"
                  value={formData.engine_capacity}
                  onChange={(e) => setFormData({ ...formData, engine_capacity: e.target.value })}
                  placeholder="2.0L"
                  required
                  className="bg-background/50 h-9 sm:h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mileage" className="text-xs sm:text-sm">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  className="bg-background/50 h-9 sm:h-10 text-sm"
                  placeholder="50000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color" className="text-xs sm:text-sm">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="bg-background/50 h-9 sm:h-10 text-sm"
                  placeholder="Silver"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="transmission" className="text-xs sm:text-sm">Transmission</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                >
                  <SelectTrigger className="bg-background/50 h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="cvt">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs sm:text-sm">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  step="0.01"
                  className="bg-background/50 h-9 sm:h-10 text-sm"
                  placeholder="25000"
                />
                {/* Price Guidance - Market Intelligence */}
                <PriceGuidance
                  make={formData.make}
                  model={formData.model}
                  year={formData.year}
                  currentPrice={formData.price}
                />
              </div>
              <div className="flex items-center space-x-2 pt-5 sm:pt-6">
                <Switch
                  id="negotiable"
                  checked={formData.negotiable}
                  onCheckedChange={(checked) => setFormData({ ...formData, negotiable: checked })}
                />
                <Label htmlFor="negotiable" className="text-xs sm:text-sm">Negotiable</Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-background/50 resize-none text-sm"
                placeholder="Add any additional details about the vehicle..."
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto h-10">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 h-10">
                {loading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <Card className="p-8 sm:p-12 bg-card/20 backdrop-blur-sm border-border/30 text-center">
          <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            {sourceFilter === 'all' 
              ? 'No vehicles in inventory' 
              : sourceFilter === 'imported' 
                ? 'No imported vehicles yet' 
                : 'No dealer-owned vehicles yet'}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {sourceFilter === 'imported' 
              ? 'Vehicles from accepted import requests will appear here'
              : 'Add your first vehicle!'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="overflow-hidden bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300 group"
            >
              {/* Image */}
              <div 
                className="h-36 sm:h-44 bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden cursor-pointer"
                onClick={() => vehicle.photos && vehicle.photos.length > 0 && openVehicleGallery(vehicle.photos)}
              >
                {vehicle.photos && vehicle.photos.length > 0 ? (
                  <img
                    src={vehicle.photos[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="h-12 sm:h-16 w-12 sm:w-16 text-muted-foreground/30" />
                  </div>
                )}
                {vehicle.photos && vehicle.photos.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openVehicleGallery(vehicle.photos);
                    }}
                    className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-background/80 hover:bg-background text-foreground text-[10px] rounded transition-colors"
                  >
                    <Maximize2 className="h-3 w-3" />
                    +{vehicle.photos.length - 1} more
                  </button>
                )}
                <Badge 
                  className={`absolute top-2 right-2 text-[10px] sm:text-xs ${
                    vehicle.is_sold 
                      ? 'bg-destructive/90 text-destructive-foreground' 
                      : 'bg-emerald-500/90 text-white'
                  }`}
                >
                  {vehicle.is_sold ? 'Sold' : 'Available'}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                {/* Source & Verification Badges */}
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      {getConditionLabel(vehicle.condition)}
                    </Badge>
                    {isImported(vehicle) ? (
                      <Badge className="text-[10px] sm:text-xs bg-secondary/20 text-secondary border-secondary/30">
                        <Package className="h-2.5 w-2.5 mr-1" />
                        Imported
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] sm:text-xs bg-primary/20 text-primary border-primary/30">
                        <Car className="h-2.5 w-2.5 mr-1" />
                        Dealer-Owned
                      </Badge>
                    )}
                    {getVerificationBadge(vehicle.verification_status)}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3 w-3" />
                    <span className="capitalize truncate">{vehicle.fuel_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    <span className="capitalize truncate">{vehicle.transmission}</span>
                  </div>
                  {vehicle.mileage && (
                    <div className="flex items-center gap-1">
                      <Gauge className="h-3 w-3" />
                      <span>{vehicle.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      <span className="capitalize truncate">{vehicle.color}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div>
                    <p className="text-base sm:text-lg font-bold text-primary">
                      {formatPrice(vehicle.price)}
                    </p>
                    {vehicle.negotiable && (
                      <p className="text-[10px] text-muted-foreground">Negotiable</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicle)}
                    className="h-8 text-xs px-1"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={vehicle.is_sold ? 'default' : 'secondary'}
                    onClick={() => handleToggleSold(vehicle.id, vehicle.is_sold)}
                    className="h-8 text-xs px-1"
                  >
                    <DollarSign className="h-3 w-3" />
                  </Button>
                  {!vehicle.verification_status || vehicle.verification_status === 'rejected' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestVerification(vehicle.id)}
                      className="h-8 text-xs px-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      title="Request Verification"
                    >
                      <ShieldCheck className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled
                      className="h-8 text-xs px-1"
                      title={vehicle.verification_status === 'verified' ? 'Verified' : 'Pending'}
                    >
                      <Shield className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vehicle.id)}
                    className="h-8 text-xs px-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Vehicle Photo Gallery */}
      <PhotoGallery
        photos={galleryPhotos}
        initialIndex={galleryIndex}
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
      />
    </div>
  );
}
