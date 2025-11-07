import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">Vehicle Inventory</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-card/40 backdrop-blur-sm border-border/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h4>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
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
                <Label htmlFor="fuel_type">Fuel Type *</Label>
                <Select
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                >
                  <SelectTrigger>
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
                <Label htmlFor="engine_capacity">Engine Capacity *</Label>
                <Input
                  id="engine_capacity"
                  value={formData.engine_capacity}
                  onChange={(e) => setFormData({ ...formData, engine_capacity: e.target.value })}
                  placeholder="e.g., 2.0L"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                >
                  <SelectTrigger>
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
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  step="0.01"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="negotiable"
                  checked={formData.negotiable}
                  onCheckedChange={(checked) => setFormData({ ...formData, negotiable: checked })}
                />
                <Label htmlFor="negotiable">Negotiable</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photos">Photo URLs (comma-separated)</Label>
              <Input
                id="photos"
                value={formData.photos}
                onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <Card className="col-span-full p-12 bg-card/40 backdrop-blur-sm border-border/50">
            <p className="text-center text-muted-foreground">
              No vehicles in inventory. Add your first vehicle!
            </p>
          </Card>
        ) : (
          vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:shadow-elevated transition-all duration-300"
            >
              {vehicle.photos.length > 0 && (
                <div className="h-48 bg-muted/20 overflow-hidden">
                  <img
                    src={vehicle.photos[0]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-foreground">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h4>
                    <Badge variant={vehicle.is_sold ? 'destructive' : 'default'}>
                      {vehicle.is_sold ? 'Sold' : 'Available'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{vehicle.fuel_type} • {vehicle.engine_capacity}</p>
                    {vehicle.mileage && <p>{vehicle.mileage.toLocaleString()} km</p>}
                    {vehicle.color && <p>Color: {vehicle.color}</p>}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ${vehicle.price.toLocaleString()}
                    </p>
                    {vehicle.negotiable && (
                      <p className="text-xs text-muted-foreground">Negotiable</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicle)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={vehicle.is_sold ? 'default' : 'secondary'}
                    onClick={() => handleToggleSold(vehicle.id, vehicle.is_sold)}
                    className="flex-1"
                  >
                    {vehicle.is_sold ? 'Mark Available' : 'Mark Sold'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
