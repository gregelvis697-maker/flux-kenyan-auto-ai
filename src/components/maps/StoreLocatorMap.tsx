import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import type { Coordinates } from '@/utils/distanceUtils';

// Fix default icon paths under Vite
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

function coloredIcon(color: 'red' | 'blue' | 'gold'): L.Icon {
  return L.icon({
    iconUrl: `${COLOR_ICON_BASE}${color}.png`,
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

export interface LocatorDealer {
  id: string;
  full_name: string | null;
  street_address: string | null;
  city: string | null;
  location_latitude: number;
  location_longitude: number;
  distance_km: number;
}

interface StoreLocatorMapProps {
  dealers: LocatorDealer[];
  selectedDealerId?: string | null;
  userLocation?: Coordinates | null;
  onDealerSelect?: (dealer: LocatorDealer) => void;
  className?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function StoreLocatorMap({
  dealers,
  selectedDealerId,
  userLocation,
  onDealerSelect,
  className,
}: StoreLocatorMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterRef = useRef<any>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { scrollWheelZoom: true }).setView(
        [-1.2832, 36.8172],
        6
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Remove previous cluster group
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
      clusterRef.current = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cluster = (L as any).markerClusterGroup({
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
    });

    dealers.forEach((d) => {
      const icon = d.id === selectedDealerId ? coloredIcon('red') : coloredIcon('blue');
      const popupHtml = `
        <div style="min-width:180px">
          <strong>${escapeHtml(d.full_name || 'Dealer')}</strong>
          <div style="margin-top:2px;color:#00A8CC;font-weight:600">${d.distance_km.toFixed(1)} km away</div>
          ${d.street_address ? `<div style="margin-top:4px">${escapeHtml(d.street_address)}</div>` : ''}
          ${d.city ? `<div style="color:#666">${escapeHtml(d.city)}</div>` : ''}
        </div>
      `;
      const marker = L.marker([d.location_latitude, d.location_longitude], { icon }).bindPopup(popupHtml);
      marker.on('click', () => onDealerSelect?.(d));
      cluster.addLayer(marker);
    });

    cluster.addTo(map);
    clusterRef.current = cluster;

    // Update user marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (userLocation) {
      userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: coloredIcon('gold'),
      })
        .bindPopup('Your location')
        .addTo(map);
    }

    // Fit bounds
    const points: L.LatLngExpression[] = dealers.map(
      (d) => [d.location_latitude, d.location_longitude] as L.LatLngExpression
    );
    if (userLocation) points.push([userLocation.latitude, userLocation.longitude]);

    if (points.length === 1) {
      const [lat, lng] = points[0] as [number, number];
      map.setView([lat, lng], 13);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points).pad(0.2));
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [dealers, selectedDealerId, userLocation, onDealerSelect]);

  // Pan to selected dealer
  useEffect(() => {
    if (!mapRef.current || !selectedDealerId) return;
    const d = dealers.find((x) => x.id === selectedDealerId);
    if (d) mapRef.current.setView([d.location_latitude, d.location_longitude], 14);
  }, [selectedDealerId, dealers]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        'rounded-lg overflow-hidden border border-border/30 h-[400px] md:h-[560px] w-full ' +
        (className || '')
      }
      aria-label="Store locator map"
    />
  );
}
