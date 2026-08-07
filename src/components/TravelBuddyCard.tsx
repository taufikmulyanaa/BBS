'use client';

import React, { useState, useEffect } from 'react';
import { TravelBuddyListing, supabase } from '@/lib/supabase';
import { MapPin, Calendar, Users, Car, CheckCircle2, UserPlus, Trash2 } from 'lucide-react';

type Props = {
  listing: TravelBuddyListing;
  currentUser?: any;
  isAdmin?: boolean;
  onChanged?: () => void;
};

export default function TravelBuddyCard({ listing, currentUser, isAdmin, onChanged }: Props) {
  const [participantsCount, setParticipantsCount] = useState(0);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwner = currentUser && currentUser.id === listing.user_id;
  const isFull = listing.kuota_maks ? participantsCount >= listing.kuota_maks : false;

  const fetchParticipants = async () => {
    const { count } = await supabase
      .from('bike_event_travel_buddy_participants')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id);
    setParticipantsCount(count || 0);

    if (currentUser) {
      const { data } = await supabase
        .from('bike_event_travel_buddy_participants')
        .select('user_id')
        .eq('listing_id', listing.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      setJoined(!!data);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [listing.id, currentUser]);

  const handleToggleJoin = async () => {
    if (!currentUser || isOwner) return;
    setLoading(true);
    try {
      if (joined) {
        await supabase.from('bike_event_travel_buddy_participants').delete().match({ listing_id: listing.id, user_id: currentUser.id });
        setJoined(false);
        setParticipantsCount((prev) => Math.max(0, prev - 1));
      } else {
        if (isFull) return;
        const { error } = await supabase.from('bike_event_travel_buddy_participants').insert([{ listing_id: listing.id, user_id: currentUser.id }]);
        if (error) throw error;
        setJoined(true);
        setParticipantsCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling travel buddy join:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus listing cari teman berangkat ini?')) return;
    try {
      const { error } = await supabase.from('bike_event_travel_buddies').delete().eq('id', listing.id);
      if (error) throw error;
      if (onChanged) onChanged();
    } catch (err) {
      console.error('Error deleting travel buddy listing:', err);
      alert('Gagal menghapus listing.');
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return null;
    try {
      return new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-[#262626] border border-[#333333] rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-bold overflow-hidden flex items-center justify-center shrink-0">
            {listing.author_avatar ? (
              <img src={listing.author_avatar} alt={listing.author_name} className="w-full h-full object-cover" />
            ) : (
              <span>{listing.author_name?.charAt(0).toUpperCase() || 'A'}</span>
            )}
          </div>
          <span className="text-sm text-white font-bold">{listing.author_name || 'Anggota Gowes'}</span>
        </div>
        {(isOwner || isAdmin) && (
          <button onClick={handleDelete} className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-red-500 hover:text-white text-red-400 border border-[#333333] transition" title="Hapus Listing">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2 text-xs text-[#B9BEC3]">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-[#EA9B28] shrink-0 mt-0.5" />
          <span className="font-medium text-[#F5F5F5]">Berangkat dari {listing.titik_berangkat}</span>
        </div>
        {formatDate(listing.tanggal_berangkat) && (
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-[#8E8B87]" />
            <span suppressHydrationWarning>{formatDate(listing.tanggal_berangkat)}</span>
          </div>
        )}
        {listing.moda && (
          <div className="flex items-center space-x-1.5">
            <Car className="w-4 h-4 text-[#8E8B87]" />
            <span>{listing.moda}</span>
          </div>
        )}
        {listing.catatan && (
          <div className="p-3 bg-[#141415] rounded-xl border border-[#42403B] text-[11px] text-[#8E8B87]">
            <p className="line-clamp-3">{listing.catatan}</p>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[#42403B] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-[#EA9B28]" />
            <span className="text-[#8E8B87]">Ikut:</span>
            <span className="font-bold text-[#F5F5F5]">
              {participantsCount}{listing.kuota_maks ? ` / ${listing.kuota_maks}` : ''}
            </span>
          </div>
          {isFull && !joined && (
            <span className="text-[10px] text-[#D9534F] font-bold bg-[#D9534F]/15 px-2 py-0.5 rounded">Kuota Penuh</span>
          )}
        </div>

        {!isOwner && (
          <button
            onClick={handleToggleJoin}
            disabled={loading || !currentUser || (isFull && !joined)}
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
                <span>Ikut (Klik untuk Batal)</span>
              </>
            ) : isFull ? (
              <span>Kuota Telah Penuh</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Ikut Bareng</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
