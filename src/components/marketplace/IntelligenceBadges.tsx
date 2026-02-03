import { TrendingDown, TrendingUp, Flame, Shield, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getConfidenceLevel } from '@/hooks/useMarketIntelligence';

interface PricePositionBadgeProps {
  position: 'below' | 'fair' | 'above' | null;
  percentDiff?: number | null;
  size?: 'sm' | 'md';
}

export function PricePositionBadge({ position, percentDiff, size = 'sm' }: PricePositionBadgeProps) {
  if (!position) return null;
  
  const config = {
    below: {
      label: 'Below Market',
      icon: TrendingDown,
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    fair: {
      label: 'Fair Price',
      icon: CheckCircle2,
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    above: {
      label: 'Above Market',
      icon: TrendingUp,
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
  };
  
  const { label, icon: Icon, className } = config[position];
  const displayLabel = percentDiff !== null && percentDiff !== undefined 
    ? `${Math.abs(percentDiff)}% ${position === 'below' ? 'Below' : position === 'above' ? 'Above' : 'Fair'}`
    : label;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 font-medium border',
        className,
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {displayLabel}
    </Badge>
  );
}

interface DemandBadgeProps {
  level: 'high' | 'moderate' | 'low' | null;
  size?: 'sm' | 'md';
}

export function DemandBadge({ level, size = 'sm' }: DemandBadgeProps) {
  if (!level || level === 'low') return null;
  
  const config = {
    high: {
      label: 'High Demand',
      icon: Flame,
      className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    moderate: {
      label: 'In Demand',
      icon: TrendingUp,
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    low: null,
  };
  
  const badgeConfig = config[level];
  if (!badgeConfig) return null;
  
  const { label, icon: Icon, className } = badgeConfig;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'gap-1 font-medium border',
        className,
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </Badge>
  );
}

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md';
}

export function VerifiedBadge({ isVerified, size = 'sm' }: VerifiedBadgeProps) {
  if (!isVerified) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              'gap-1 font-medium border bg-green-500/20 text-green-400 border-green-500/30',
              size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
            )}
          >
            <Shield className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
            FLUX Verified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This vehicle has been verified by FLUX</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface TrustIndicatorProps {
  fulfillmentRate: number | null | undefined;
  size?: 'sm' | 'md';
}

export function TrustIndicator({ fulfillmentRate, size = 'sm' }: TrustIndicatorProps) {
  if (fulfillmentRate === null || fulfillmentRate === undefined) return null;
  
  const getColor = () => {
    if (fulfillmentRate >= 90) return 'text-green-400';
    if (fulfillmentRate >= 70) return 'text-yellow-400';
    return 'text-muted-foreground';
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('text-xs font-medium', getColor(), size === 'sm' ? 'text-[10px]' : 'text-xs')}>
            {fulfillmentRate}% trust
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Dealer fulfillment rate: {fulfillmentRate}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface RiskIndicatorProps {
  riskScore: number | null | undefined;
  size?: 'sm' | 'md';
}

export function RiskIndicator({ riskScore, size = 'sm' }: RiskIndicatorProps) {
  if (riskScore === null || riskScore === undefined || riskScore === 0) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              'gap-1 font-medium border bg-red-500/10 text-red-400 border-red-500/20',
              size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
            )}
          >
            <AlertTriangle className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
            {riskScore} {riskScore === 1 ? 'flag' : 'flags'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>This listing has {riskScore} risk {riskScore === 1 ? 'indicator' : 'indicators'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ConfidenceScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConfidenceScoreBadge({ score, size = 'sm', showLabel = false }: ConfidenceScoreBadgeProps) {
  const level = getConfidenceLevel(score);
  
  const config = {
    excellent: {
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      label: 'Excellent',
    },
    good: {
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      label: 'Good',
    },
    fair: {
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      label: 'Fair',
    },
    low: {
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
      label: 'Low',
    },
  };
  
  const { className, label } = config[level];
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              'gap-1 font-medium border',
              className,
              sizeClasses[size]
            )}
          >
            <Star className={cn(
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4',
              'fill-current'
            )} />
            {score}
            {showLabel && ` - ${label}`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Confidence Score: {score}/100 ({label})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface LargeConfidenceScoreProps {
  score: number;
}

export function LargeConfidenceScore({ score }: LargeConfidenceScoreProps) {
  const level = getConfidenceLevel(score);
  
  const config = {
    excellent: {
      ringColor: 'stroke-emerald-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      label: 'Excellent',
    },
    good: {
      ringColor: 'stroke-blue-500',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      label: 'Good',
    },
    fair: {
      ringColor: 'stroke-amber-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      label: 'Fair',
    },
    low: {
      ringColor: 'stroke-red-500',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      label: 'Low',
    },
  };
  
  const { ringColor, textColor, bgColor, label } = config[level];
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className={cn('flex items-center gap-4 p-4 rounded-xl', bgColor)}>
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            className="stroke-muted/30"
            strokeWidth="8"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className={cn('transition-all duration-500', ringColor)}
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-2xl font-bold', textColor)}>{score}</span>
        </div>
      </div>
      <div>
        <p className={cn('text-lg font-semibold', textColor)}>{label}</p>
        <p className="text-sm text-muted-foreground">Confidence Score</p>
      </div>
    </div>
  );
}
