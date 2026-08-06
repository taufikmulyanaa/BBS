'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

type Props = {
  routeName?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  className?: string;
};

export default function LeafletMap({ routeName = 'Rute Gowes', lat = -7.3274, lng = 108.3549, zoom = 11, className = 'w-full h-full' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current).setView([lat, lng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Force Leaflet to recalculate container bounds once modal opens
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #F59E0B; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #111111; box-shadow: 0 0 12px rgba(245, 158, 11, 0.9);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      // Route coordinates path
      const routeCoordinates: [number, number][] = [
        [lat, lng],
        [lat - 0.05, lng + 0.06],
        [lat - 0.1, lng + 0.12],
        [lat - 0.18, lng + 0.18],
        [lat - 0.25, lng + 0.22],
      ];

      // Draw route polyline
      L.polyline(routeCoordinates, {
        color: '#F59E0B',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Add Start Marker
      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>Titik Kumpul / Start</b><br/>${routeName}`)
        .openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom, routeName]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden border border-[#333333]">
      <div ref={mapRef} className="w-full h-full min-h-[350px] z-0" />
      <div className="absolute bottom-2 left-2 z-10 bg-[#111111]/90 border border-[#333333] px-3 py-1.5 rounded-lg text-xs font-mono text-amber-400">
        OpenStreetMap • {routeName}
      </div>
    </div>
  );
}
