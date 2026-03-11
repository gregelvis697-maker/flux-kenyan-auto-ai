import { Fuel, Settings, Cog, CircleDot } from 'lucide-react';

interface VehicleQuickSpecsProps {
  fuelType: string;
  engineCapacity: string;
  transmission: string | null;
  driveType: string | null;
}

const formatLabel = (val: string | null) => {
  if (!val) return 'N/A';
  return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export function VehicleQuickSpecs({ fuelType, engineCapacity, transmission, driveType }: VehicleQuickSpecsProps) {
  const specs = [
    { icon: Fuel, label: 'FUEL TYPE', value: formatLabel(fuelType) },
    { icon: Settings, label: 'ENGINE', value: engineCapacity || 'N/A' },
    { icon: Cog, label: 'TRANSMISSION', value: formatLabel(transmission) },
    { icon: CircleDot, label: 'DRIVETRAIN', value: formatLabel(driveType) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 border border-border/30 text-center"
        >
          <spec.icon className="h-6 w-6 text-primary" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            {spec.label}
          </span>
          <span className="text-sm font-semibold text-foreground">{spec.value}</span>
        </div>
      ))}
    </div>
  );
}
