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

    // 1. Dynamic Extraction of Titik Start Location Name
    let searchLocation = routeName;
    let labelLocation = routeName;

    const startMatch = routeDescription.match(/📍 Titik Start: (.*?)\n/);
    if (startMatch && startMatch[1] && startMatch[1].trim().length > 0) {
      searchLocation = startMatch[1].trim();
      labelLocation = startMatch[1].trim();
    } else {
      // Clean prefix numbers and brackets for better geocoding query
      searchLocation = routeName.replace(/^[\d.\s]+/, '').replace(/\(.*?\)/g, '').trim();
    }

    // 2. Check if explicit GPS coordinates are present e.g. "Lat: -6.9024, Lng: 107.6187"
    const gpsMatch = routeDescription.match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/i);

    const renderMapWithCoords = (startLat: number, startLng: number, displayLabel: string) => {
      import('leaflet').then((L) => {
        if (!isMounted || !mapRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapRef.current).setView([startLat, startLng], 14);

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

        // Add Pin Marker
        L.marker([startLat, startLng], { icon: startIcon })
          .addTo(map)
          .bindPopup(`<b>Titik Kumpul / Start</b><br/>${displayLabel}`)
          .openPopup();

        mapInstanceRef.current = map;
      });
    };

    if (gpsMatch) {
      const parsedLat = parseFloat(gpsMatch[1]);
      const parsedLng = parseFloat(gpsMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        renderMapWithCoords(parsedLat, parsedLng, labelLocation);
        return;
      }
    }

    // 3. Query OpenStreetMap Nominatim Geocoding API for dynamic position
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}`;

    fetch(geocodeUrl)
      .then((res) => res.json())
      .then((geoData) => {
        if (!isMounted) return;

        if (geoData && geoData.length > 0) {
          const lat = parseFloat(geoData[0].lat);
          const lon = parseFloat(geoData[0].lon);
          renderMapWithCoords(lat, lon, labelLocation);
        } else {
          // Fallback keyword matcher if Nominatim API query returns no result
          const lower = (routeName + ' ' + routeDescription).toLowerCase();
          let fallbackLat = -6.9024;
          let fallbackLng = 107.6187;

          if (lower.includes('pangandaran') || lower.includes('tasik') || lower.includes('ciamis')) {
            fallbackLat = -7.3274;
            fallbackLng = 108.3549;
          } else if (lower.includes('bsd') || lower.includes('kebayoran') || lower.includes('jakarta')) {
            fallbackLat = -6.2443;
            fallbackLng = 106.7844;
          } else if (lower.includes('sentul') || lower.includes('bogor')) {
            fallbackLat = -6.5892;
            fallbackLng = 106.8400;
          }

          renderMapWithCoords(fallbackLat, fallbackLng, labelLocation);
        }
      })
      .catch((err) => {
        console.error('Geocoding error:', err);
        // Fallback to default Gedung Sate if network fails
        renderMapWithCoords(-6.9024, 107.6187, labelLocation);
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
