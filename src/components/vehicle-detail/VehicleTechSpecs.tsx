import { Wrench } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface VehicleTechSpecsProps {
  vehicle: {
    engine_capacity: string;
    fuel_type: string;
    transmission: string | null;
    drive_type: string | null;
    body_type: string | null;
    seating_capacity: number | null;
    color: string | null;
    interior_color: string | null;
    year: number;
    mileage: number | null;
    condition: string;
  };
}

const formatLabel = (val: string | null | undefined) => {
  if (!val) return '—';
  return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export function VehicleTechSpecs({ vehicle }: VehicleTechSpecsProps) {
  const specs = [
    { label: 'Engine', value: vehicle.engine_capacity || '—' },
    { label: 'Fuel Type', value: formatLabel(vehicle.fuel_type) },
    { label: 'Transmission', value: formatLabel(vehicle.transmission) },
    { label: 'Drivetrain', value: formatLabel(vehicle.drive_type) },
    { label: 'Body Type', value: formatLabel(vehicle.body_type) },
    { label: 'Seating Capacity', value: vehicle.seating_capacity ? `${vehicle.seating_capacity} passengers` : '—' },
    { label: 'Exterior Color', value: formatLabel(vehicle.color) },
    { label: 'Interior Color', value: formatLabel(vehicle.interior_color) },
    { label: 'Year', value: vehicle.year.toString() },
    { label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '—' },
    { label: 'Condition', value: formatLabel(vehicle.condition) },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Technical Specifications</h2>
      </div>
      <Separator className="mb-4 bg-border/30" />
      <div className="rounded-lg border border-border/30 overflow-hidden">
        {specs.map((spec, i) => (
          <div
            key={spec.label}
            className={cn(
              "flex justify-between items-center px-4 py-3 text-sm",
              i % 2 === 0 ? "bg-muted/20" : "bg-transparent"
            )}
          >
            <span className="font-medium text-muted-foreground">{spec.label}</span>
            <span className="text-foreground">{spec.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
