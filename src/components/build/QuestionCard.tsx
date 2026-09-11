import React from 'react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { formatKes, type Question } from '@/lib/buildQuestions';
import { Check } from 'lucide-react';

interface Props {
  question: Question;
  value: any;
  valueMax?: any;
  onChange: (value: any, valueMax?: any) => void;
}

export const QuestionCard = React.forwardRef<HTMLDivElement, Props>(
  ({ question, value, valueMax, onChange }, ref) => {
    const isMulti = question.kind === 'multi';
    const selected: string[] = isMulti ? (Array.isArray(value) ? value : []) : [];

    const toggleMulti = (v: string) => {
      if (selected.includes(v)) {
        onChange(selected.filter((s) => s !== v));
      } else if (!question.max || selected.length < question.max) {
        onChange([...selected, v]);
      }
    };

    return (
      <div ref={ref} className="space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-primary font-semibold">
            {question.section}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {question.title}
          </h2>
          {question.help && (
            <p className="mt-2 text-sm text-muted-foreground">{question.help}</p>
          )}
        </div>

        {(question.kind === 'single' || isMulti) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options?.map((opt) => {
              const active = isMulti
                ? selected.includes(opt.value)
                : String(value ?? '') === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => (isMulti ? toggleMulti(opt.value) : onChange(opt.value))}
                  className={cn(
                    'min-h-[64px] text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-3',
                    active
                      ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.4)]'
                      : 'border-border/60 bg-card/60 hover:border-border',
                  )}
                >
                  {opt.emoji && <span className="text-xl leading-none">{opt.emoji}</span>}
                  <span className="flex-1">
                    <span className="block font-semibold text-foreground text-sm">{opt.label}</span>
                    {opt.hint && (
                      <span className="block text-xs text-muted-foreground mt-0.5">{opt.hint}</span>
                    )}
                  </span>
                  {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {isMulti && question.max && (
          <p className="text-xs text-muted-foreground">
            {selected.length} of {question.max} selected
          </p>
        )}

        {question.kind === 'range' && (
          <div className="space-y-6 p-5 rounded-xl border border-border/60 bg-card/60">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{value ?? question.min}</span>
              <span className="text-muted-foreground text-xs uppercase tracking-widest">to</span>
              <span>{valueMax ?? question.rangeMax}</span>
            </div>
            <Slider
              min={question.min}
              max={question.rangeMax}
              step={question.step}
              value={[Number(value ?? question.min), Number(valueMax ?? question.rangeMax)]}
              onValueChange={(v) => onChange(v[0], v[1])}
            />
          </div>
        )}

        {question.kind === 'number-range' && (
          <div className="space-y-6 p-5 rounded-xl border border-border/60 bg-card/60">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{formatKes(Number(value ?? question.min))}</span>
              <span className="text-muted-foreground text-xs uppercase tracking-widest">to</span>
              <span>{formatKes(Number(valueMax ?? question.rangeMax))}</span>
            </div>
            <Slider
              min={question.min}
              max={question.rangeMax}
              step={question.step}
              value={[Number(value ?? question.min), Number(valueMax ?? question.rangeMax)]}
              onValueChange={(v) => onChange(v[0], v[1])}
            />
          </div>
        )}
      </div>
    );
  },
);

QuestionCard.displayName = 'QuestionCard';
