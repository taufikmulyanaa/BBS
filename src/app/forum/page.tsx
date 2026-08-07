'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, AlertTriangle, Coffee } from 'lucide-react';
import { supabase, ForumPost } from '@/lib/supabase';
import ForumPostCard from '@/components/ForumPostCard';
import CreateForumPostModal from '@/components/CreateForumPostModal';
import EditForumPostModal from '@/components/EditForumPostModal';

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'diskusi' | 'laporan_jalan' | 'rekomendasi_warkop'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const localAvatar = user && typeof window !== 'undefined' ? localStorage.getItem(`bbs_avatar_${user.id}`) : null;

      const { data } = await supabase
        .from('forum_posts')
        .select('*, profiles:user_id(nama_lengkap, foto_profil_url)')
        .order('created_at', { ascending: false });
      if (data) {
        const formatted = data.map((p: any) => {
          let itemTipe = p.tipe;
          const text = `${p.judul || ''} ${p.isi || ''}`.toLowerCase();
          if (text.includes('[warkop]') || text.includes('warkop') || text.includes('warung kopi')) {
            itemTipe = 'rekomendasi_warkop';
          }

          const isUserAuthor = user && p.user_id === user.id;
          const avatarUrl = isUserAuthor
            ? (localAvatar || p.profiles?.foto_profil_url || user.user_metadata?.custom_avatar || user.user_metadata?.avatar_url || '')
            : (p.profiles?.foto_profil_url || '');

          return {
            ...p,
            tipe: itemTipe,
            author_name: p.profiles?.nama_lengkap || 'Anggota Gowes',
            author_avatar: avatarUrl,
          };
        });
        setPosts(formatted);
      }
    } catch (err) {
      console.error('Error fetching forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'laporan_jalan') {
      return post.tipe === 'laporan_jalan' || post.tipe === 'laporan_kondisi';
    }
    return post.tipe === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Forum Diskusi Rute</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Ruang Diskusi & Laporan Jalan
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Tanya jawab seputar jalur gowes, rekomendasi warung kopi, dan update perbaikan jalan real-time.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Tulis Post Forum</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#333333] space-x-6 text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Semua Topik
        </button>
        <button
          onClick={() => setActiveTab('laporan_jalan')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'laporan_jalan'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Laporan Kondisi Jalan</span>
        </button>
        <button
          onClick={() => setActiveTab('diskusi')}
          className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'diskusi'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Diskusi Rute & Gear
        </button>
        <button
          onClick={() => setActiveTab('rekomendasi_warkop')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'rekomendasi_warkop'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Coffee className="w-4 h-4 text-amber-400" />
          <span>Info Warkop Gowes</span>
        </button>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Memuat diskusi forum...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-[#262626] border border-[#333333] rounded-2xl space-y-3">
          <MessageSquare className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
          <h3 className="text-white font-bold text-base">Belum Ada Postingan Topik Ini</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Mulai diskusi atau bagikan laporan kondisi jalanan untuk anggota gowes lainnya!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Post Forum</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <ForumPostCard
              key={post.id}
              post={post}
              onEdit={(p) => setEditingPost(p)}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateForumPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPosts}
        currentUser={currentUser}
      />

      {/* Edit & Delete Modal */}
      <EditForumPostModal
        isOpen={editingPost !== null}
        onClose={() => setEditingPost(null)}
        onSuccess={fetchPosts}
        post={editingPost}
        currentUser={currentUser}
      />
    </div>
  );
}

