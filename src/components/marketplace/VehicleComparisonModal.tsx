import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Car, Fuel, Settings, Gauge, Palette, Calendar, DollarSign, Check, Minus } from 'lucide-react';

interface VehicleForComparison {
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
  price: number;
  negotiable: boolean;
  photos: string[] | null;
}

interface VehicleComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: VehicleForComparison[];
  onRemove: (vehicleId: string) => void;
}

export function VehicleComparisonModal({ 
  open, 
  onOpenChange, 
  vehicles,
  onRemove 
}: VehicleComparisonModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'New',
      used: 'Used',
      certified_pre_owned: 'CPO',
    };
    return labels[condition] || condition;
  };

  const getFuelLabel = (fuel: string) => {
    const labels: Record<string, string> = {
      petrol: 'Petrol',
      diesel: 'Diesel',
      electric: 'Electric',
      hybrid: 'Hybrid',
      plug_in_hybrid: 'Plug-in Hybrid',
    };
    return labels[fuel] || fuel;
  };

  const specs = [
    { key: 'price', label: 'Price', icon: DollarSign, getValue: (v: VehicleForComparison) => formatPrice(v.price) },
    { key: 'year', label: 'Year', icon: Calendar, getValue: (v: VehicleForComparison) => v.year.toString() },
    { key: 'condition', label: 'Condition', icon: Check, getValue: (v: VehicleForComparison) => getConditionLabel(v.condition) },
    { key: 'fuel_type', label: 'Fuel Type', icon: Fuel, getValue: (v: VehicleForComparison) => getFuelLabel(v.fuel_type) },
    { key: 'engine', label: 'Engine', icon: Settings, getValue: (v: VehicleForComparison) => v.engine_capacity },
    { key: 'transmission', label: 'Transmission', icon: Settings, getValue: (v: VehicleForComparison) => v.transmission || 'N/A' },
    { key: 'mileage', label: 'Mileage', icon: Gauge, getValue: (v: VehicleForComparison) => v.mileage ? `${v.mileage.toLocaleString()} km` : 'N/A' },
    { key: 'color', label: 'Color', icon: Palette, getValue: (v: VehicleForComparison) => v.color || 'N/A' },
    { key: 'negotiable', label: 'Negotiable', icon: DollarSign, getValue: (v: VehicleForComparison) => v.negotiable ? 'Yes' : 'No' },
  ];

  // Find lowest price for highlighting
  const lowestPrice = Math.min(...vehicles.map(v => v.price));
  const lowestMileage = Math.min(...vehicles.filter(v => v.mileage).map(v => v.mileage!));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 bg-card border-border">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">Compare Vehicles</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-4 sm:p-6 pt-4">
            {vehicles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Car className="h-16 w-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg">No vehicles to compare</p>
                <p className="text-sm">Add vehicles to compare their specs side by side</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-3 bg-muted/30 rounded-tl-lg font-medium text-muted-foreground text-sm min-w-[120px]">
                        Specification
                      </th>
                      {vehicles.map((vehicle, idx) => (
                        <th 
                          key={vehicle.id} 
                          className={`p-3 bg-muted/30 text-left min-w-[180px] ${idx === vehicles.length - 1 ? 'rounded-tr-lg' : ''}`}
                        >
                          <div className="space-y-2">
                            <div className="relative">
                              {vehicle.photos && vehicle.photos.length > 0 ? (
                                <img
                                  src={vehicle.photos[0]}
                                  alt={`${vehicle.make} ${vehicle.model}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-24 bg-muted/50 rounded-lg flex items-center justify-center">
                                  <Car className="h-8 w-8 text-muted-foreground/40" />
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                                onClick={() => onRemove(vehicle.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {vehicle.year} {vehicle.make}
                              </p>
                              <p className="text-muted-foreground text-sm">{vehicle.model}</p>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((spec, rowIdx) => (
                      <tr key={spec.key} className={rowIdx % 2 === 0 ? 'bg-muted/10' : ''}>
                        <td className="p-3 font-medium text-muted-foreground text-sm">
                          <div className="flex items-center gap-2">
                            <spec.icon className="h-4 w-4" />
                            {spec.label}
                          </div>
                        </td>
                        {vehicles.map((vehicle) => {
                          const value = spec.getValue(vehicle);
                          const isLowestPrice = spec.key === 'price' && vehicle.price === lowestPrice;
                          const isLowestMileage = spec.key === 'mileage' && vehicle.mileage === lowestMileage && vehicle.mileage !== null;
                          
                          return (
                            <td 
                              key={vehicle.id} 
                              className={`p-3 text-sm ${
                                isLowestPrice || isLowestMileage 
                                  ? 'text-green-500 font-semibold' 
                                  : 'text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                {value}
                                {(isLowestPrice || isLowestMileage) && (
                                  <Badge variant="outline" className="text-[10px] ml-1 bg-green-500/10 text-green-500 border-green-500/30">
                                    Best
                                  </Badge>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
