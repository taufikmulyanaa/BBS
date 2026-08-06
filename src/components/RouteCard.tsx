'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Route } from '@/lib/supabase';
import { MapPin, Navigation, Mountain, Star, Download, Bookmark, CheckCircle } from 'lucide-react';
import LeafletMap from './LeafletMap';

type Props = {
  route: Route;
  onSave?: (routeId: string) => void;
  isSaved?: boolean;
};

export default function RouteCard({ route, onSave, isSaved = false }: Props) {
  const [showMapModal, setShowMapModal] = useState(false);

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'easy':
        return <span className="bg-[#5DBB63]/20 border border-[#5DBB63]/40 text-[#8ee594] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">Easy</span>;
      case 'medium':
        return <span className="bg-[#EA9B28]/20 border border-[#EA9B28]/40 text-[#F7C56A] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">Medium</span>;
      case 'hard':
        return <span className="bg-[#D9534F]/20 border border-[#D9534F]/40 text-[#ff9996] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">Hard</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="group bg-[#232322] hover:bg-[#2A2A2A] border border-[#42403B] hover:border-[#EA9B28]/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg">
        {/* Card Header Cover */}
        <div className="relative h-48 w-full overflow-hidden bg-[#141415]">
          <img
            src={route.cover_image_url || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'}
            alt={route.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#232322] via-transparent to-black/40"></div>

          {/* Level Badge */}
          <div className="absolute top-3 left-3 flex items-center space-x-2">
            {getLevelBadge(route.level)}
            {route.status_verifikasi === 'terverifikasi' && (
              <span className="bg-[#141415]/80 text-[#5DBB63] text-[11px] font-medium px-2 py-0.5 rounded-full border border-[#5DBB63]/30 flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Terverifikasi</span>
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onSave && onSave(route.id)}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
              isSaved ? 'bg-[#EA9B28] text-[#141415]' : 'bg-[#141415]/70 text-[#F5F5F5] hover:text-[#EA9B28]'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8E8B87] mb-1">
              <span className="flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 text-[#EA9B28] fill-current" />
                <span className="text-[#F5F5F5] font-bold">{route.rating_avg}</span>
                <span>({route.rating_count} ulasan)</span>
              </span>
            </div>

            <h3 className="font-heading font-bold text-lg text-[#F5F5F5] group-hover:text-[#EA9B28] transition-colors line-clamp-1">
              {route.nama}
            </h3>
            <p className="text-xs text-[#B9BEC3] mt-1 line-clamp-2 leading-relaxed">
              {route.deskripsi}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#42403B]/60 text-xs">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-[#EA9B28]" />
              <div>
                <span className="block text-[10px] text-[#8E8B87]">Jarak</span>
                <span className="font-bold text-[#F5F5F5]">{route.jarak_km} km</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Mountain className="w-4 h-4 text-[#EA9B28]" />
              <div>
                <span className="block text-[10px] text-[#8E8B87]">Elevasi</span>
                <span className="font-bold text-[#F5F5F5]">{route.elevasi_m || 0} m</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {route.tags.map((tag) => (
              <span key={tag} className="text-[10px] bg-[#141415] text-[#B9BEC3] border border-[#42403B] px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={() => setShowMapModal(true)}
              className="flex-1 bg-[#141415] hover:bg-[#2A2A2A] text-[#F5F5F5] border border-[#42403B] text-xs font-semibold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#EA9B28]" />
              <span>Lihat Peta</span>
            </button>
            <a
              href={route.gpx_file_url || '#'}
              download
              className="bg-[#EA9B28]/15 hover:bg-[#EA9B28]/25 text-[#EA9B28] border border-[#EA9B28]/40 text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors"
              title="Unduh file GPX"
            >
              <Download className="w-3.5 h-3.5" />
              <span>GPX</span>
            </a>
          </div>
        </div>
      </div>

      {/* Map Preview Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-[#232322] border border-[#42403B] rounded-2xl overflow-hidden p-5 text-[#F5F5F5] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-xl">{route.nama}</h3>
                <p className="text-xs text-[#B9BEC3]">{route.jarak_km} km • Elevasi {route.elevasi_m}m</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-1 rounded-lg bg-[#141415] hover:bg-[#2A2A2A] text-[#8E8B87] hover:text-[#F5F5F5]"
              >
                ✕
              </button>
            </div>
            <div className="h-96 w-full">
              <LeafletMap routeName={route.nama} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
