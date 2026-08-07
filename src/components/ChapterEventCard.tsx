'use client';

import React, { useState, useEffect } from 'react';
import { ChapterEvent, supabase } from '@/lib/supabase';
import { Calendar, Clock, MapPin, Users, CheckCircle2, UserPlus, Bike, Coffee, PartyPopper, Trash2 } from 'lucide-react';

type Props = {
  event: ChapterEvent;
  currentUser?: any;
  isMember: boolean;
  canManage: boolean;
  onChanged?: () => void;
};

const jenisMeta: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  open_ride: { label: 'Open Ride', icon: Bike, className: 'bg-[#5DBB63]/20 border-[#5DBB63]/40 text-[#8ee594]' },
  kopdar: { label: 'Kopdar', icon: Coffee, className: 'bg-[#EA9B28]/20 border-[#EA9B28]/40 text-[#F7C56A]' },
  lainnya: { label: 'Kegiatan', icon: PartyPopper, className: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
};

export default function ChapterEventCard({ event, currentUser, isMember, canManage, onChanged }: Props) {
  const [joined, setJoined] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const meta = jenisMeta[event.jenis] || jenisMeta.lainnya;
  const Icon = meta.icon;
  const isFull = event.kuota_maks ? participantsCount >= event.kuota_maks : false;

  const fetchParticipants = async () => {
    const { count } = await supabase
      .from('chapter_event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id);
    setParticipantsCount(count || 0);

    if (currentUser) {
      const { data } = await supabase
        .from('chapter_event_participants')
        .select('user_id')
        .eq('event_id', event.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      setJoined(!!data);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [event.id, currentUser]);

  const handleToggleJoin = async () => {
    if (!currentUser || !isMember) return;
    setLoading(true);
    try {
      if (joined) {
        await supabase.from('chapter_event_participants').delete().match({ event_id: event.id, user_id: currentUser.id });
        setJoined(false);
        setParticipantsCount((prev) => Math.max(0, prev - 1));
      } else {
        if (isFull) return;
        const { error } = await supabase.from('chapter_event_participants').insert([{ event_id: event.id, user_id: currentUser.id }]);
        if (error) throw error;
        setJoined(true);
        setParticipantsCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling event RSVP:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus kegiatan ini secara permanen?')) return;
    try {
      const { error } = await supabase.from('chapter_events').delete().eq('id', event.id);
      if (error) throw error;
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Gagal menghapus kegiatan.');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-[#262626] border border-[#333333] rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 text-xs text-[#EA9B28] font-semibold bg-[#EA9B28]/10 border border-[#EA9B28]/20 px-3 py-1 rounded-full">
          <Calendar className="w-3.5 h-3.5" />
          <span suppressHydrationWarning>{formatDate(event.tanggal_waktu)}</span>
        </div>
        <div className="flex items-center space-x-2">
          {canManage && (
            <button onClick={handleDelete} className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-red-500 hover:text-white text-red-400 border border-[#333333] transition" title="Hapus Kegiatan">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center space-x-1 ${meta.className}`}>
            <Icon className="w-3 h-3" />
            <span>{meta.label}</span>
          </span>
        </div>
      </div>

      <h3 className="font-heading font-extrabold text-lg text-[#F5F5F5] leading-snug">{event.judul}</h3>

      {event.deskripsi && <p className="text-xs text-[#B9BEC3] line-clamp-3">{event.deskripsi}</p>}

      <div className="space-y-2 text-xs text-[#B9BEC3]">
        {event.lokasi && (
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-[#EA9B28] shrink-0 mt-0.5" />
            <span className="font-medium text-[#F5F5F5]">{event.lokasi}</span>
          </div>
        )}
        <div className="flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-[#8E8B87]" />
          <span suppressHydrationWarning>{formatTime(event.tanggal_waktu)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#42403B] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-[#EA9B28]" />
            <span className="text-[#8E8B87]">Peserta:</span>
            <span className="font-bold text-[#F5F5F5]">
              {participantsCount}{event.kuota_maks ? ` / ${event.kuota_maks}` : ''}
            </span>
          </div>
          {isFull && !joined && (
            <span className="text-[10px] text-[#D9534F] font-bold bg-[#D9534F]/15 px-2 py-0.5 rounded">Kuota Penuh</span>
          )}
        </div>

        <button
          onClick={handleToggleJoin}
          disabled={loading || !isMember || (isFull && !joined)}
          title={!isMember ? 'Gabung chapter ini untuk RSVP kegiatan' : undefined}
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
            joined
              ? 'bg-[#5DBB63]/20 border border-[#5DBB63]/40 text-[#8ee594] hover:bg-[#5DBB63]/30'
              : !isMember || isFull
              ? 'bg-[#141415] text-[#8E8B87] border border-[#42403B] cursor-not-allowed'
              : 'bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] shadow-md shadow-[#EA9B28]/20'
          }`}
        >
          {joined ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Terdaftar (Klik untuk Batal)</span>
            </>
          ) : !isMember ? (
            <span>Gabung Chapter untuk RSVP</span>
          ) : isFull ? (
            <span>Kuota Telah Penuh</span>
          ) : (
            <>
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Ikut Kegiatan Ini</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
