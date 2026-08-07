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

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    // 1. Dynamic Extraction of Titik Start & Finish Location Names
    let startQuery = routeName.replace(/^[\d.\s]+/, '').replace(/\(.*?\)/g, '').trim();
    let finishQuery = '';

    const startMatch = routeDescription.match(/📍 Titik Start: (.*?)\n/);
    if (startMatch && startMatch[1] && startMatch[1].trim().length > 0) {
      startQuery = startMatch[1].trim();
    }

    const finishMatch = routeDescription.match(/🏁 Titik Finish: (.*?)\n/);
    if (finishMatch && finishMatch[1] && finishMatch[1].trim().length > 0) {
      finishQuery = finishMatch[1].trim();
    }

    // Function to render Leaflet map with Start & Finish markers + OSRM Biking Route
    const renderMapWithCoords = (
      startLat: number,
      startLng: number,
      startLabel: string,
      finishLat?: number,
      finishLng?: number,
      finishLabel?: string
    ) => {
      import('leaflet').then((L) => {
        if (!isMounted || !mapRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapRef.current).setView([startLat, startLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 250);

        // Start Marker Icon (Amber Pin)
        const startIcon = L.divIcon({
          className: 'custom-leaflet-marker-start',
          html: `<div style="background-color: #F59E0B; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #111111; box-shadow: 0 0 14px rgba(245, 158, 11, 0.9);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        // Add Start Marker
        L.marker([startLat, startLng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`<b>Titik Start (Awal)</b><br/>${startLabel}`)
          .openPopup();

        // If Finish location exists, fetch real OSRM Bicycle Routing path along real roads!
        if (finishLat && finishLng) {
          const finishIcon = L.divIcon({
            className: 'custom-leaflet-marker-finish',
            html: `<div style="background-color: #22C55E; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #111111; box-shadow: 0 0 14px rgba(34, 197, 94, 0.9);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([finishLat, finishLng], { icon: finishIcon })
            .addTo(map)
            .bindPopup(`<b>Titik Tujuan (Finish)</b><br/>${finishLabel || 'Tujuan Gowes'}`);

          // Query OSRM Biking API for turn-by-turn bicycle navigation path
          const osrmUrl = `https://router.project-osrm.org/route/v1/biking/${startLng},${startLat};${finishLng},${finishLat}?overview=full&geometries=geojson`;

          fetch(osrmUrl)
            .then((res) => res.json())
            .then((osrmData) => {
              if (!isMounted) return;

              let routeCoords: [number, number][] = [
                [startLat, startLng],
                [(startLat + finishLat) / 2 + 0.005, (startLng + finishLng) / 2 + 0.005],
                [finishLat, finishLng],
              ];

              if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
                const geoCoords = osrmData.routes[0].geometry.coordinates;
                routeCoords = geoCoords.map(([lon, lat]: [number, number]) => [lat, lon]);
              }

              const routePolyline = L.polyline(routeCoords, {
                color: '#F59E0B',
                weight: 6,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }).addTo(map);

              map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
            })
            .catch((err) => {
              console.error('OSRM Biking Route error:', err);
              // Fallback simple polyline if OSRM is unreachable
              const routePolyline = L.polyline(
                [
                  [startLat, startLng],
                  [finishLat, finishLng],
                ],
                { color: '#F59E0B', weight: 6, opacity: 0.9 }
              ).addTo(map);
              map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
            });
        }

        mapInstanceRef.current = map;
      });
    };

    // Geocode both Start and Finish using Nominatim API
    const fetchStart = fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startQuery)}`)
      .then((res) => res.json())
      .catch(() => []);

    const fetchFinish = finishQuery
      ? fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finishQuery)}`)
          .then((res) => res.json())
          .catch(() => [])
      : Promise.resolve([]);

    Promise.all([fetchStart, fetchFinish]).then(([startGeo, finishGeo]) => {
      if (!isMounted) return;

      let startLat = -6.9024;
      let startLng = 107.6187;

      if (startGeo && startGeo.length > 0) {
        startLat = parseFloat(startGeo[0].lat);
        startLng = parseFloat(startGeo[0].lon);
      }

      let finishLat: number | undefined = undefined;
      let finishLng: number | undefined = undefined;

      if (finishGeo && finishGeo.length > 0) {
        finishLat = parseFloat(finishGeo[0].lat);
        finishLng = parseFloat(finishGeo[0].lon);
      } else {
        // Fallback default finish offset if no explicit finish location was entered
        const lowerName = (routeName + ' ' + routeDescription).toLowerCase();
        if (lowerName.includes('lembang') || lowerName.includes('teh') || lowerName.includes('bandung')) {
          finishLat = -6.7600;
          finishLng = 107.6100; // Tangkuban Perahu / Lembang Peak
          finishQuery = 'Tangkuban Perahu / Lembang';
        } else if (lowerName.includes('bsd') || lowerName.includes('kebayoran')) {
          finishLat = -6.3015;
          finishLng = 106.6534; // BSD Line Pipe
          finishQuery = 'BSD City (Line Pipe)';
        } else if (lowerName.includes('pangandaran') || lowerName.includes('tasik')) {
          finishLat = -7.6322;
          finishLng = 108.6534; // Pangandaran Beach
          finishQuery = 'Pantai Pangandaran';
        } else if (lowerName.includes('sentul') || lowerName.includes('pelangi') || lowerName.includes('bogor')) {
          finishLat = -6.6415;
          finishLng = 106.8920; // Bukit Pelangi
          finishQuery = 'Bukit Pelangi Sentul';
        } else {
          // Default offset relative to start position
          finishLat = startLat - 0.08;
          finishLng = startLng + 0.06;
          finishQuery = 'Tujuan Rute Gowes';
        }
      }

      renderMapWithCoords(startLat, startLng, startQuery, finishLat, finishLng, finishQuery);
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
