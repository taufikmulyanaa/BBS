'use client';

import React, { useState, useEffect } from 'react';
import { ForumPost, supabase } from '@/lib/supabase';
import { Heart, MessageSquare, AlertTriangle, Share2, MapPin, Send, MessageCircle, Edit3 } from 'lucide-react';

type Props = {
  post: ForumPost;
  onLike?: (postId: string) => void;
  onEdit?: (post: ForumPost) => void;
  currentUser?: any;
};

type CommentItem = {
  id: string;
  author_name: string;
  author_avatar?: string;
  isi: string;
  created_at: string;
};

export default function ForumPostCard({ post, onLike, onEdit, currentUser }: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.like_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsCount, setCommentsCount] = useState(post.comment_count || 0);
  const [submittingComment, setSubmittingComment] = useState(false);

  const isAuthor =
    currentUser &&
    ((post.user_id && currentUser.id === post.user_id) ||
      (post.author_id && currentUser.id === post.author_id));

  useEffect(() => {
    if (currentUser) {
      // Check if current user liked this post
      supabase
        .from('forum_likes')
        .select('*')
        .match({ post_id: post.id, user_id: currentUser.id })
        .then(({ data }) => {
          if (data && data.length > 0) setLiked(true);
        });
    }
  }, [currentUser, post.id]);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Silakan masuk terlebih dahulu untuk menyukai postingan.');
      return;
    }

    try {
      if (liked) {
        await supabase
          .from('forum_likes')
          .delete()
          .match({ post_id: post.id, user_id: currentUser.id });

        setLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('forum_likes')
          .insert([{ post_id: post.id, user_id: currentUser.id }]);

        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }

      if (onLike) onLike(post.id);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('forum_comments')
      .select('*, profiles:user_id(nama_lengkap, foto_profil_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (data) {
      const formatted = data.map((c: any) => ({
        id: c.id,
        author_name: c.profiles?.nama_lengkap || 'Anggota Gowes',
        author_avatar: c.profiles?.foto_profil_url || '',
        isi: c.isi,
        created_at: c.created_at,
      }));
      setComments(formatted);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) {
      alert('Silakan masuk terlebih dahulu untuk menulis komentar.');
      return;
    }

    setSubmittingComment(true);

    try {
      const authorName =
        currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Anggota Gowes';

      const { data, error } = await supabase.from('forum_comments').insert([
        {
          post_id: post.id,
          user_id: currentUser.id,
          isi: newComment.trim(),
        },
      ]).select();

      if (error) throw error;

      if (data && data[0]) {
        setComments((prev) => [
          ...prev,
          {
            id: data[0].id,
            author_name: authorName,
            isi: data[0].isi,
            created_at: data[0].created_at,
          },
        ]);
        setCommentsCount((prev) => prev + 1);
      }
      setNewComment('');
    } catch (err) {
      console.error('Error sending comment:', err);
    } finally {
      setSubmittingComment(false);
    }
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

  const localAvatar = currentUser && typeof window !== 'undefined' ? localStorage.getItem(`bbs_avatar_${currentUser.id}`) : null;
  const authorAvatar = isAuthor
    ? (localAvatar || post.author_avatar || currentUser?.user_metadata?.custom_avatar)
    : post.author_avatar;

  return (
    <div className="bg-[#262626] border border-[#333333] hover:border-amber-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-md">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold overflow-hidden flex items-center justify-center border border-amber-500/40 shrink-0">
            {authorAvatar ? (
              <img src={authorAvatar} alt={post.author_name} className="w-full h-full object-cover" />
            ) : (
              <span>{post.author_name?.charAt(0).toUpperCase() || 'P'}</span>
            )}
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white">{post.author_name || 'Bapak Sepeda'}</h4>
            <span suppressHydrationWarning className="text-[11px] text-gray-400">
              {getTimeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {/* Post Type Badge & Edit Button */}
        <div className="flex items-center space-x-2">
          {(isAuthor || onEdit) && (
            <button
              type="button"
              onClick={() => onEdit && onEdit(post)}
              className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-amber-500 hover:text-black text-amber-400 border border-[#333333] transition"
              title="Edit / Hapus Post"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {post.tipe === 'laporan_jalan' || post.tipe === 'laporan_kondisi' ? (
            <span className="bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Laporan Jalan</span>
            </span>
          ) : post.tipe === 'rekomendasi_warkop' ? (
            <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              ☕ Rekomendasi Warkop
            </span>
          ) : (
            <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              Diskusi Rute
            </span>
          )}
        </div>
      </div>

      {/* Linked Location/Route info if present */}
      {post.lokasi_patokan && (
        <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 bg-[#1A1A1A] border border-[#333333] px-2.5 py-1 rounded-md">
          <MapPin className="w-3.5 h-3.5" />
          <span>Lokasi: {post.lokasi_patokan}</span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-1.5">
        <h3 className="font-heading font-extrabold text-base text-white leading-snug">
          {post.judul}
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
          {post.isi}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#333333] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1.5 transition-colors ${
              liked ? 'text-red-500' : 'hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="font-bold">{likesCount}</span>
          </button>

          <button
            onClick={handleToggleComments}
            className="flex items-center space-x-1.5 hover:text-white transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>{commentsCount} Komentar</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: post.judul, text: post.isi, url: window.location.href });
            }
          }}
          className="p-1.5 rounded-lg hover:bg-[#1A1A1A] hover:text-white transition-colors"
          title="Bagikan"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-[#333333] space-y-3 animate-fade-in">
          <h4 className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Komentar Komunitas ({comments.length})</span>
          </h4>

          {comments.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment.id} className="p-2.5 bg-[#1A1A1A] rounded-xl border border-[#333333] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{comment.author_name}</span>
                    <span suppressHydrationWarning className="text-[10px] text-gray-500">
                      {getTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-snug">{comment.isi}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleSendComment} className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              placeholder={currentUser ? 'Tulis komentar...' : 'Masuk untuk berkomentar'}
              disabled={!currentUser || submittingComment}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!currentUser || submittingComment || !newComment.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-black p-2 rounded-lg font-bold transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
