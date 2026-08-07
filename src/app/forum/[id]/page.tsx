'use client';

import React, { useState, useEffect } from 'react';
import { supabase, ForumPost } from '@/lib/supabase';
import ForumPostCard from '@/components/ForumPostCard';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function ForumPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const postId = unwrappedParams.id;

  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    const fetchPost = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const localAvatar = user && typeof window !== 'undefined' ? localStorage.getItem(`bbs_avatar_${user.id}`) : null;

        const { data, error } = await supabase
          .from('forum_posts')
          .select('*, profiles:user_id(nama_lengkap, foto_profil_url)')
          .eq('id', postId)
          .single();

        if (error) throw error;
        if (data) {
          let itemTipe = data.tipe;
          const text = `${data.judul || ''} ${data.isi || ''}`.toLowerCase();
          if (text.includes('[warkop]') || text.includes('warkop') || text.includes('warung kopi')) {
            itemTipe = 'rekomendasi_warkop';
          }

          const isUserAuthor = user && data.user_id === user.id;
          const avatarUrl = isUserAuthor
            ? (localAvatar || data.profiles?.foto_profil_url || user.user_metadata?.custom_avatar || user.user_metadata?.avatar_url || '')
            : (data.profiles?.foto_profil_url || '');

          setPost({
            ...data,
            tipe: itemTipe,
            author_name: data.profiles?.nama_lengkap || 'Anggota Gowes',
            author_avatar: avatarUrl,
          });
        }
      } catch (err) {
        console.error('Error fetching forum post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Memuat detail postingan...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Postingan Tidak Ditemukan</h2>
        <p className="text-gray-400">Postingan yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
        <Link href="/forum" className="inline-block mt-4 text-amber-400 hover:underline">
          Kembali ke Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-4 py-4 sm:py-8 space-y-4">
      {/* Header / Back Navigation */}
      <div className="px-4 flex items-center space-x-3 mb-2">
        <Link href="/forum" className="p-2 -ml-2 rounded-full hover:bg-[#262626] text-gray-300 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading font-extrabold text-xl text-white">
          Thread Diskusi
        </h1>
      </div>

      {/* Detail Post Card */}
      <div className="bg-[#1A1A1A] sm:border sm:border-[#333333] sm:rounded-2xl overflow-hidden shadow-2xl">
        <ForumPostCard 
          post={post} 
          currentUser={currentUser} 
          isDetailView={true}
        />
      </div>
    </div>
  );
}
