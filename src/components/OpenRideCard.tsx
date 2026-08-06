'use client';

import React, { useState } from 'react';
import { OpenRide } from '@/lib/supabase';
import { Calendar, Clock, MapPin, Users, CheckCircle2, UserPlus, Info } from 'lucide-react';

type Props = {
  ride: OpenRide;
  onJoin?: (rideId: string) => void;
  isJoined?: boolean;
};

export default function OpenRideCard({ ride, onJoin, isJoined = false }: Props) {
  const [joined, setJoined] = useState(isJoined);
  const [participantsCount, setParticipantsCount] = useState(ride.participant_count || 5);

  const handleJoinClick = () => {
    if (joined) {
      setJoined(false);
      setParticipantsCount((prev) => Math.max(0, prev - 1));
    } else {
      if (participantsCount >= ride.kuota_maks) return;
      setJoined(true);
      setParticipantsCount((prev) => prev + 1);
    }
    if (onJoin) onJoin(ride.id);
  };

  const isFull = participantsCount >= ride.kuota_maks;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return isoString;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch (e) {
      return '06:00 WIB';
    }
  };

  return (
    <div className="bg-[#232322] border border-[#42403B] hover:border-[#EA9B28]/50 rounded-2xl p-5 space-y-4 transition-all shadow-lg flex flex-col justify-between">
      <div className="space-y-3">
        {/* Date & Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-[#EA9B28] font-semibold bg-[#EA9B28]/10 border border-[#EA9B28]/20 px-3 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(ride.tanggal_waktu)}</span>
          </div>

          <span
            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
              ride.level === 'easy'
                ? 'bg-[#5DBB63]/20 border-[#5DBB63]/40 text-[#8ee594]'
                : ride.level === 'medium'
                ? 'bg-[#EA9B28]/20 border-[#EA9B28]/40 text-[#F7C56A]'
                : 'bg-[#D9534F]/20 border-[#D9534F]/40 text-[#ff9996]'
            }`}
          >
            {ride.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading font-extrabold text-lg text-[#F5F5F5] hover:text-[#EA9B28] transition-colors leading-snug">
          {ride.judul}
        </h3>

        {/* Details */}
        <div className="space-y-2 text-xs text-[#B9BEC3]">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-[#EA9B28] shrink-0 mt-0.5" />
            <span className="font-medium text-[#F5F5F5]">{ride.titik_kumpul}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#8E8B87]" />
              <span>{formatTime(ride.tanggal_waktu)}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[#8E8B87]">Jarak:</span>
              <span className="font-bold text-[#F5F5F5]">{ride.jarak_km} km</span>
            </div>
          </div>

          {ride.catatan && (
            <div className="p-3 bg-[#141415] rounded-xl border border-[#42403B] flex items-start space-x-2 text-[11px] text-[#8E8B87]">
              <Info className="w-3.5 h-3.5 text-[#EA9B28] shrink-0 mt-0.5" />
              <p className="line-clamp-2">{ride.catatan}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer & Quota */}
      <div className="pt-3 border-t border-[#42403B] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-[#EA9B28]" />
            <span className="text-[#8E8B87]">Peserta:</span>
            <span className="font-bold text-[#F5F5F5]">
              {participantsCount} / {ride.kuota_maks}
            </span>
          </div>
          {isFull && !joined && (
            <span className="text-[10px] text-[#D9534F] font-bold bg-[#D9534F]/15 px-2 py-0.5 rounded">
              Kuota Penuh
            </span>
          )}
        </div>

        <button
          onClick={handleJoinClick}
          disabled={isFull && !joined}
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            joined
              ? 'bg-[#5DBB63]/20 border border-[#5DBB63]/40 text-[#8ee594] hover:bg-[#5DBB63]/30'
              : isFull
              ? 'bg-[#141415] text-[#8E8B87] border border-[#42403B] cursor-not-allowed'
              : 'bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] shadow-md shadow-[#EA9B28]/20'
          }`}
        >
          {joined ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Terdaftar (Klik untuk Batal)</span>
            </>
          ) : isFull ? (
            <span>Kuota Telah Penuh</span>
          ) : (
            <>
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Gabung Gowes Bareng</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
