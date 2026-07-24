import { supabase } from '@/lib/supabase';

export interface DealerMapLocation {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  street_address: string | null;
  city: string | null;
  phone?: string | null;
  opening_hours?: string | null;
  is_primary: boolean;
}

/**
 * Returns all public map locations for a dealer: the primary one from the
 * public_dealer_profiles view (if geocoded) + any active rows from
 * public.dealer_locations. Safe for anonymous callers.
 */
export async function getDealerAllLocations(
  dealerId: string,
  primary?: {
    full_name: string | null;
    street_address: string | null;
    city: string | null;
    location_latitude: number | null;
    location_longitude: number | null;
  } | null
): Promise<DealerMapLocation[]> {
  const locations: DealerMapLocation[] = [];

  let primaryProfile = primary;
  if (!primaryProfile) {
    const { data } = await supabase
      .from('public_dealer_profiles')
      .select('full_name, street_address, city, location_latitude, location_longitude')
      .eq('id', dealerId)
      .maybeSingle();
    primaryProfile = data ?? null;
  }

  if (
    primaryProfile &&
    typeof primaryProfile.location_latitude === 'number' &&
    typeof primaryProfile.location_longitude === 'number'
  ) {
    locations.push({
      id: `primary-${dealerId}`,
      location_name: `${primaryProfile.full_name || 'Dealer'} (Main)`,
      latitude: primaryProfile.location_latitude,
      longitude: primaryProfile.location_longitude,
      street_address: primaryProfile.street_address,
      city: primaryProfile.city,
      is_primary: true,
    });
  }

  const { data: secondary } = await supabase
    .from('dealer_locations' as any)
    .select('id, location_name, street_address, city, location_latitude, location_longitude, phone, opening_hours, is_primary')
    .eq('dealer_id', dealerId)
    .eq('is_active', true);

  if (Array.isArray(secondary)) {
    for (const loc of secondary as any[]) {
      if (typeof loc.location_latitude !== 'number' || typeof loc.location_longitude !== 'number') continue;
      locations.push({
        id: loc.id,
        location_name: loc.location_name || 'Branch',
        latitude: loc.location_latitude,
        longitude: loc.location_longitude,
        street_address: loc.street_address,
        city: loc.city,
        phone: loc.phone,
        opening_hours: loc.opening_hours,
        is_primary: !!loc.is_primary,
      });
    }
  }

  return locations;
}
