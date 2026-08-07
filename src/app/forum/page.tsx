'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, AlertTriangle, Coffee } from 'lucide-react';
import { supabase, ForumPost } from '@/lib/supabase';
import ForumPostCard from '@/components/ForumPostCard';
import CreateForumPostModal from '@/components/CreateForumPostModal';
import EditForumPostModal from '@/components/EditForumPostModal';

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'diskusi' | 'laporan_jalan' | 'rekomendasi_warkop' | 'jual_beli' | 'event' | 'tips' | 'bengkel'>('all');
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
        .select('*, profiles:user_id(nama_lengkap, foto_profil_url), forum_comments(count)')
        .order('created_at', { ascending: false });
      if (data) {
        const formatted = data.map((p: any) => {
          let itemTipe = p.tipe;
          const text = `${p.judul || ''} ${p.isi || ''}`.toLowerCase();
          if (text.includes('[warkop]') || text.includes('warkop') || text.includes('warung kopi')) {
            itemTipe = 'rekomendasi_warkop';
          } else if (text.includes('[jual_beli]')) {
            itemTipe = 'jual_beli';
          } else if (text.includes('[event]')) {
            itemTipe = 'event';
          } else if (text.includes('[tips]')) {
            itemTipe = 'tips';
          } else if (text.includes('[bengkel]')) {
            itemTipe = 'bengkel';
          }

          const isUserAuthor = user && p.user_id === user.id;
          const avatarUrl = isUserAuthor
            ? (localAvatar || p.profiles?.foto_profil_url || user.user_metadata?.custom_avatar || user.user_metadata?.avatar_url || '')
            : (p.profiles?.foto_profil_url || '');

          return {
            ...p,
            comment_count: p.forum_comments?.[0]?.count || 0,
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

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus postingan ini secara permanen?')) return;
    try {
      const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Gagal menghapus postingan.');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'laporan_jalan') {
      return post.tipe === 'laporan_jalan' || post.tipe === 'laporan_kondisi';
    }
    return post.tipe === activeTab;
  });

  const localAvatar = currentUser && typeof window !== 'undefined' ? localStorage.getItem(`bbs_avatar_${currentUser.id}`) : null;
  const avatarUrl = localAvatar || currentUser?.user_metadata?.custom_avatar || currentUser?.user_metadata?.avatar_url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header aligned with content */}
      <div className="max-w-2xl mx-auto w-full">
        <div className="pb-4 mb-2 flex flex-col space-y-4">
          <h1 className="font-bold text-2xl text-white">
            Forum Diskusi
          </h1>
          
          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'diskusi', label: 'Diskusi' },
              { id: 'laporan_jalan', label: 'Laporan Jalan' },
              { id: 'rekomendasi_warkop', label: 'Warkop' },
              { id: 'jual_beli', label: 'Jual Beli' },
              { id: 'event', label: 'Event' },
              { id: 'tips', label: 'Tips' },
              { id: 'bengkel', label: 'Bengkel' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#262626] text-gray-400 hover:bg-[#333333] hover:text-white border border-[#333333]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
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
        <div className="max-w-2xl mx-auto w-full">
          {/* Inline Create Trigger */}
          <div 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-4 p-4 border-b border-[#333333] cursor-text group"
          >
            <div className="w-10 h-10 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center font-bold shrink-0 overflow-hidden text-amber-500">
              {avatarUrl ? (
                <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'P'}</span>
              )}
            </div>
            <div className="text-gray-500 text-sm flex-1 group-hover:text-gray-400 transition-colors">
              Mulai diskusi atau lapor kondisi jalan...
            </div>
            <button className="bg-[#262626] group-hover:bg-[#333333] text-white font-bold text-xs px-4 py-2 rounded-full transition-colors border border-[#444444]">
              Posting
            </button>
          </div>

          <div className="flex flex-col divide-y divide-[#333333]">
            {filteredPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                onEdit={(p) => setEditingPost(p)}
                onDelete={handleDeletePost}
                currentUser={currentUser}
              />
            ))}
          </div>
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

