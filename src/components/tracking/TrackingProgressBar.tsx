import React from 'react';
import { cn } from '@/lib/utils';
import { TrackingService } from '@/services/trackingService';
import { getStageIcon, getStageLabel } from '@/lib/trackingStages';

interface TrackingProgressBarProps {
  currentStage: string;
  className?: string;
  showLabel?: boolean;
}

export const TrackingProgressBar = React.forwardRef<HTMLDivElement, TrackingProgressBarProps>(
  ({ currentStage, className, showLabel = true }, ref) => {
    const progress = TrackingService.getTrackingProgress(currentStage);

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {showLabel && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">
              {getStageIcon(currentStage)} {getStageLabel(currentStage)}
            </span>
            <span className="text-sm font-semibold text-primary">{progress}%</span>
          </div>
        )}
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted/40"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tracking progress"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-[400ms]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }
);

TrackingProgressBar.displayName = 'TrackingProgressBar';
