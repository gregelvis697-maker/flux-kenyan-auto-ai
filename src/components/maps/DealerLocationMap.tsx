import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation2 } from 'lucide-react';
import { DistanceUtils, type Coordinates } from '@/utils/distanceUtils';
import type { DealerMapLocation } from '@/services/dealerLocations';

// Fix Leaflet's default icon paths under Vite bundling.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const COLOR_ICON_BASE =
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-';
const SHADOW_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

function coloredIcon(color: 'red' | 'blue' | 'gold' | 'green'): L.Icon {
  return L.icon({
    iconUrl: `${COLOR_ICON_BASE}${color}.png`,
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

interface DealerLocationMapProps {
  dealerName: string;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  city?: string | null;
  className?: string;
  showDistance?: boolean;
  dealerLocations?: DealerMapLocation[];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function DealerLocationMap({
  dealerName,
  latitude,
  longitude,
  address,
  city,
  className,
  showDistance = true,
  dealerLocations,
}: DealerLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle');

  // Resolve effective list of locations to render.
  const effectiveLocations: DealerMapLocation[] =
    dealerLocations && dealerLocations.length > 0
      ? dealerLocations
      : latitude != null && longitude != null
      ? [
          {
            id: 'default',
            location_name: dealerName || 'Dealer',
            latitude,
            longitude,
            street_address: address ?? null,
            city: city ?? null,
            is_primary: true,
          },
        ]
      : [];

  const hasAnyLocation = effectiveLocations.length > 0;

  // Request user location (once per mount) if distance display is on.
  useEffect(() => {
    if (!showDistance || !hasAnyLocation) return;
    let cancelled = false;
    setLocStatus('loading');
    DistanceUtils.getUserLocation().then((loc) => {
      if (cancelled) return;
      if (loc) {
        setUserLocation(loc);
        setLocStatus('ok');
      } else {
        setLocStatus('denied');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showDistance, hasAnyLocation]);

  // Compute distance to the primary/nearest location for the chip.
  useEffect(() => {
    if (!userLocation || effectiveLocations.length === 0) {
      setDistanceKm(null);
      return;
    }
    const primary = effectiveLocations.find((l) => l.is_primary) ?? effectiveLocations[0];
    const d = DistanceUtils.calculateDistance(userLocation, {
      latitude: primary.latitude,
      longitude: primary.longitude,
    });
    setDistanceKm(d);
  }, [userLocation, effectiveLocations]);

  // Build / rebuild map layers.
  useEffect(() => {
    if (!containerRef.current || !hasAnyLocation) return;

    try {
      const first = effectiveLocations[0];

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView([first.latitude, first.longitude], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      // Clear prior markers / circles / polylines
      map.eachLayer((layer) => {
        if (
          layer instanceof L.Marker ||
          layer instanceof L.Circle ||
          layer instanceof L.Polyline
        ) {
          map.removeLayer(layer);
        }
      });

      // Add a marker per dealer location
      effectiveLocations.forEach((loc) => {
        const icon = loc.is_primary ? coloredIcon('red') : coloredIcon('blue');
        const popupHtml = `
          <div style="min-width:160px">
            <strong>${escapeHtml(loc.location_name)}</strong>
            ${loc.street_address ? `<div style="margin-top:4px">${escapeHtml(loc.street_address)}</div>` : ''}
            ${loc.city ? `<div style="color:#666">${escapeHtml(loc.city)}</div>` : ''}
            ${loc.phone ? `<div style="margin-top:4px">📞 ${escapeHtml(loc.phone)}</div>` : ''}
            ${loc.opening_hours ? `<div style="color:#666">🕒 ${escapeHtml(loc.opening_hours)}</div>` : ''}
          </div>
        `;
        L.marker([loc.latitude, loc.longitude], { icon })
          .addTo(map)
          .bindPopup(popupHtml);

        L.circle([loc.latitude, loc.longitude], {
          color: '#00D9FF',
          fillColor: '#00D9FF',
          fillOpacity: 0.06,
          radius: 800,
        }).addTo(map);
      });

      // User location marker + polyline to primary
      if (userLocation) {
        L.marker([userLocation.latitude, userLocation.longitude], {
          icon: coloredIcon('gold'),
        })
          .addTo(map)
          .bindPopup('Your location');

        const primary = effectiveLocations.find((l) => l.is_primary) ?? effectiveLocations[0];
        L.polyline(
          [
            [userLocation.latitude, userLocation.longitude],
            [primary.latitude, primary.longitude],
          ],
          { color: '#00D9FF', weight: 2, opacity: 0.7, dashArray: '5, 5' }
        ).addTo(map);
      }

      // Fit bounds when we have multiple points to show
      const points: L.LatLngExpression[] = effectiveLocations.map(
        (l) => [l.latitude, l.longitude] as L.LatLngExpression
      );
      if (userLocation) points.push([userLocation.latitude, userLocation.longitude]);

      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points).pad(0.15));
      } else {
        map.setView([first.latitude, first.longitude], 15);
      }

      // Open primary popup by default when just one point
      if (effectiveLocations.length === 1 && !userLocation) {
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) layer.openPopup();
        });
      }

      setTimeout(() => map.invalidateSize(), 100);
    } catch (err) {
      console.error('Map init error:', err);
    }
    // Recompute when locations or user location change
  }, [effectiveLocations, userLocation, hasAnyLocation]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (!hasAnyLocation) {
    return (
      <div
        className={
          'flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/20 border border-border/30 rounded-lg h-[250px] md:h-[300px] ' +
          (className || '')
        }
      >
        <MapPin className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">Location not available</p>
        <p className="text-xs mt-1">This dealer hasn't shared a mappable address yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showDistance && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {locStatus === 'loading' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-2.5 py-1 text-muted-foreground">
              <Navigation2 className="h-3 w-3 animate-pulse" />
              Getting your location…
            </span>
          )}
          {locStatus === 'ok' && distanceKm != null && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-medium text-primary">
              <Navigation2 className="h-3 w-3" />
              {DistanceUtils.formatDistance(distanceKm)} away
            </span>
          )}
          {locStatus === 'denied' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-2.5 py-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Enable location to see distance
            </span>
          )}
          {dealerLocations && dealerLocations.length > 1 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/30 px-2.5 py-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {dealerLocations.length} locations
            </span>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={'rounded-lg overflow-hidden border border-border/30 h-[250px] md:h-[300px] w-full ' + (className || '')}
        aria-label={`Map showing ${dealerName} location`}
      />
    </div>
  );
}
