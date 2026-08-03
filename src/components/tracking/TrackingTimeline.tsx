import React from 'react';
import { cn } from '@/lib/utils';
import { getStageIcon, getStageLabel } from '@/lib/trackingStages';

export interface TrackingUpdateRecord {
  id: string;
  stage: string;
  stage_label?: string | null;
  location_text?: string | null;
  notes?: string | null;
  status?: string | null;
  created_at: string;
}

interface TrackingTimelineProps {
  updates: TrackingUpdateRecord[];
  className?: string;
  emptyMessage?: string;
}

const statusStyles: Record<string, string> = {
  completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  in_progress: 'border-primary/40 bg-primary/10 text-primary',
  delayed: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
};

export const TrackingTimeline = React.forwardRef<HTMLDivElement, TrackingTimelineProps>(
  ({ updates, className, emptyMessage = 'No tracking updates yet.' }, ref) => {
    if (!updates || updates.length === 0) {
      return (
        <div ref={ref} className={cn('rounded-lg border border-border/40 bg-muted/20 p-6 text-center', className)}>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-0', className)}>
        {updates.map((update, index) => (
          <div key={update.id} className="relative flex gap-3 sm:gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card text-base">
                {getStageIcon(update.stage)}
              </div>
              {index < updates.length - 1 && (
                <div className="mt-1 w-px flex-1 bg-border/50" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground text-sm sm:text-base">
                  {update.stage_label || getStageLabel(update.stage)}
                </p>
                {update.status && (
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide',
                      statusStyles[update.status] ?? 'border-border/40 bg-muted/30 text-muted-foreground'
                    )}
                  >
                    {update.status.replace('_', ' ')}
                  </span>
                )}
              </div>

              {update.location_text && (
                <p className="mt-0.5 text-sm text-muted-foreground break-words">📍 {update.location_text}</p>
              )}
              {update.notes && (
                <p className="mt-1 text-sm italic text-muted-foreground break-words">"{update.notes}"</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(update.created_at).toLocaleDateString('en-KE', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

TrackingTimeline.displayName = 'TrackingTimeline';
