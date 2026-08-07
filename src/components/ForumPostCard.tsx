'use client';

import React, { useState, useEffect } from 'react';
import { ForumPost, supabase } from '@/lib/supabase';
import { Heart, MessageSquare, AlertTriangle, Share2, MapPin, Send, MessageCircle, Edit3, Trash2, Camera, ExternalLink } from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';

type Props = {
  post: ForumPost;
  onLike?: (postId: string) => void;
  onEdit?: (post: ForumPost) => void;
  onDelete?: (postId: string) => void;
  currentUser?: any;
};

type CommentItem = {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  isi: string;
  created_at: string;
};

export default function ForumPostCard({ post, onLike, onEdit, onDelete, currentUser }: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.like_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsCount, setCommentsCount] = useState(post.comment_count || 0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  const isAuthor =
    currentUser &&
    ((post.user_id && currentUser.id === post.user_id) ||
      (post.author_id && currentUser.id === post.author_id));

  const [isAdmin, setIsAdmin] = useState(false);

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
        
      // Fetch admin role
      supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()
        .then(({ data }) => {
          if (data?.role === 'admin') setIsAdmin(true);
        });
    }
  }, [currentUser, post.id]);

  const handleLike = async () => {
    if (!currentUser) {
      setLoginMessage('Silakan masuk terlebih dahulu untuk menyukai postingan.');
      setShowLoginModal(true);
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
      const formatted: CommentItem[] = data.map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
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
      setLoginMessage('Silakan masuk terlebih dahulu untuk menulis komentar.');
      setShowLoginModal(true);
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
            user_id: currentUser.id,
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

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      const { error } = await supabase.from('forum_comments').delete().eq('id', commentId);
      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Gagal menghapus komentar.');
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

  // Parse attached photo URLs from post.isi if present
  const extractPhotoUrls = (text: string) => {
    const urls: string[] = [];
    const urlRegex = /(https?:\/\/[^\s]+(?:\.png|\.jpg|\.jpeg|\.webp|\.gif|[^\s]*))/gi;
    const matches = text.match(urlRegex);
    if (matches) {
      matches.forEach((m) => {
        if (m.includes('http') && (m.includes('unsplash') || m.includes('imgur') || m.includes('.jpg') || m.includes('.png') || m.includes('.jpeg') || m.includes('.webp'))) {
          if (!urls.includes(m)) urls.push(m);
        }
      });
    }
    return urls;
  };

  const photoUrls = extractPhotoUrls(post.isi || '');
  const cleanIsiText = (post.isi || '').replace(/📷 Foto Lampiran:[\s\S]*/, '').trim();

  const localAvatar = currentUser && typeof window !== 'undefined' ? localStorage.getItem(`bbs_avatar_${currentUser.id}`) : null;
  const authorAvatar = isAuthor
    ? (localAvatar || post.author_avatar || currentUser?.user_metadata?.custom_avatar)
    : post.author_avatar;

  return (
    <div className="bg-[#262626] border border-[#333333] hover:border-amber-500/50 rounded-2xl p-5 sm:p-6 space-y-4 transition-all shadow-md">
      <div className="space-y-4">
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
            {(isAuthor || isAdmin) && (
              <div className="flex items-center space-x-1">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit && onEdit(post)}
                    className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-amber-500 hover:text-black text-amber-400 border border-[#333333] transition"
                    title="Edit Post"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(post.id)}
                    className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-red-500 hover:text-white text-red-400 border border-[#333333] transition"
                    title="Hapus Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
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
        <div className="space-y-2">
          <h3 className="font-heading font-extrabold text-lg text-white leading-tight">
            {post.judul}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {cleanIsiText}
          </p>

          {/* Photo Attachments Preview Grid */}
          {photoUrls.length > 0 && (
            <div className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photoUrls.slice(0, 5).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="relative aspect-video rounded-lg overflow-hidden border border-[#333333] group/img bg-black/40 block"
                  >
                    <img src={url} alt={`Lampiran ${i + 1}`} className="w-full h-full object-cover group-hover/img:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="space-y-3 pt-3">
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
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Tautan postingan berhasil disalin!');
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
                      <div className="flex items-center space-x-2">
                        <span suppressHydrationWarning className="text-[10px] text-gray-500">
                          {getTimeAgo(comment.created_at)}
                        </span>
                        {(comment.user_id === currentUser?.id || isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-500 hover:text-red-400 transition"
                            title="Hapus Komentar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
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

      {/* Login Required Modal */}
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        message={loginMessage}
      />
    </div>
  );
}
