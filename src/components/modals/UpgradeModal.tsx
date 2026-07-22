import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { startSubscribeCheckout } from '@/services/paystackService';
import { formatPrice, type SubscriptionTier } from '@/lib/subscriptionTiers';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  featureDescription: string;
  requiredTier: Exclude<SubscriptionTier, 'free'>;
  currentTier: SubscriptionTier;
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  featureDescription,
  requiredTier,
  currentTier,
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await startSubscribeCheckout(requiredTier);
    } catch (err) {
      console.error('Upgrade checkout failed', err);
      toast.error('Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{feature}</h3>
            <p className="text-sm text-muted-foreground">{featureDescription}</p>
            <p className="text-xs text-muted-foreground">
              Requires the <span className="font-medium capitalize">{requiredTier}</span> plan
              {currentTier !== 'free' && <> (you are on {currentTier}).</>}
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan price</span>
              <span className="font-medium">{formatPrice(requiredTier)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing</span>
              <span className="font-medium">Monthly, auto-renew</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleUpgrade} disabled={loading} className="w-full">
              {loading ? 'Redirecting to Paystack…' : `Upgrade to ${requiredTier}`}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full">
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
