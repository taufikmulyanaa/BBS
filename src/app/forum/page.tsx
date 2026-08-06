'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, AlertTriangle, Filter } from 'lucide-react';
import { ForumPost } from '@/lib/supabase';
import { INITIAL_FORUM_POSTS } from '@/lib/mockData';
import ForumPostCard from '@/components/ForumPostCard';
import CreatePostModal from '@/components/CreatePostModal';

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);
  const [activeTab, setActiveTab] = useState<'all' | 'diskusi' | 'laporan_kondisi'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreatePost = (newPost: ForumPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'all') return true;
    return post.tipe === activeTab;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs text-[#EA9B28] font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Forum Diskusi Rute</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#F5F5F5]">
            Ruang Diskusi & Laporan Jalan
          </h1>
          <p className="text-sm text-[#B9BEC3]">
            Tanya jawab seputar jalur gowes, rekomendasi warung kopi, dan update perbaikan jalan real-time.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#EA9B28]/20 flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Tulis Post Forum</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#42403B] space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-[#EA9B28] text-[#EA9B28]'
              : 'border-transparent text-[#8E8B87] hover:text-[#F5F5F5]'
          }`}
        >
          Semua Topik
        </button>
        <button
          onClick={() => setActiveTab('diskusi')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'diskusi'
              ? 'border-[#EA9B28] text-[#EA9B28]'
              : 'border-transparent text-[#8E8B87] hover:text-[#F5F5F5]'
          }`}
        >
          Diskusi Rute
        </button>
        <button
          onClick={() => setActiveTab('laporan_kondisi')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'laporan_kondisi'
              ? 'border-[#D9534F] text-[#ff9996]'
              : 'border-transparent text-[#8E8B87] hover:text-[#F5F5F5]'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-[#D9534F]" />
          <span>Laporan Kondisi Jalan</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <ForumPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Create Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreatePost}
      />
    </div>
  );
}
