import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, X, Car, Fuel, Settings, DollarSign } from 'lucide-react';
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
    photos: '',
  });

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
        photos: formData.photos ? formData.photos.split(',').map(p => p.trim()) : [],
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
      photos: vehicle.photos.join(', '),
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
      photos: '',
    });
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

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make" className="text-sm">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition" className="text-sm">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="certified_pre_owned">Certified Pre-Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuel_type" className="text-sm">Fuel Type *</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                >
                  <SelectTrigger className="bg-background/50">
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
              <div className="space-y-2">
                <Label htmlFor="engine_capacity" className="text-sm">Engine Capacity *</Label>
                <Input
                  id="engine_capacity"
                  value={formData.engine_capacity}
                  onChange={(e) => setFormData({ ...formData, engine_capacity: e.target.value })}
                  placeholder="e.g., 2.0L"
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage" className="text-sm">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission" className="text-sm">Transmission</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic">Automatic</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="cvt">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  step="0.01"
                  className="bg-background/50"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="negotiable"
                  checked={formData.negotiable}
                  onCheckedChange={(checked) => setFormData({ ...formData, negotiable: checked })}
                />
                <Label htmlFor="negotiable" className="text-sm">Negotiable</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-background/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photos" className="text-sm">Photo URLs (comma-separated)</Label>
              <Input
                id="photos"
                value={formData.photos}
                onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                className="bg-background/50"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                {loading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vehicle Grid */}
      {vehicles.length === 0 ? (
        <Card className="p-8 sm:p-12 bg-card/20 backdrop-blur-sm border-border/30 text-center">
          <Car className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No vehicles in inventory</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Add your first vehicle!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="overflow-hidden bg-card/30 backdrop-blur-sm border-border/30 hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300 group"
            >
              {/* Image */}
              <div className="h-40 sm:h-48 bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden">
                {vehicle.photos && vehicle.photos.length > 0 ? (
                  <img
                    src={vehicle.photos[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                <Badge 
                  className={`absolute top-3 right-3 ${
                    vehicle.is_sold 
                      ? 'bg-destructive/90 text-destructive-foreground' 
                      : 'bg-emerald-500/90 text-white'
                  }`}
                >
                  {vehicle.is_sold ? 'Sold' : 'Available'}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <div>
                  <h4 className="font-semibold text-foreground text-base sm:text-lg leading-tight">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <Badge variant="outline" className="mt-1.5 text-xs">
                    {getConditionLabel(vehicle.condition)}
                  </Badge>
                </div>

                {/* Specs */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Fuel className="h-3.5 w-3.5" />
                    <span className="capitalize">{vehicle.fuel_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-3.5 w-3.5" />
                    <span>{vehicle.engine_capacity}</span>
                  </div>
                  {vehicle.mileage && (
                    <span>{vehicle.mileage.toLocaleString()} km</span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      {vehicle.price.toLocaleString()}
                    </span>
                  </div>
                  {vehicle.negotiable && (
                    <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                      Negotiable
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicle)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={vehicle.is_sold ? 'default' : 'secondary'}
                    onClick={() => handleToggleSold(vehicle.id, vehicle.is_sold)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    {vehicle.is_sold ? 'Relist' : 'Mark Sold'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vehicle.id)}
                    className="px-2.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}