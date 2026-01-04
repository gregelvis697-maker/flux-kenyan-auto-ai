import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Car, Fuel, Settings, DollarSign, Gauge, Palette, Maximize2 } from 'lucide-react';
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
import { InventoryFilters, FilterValues, defaultFilters } from './InventoryFilters';
import { BulkActions } from './BulkActions';

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
}

interface InventoryTabProps {
  onUpdate: () => void;
}

export function InventoryTab({ onUpdate }: InventoryTabProps) {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
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
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory',
        variant: 'destructive',
      });
    }
  };

  // Extract unique makes and models for filter dropdowns
  const makes = useMemo(() => [...new Set(vehicles.map((v) => v.make))].sort(), [vehicles]);
  const models = useMemo(() => {
    if (filters.make) {
      return [...new Set(vehicles.filter((v) => v.make === filters.make).map((v) => v.model))].sort();
    }
    return [...new Set(vehicles.map((v) => v.model))].sort();
  }, [vehicles, filters.make]);

  // Filter vehicles based on current filters
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        !filters.search ||
        vehicle.make.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.year.toString().includes(searchLower) ||
        (vehicle.description && vehicle.description.toLowerCase().includes(searchLower));

      const matchesMake = !filters.make || vehicle.make === filters.make;
      const matchesModel = !filters.model || vehicle.model === filters.model;
      const matchesCondition = !filters.condition || vehicle.condition === filters.condition;
      const matchesFuelType = !filters.fuelType || vehicle.fuel_type === filters.fuelType;
      const matchesMinPrice = !filters.minPrice || vehicle.price >= parseFloat(filters.minPrice);
      const matchesMaxPrice = !filters.maxPrice || vehicle.price <= parseFloat(filters.maxPrice);
      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'sold' && vehicle.is_sold) ||
        (filters.status === 'available' && !vehicle.is_sold);

      return (
        matchesSearch &&
        matchesMake &&
        matchesModel &&
        matchesCondition &&
        matchesFuelType &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesStatus
      );
    });
  }, [vehicles, filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const vehicleData = {
        dealer_id: user.id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        condition: formData.condition as 'new' | 'used' | 'certified_pre_owned',
        fuel_type: formData.fuel_type as 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug_in_hybrid',
        engine_capacity: formData.engine_capacity,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        color: formData.color || null,
        transmission: formData.transmission || null,
        description: formData.description || null,
        price: parseFloat(formData.price),
        negotiable: formData.negotiable,
        photos: photos,
      };

      let error;
      if (editingVehicle) {
        ({ error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id));
      } else {
        ({ error } = await supabase.from('vehicles').insert(vehicleData));
      }

      if (error) throw error;

      toast({
        title: 'Success',
        description: editingVehicle ? 'Vehicle updated successfully' : 'Vehicle added successfully',
      });

      resetForm();
      fetchVehicles();
      onUpdate();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to save vehicle',
        variant: 'destructive',
      });
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

  // Bulk actions
  const toggleSelectVehicle = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedVehicles.size === filteredVehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map((v) => v.id)));
    }
  };

  const handleBulkMarkSold = async () => {
    if (selectedVehicles.size === 0) return;
    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_sold: true })
        .in('id', Array.from(selectedVehicles));

      if (error) throw error;

      toast({ title: 'Success', description: `${selectedVehicles.size} vehicles marked as sold` });
      setSelectedVehicles(new Set());
      fetchVehicles();
      onUpdate();
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast({ title: 'Error', description: 'Failed to update vehicles', variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkMarkAvailable = async () => {
    if (selectedVehicles.size === 0) return;
    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_sold: false })
        .in('id', Array.from(selectedVehicles));

      if (error) throw error;

      toast({ title: 'Success', description: `${selectedVehicles.size} vehicles marked as available` });
      setSelectedVehicles(new Set());
      fetchVehicles();
      onUpdate();
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast({ title: 'Error', description: 'Failed to update vehicles', variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVehicles.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedVehicles.size} vehicles?`)) return;

    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .in('id', Array.from(selectedVehicles));

      if (error) throw error;

      toast({ title: 'Success', description: `${selectedVehicles.size} vehicles deleted` });
      setSelectedVehicles(new Set());
      fetchVehicles();
      onUpdate();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast({ title: 'Error', description: 'Failed to delete vehicles', variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedData = vehicles.filter((v) => selectedVehicles.has(v.id));
    const csvContent = [
      ['Make', 'Model', 'Year', 'Condition', 'Fuel Type', 'Engine', 'Mileage', 'Color', 'Transmission', 'Price', 'Status'].join(','),
      ...selectedData.map((v) =>
        [
          v.make,
          v.model,
          v.year,
          v.condition,
          v.fuel_type,
          v.engine_capacity,
          v.mileage || '',
          v.color || '',
          v.transmission || '',
          v.price,
          v.is_sold ? 'Sold' : 'Available',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Success', description: `Exported ${selectedData.length} vehicles` });
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
            {filteredVehicles.length} of {vehicles.length} vehicles
          </p>
        </div>
        <div className="flex gap-2">
          {filteredVehicles.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="text-xs"
            >
              {selectedVehicles.size === filteredVehicles.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
          <Button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <InventoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        makes={makes}
        models={models}
      />

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
            {vehicles.length === 0 ? 'No vehicles in inventory' : 'No vehicles match your filters'}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {vehicles.length === 0 ? 'Add your first vehicle!' : 'Try adjusting your search criteria'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={`overflow-hidden bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300 group ${
                selectedVehicles.has(vehicle.id) ? 'ring-2 ring-primary border-primary/50' : ''
              }`}
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
                {/* Selection checkbox */}
                <div
                  className="absolute top-2 left-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedVehicles.has(vehicle.id)}
                    onCheckedChange={() => toggleSelectVehicle(vehicle.id)}
                    className="h-5 w-5 bg-background/80 border-border"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                {/* Title */}
                <div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs">
                    {getConditionLabel(vehicle.condition)}
                  </Badge>
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
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicle)}
                    className="h-8 text-xs px-2"
                  >
                    <Edit className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={vehicle.is_sold ? 'default' : 'secondary'}
                    onClick={() => handleToggleSold(vehicle.id, vehicle.is_sold)}
                    className="h-8 text-xs px-2"
                  >
                    <DollarSign className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">{vehicle.is_sold ? 'Relist' : 'Sold'}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vehicle.id)}
                    className="h-8 text-xs px-2"
                  >
                    <Trash2 className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Delete</span>
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

      {/* Bulk Actions Bar */}
      <BulkActions
        selectedCount={selectedVehicles.size}
        onMarkSold={handleBulkMarkSold}
        onMarkAvailable={handleBulkMarkAvailable}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onClearSelection={() => setSelectedVehicles(new Set())}
        loading={bulkLoading}
      />
    </div>
  );
}
