/**
 * Shared display helpers for vehicle pricing & availability.
 * Use these EVERYWHERE a vehicle is rendered (cards, detail pages, modals)
 * so behavior stays consistent across the marketplace.
 */

export type Availability = 'available' | 'in_transit' | 'reserved' | 'sold';

export interface VehicleDisplayInput {
  price?: number | null;
  price_on_request?: boolean | null;
  availability_status?: string | null;
  is_sold?: boolean | null;
}

/**
 * A vehicle is "Call for Price" when the dealer explicitly opted in,
 * OR when the price is missing / zero / negative.
 */
export function isCallForPrice(v: VehicleDisplayInput): boolean {
  if (v.price_on_request === true) return true;
  const p = v.price;
  return p === null || p === undefined || Number(p) <= 0;
}

/**
 * Resolve the canonical availability state. `is_sold` always wins.
 * RESERVED only shows when explicitly set on `availability_status`.
 * Anything unrecognized falls back to 'available'.
 */
export function getAvailability(v: VehicleDisplayInput): Availability {
  if (v.is_sold === true) return 'sold';
  const s = (v.availability_status || '').toLowerCase().trim();
  if (s === 'sold') return 'sold';
  if (s === 'in_transit') return 'in_transit';
  if (s === 'reserved') return 'reserved';
  // 'available', null, '', or unknown -> available
  return 'available';
}

export interface StatusStyle {
  label: string;
  className: string;
}

export const statusStyles: Record<Availability, StatusStyle> = {
  available: { label: 'AVAILABLE', className: 'bg-emerald-500/95 text-white border-emerald-400' },
  in_transit: { label: 'IN TRANSIT', className: 'bg-amber-500/95 text-white border-amber-400' },
  reserved: { label: 'RESERVED', className: 'bg-slate-500/95 text-white border-slate-400' },
  sold: { label: 'SOLD', className: 'bg-rose-600/95 text-white border-rose-500' },
};

/**
 * Tooltip copy for the "Call for Price" badge — kept here so wording stays
 * identical wherever the badge renders (cards, detail page, modals, saved tab).
 */
export const CALL_FOR_PRICE_TOOLTIP =
  "Pricing isn't listed publicly — the dealer prefers to discuss the final number directly. Tap to contact them on WhatsApp.";

export function formatPriceDisplay(v: VehicleDisplayInput): string {
  if (isCallForPrice(v)) return 'Call for Price';
  return `KES ${Number(v.price).toLocaleString()}`;
}
