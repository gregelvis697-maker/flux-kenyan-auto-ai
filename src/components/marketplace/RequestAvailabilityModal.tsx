import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FLUX_SUPPORT_WHATSAPP } from '@/config/contact';

interface RequestAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional prefill (e.g. when triggered from a sold vehicle's detail page) */
  prefill?: { make?: string; model?: string; year?: number };
}

interface FormState {
  make: string;
  model: string;
  year: string;
  budget: string;
  notes: string;
  buyerName: string;
  buyerPhone: string;
}

interface FormErrors {
  make?: string;
  model?: string;
  year?: string;
  buyerName?: string;
  buyerPhone?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

export function RequestAvailabilityModal({
  open,
  onOpenChange,
  prefill,
}: RequestAvailabilityModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>({
    make: '',
    model: '',
    year: '',
    budget: '',
    notes: '',
    buyerName: '',
    buyerPhone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Prefill from props + logged-in profile when the modal opens
  useEffect(() => {
    if (!open) return;
    setForm(prev => ({
      ...prev,
      make: prefill?.make || prev.make,
      model: prefill?.model || prev.model,
      year: prefill?.year ? String(prefill.year) : prev.year,
    }));
    setErrors({});

    if (user) {
      (async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, phone_number')
            .eq('id', user.id)
            .single();
          if (data) {
            setForm(prev => ({
              ...prev,
              buyerName: prev.buyerName || data.full_name || '',
              buyerPhone: prev.buyerPhone || data.phone_number || '',
            }));
          }
        } catch {
          /* silent */
        }
      })();
    }
  }, [open, user, prefill?.make, prefill?.model, prefill?.year]);

  const update = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.make.trim()) next.make = 'Required';
    if (!form.model.trim()) next.model = 'Required';
    const yr = parseInt(form.year, 10);
    if (!form.year || Number.isNaN(yr) || yr < 1990 || yr > CURRENT_YEAR + 1) {
      next.year = `Enter a year between 1990 and ${CURRENT_YEAR + 1}`;
    }
    if (!form.buyerName.trim()) next.buyerName = 'Required';
    if (!form.buyerPhone.trim() || form.buyerPhone.replace(/\D/g, '').length < 7) {
      next.buyerPhone = 'Enter a valid phone number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const lines = [
      'Hi Flux, I would like to request availability for a vehicle:',
      '',
      `• Make: ${form.make.trim()}`,
      `• Model: ${form.model.trim()}`,
      `• Year: ${form.year.trim()}`,
    ];
    if (form.budget.trim()) lines.push(`• Max budget: KES ${form.budget.trim()}`);
    if (form.notes.trim()) lines.push(`• Notes: ${form.notes.trim()}`);
    lines.push('');
    lines.push(`Name: ${form.buyerName.trim()}`);
    lines.push(`Phone: ${form.buyerPhone.trim()}`);

    const message = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${FLUX_SUPPORT_WHATSAPP}?text=${message}`, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Availability</DialogTitle>
          <DialogDescription>
            Tell us what you're looking for and our dealers will source it for you. Your details
            will open in WhatsApp so you can send them with one tap.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ra-make">Make *</Label>
              <Input
                id="ra-make"
                value={form.make}
                onChange={update('make')}
                placeholder="e.g. Toyota"
                aria-invalid={!!errors.make}
              />
              {errors.make && <p className="text-xs text-destructive">{errors.make}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ra-model">Model *</Label>
              <Input
                id="ra-model"
                value={form.model}
                onChange={update('model')}
                placeholder="e.g. Land Cruiser"
                aria-invalid={!!errors.model}
              />
              {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ra-year">Year *</Label>
              <Input
                id="ra-year"
                type="number"
                inputMode="numeric"
                min={1990}
                max={CURRENT_YEAR + 1}
                value={form.year}
                onChange={update('year')}
                placeholder={String(CURRENT_YEAR)}
                aria-invalid={!!errors.year}
              />
              {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ra-budget">Max budget (KES)</Label>
              <Input
                id="ra-budget"
                type="number"
                inputMode="numeric"
                value={form.budget}
                onChange={update('budget')}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ra-notes">Notes</Label>
            <Textarea
              id="ra-notes"
              value={form.notes}
              onChange={update('notes')}
              placeholder="Trim, color, mileage, anything else..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
            <div className="space-y-1.5">
              <Label htmlFor="ra-name">Your name *</Label>
              <Input
                id="ra-name"
                value={form.buyerName}
                onChange={update('buyerName')}
                placeholder="Full name"
                aria-invalid={!!errors.buyerName}
              />
              {errors.buyerName && (
                <p className="text-xs text-destructive">{errors.buyerName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ra-phone">Your phone *</Label>
              <Input
                id="ra-phone"
                type="tel"
                inputMode="tel"
                value={form.buyerPhone}
                onChange={update('buyerPhone')}
                placeholder="07XX XXX XXX"
                aria-invalid={!!errors.buyerPhone}
              />
              {errors.buyerPhone && (
                <p className="text-xs text-destructive">{errors.buyerPhone}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Send via WhatsApp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
