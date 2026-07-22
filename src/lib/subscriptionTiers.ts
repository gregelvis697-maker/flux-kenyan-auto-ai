export type SubscriptionTier = 'free' | 'standard' | 'premium';

export interface TierFeatures {
  basicAnalytics: boolean;
  emailSupport: boolean;
  standardBadge: boolean;
  fullEscrow?: boolean;
  priceTrends?: boolean;
  fraudAlerts?: boolean;
  standardReports?: boolean;
  verifiedBadge?: boolean;
  priorityPlacement?: boolean;
  aiMatching?: boolean;
  advancedAnalytics?: boolean;
  prioritySupport?: boolean;
  premiumBadge?: boolean;
  customReports?: boolean;
  marketIntelligence?: boolean;
  dedicatedManager?: boolean;
  priorityEscrow?: boolean;
}

export interface TierData {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: 'KES';
  billingPeriod?: 'monthly';
  listingLimit: number;
  features: TierFeatures;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierData> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'KES',
    listingLimit: 3,
    features: {
      basicAnalytics: true,
      emailSupport: true,
      standardBadge: true,
    },
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 32000,
    currency: 'KES',
    billingPeriod: 'monthly',
    listingLimit: 15,
    features: {
      basicAnalytics: true,
      emailSupport: true,
      standardBadge: true,
      fullEscrow: true,
      priceTrends: true,
      fraudAlerts: true,
      standardReports: true,
      verifiedBadge: true,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 40000,
    currency: 'KES',
    billingPeriod: 'monthly',
    listingLimit: 50,
    features: {
      basicAnalytics: true,
      emailSupport: true,
      standardBadge: true,
      fullEscrow: true,
      priceTrends: true,
      fraudAlerts: true,
      standardReports: true,
      verifiedBadge: true,
      priorityPlacement: true,
      aiMatching: true,
      advancedAnalytics: true,
      prioritySupport: true,
      premiumBadge: true,
      customReports: true,
      marketIntelligence: true,
      dedicatedManager: true,
      priorityEscrow: true,
    },
  },
};

export const getSubscriptionTier = (tier: SubscriptionTier): TierData =>
  SUBSCRIPTION_TIERS[tier] ?? SUBSCRIPTION_TIERS.free;

export const hasFeature = (
  tier: SubscriptionTier,
  feature: keyof TierFeatures,
): boolean => Boolean(getSubscriptionTier(tier).features[feature]);

export const canAddListing = (
  currentListings: number,
  tier: SubscriptionTier,
): boolean => currentListings < getSubscriptionTier(tier).listingLimit;

export const formatPrice = (tier: SubscriptionTier): string => {
  const t = getSubscriptionTier(tier);
  if (t.price === 0) return 'Free';
  return `KES ${t.price.toLocaleString()} / month`;
};
