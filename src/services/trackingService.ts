import { GeocodingService } from '@/services/geocodingService';
import { TRACKING_STAGES, TrackingStage, getStageIndex } from '@/lib/trackingStages';

export interface TrackingUpdateInput {
  stage: TrackingStage | string;
  location_text: string;
  notes?: string;
  status?: 'completed' | 'in_progress' | 'delayed';
  estimated_next_arrival?: string | null;
}

export class TrackingService {
  /** Generate a unique-ish token for public sharing. */
  static generateTrackingToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /** ETA = current stage date + remaining stage estimates. */
  static calculateETA(currentStage: string, currentStageDate: Date): Date {
    const stageIndex = Math.max(0, getStageIndex(currentStage));
    let totalDays = 0;
    for (let i = stageIndex; i < TRACKING_STAGES.length; i++) {
      totalDays += TRACKING_STAGES[i].estimatedDays;
    }
    const eta = new Date(currentStageDate);
    eta.setDate(eta.getDate() + totalDays);
    return eta;
  }

  static daysUntilDelivery(etaDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eta = new Date(etaDate);
    eta.setHours(0, 0, 0, 0);
    return Math.ceil((eta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  static formatETA(etaDate: Date, daysUntil?: number): string {
    if (!etaDate || Number.isNaN(etaDate.getTime())) return 'To be confirmed';
    const days = daysUntil ?? TrackingService.daysUntilDelivery(etaDate);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `In ${days} days`;
    const date = etaDate.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
    return `${date} (${days} days)`;
  }

  static async geocodeTrackingLocation(locationText: string) {
    if (!locationText?.trim()) return null;
    try {
      const result = await GeocodingService.geocodeAddress(locationText);
      if (result.success) {
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          geocoded_at: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error('Tracking geocode failed:', err);
    }
    return null;
  }

  static getTrackingProgress(currentStage: string): number {
    const idx = getStageIndex(currentStage);
    if (idx < 0) return 0;
    return Math.round(((idx + 1) / TRACKING_STAGES.length) * 100);
  }

  static getNextStage(currentStage: string): TrackingStage | null {
    const idx = getStageIndex(currentStage);
    if (idx >= 0 && idx < TRACKING_STAGES.length - 1) {
      return TRACKING_STAGES[idx + 1].id;
    }
    return null;
  }
}
