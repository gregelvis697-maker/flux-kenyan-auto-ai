/**
 * Distance utilities — Haversine + browser geolocation.
 * All distances in kilometers.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export const DistanceUtils = {
  calculateDistance(a: Coordinates, b: Coordinates): number {
    const lat1 = toRadians(a.latitude);
    const lat2 = toRadians(b.latitude);
    const dLat = toRadians(b.latitude - a.latitude);
    const dLon = toRadians(b.longitude - a.longitude);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    const distance = EARTH_RADIUS_KM * c;
    return Math.round(distance * 10) / 10;
  },

  getUserLocation(): Promise<Coordinates | null> {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => resolve(null),
        { timeout: 5000, enableHighAccuracy: false, maximumAge: 5 * 60 * 1000 }
      );
    });
  },

  formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  },
};
