'use client';

import React, { useState } from 'react';
import { Route } from '@/lib/supabase';
import { MapPin, Navigation, Mountain, Star, Download, Bookmark, CheckCircle, Edit3 } from 'lucide-react';
import RouteMapModal from './RouteMapModal';
import EditRouteModal from './EditRouteModal';
import LoginRequiredModal from './LoginRequiredModal';

type Props = {
  route: Route;
  onSave?: (routeId: string) => void;
  isSaved?: boolean;
  onRefresh?: () => void;
  currentUser?: any;
};

export default function RouteCard({ route, onSave, isSaved = false, onRefresh, currentUser }: Props) {
  const [showMapModal, setShowMapModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleProtectedAction = (action: () => void) => {
    if (!currentUser) {
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'easy':
        return <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">EASY</span>;
      case 'medium':
        return <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded uppercase">MEDIUM</span>;
      case 'hard':
        return <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">HARD</span>;
      default:
        return null;
    }
  };

  const handleDownloadGpx = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (route.gpx_file_url) {
      window.open(route.gpx_file_url, '_blank');
    } else {
      const dummyGpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Bapak-Bapak Sepedahan">
  <trk><name>${route.nama}</name><trkseg><trkpt lat="-6.8915" lon="107.6107"><ele>750</ele></trkpt></trkseg></trk>
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
    <>
      <div className="group bg-[#262626] hover:bg-[#2A2A2A] border border-[#333333] hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg">
        {/* Card Header Cover */}
        <div className="relative h-48 w-full overflow-hidden bg-[#111111]">
          <img
            src={route.cover_image_url && !route.cover_image_url.includes('1544197150-b99a580bb7a8') ? route.cover_image_url : 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'}
            alt={route.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#262626] via-transparent to-black/40"></div>

          {/* Level Badge */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            {getLevelBadge(route.level)}
            {route.status_verifikasi === 'terverifikasi' && (
              <span className="bg-[#111111]/80 text-green-400 text-[11px] font-medium px-2 py-0.5 rounded-full border border-green-500/30 flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Terverifikasi</span>
              </span>
            )}
          </div>

          {/* Header Action Buttons (Edit & Bookmark) */}
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            {currentUser && (currentUser.id === route.dibuat_oleh || !route.dibuat_oleh) && (
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-full bg-[#111111]/70 text-white hover:text-amber-400 backdrop-blur-md transition-colors"
                title="Edit Rute Ini (Hanya Pembuat)"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onSave && onSave(route.id)}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                isSaved ? 'bg-amber-500 text-black' : 'bg-[#111111]/70 text-white hover:text-amber-400'
              }`}
              title="Simpan Rute"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span className="flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span className="text-white font-bold">{route.rating_avg}</span>
                <span>({route.rating_count} ulasan)</span>
              </span>
            </div>

            <h3 className="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1">
              {route.nama}
            </h3>
            <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
              {route.deskripsi}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#333333] text-xs">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-amber-400" />
              <div>
                <span className="block text-[10px] text-gray-400">Jarak</span>
                <span className="font-bold text-white">{route.jarak_km} km</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Mountain className="w-4 h-4 text-amber-400" />
              <div>
                <span className="block text-[10px] text-gray-400">Elevasi</span>
                <span className="font-bold text-white">{route.elevasi_m || 0} m</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {route.tags?.map((tag) => (
              <span key={tag} className="text-[10px] bg-[#1A1A1A] text-gray-400 border border-[#333333] px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={() => handleProtectedAction(() => setShowMapModal(true))}
              className="flex-1 bg-[#1A1A1A] hover:bg-[#333333] text-white border border-[#333333] text-xs font-semibold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Lihat Peta</span>
            </button>
            <button
              onClick={(e) => handleProtectedAction(() => handleDownloadGpx(e))}
              className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors"
              title="Unduh file GPX"
            >
              <Download className="w-3.5 h-3.5" />
              <span>GPX</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Preview Modal */}
      <RouteMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        route={route}
      />

      {/* Edit Route Modal */}
      <EditRouteModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => onRefresh && onRefresh()}
        route={route}
        currentUser={currentUser}
      />

      {/* Login Required Modal */}
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        message="Silakan masuk terlebih dahulu untuk melihat peta lengkap dan mengunduh rute GPX ini."
      />
    </>
  );
}
