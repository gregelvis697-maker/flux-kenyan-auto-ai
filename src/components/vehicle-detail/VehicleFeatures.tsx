import { ListChecks, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface VehicleFeaturesProps {
  features: string[] | null;
}

export function VehicleFeatures({ features }: VehicleFeaturesProps) {
  if (!features || features.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Features & Options</h2>
        </div>
        <Separator className="mb-4 bg-border/30" />
        <p className="text-sm text-muted-foreground italic">No features listed</p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <ListChecks className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Features & Options</h2>
      </div>
      <Separator className="mb-4 bg-border/30" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-foreground py-1">
            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
