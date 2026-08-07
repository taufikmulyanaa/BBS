'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BikeEvent, supabase } from '@/lib/supabase';
import { Calendar, MapPin, Star, Edit3, ArrowRight, Flag } from 'lucide-react';

type Props = {
  event: BikeEvent;
  currentUser?: any;
  onEdit?: (event: BikeEvent) => void;
};

export default function EventCard({ event, currentUser, onEdit }: Props) {
  const [interestCount, setInterestCount] = useState(0);
  const [interested, setInterested] = useState(false);

  const isCreator = currentUser && currentUser.id === event.dibuat_oleh;

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from('bike_event_interests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id);
      setInterestCount(count || 0);

      if (currentUser) {
        const { data } = await supabase
          .from('bike_event_interests')
          .select('user_id')
          .eq('event_id', event.id)
          .eq('user_id', currentUser.id)
          .maybeSingle();
        setInterested(!!data);
      }
    };
    load();
  }, [event.id, currentUser]);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className="bg-[#262626] border border-[#333333] hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all shadow-lg flex flex-col group"
    >
      <div className="h-36 bg-[#1A1A1A] relative overflow-hidden">
        {event.poster_url ? (
          <img src={event.poster_url} alt={event.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Flag className="w-10 h-10 text-amber-500/30" />
          </div>
        )}

        {isCreator && onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(event);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-amber-500 hover:text-black text-amber-400 border border-[#333333] transition"
            title="Edit / Hapus Event"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}

        {event.status !== 'akan_datang' && (
          <span
            className={`absolute top-2 left-2 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
              event.status === 'selesai'
                ? 'bg-[#333333]/80 border-[#444444] text-gray-300'
                : 'bg-[#D9534F]/80 border-[#D9534F] text-white'
            }`}
          >
            {event.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
          </span>
        )}
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span suppressHydrationWarning>{formatDate(event.tanggal_mulai)}</span>
          </div>
          <h3 className="font-heading font-extrabold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug">
            {event.judul}
          </h3>
          {event.lokasi && (
            <div className="flex items-start space-x-1.5 text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{event.lokasi}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#333333] flex items-center justify-between">
          <div className={`flex items-center space-x-1.5 text-xs ${interested ? 'text-amber-400' : 'text-gray-400'}`}>
            <Star className={`w-4 h-4 ${interested ? 'fill-current text-amber-400' : 'text-amber-500'}`} />
            <span className="font-bold">{interestCount}</span>
            <span>Tertarik/Akan Ikut</span>
          </div>
          <span className="text-[11px] text-amber-400 font-bold flex items-center space-x-1">
            <span>Lihat Detail</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
