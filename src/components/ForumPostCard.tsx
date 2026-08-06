'use client';

import React, { useState } from 'react';
import { ForumPost } from '@/lib/supabase';
import { Heart, MessageSquare, AlertTriangle, Share2, MapPin } from 'lucide-react';

type Props = {
  post: ForumPost;
  onLike?: (postId: string) => void;
};

export default function ForumPostCard({ post, onLike }: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.like_count);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    if (onLike) onLike(post.id);
  };

  const getTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Baru saja';
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} hari lalu`;
    } catch (e) {
      return '1 hari lalu';
    }
  };

  return (
    <div className="bg-[#262626] border border-[#333333] hover:border-amber-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-md">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#EA9B28] text-[#141415] font-bold overflow-hidden flex items-center justify-center border border-[#EA9B28]/40">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt={post.author_name} className="w-full h-full object-cover" />
            ) : (
              <span>{post.author_name?.charAt(0) || 'P'}</span>
            )}
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-[#F5F5F5]">{post.author_name || 'Bapak Sepeda'}</h4>
            <span suppressHydrationWarning className="text-[11px] text-[#8E8B87]">{getTimeAgo(post.created_at)}</span>
          </div>
        </div>

        {/* Post Type Badge */}
        {post.tipe === 'laporan_kondisi' ? (
          <span className="bg-[#D9534F]/15 border border-[#D9534F]/30 text-[#ff9996] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Laporan Jalan</span>
          </span>
        ) : (
          <span className="bg-[#EA9B28]/15 border border-[#EA9B28]/30 text-[#F7C56A] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            Diskusi Rute
          </span>
        )}
      </div>

      {/* Linked Route info if present */}
      {post.route_name && (
        <div className="inline-flex items-center space-x-1.5 text-xs text-[#EA9B28] bg-[#141415] border border-[#42403B] px-2.5 py-1 rounded-md">
          <MapPin className="w-3.5 h-3.5" />
          <span>Terkait Rute: {post.route_name}</span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-1.5">
        <h3 className="font-heading font-extrabold text-base text-[#F5F5F5] leading-snug">
          {post.judul}
        </h3>
        <p className="text-xs text-[#B9BEC3] leading-relaxed whitespace-pre-line">
          {post.isi}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#42403B] flex items-center justify-between text-xs text-[#8E8B87]">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1.5 transition-colors ${
              liked ? 'text-[#D9534F]' : 'hover:text-[#F5F5F5]'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="font-bold">{likesCount}</span>
          </button>

          <div className="flex items-center space-x-1.5 hover:text-[#F5F5F5]">
            <MessageSquare className="w-4 h-4 text-[#EA9B28]" />
            <span>{post.comment_count} Komentar</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: post.judul, text: post.isi, url: window.location.href });
            }
          }}
          className="p-1.5 rounded-lg hover:bg-[#141415] hover:text-[#F5F5F5] transition-colors"
          title="Bagikan"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
