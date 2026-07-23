/**
 * Geocoding via free Nominatim (OpenStreetMap). No API key required.
 * ToS: max 1 req/sec, meaningful User-Agent, cache results.
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  success: boolean;
  error?: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
// Browsers block setting User-Agent, but Nominatim also accepts Referer for identification.
// We add a descriptive `email` param instead, which is an accepted identifier.
const CONTACT_EMAIL = 'support@flux.co.ke';

let lastCallAt = 0;
async function throttle() {
  const now = Date.now();
  const wait = Math.max(0, 1100 - (now - lastCallAt));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
}

export const GeocodingService = {
  formatAddress(street: string, city: string): string {
    return [street, city].map((s) => s?.trim()).filter(Boolean).join(', ');
  },

  isValidCoordinates(lat: number, lng: number): boolean {
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0)
    );
  },

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    const trimmed = address?.trim() ?? '';
    if (!trimmed) {
      return { latitude: 0, longitude: 0, displayName: '', success: false, error: 'Address cannot be empty' };
    }

    try {
      await throttle();
      const params = new URLSearchParams({
        q: trimmed,
        format: 'json',
        limit: '1',
        email: CONTACT_EMAIL,
      });

      const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return {
          latitude: 0,
          longitude: 0,
          displayName: '',
          success: false,
          error: `Geocoding service error (${response.status})`,
        };
      }

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        return {
          latitude: 0,
          longitude: 0,
          displayName: '',
          success: false,
          error: 'Address not found. Try including the neighbourhood or a well-known landmark.',
        };
      }

      const r = results[0];
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      if (!this.isValidCoordinates(lat, lng)) {
        return { latitude: 0, longitude: 0, displayName: '', success: false, error: 'Invalid coordinates returned' };
      }

      return { latitude: lat, longitude: lng, displayName: r.display_name || trimmed, success: true };
    } catch (err) {
      console.error('Geocoding error:', err);
      return {
        latitude: 0,
        longitude: 0,
        displayName: '',
        success: false,
        error: 'Geocoding service unavailable. Check your connection and try again.',
      };
    }
  },
};
