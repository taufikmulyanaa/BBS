'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, MapPin, Search, Navigation, Compass } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  defaultLocation?: { lat: number; lng: number };
  title?: string;
};

interface SearchResultItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export default function MapLocationPickerModal({ isOpen, onClose, onSelect, defaultLocation, title = 'Pilih Lokasi di Peta' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const userGpsMarkerRef = useRef<any>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  // Dynamic Reverse Geocoding helper from OpenStreetMap Nominatim
  const fetchAddressName = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
    return `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
  };

  // Helper to place marker with custom icon & popup
  const placeMarkerAt = (L: any, lat: number, lng: number, labelName?: string) => {
    if (!mapInstanceRef.current) return;

    setSelectedCoords({ lat, lng });

    const pinIcon = L.divIcon({
      className: 'custom-leaflet-marker-picker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(234, 179, 8, 0.4); border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;"></div>
          <div style="position: relative; background-color: #EAB308; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; background-color: #111111; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([lat, lng]);
      markerInstanceRef.current.setIcon(pinIcon);
    } else {
      markerInstanceRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(mapInstanceRef.current);
    }

    if (labelName) {
      setSelectedLocationName(labelName);
      const popupText = `
        <div style="font-family: sans-serif; min-width: 140px; padding: 2px;">
          <strong style="color: #D97706; font-size: 13px; display: block; margin-bottom: 2px;">📍 ${labelName.split(',')[0]}</strong>
          <span style="font-size: 11px; color: #4B5563; line-height: 1.3; display: block;">${labelName}</span>
          <small style="color: #6B7280; font-size: 10px; display: block; margin-top: 4px;">Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</small>
        </div>
      `;
      markerInstanceRef.current.bindPopup(popupText).openPopup();
    } else {
      // Dynamic reverse geocode if no label name provided
      fetchAddressName(lat, lng).then((name) => {
        setSelectedLocationName(name);
        const popupText = `
          <div style="font-family: sans-serif; min-width: 140px; padding: 2px;">
            <strong style="color: #D97706; font-size: 13px; display: block; margin-bottom: 2px;">📍 ${name.split(',')[0]}</strong>
            <span style="font-size: 11px; color: #4B5563; line-height: 1.3; display: block;">${name}</span>
            <small style="color: #6B7280; font-size: 10px; display: block; margin-top: 4px;">Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}</small>
          </div>
        `;
        if (markerInstanceRef.current) {
          markerInstanceRef.current.bindPopup(popupText).openPopup();
        }
      });
    }

    mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
  };

  // Detect real active GPS location dynamically
  const fetchAndSetRealGpsLocation = (L: any, autoZoom = true) => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Draw live blue GPS beacon on map
        const blueGpsIcon = L.divIcon({
          className: 'custom-leaflet-blue-gps-marker',
          html: `
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 28px; height: 28px; background-color: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; background-color: #3B82F6; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 0 12px rgba(59, 130, 246, 0.9);"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        if (mapInstanceRef.current) {
          if (userGpsMarkerRef.current) {
            userGpsMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            userGpsMarkerRef.current = L.marker([latitude, longitude], { icon: blueGpsIcon }).addTo(mapInstanceRef.current);
          }
        }

        const addressName = await fetchAddressName(latitude, longitude);

        if (autoZoom && mapInstanceRef.current) {
          placeMarkerAt(L, latitude, longitude, addressName);
        }

        setLocating(false);
      },
      (error) => {
        console.warn('Geolocation access failed:', error);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur lokasi (Geolocation).');
      return;
    }

    setShowResultsDropdown(false);
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        fetchAndSetRealGpsLocation(L, true);
      });
    }
  };

  const selectSearchResult = (item: SearchResultItem) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        placeMarkerAt(L, lat, lng, item.display_name);
      });
    }

    setShowResultsDropdown(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setSearching(true);
    setSearchResults([]);
    setShowResultsDropdown(false);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=id&limit=5`
      );
      const data: SearchResultItem[] = await res.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
        setShowResultsDropdown(true);

        // Auto select first result to immediately point to the location!
        selectSearchResult(data[0]);
      } else {
        alert('Lokasi tidak ditemukan. Coba kata kunci yang lebih spesifik.');
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

      mapInstanceRef.current = map;

      if (defaultLocation) {
        placeMarkerAt(L, startLat, startLng);
      } else {
        // Automatically fetch real GPS location dynamically on launch
        fetchAndSetRealGpsLocation(L, true);
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setShowResultsDropdown(false);
        placeMarkerAt(L, lat, lng);
      });
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerInstanceRef.current = null;
      userGpsMarkerRef.current = null;
      setSearchResults([]);
      setShowResultsDropdown(false);
    };
  }, [isOpen, defaultLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#262626] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333333] bg-[#1E1E1E]">
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

        {/* Dynamic Search Bar */}
        <div className="p-3 bg-[#1A1A1A] border-b border-[#333333] relative z-20">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input
              type="text"
              placeholder="Cari lokasi/area di peta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#262626] border border-[#333333] rounded-lg pl-9 pr-24 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-md transition disabled:opacity-50 flex items-center space-x-1"
            >
              {searching ? (
                <span>Mencari...</span>
              ) : (
                <>
                  <Navigation className="w-3 h-3" />
                  <span>Cari</span>
                </>
              )}
            </button>
          </form>

          {/* Dynamic Search Suggestions Dropdown */}
          {showResultsDropdown && searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-[#262626] border border-[#333333] rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              <div className="p-2 text-[10px] uppercase font-bold text-amber-400 border-b border-[#333333]">
                Hasil Pencarian ({searchResults.length}):
              </div>
              {searchResults.map((item) => (
                <button
                  key={item.place_id}
                  onClick={() => selectSearchResult(item)}
                  className="w-full text-left px-3 py-2.5 border-b border-[#333333]/50 hover:bg-[#333333] transition flex items-start space-x-2 text-xs"
                >
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white line-clamp-1">{item.display_name.split(',')[0]}</div>
                    <div className="text-[11px] text-gray-400 line-clamp-1">{item.display_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 bg-[#111111] overflow-hidden">
          <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" />
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg border border-[#333333] pointer-events-none">
            Klik pada peta atau cari lokasi untuk menempatkan pin
          </div>

          {/* Floating Current Location Button on Map Bottom Right */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={locating}
            className="absolute bottom-4 right-4 z-10 bg-[#1E1E1E]/95 hover:bg-black text-amber-400 border border-amber-500/50 p-3 rounded-full shadow-2xl backdrop-blur-md transition hover:scale-110 active:scale-95 disabled:opacity-50"
            title="Deteksi Lokasi GPS Saya Saat Ini"
          >
            <Compass className={`w-5 h-5 ${locating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1A1A1A] border-t border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-gray-400 flex flex-col max-w-sm">
            {selectedCoords ? (
              <>
                <span className="text-amber-400 font-bold mb-0.5">📍 Titik Terpilih:</span>
                {selectedLocationName && (
                  <span className="text-white font-sans text-xs truncate mb-0.5">
                    {selectedLocationName.split(',')[0]}
                  </span>
                )}
                <span className="text-[11px] text-gray-400">
                  Lat: {selectedCoords.lat.toFixed(5)}, Lng: {selectedCoords.lng.toFixed(5)}
                </span>
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





