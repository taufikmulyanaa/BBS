'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, MapPin, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  defaultLocation?: { lat: number; lng: number };
  title?: string;
};

export default function MapLocationPickerModal({ isOpen, onClose, onSelect, defaultLocation, title = 'Pilih Lokasi di Peta' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=id`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        mapInstanceRef.current.setView([lat, lng], 14);
      } else {
        alert('Lokasi tidak ditemukan.');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      const startLat = defaultLocation?.lat || -6.9024;
      const startLng = defaultLocation?.lng || 107.6187;

      const map = L.map(mapRef.current).setView([startLat, startLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      // Icon Definition
      const pinIcon = L.divIcon({
        className: 'custom-leaflet-marker-picker',
        html: `<div style="background-color: #EAB308; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 16px rgba(234, 179, 8, 1); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: #000; border-radius: 50%;"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      if (defaultLocation) {
        markerInstanceRef.current = L.marker([startLat, startLng], { icon: pinIcon }).addTo(map);
        setSelectedCoords({ lat: startLat, lng: startLng });
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setSelectedCoords({ lat, lng });

        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([lat, lng]);
        } else {
          markerInstanceRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerInstanceRef.current = null;
    };
  }, [isOpen, defaultLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#262626] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#333333] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#1A1A1A] border-b border-[#333333]">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="Cari area lokasi (contoh: Pantai Batu Hiu, Parigi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#262626] border border-[#333333] rounded-lg pl-9 pr-24 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-1.5 px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-gray-300 text-xs font-bold rounded-md transition disabled:opacity-50"
            >
              {searching ? 'Mencari...' : 'Cari'}
            </button>
          </form>
        </div>

        {/* Map Container */}
        <div className="relative flex-1 bg-[#111111] overflow-hidden">
          <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg border border-[#333333]">
            Klik pada peta untuk menempatkan pin
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1A1A1A] border-t border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-gray-400 flex flex-col">
            {selectedCoords ? (
              <>
                <span className="text-amber-400 font-bold mb-1">Koordinat Terpilih:</span>
                <span>Lat: {selectedCoords.lat.toFixed(5)}</span>
                <span>Lng: {selectedCoords.lng.toFixed(5)}</span>
              </>
            ) : (
              <span className="text-gray-500 italic">Belum ada titik yang dipilih...</span>
            )}
          </div>

          <div className="flex space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition"
            >
              Batal
            </button>
            <button
              disabled={!selectedCoords}
              onClick={() => {
                if (selectedCoords) {
                  onSelect(selectedCoords.lat, selectedCoords.lng);
                  onClose();
                }
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Gunakan Lokasi Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
