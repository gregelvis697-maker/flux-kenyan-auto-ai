import React from 'react';
import { formatKes, labelFor, type PreferenceAnswers } from '@/lib/buildQuestions';

const rows = (a: PreferenceAnswers) => [
  { label: 'Vehicle type', value: labelFor('vehicle_type', a.vehicle_type) },
  {
    label: 'Year range',
    value: a.year_min || a.year_max ? `${a.year_min ?? '—'} – ${a.year_max ?? '—'}` : null,
  },
  {
    label: 'Budget',
    value:
      a.price_min || a.price_max ? `${formatKes(a.price_min)} – ${formatKes(a.price_max)}` : null,
  },
  { label: 'Mileage', value: labelFor('mileage_preference', a.mileage_preference) },
  { label: 'Main use', value: labelFor('primary_use_case', a.primary_use_case) },
  { label: 'Vibe', value: labelFor('vibe', a.vibe) },
  { label: 'Transmission', value: labelFor('transmission_preference', a.transmission_preference) },
  { label: 'Fuel', value: labelFor('fuel_type_preference', a.fuel_type_preference) },
  { label: 'Interior', value: labelFor('interior_vibe', a.interior_vibe) },
  { label: 'Timeline', value: labelFor('purchase_timeline', a.purchase_timeline) },
  { label: 'Updates', value: labelFor('notification_preference', a.notification_preference) },
];

export const PreferenceSummary = React.forwardRef<HTMLDivElement, { answers: PreferenceAnswers }>(
  ({ answers }, ref) => (
    <div ref={ref} className="grid gap-3 sm:grid-cols-2">
      {rows(answers)
        .filter((r) => r.value)
        .map((r) => (
          <div key={r.label} className="p-4 rounded-xl border border-border/60 bg-card/60">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.label}</p>
            <p className="mt-1 font-semibold text-foreground text-sm">{r.value}</p>
          </div>
        ))}
    </div>
  ),
);

PreferenceSummary.displayName = 'PreferenceSummary';
