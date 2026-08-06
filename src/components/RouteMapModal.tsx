'use client';

import React from 'react';
import { X, Navigation, Mountain, Download, MapPin, CheckCircle, Star } from 'lucide-react';
import { Route } from '@/lib/supabase';
import LeafletMap from './LeafletMap';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
};

export default function RouteMapModal({ isOpen, onClose, route }: Props) {
  if (!isOpen || !route) return null;

  const handleDownloadGpx = () => {
    if (route.gpx_file_url) {
      window.open(route.gpx_file_url, '_blank');
    } else {
      // Create a dummy GPX file blob for demonstration
      const dummyGpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Bapak-Bapak Sepedahan">
  <trk>
    <name>${route.nama}</name>
    <trkseg>
      <trkpt lat="-6.8915" lon="107.6107"><ele>750</ele></trkpt>
      <trkpt lat="-6.8700" lon="107.6200"><ele>920</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;
      const blob = new Blob([dummyGpxContent], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${route.nama.toLowerCase().replace(/\s+/g, '-')}.gpx`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#262626] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#333333]">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  route.level === 'easy'
                    ? 'bg-green-600 text-white'
                    : route.level === 'medium'
                    ? 'bg-amber-500 text-black'
                    : 'bg-red-600 text-white'
                }`}
              >
                {route.level}
              </span>
              <span className="text-xs text-amber-400 font-semibold flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{route.rating_avg} ({route.rating_count} ulasan)</span>
              </span>
            </div>
            <h3 className="font-heading font-extrabold text-xl text-white">{route.nama}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#333333] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Body */}
        <div className="flex-1 min-h-[350px] relative bg-[#1A1A1A]">
          <LeafletMap routeName={route.nama} lat={-6.8915} lng={107.6107} zoom={12} className="w-full h-full min-h-[350px]" />
        </div>

        {/* Footer Details & GPX Download */}
        <div className="p-5 bg-[#1A1A1A] border-t border-[#333333] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs w-full md:w-auto">
            <div>
              <span className="block text-gray-400">Total Jarak</span>
              <span className="font-extrabold text-base text-amber-400">{route.jarak_km} km</span>
            </div>
            <div>
              <span className="block text-gray-400">Elevasi Tanjakan</span>
              <span className="font-extrabold text-base text-white">{route.elevasi_m || 350} m</span>
            </div>
            <div>
              <span className="block text-gray-400">Status Rute</span>
              <span className="font-semibold text-green-400 flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5 inline" />
                <span>Terverifikasi</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition w-full md:w-auto"
            >
              Tutup
            </button>
            <button
              onClick={handleDownloadGpx}
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg flex items-center justify-center space-x-2 w-full md:w-auto"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Unduh File GPX</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
