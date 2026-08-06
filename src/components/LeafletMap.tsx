'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  routeName?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  className?: string;
};

export default function LeafletMap({ routeName = 'Rute Gowes', lat = -6.8915, lng = 107.6107, zoom = 12, className = 'w-full h-full' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import leaflet to avoid SSR window errors
    import('leaflet').then((L) => {
      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current!).setView([lat, lng], zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #EA9B28; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #141415; box-shadow: 0 0 10px rgba(234, 155, 40, 0.8);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      // Sample route coordinates path around lat/lng
      const routeCoordinates: [number, number][] = [
        [lat, lng],
        [lat + 0.015, lng + 0.02],
        [lat + 0.03, lng + 0.015],
        [lat + 0.04, lng - 0.01],
        [lat + 0.02, lng - 0.025],
        [lat, lng],
      ];

      // Draw route polyline
      L.polyline(routeCoordinates, {
        color: '#EA9B28',
        weight: 5,
        opacity: 0.85,
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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, zoom, routeName]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-[#42403B]">
      <div ref={mapRef} className="w-full h-full z-0" />
      <div className="absolute bottom-2 left-2 z-10 bg-[#141415]/90 border border-[#42403B] px-3 py-1.5 rounded-lg text-xs font-mono text-[#F7C56A]">
        OpenStreetMap • {routeName}
      </div>
    </div>
  );
}
