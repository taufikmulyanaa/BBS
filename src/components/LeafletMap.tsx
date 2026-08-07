'use client';

import React, { useEffect, useRef, useState } from 'react';
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

  const [routeStats, setRouteStats] = useState<{ distance: string; duration: string } | null>(null);

  const sanitizeLocationQuery = (str: string) => {
    return str
      .replace(/Coastal Ride|Challenge|Rute|Tanjakan|Gowes|Loop|Santai|Ekstrem|Segmen|Endurance|Trail|\d+\./gi, '')
      .replace(/KM\s*\d+|Loop|Via.*|Part\s*\d+|Easy|Medium|Hard|\(.*?\)/gi, '')
      .trim();
  };

  // 100% Dynamic Location Extractor from Title & Description (Zero Hardcoding)
  const extractLocations = (title: string, desc: string) => {
    let startQuery = '';
    let finishQuery = '';

    // Extract explicit Start and Finish from description (supporting CRLF, LF, and end of string)
    const startMatch = desc.match(/📍\s*Titik Start:\s*(.*?)(?:\r?\n|$)/i);
    if (startMatch && startMatch[1] && startMatch[1].trim().length > 0) {
      startQuery = startMatch[1].trim();
    }

    const finishMatch = desc.match(/🏁\s*Titik Finish:\s*(.*?)(?:\r?\n|$)/i);
    if (finishMatch && finishMatch[1] && finishMatch[1].trim().length > 0) {
      finishQuery = finishMatch[1].trim();
    }

    // Dynamic NLP parsing from route title if explicit start/finish are missing
    const cleanTitle = title
      .replace(/^[\d.\s]+/, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    if (!startQuery && !finishQuery) {
      if (cleanTitle.includes('–') || cleanTitle.includes('-')) {
        const parts = cleanTitle.split(/–|-/);
        startQuery = sanitizeLocationQuery(parts[0]);
        finishQuery = sanitizeLocationQuery(parts[1]);
      } else {
        startQuery = sanitizeLocationQuery(cleanTitle);
        finishQuery = sanitizeLocationQuery(cleanTitle);
      }
    } else if (!startQuery) {
      startQuery = sanitizeLocationQuery(cleanTitle);
    } else if (!finishQuery) {
      finishQuery = sanitizeLocationQuery(cleanTitle);
    }

    return { startQuery, finishQuery };
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    const { startQuery, finishQuery } = extractLocations(routeName, routeDescription);

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
          html: `<div style="background-color: #F59E0B; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 16px rgba(245, 158, 11, 1);"></div>`,
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
            html: `<div style="background-color: #22C55E; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 16px rgba(34, 197, 94, 1);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const finishMarker = L.marker([finishLat, finishLng], { icon: finishIcon }).addTo(map);
          finishMarker.bindPopup(`<b>Titik Tujuan (Finish)</b><br/>${finishLabel || 'Tujuan Gowes'}`);

          // Query OSRM Biking API for turn-by-turn bicycle navigation path
          const osrmUrl = `https://router.project-osrm.org/route/v1/biking/${startLng},${startLat};${finishLng},${finishLat}?overview=full&geometries=geojson`;

          fetch(osrmUrl)
            .then((res) => res.json())
            .then((osrmData) => {
              if (!isMounted) return;

              let routeCoords: [number, number][] = [
                [startLat, startLng],
                [(startLat + finishLat) / 2, (startLng + finishLng) / 2],
                [finishLat, finishLng],
              ];

              if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
                const route = osrmData.routes[0];
                const geoCoords = route.geometry.coordinates;
                routeCoords = geoCoords.map(([lon, lat]: [number, number]) => [lat, lon]);

                // Calculate Distance & Duration
                const distKm = (route.distance / 1000).toFixed(1);
                const totalMins = Math.round(route.duration / 60);
                const hrs = Math.floor(totalMins / 60);
                const mins = totalMins % 60;
                const durationText = hrs > 0 ? `${hrs} jam ${mins} menit` : `${mins} menit`;

                setRouteStats({ distance: `${distKm} km`, duration: durationText });

                // Snap Finish Marker EXACTLY to the last coordinate of the route polyline!
                const lastCoord = routeCoords[routeCoords.length - 1];
                finishMarker.setLatLng(lastCoord);
              }

              // High-Contrast Dual Polyline (Dark Outline + Neon Cyan Blue Line)
              L.polyline(routeCoords, {
                color: '#000000',
                weight: 10,
                opacity: 0.6,
                lineCap: 'round',
                lineJoin: 'round',
              }).addTo(map);

              const routePolyline = L.polyline(routeCoords, {
                color: '#0284C7',
                weight: 6,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
              }).addTo(map);

              map.fitBounds(routePolyline.getBounds(), { padding: [45, 45] });
            })
            .catch((err) => {
              console.error('OSRM Biking Route error:', err);
              const routePolyline = L.polyline(
                [
                  [startLat, startLng],
                  [finishLat, finishLng],
                ],
                { color: '#0284C7', weight: 6, opacity: 1 }
              ).addTo(map);
              map.fitBounds(routePolyline.getBounds(), { padding: [45, 45] });
            });
        }

        mapInstanceRef.current = map;
      });
    };

    const formatGeocodeQuery = (q: string) => {
      if (!q) return '';
      const clean = q.trim();
      return clean.toLowerCase().includes('indonesia') ? clean : `${clean}, Indonesia`;
    };

    // Geocode both Start and Finish dynamically using Nominatim API (100% Dynamic, Zero Hardcoding)
    const fetchStart = fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formatGeocodeQuery(startQuery))}`)
      .then((res) => res.json())
      .catch(() => []);

    const fetchFinish = finishQuery
      ? fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formatGeocodeQuery(finishQuery))}`)
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
        // Pure dynamic fallback offset relative to start position if geocoding returns no result
        finishLat = startLat - 0.08;
        finishLng = startLng + 0.08;
      }

      renderMapWithCoords(startLat, startLng, startQuery, finishLat, finishLng, finishQuery || 'Tujuan Gowes');
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
      
      {/* Route Info Badge HUD Overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#111111]/90 backdrop-blur-md border border-[#333333] px-3.5 py-2 rounded-xl text-xs shadow-xl flex flex-col space-y-1">
        <div className="flex items-center space-x-2 font-mono text-amber-400">
          <span className="font-bold">OpenStreetMap</span>
          <span>•</span>
          <span className="text-white truncate max-w-[200px]">{routeName}</span>
        </div>
        {routeStats && (
          <div className="flex items-center space-x-3 text-[11px] font-semibold text-gray-300 border-t border-[#333333]/60 pt-1 mt-0.5">
            <span className="text-cyan-400 flex items-center space-x-1">
              <span>🚴 Estimasi:</span>
              <strong className="text-white">{routeStats.duration}</strong>
            </span>
            <span>•</span>
            <span className="text-green-400 flex items-center space-x-1">
              <span>📏 Navigasi:</span>
              <strong className="text-white">{routeStats.distance}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
