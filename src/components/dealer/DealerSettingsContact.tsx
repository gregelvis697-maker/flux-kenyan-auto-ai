import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Phone, Mail, MessageCircle } from 'lucide-react';
import { ContactUtils } from '@/utils/contactUtils';

interface ContactForm {
  whatsapp_number: string;
  phone_number: string;
  email_public: string;
  show_whatsapp: boolean;
  show_phone: boolean;
  show_email: boolean;
}

const EMPTY: ContactForm = {
  whatsapp_number: '',
  phone_number: '',
  email_public: '',
  show_whatsapp: true,
  show_phone: true,
  show_email: true,
};

export function DealerSettingsContact({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('whatsapp_number, phone_number, email_public, show_whatsapp, show_phone, show_email')
          .eq('id', userId)
          .maybeSingle();
        if (cancelled) return;
        if (error) throw error;
        if (data) {
          setForm({
            whatsapp_number: data.whatsapp_number || '',
            phone_number: data.phone_number || '',
            email_public: data.email_public || '',
            show_whatsapp: data.show_whatsapp ?? true,
            show_phone: data.show_phone ?? true,
            show_email: data.show_email ?? true,
          });
        }
      } catch (err) {
        console.error('Load contact settings error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const update = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '', contact: '' }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.whatsapp_number && !ContactUtils.isValidPhoneNumber(form.whatsapp_number)) {
      next.whatsapp_number = 'Invalid phone number format';
    }
    if (form.phone_number && !ContactUtils.isValidPhoneNumber(form.phone_number)) {
      next.phone_number = 'Invalid phone number format';
    }
    if (form.email_public && !ContactUtils.isValidEmail(form.email_public)) {
      next.email_public = 'Invalid email format';
    }
    if (!form.whatsapp_number && !form.phone_number && !form.email_public) {
      next.contact = 'Please add at least one contact method';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          whatsapp_number: form.whatsapp_number.trim() || null,
          phone_number: form.phone_number.trim() || null,
          email_public: form.email_public.trim() || null,
          show_whatsapp: form.show_whatsapp,
          show_phone: form.show_phone,
          show_email: form.show_email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) throw error;
      toast({
        title: '📞 Contact information updated',
        description: 'Buyers can now reach you through your enabled channels.',
      });
    } catch (err) {
      console.error('Save contact settings error:', err);
      toast({
        title: 'Error',
        description: 'Failed to save contact information.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const activeMethods = ContactUtils.getActiveContactMethods({
    whatsappNumber: form.whatsapp_number,
    phoneNumber: form.phone_number,
    emailPublic: form.email_public,
    showWhatsapp: form.show_whatsapp,
    showPhone: form.show_phone,
    showEmail: form.show_email,
  });

  if (loading) {
    return (
      <Card className="bg-card/60 backdrop-blur-lg border-border/50">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 backdrop-blur-lg border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Phone className="h-5 w-5 text-primary" />
          Contact Information
        </CardTitle>
        <CardDescription>
          Buyers can reach you through WhatsApp, a phone call, or email. Toggle each channel to
          control what appears on your public listings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.contact && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            ⚠️ {errors.contact}
          </div>
        )}

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            WhatsApp Number
          </Label>
          <Input
            id="whatsapp"
            value={form.whatsapp_number}
            onChange={(e) => update('whatsapp_number', e.target.value)}
            placeholder="+254 700 000 000"
            className="h-11"
          />
          {errors.whatsapp_number && (
            <p className="text-xs text-destructive">{errors.whatsapp_number}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Include the country code (e.g. +254) so click-to-chat works everywhere.
          </p>
          {form.whatsapp_number && (
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="show_whatsapp"
                checked={form.show_whatsapp}
                onCheckedChange={(v) => update('show_whatsapp', v)}
              />
              <Label htmlFor="show_whatsapp" className="text-sm font-normal">
                Show on public listings
              </Label>
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number
          </Label>
          <Input
            id="phone"
            value={form.phone_number}
            onChange={(e) => update('phone_number', e.target.value)}
            placeholder="+254 700 000 000"
            className="h-11"
          />
          {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number}</p>}
          <p className="text-xs text-muted-foreground">For direct calls from buyers.</p>
          {form.phone_number && (
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="show_phone"
                checked={form.show_phone}
                onCheckedChange={(v) => update('show_phone', v)}
              />
              <Label htmlFor="show_phone" className="text-sm font-normal">
                Show on public listings
              </Label>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email_public" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Public Email Address
          </Label>
          <Input
            id="email_public"
            type="email"
            value={form.email_public}
            onChange={(e) => update('email_public', e.target.value)}
            placeholder="sales@yourdealership.co.ke"
            className="h-11"
          />
          {errors.email_public && <p className="text-xs text-destructive">{errors.email_public}</p>}
          <p className="text-xs text-muted-foreground">
            Separate from your login email — only this address is shown to buyers.
          </p>
          {form.email_public && (
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="show_email"
                checked={form.show_email}
                onCheckedChange={(v) => update('show_email', v)}
              />
              <Label htmlFor="show_email" className="text-sm font-normal">
                Show on public listings
              </Label>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-md border border-border/40 bg-muted/20 px-3 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Active contact methods</p>
          {activeMethods.length === 0 ? (
            <p className="text-xs text-muted-foreground">None yet — add at least one.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeMethods.includes('whatsapp') && <Badge variant="secondary">✓ WhatsApp</Badge>}
              {activeMethods.includes('phone') && <Badge variant="secondary">✓ Phone</Badge>}
              {activeMethods.includes('email') && <Badge variant="secondary">✓ Email</Badge>}
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Contact Information
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
