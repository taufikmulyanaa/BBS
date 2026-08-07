'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Chapter, supabase } from '@/lib/supabase';
import { MapPin, Users, ArrowRight, Clock, Check } from 'lucide-react';

type Props = {
  chapter: Chapter;
  currentUser?: any;
};

export default function ChapterCard({ chapter, currentUser }: Props) {
  const [memberCount, setMemberCount] = useState(0);
  const [myStatus, setMyStatus] = useState<'pending' | 'aktif' | 'ditolak' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from('chapter_members')
        .select('*', { count: 'exact', head: true })
        .eq('chapter_id', chapter.id)
        .eq('status', 'aktif');
      setMemberCount(count || 0);

      if (currentUser) {
        const { data } = await supabase
          .from('chapter_members')
          .select('status')
          .eq('chapter_id', chapter.id)
          .eq('user_id', currentUser.id)
          .maybeSingle();
        setMyStatus(data?.status || null);
      }
    };
    load();
  }, [chapter.id, currentUser]);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;

    setLoading(true);
    try {
      if (myStatus === 'ditolak') {
        await supabase.from('chapter_members').delete().match({ chapter_id: chapter.id, user_id: currentUser.id });
      }
      const { error } = await supabase.from('chapter_members').insert([
        { chapter_id: chapter.id, user_id: currentUser.id, role: 'member', status: 'pending' },
      ]);
      if (error) throw error;
      setMyStatus('pending');
    } catch (err) {
      console.error('Error requesting to join chapter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;

    setLoading(true);
    try {
      await supabase.from('chapter_members').delete().match({ chapter_id: chapter.id, user_id: currentUser.id });
      setMyStatus(null);
    } catch (err) {
      console.error('Error cancelling join request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={`/chapter/${chapter.slug}`}
      className="bg-[#262626] border border-[#333333] hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all shadow-lg flex flex-col group"
    >
      <div className="h-32 bg-[#1A1A1A] relative overflow-hidden">
        {chapter.cover_image_url ? (
          <img src={chapter.cover_image_url} alt={chapter.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-10 h-10 text-amber-500/30" />
          </div>
        )}
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{chapter.kota}</span>
          </div>
          <h3 className="font-heading font-extrabold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug">
            {chapter.nama}
          </h3>
          {chapter.deskripsi && (
            <p className="text-xs text-gray-400 line-clamp-2">{chapter.deskripsi}</p>
          )}
        </div>

        <div className="pt-3 border-t border-[#333333] flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-gray-400">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-white">{memberCount}</span>
            <span>Anggota</span>
          </div>

          {!currentUser ? (
            <span className="text-[11px] text-amber-400 font-bold flex items-center space-x-1">
              <span>Lihat Chapter</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          ) : myStatus === 'aktif' ? (
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#5DBB63]/20 border border-[#5DBB63]/40 text-[#8ee594] flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Anggota</span>
            </span>
          ) : myStatus === 'pending' ? (
            <button
              onClick={handleCancelRequest}
              disabled={loading}
              className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#EA9B28]/20 border border-[#EA9B28]/40 text-[#F7C56A] flex items-center space-x-1 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition"
              title="Batalkan permintaan"
            >
              <Clock className="w-3 h-3" />
              <span>Menunggu</span>
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition disabled:opacity-50"
            >
              {myStatus === 'ditolak' ? 'Ajukan Lagi' : 'Gabung'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
