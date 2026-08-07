'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

type Props = {
  routeName?: string;
  routeDescription?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  className?: string;
};

export default function LeafletMap({ routeName = 'Rute Gowes', routeDescription = '', className = 'w-full h-full' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const getRouteDetails = (nama: string, deskripsi: string) => {
    const lower = (nama + ' ' + deskripsi).toLowerCase();

    // Check if custom GPS pin coordinates are present e.g. "Lat: -6.9003, Lng: 107.6186"
    const gpsMatch = deskripsi.match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/i);
    if (gpsMatch) {
      const parsedLat = parseFloat(gpsMatch[1]);
      const parsedLng = parseFloat(gpsMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return {
          center: [parsedLat, parsedLng] as [number, number],
          zoom: 13,
          start: [parsedLat, parsedLng] as [number, number],
          finish: [parsedLat - 0.05, parsedLng + 0.05] as [number, number],
          startName: 'Titik Start GPS Presisi',
          path: [
            [parsedLat, parsedLng],
            [parsedLat - 0.02, parsedLng + 0.02],
            [parsedLat - 0.05, parsedLng + 0.05],
          ] as [number, number][],
        };
      }
    }

    // Extract custom start location name if present
    let startLocationLabel = 'Gedung Sate (Jl. Diponegoro, Bandung)';
    const startMatch = deskripsi.match(/📍 Titik Start: (.*?)\n/);
    if (startMatch && startMatch[1]) {
      startLocationLabel = startMatch[1];
    }

    // 1. Gedung Sate / Diponegoro / Bandung / Lembang / Tangkuban Perahu
    if (
      lower.includes('gedung sate') ||
      lower.includes('diponegoro') ||
      lower.includes('lembang') ||
      lower.includes('tangkuban perahu') ||
      lower.includes('bandung')
    ) {
      return {
        center: [-6.8300, 107.6150] as [number, number],
        zoom: 12,
        start: [-6.9024, 107.6187] as [number, number], // Gedung Sate Main Building (Jl. Diponegoro)
        finish: [-6.7600, 107.6100] as [number, number], // Tangkuban Perahu Peak
        startName: startLocationLabel,
        path: [
          [-6.9024, 107.6187], // Gedung Sate (Start)
          [-6.8650, 107.6150], // Setiabudi / Ledeng
          [-6.8150, 107.6170], // Alun-Alun Lembang
          [-6.7600, 107.6100], // Tangkuban Perahu (Finish)
        ] as [number, number][],
      };
    }

    // 2. Kebayoran / BSD / Bintaro / Tangerang / Line Pipe / Jakarta
    if (
      lower.includes('bsd') ||
      lower.includes('kebayoran') ||
      lower.includes('bintaro') ||
      lower.includes('line pipe') ||
      lower.includes('tangerang') ||
      lower.includes('jakarta')
    ) {
      return {
        center: [-6.2750, 106.7200] as [number, number],
        zoom: 12,
        start: [-6.2443, 106.7844] as [number, number], // Kebayoran
        finish: [-6.3015, 106.6534] as [number, number], // BSD Line Pipe
        startName: 'Kebayoran Baru (Start)',
        path: [
          [-6.2443, 106.7844], // Kebayoran Baru
          [-6.2700, 106.7400], // Bintaro Loop
          [-6.2850, 106.7000], // Serpong Utama
          [-6.3015, 106.6534], // BSD Pipe Line
        ] as [number, number][],
      };
    }

    // 3. Tasikmalaya - Ciamis - Banjar - Padaherang - Pangandaran
    if (
      lower.includes('pangandaran') ||
      lower.includes('tasik') ||
      lower.includes('ciamis') ||
      lower.includes('padaherang') ||
      lower.includes('banjar')
    ) {
      return {
        center: [-7.4500, 108.5500] as [number, number],
        zoom: 10,
        start: [-7.3274, 108.3549] as [number, number], // Ciamis
        finish: [-7.6322, 108.6534] as [number, number], // Pangandaran Beach
        startName: 'Ciamis / Tasikmalaya (Start)',
        path: [
          [-7.3274, 108.3549], // Ciamis
          [-7.3712, 108.5361], // Banjar
          [-7.4725, 108.6015], // Padaherang
          [-7.5500, 108.6300], // Kalipucang
          [-7.6322, 108.6534], // Pangandaran Beach
        ] as [number, number][],
      };
    }

    // 4. Bukit Pelangi / Sentul / Bogor / Puncak
    if (
      lower.includes('bukit pelangi') ||
      lower.includes('bogor') ||
      lower.includes('sentul') ||
      lower.includes('puncak')
    ) {
      return {
        center: [-6.6100, 106.8650] as [number, number],
        zoom: 12,
        start: [-6.5892, 106.8400] as [number, number],
        finish: [-6.6415, 106.8920] as [number, number],
        startName: 'Sentul City (Start)',
        path: [
          [-6.5892, 106.8400],
          [-6.6050, 106.8550],
          [-6.6220, 106.8750],
          [-6.6415, 106.8920],
        ] as [number, number][],
      };
    }

    // 5. KM0 Jalur Hijau
    if (lower.includes('km0') || lower.includes('hijau')) {
      return {
        center: [-6.6250, 106.8900] as [number, number],
        zoom: 13,
        start: [-6.6150, 106.8700] as [number, number],
        finish: [-6.6350, 106.9100] as [number, number],
        startName: 'Pos KM 0 Jalur Hijau',
        path: [
          [-6.6150, 106.8700],
          [-6.6250, 106.8900],
          [-6.6350, 106.9100],
        ] as [number, number][],
      };
    }

    // Default: Gedung Sate / Bandung Loop
    return {
      center: [-6.8300, 107.6150] as [number, number],
      zoom: 12,
      start: [-6.9003, 107.6186] as [number, number], // Gedung Sate
      finish: [-6.8200, 107.6500] as [number, number],
      startName: 'Gedung Sate (Jl. Diponegoro, Bandung)',
      path: [
        [-6.9003, 107.6186],
        [-6.8650, 107.6250],
        [-6.8400, 107.6400],
        [-6.8200, 107.6500],
      ] as [number, number][],
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;
    const routeDetails = getRouteDetails(routeName, routeDescription);

    import('leaflet').then((L) => {
      if (!isMounted || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current).setView(routeDetails.center, routeDetails.zoom);

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

      // Start Marker Icon (Amber Pin)
      const startIcon = L.divIcon({
        className: 'custom-leaflet-marker-start',
        html: `<div style="background-color: #F59E0B; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #111111; box-shadow: 0 0 12px rgba(245, 158, 11, 0.9);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      // Finish Marker Icon (Green Pin)
      const finishIcon = L.divIcon({
        className: 'custom-leaflet-marker-finish',
        html: `<div style="background-color: #22C55E; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #111111; box-shadow: 0 0 12px rgba(34, 197, 94, 0.9);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      // Draw route polyline
      const polyline = L.polyline(routeDetails.path, {
        color: '#F59E0B',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Add Start & Finish Markers
      L.marker(routeDetails.start, { icon: startIcon })
        .addTo(map)
        .bindPopup(`<b>Titik Kumpul / Start</b><br/>${routeDetails.startName || routeName}`)
        .openPopup();

      L.marker(routeDetails.finish, { icon: finishIcon })
        .addTo(map)
        .bindPopup(`<b>Titik Finish</b><br/>${routeName}`);

      // Fit map view to polyline bounds
      map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routeName, routeDescription]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden border border-[#333333]">
      <div ref={mapRef} className="w-full h-full min-h-[350px] z-0" />
      <div className="absolute bottom-2 left-2 z-10 bg-[#111111]/90 border border-[#333333] px-3 py-1.5 rounded-lg text-xs font-mono text-amber-400">
        OpenStreetMap • {routeName}
      </div>
    </div>
  );
}
