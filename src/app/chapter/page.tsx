'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { supabase, Chapter } from '@/lib/supabase';
import ChapterCard from '@/components/ChapterCard';
import CreateChapterModal from '@/components/CreateChapterModal';

export default function ChapterPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchChapters = async () => {
    try {
      const { data } = await supabase.from('chapters').select('*').eq('status', 'aktif').order('created_at', { ascending: false });
      if (data) setChapters(data);
    } catch (err) {
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data?.role === 'admin') setIsAdmin(true);
      }
    });

    fetchChapters();
  }, []);

  const filteredChapters = chapters.filter(
    (c) =>
      c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.kota.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Chapter Komunitas</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">Chapter Berdasarkan Kota</h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Gabung sub-komunitas di kotamu untuk forum, kalender kegiatan, dan open ride khusus chapter.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Buat Chapter Baru</span>
          </button>
        )}
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari chapter atau kota..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Memuat daftar chapter...</div>
      ) : filteredChapters.length === 0 ? (
        <div className="text-center py-16 bg-[#262626] border border-[#333333] rounded-2xl space-y-3">
          <Users className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
          <h3 className="text-white font-bold text-base">Belum Ada Chapter</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {isAdmin ? 'Buat chapter pertama untuk komunitas di kotamu!' : 'Chapter untuk kotamu akan segera hadir.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} currentUser={currentUser} />
          ))}
        </div>
      )}

      <CreateChapterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchChapters}
        currentUser={currentUser}
      />
    </div>
  );
}
