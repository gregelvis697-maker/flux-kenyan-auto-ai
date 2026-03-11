import { FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface VehicleOverviewProps {
  description: string | null;
}

export function VehicleOverview({ description }: VehicleOverviewProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Vehicle Overview</h2>
      </div>
      <Separator className="mb-4 bg-border/30" />
      {description ? (
        <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-line">
          {description}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">No description provided</p>
      )}
    </section>
  );
}
