import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix Leaflet's default icon paths under Vite bundling.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface DealerLocationMapProps {
  dealerName: string;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  city?: string | null;
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

export function DealerLocationMap({
  dealerName,
  latitude,
  longitude,
  address,
  city,
  className,
}: DealerLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || latitude == null || longitude == null) return;

    try {
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView([latitude, longitude], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      } else {
        mapRef.current.setView([latitude, longitude], 15);
      }

      // Clear existing markers/circles
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          mapRef.current!.removeLayer(layer);
        }
      });

      const popupHtml = `
        <div style="min-width:160px">
          <strong>${escapeHtml(dealerName || 'Dealer')}</strong>
          ${address ? `<div style="margin-top:4px">${escapeHtml(address)}</div>` : ''}
          ${city ? `<div style="color:#666">${escapeHtml(city)}</div>` : ''}
        </div>
      `;

      L.marker([latitude, longitude]).addTo(mapRef.current).bindPopup(popupHtml).openPopup();

      L.circle([latitude, longitude], {
        color: '#00D9FF',
        fillColor: '#00D9FF',
        fillOpacity: 0.08,
        radius: 800,
      }).addTo(mapRef.current);

      // Ensure correct sizing when parent becomes visible.
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    } catch (err) {
      console.error('Map init error:', err);
    }
  }, [latitude, longitude, dealerName, address, city]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (latitude == null || longitude == null) {
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
    <div
      ref={containerRef}
      className={'rounded-lg overflow-hidden border border-border/30 h-[250px] md:h-[300px] w-full ' + (className || '')}
      aria-label={`Map showing ${dealerName} location`}
    />
  );
}
