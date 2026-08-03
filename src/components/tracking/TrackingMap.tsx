import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface TrackingMapPoint {
  label: string;
  latitude: number;
  longitude: number;
  isCurrent?: boolean;
}

interface TrackingMapProps {
  points: TrackingMapPoint[];
  className?: string;
}

export function TrackingMap({ points, className }: TrackingMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    try {
      const first = points[0];

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
          [first.latitude, first.longitude],
          4
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;

      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });

      points.forEach((p) => {
        L.marker([p.latitude, p.longitude], { icon: coloredIcon(p.isCurrent ? 'red' : 'blue') })
          .addTo(map)
          .bindPopup(`<strong>${escapeHtml(p.label)}</strong>`);
      });

      if (points.length > 1) {
        const latlngs = points.map((p) => [p.latitude, p.longitude] as L.LatLngExpression);
        L.polyline(latlngs, { color: '#00D9FF', weight: 2, opacity: 0.7, dashArray: '5, 5' }).addTo(map);
        map.fitBounds(L.latLngBounds(latlngs).pad(0.2));
      } else {
        map.setView([first.latitude, first.longitude], 6);
      }

      setTimeout(() => map.invalidateSize(), 100);
    } catch (err) {
      console.error('Tracking map error:', err);
    }
  }, [points]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (points.length === 0) {
    return (
      <div
        className={
          'flex h-[220px] flex-col items-center justify-center rounded-lg border border-border/30 bg-muted/20 text-center text-muted-foreground md:h-[280px] ' +
          (className || '')
        }
      >
        <MapPin className="mb-2 h-8 w-8 opacity-40" />
        <p className="text-sm font-medium">No mapped locations yet</p>
        <p className="text-xs">Locations appear here once updates include a place.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        'h-[220px] w-full overflow-hidden rounded-lg border border-border/30 md:h-[280px] ' + (className || '')
      }
      aria-label="Map of vehicle tracking locations"
    />
  );
}
