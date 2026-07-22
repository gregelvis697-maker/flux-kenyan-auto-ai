import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { startSubscribeCheckout } from '@/services/paystackService';
import { SUBSCRIPTION_TIERS, formatPrice, type SubscriptionTier } from '@/lib/subscriptionTiers';
import type { SubscriptionState } from '@/hooks/useSubscription';

interface Props {
  subscription: SubscriptionState;
}

export function SubscriptionCard({ subscription }: Props) {
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const { tier, status, expiresAt, limit, listingCount } = subscription;

  const currentTier = SUBSCRIPTION_TIERS[tier];
  const isFree = tier === 'free';
  const isActive = status === 'active';
  const isPastDue = status === 'past_due';

  const usagePct = Math.min((listingCount / Math.max(limit, 1)) * 100, 100);
  const usageColor = usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-yellow-500' : 'bg-emerald-500';

  const upgrade = async (target: SubscriptionTier) => {
    setLoading(target);
    try {
      await startSubscribeCheckout(target);
    } catch (err) {
      console.error(err);
      toast.error('Could not start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-lg">Your subscription</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Manage your plan and billing</p>
          </div>
          <Badge variant={isFree ? 'secondary' : 'default'} className="capitalize">
            {tier === 'premium' && <Crown className="h-3 w-3 mr-1" />}
            {currentTier.name} plan
          </Badge>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Listings used</span>
              <span className="font-medium">
                {listingCount} / {limit}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${usageColor}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            {listingCount >= limit && (
              <p className="text-xs text-yellow-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                You've reached your listing limit. Upgrade to add more vehicles.
              </p>
            )}
          </div>

          {/* Status */}
          {isActive && expiresAt && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active — renews on {new Date(expiresAt).toLocaleDateString()}
            </div>
          )}
          {isPastDue && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Payment failed. Update your card to keep your subscription active.
            </div>
          )}

          {/* Actions */}
          <div className="grid gap-2">
            {isFree && (
              <>
                <Button
                  onClick={() => upgrade('standard')}
                  disabled={loading !== null}
                  className="w-full"
                >
                  {loading === 'standard' ? 'Redirecting…' : `Upgrade to Standard — ${formatPrice('standard')}`}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => upgrade('premium')}
                  disabled={loading !== null}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {loading === 'premium' ? 'Redirecting…' : `Upgrade to Premium — ${formatPrice('premium')}`}
                </Button>
              </>
            )}

            {tier === 'standard' && (
              <Button
                onClick={() => upgrade('premium')}
                disabled={loading !== null}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {loading === 'premium' ? 'Redirecting…' : `Upgrade to Premium — ${formatPrice('premium')}`}
              </Button>
            )}

            {tier === 'premium' && (
              <div className="text-center text-sm text-muted-foreground py-2">
                You're on our highest plan. 🎉
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <Card className="bg-card/60 backdrop-blur-lg border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Plan details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {(['free', 'standard', 'premium'] as SubscriptionTier[]).map((t) => {
            const data = SUBSCRIPTION_TIERS[t];
            const isCurrent = t === tier;
            return (
              <div
                key={t}
                className={`rounded-lg border p-3 text-sm ${
                  isCurrent ? 'border-primary/60 bg-primary/5' : 'border-border/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{data.name}</span>
                  {isCurrent && <Badge variant="outline">Current</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{formatPrice(t)}</div>
                <div className="text-xs mt-2">{data.listingLimit} listings</div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
