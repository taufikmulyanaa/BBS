'use client';

import React, { useState, useEffect } from 'react';
import { ForumPost, supabase } from '@/lib/supabase';
import { Heart, MessageSquare, AlertTriangle, Share2, MapPin, Send, MessageCircle, Edit3, Trash2, Camera, ExternalLink, X, ArrowLeft } from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';
import { useRouter } from 'next/navigation';

type Props = {
  post: ForumPost;
  onLike?: (postId: string) => void;
  onEdit?: (post: ForumPost) => void;
  onDelete?: (postId: string) => void;
  currentUser?: any;
  isDetailView?: boolean;
};

const LocationBadge = ({ lokasi }: { lokasi: string }) => {
  const [placeName, setPlaceName] = useState<string | null>(null);
  
  const match = lokasi.match(/Lat:\s*([-.\d]+),\s*Lng:\s*([-.\d]+)/i);
  const fallbackNameMatch = lokasi.match(/-\s*(.+)$/);
  const fallbackName = fallbackNameMatch ? fallbackNameMatch[1] : 'Memuat peta...';
  
  useEffect(() => {
    if (match) {
      const lat = match[1];
      const lng = match[2];
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.display_name) {
            const parts = data.display_name.split(', ');
            setPlaceName(parts.slice(0, 3).join(', '));
          }
        })
        .catch(err => console.error(err));
    }
  }, [lokasi]);

  if (match) {
    const lat = match[1];
    const lng = match[2];
    return (
      <a 
        href={`https://www.google.com/maps?q=${lat},${lng}`} 
        target="_blank" 
        rel="noreferrer"
        className="inline-flex items-center space-x-1 text-[12px] text-amber-400 hover:text-amber-300 font-semibold mt-1 mb-2 hover:underline bg-amber-500/10 px-2 py-1 rounded-md w-fit"
        onClick={(e) => e.stopPropagation()}
      >
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate max-w-[250px]">{placeName || fallbackName}</span>
      </a>
    );
  }

  return (
    <div className="inline-flex items-center space-x-1 text-[12px] text-amber-400 font-semibold mt-1 mb-2 bg-amber-500/10 px-2 py-1 rounded-md w-fit">
      <MapPin className="w-3 h-3 shrink-0" />
      <span className="truncate max-w-[250px]">{lokasi}</span>
    </div>
  );
};

type CommentItem = {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string;
  isi: string;
  created_at: string;
  parent_comment_id?: string | null;
};

export default function ForumPostCard({ post, onLike, onEdit, onDelete, currentUser, isDetailView = false }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.like_count || 0);
  const [showComments, setShowComments] = useState(isDetailView);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
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

  useEffect(() => {
    if (isDetailView || showComments) {
      loadComments();
    }
  }, [isDetailView, post.id]);

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
        parent_comment_id: c.parent_comment_id,
      }));
      setComments(formatted);
      setCommentsCount(formatted.length);
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
          parent_comment_id: replyingTo,
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
            parent_comment_id: data[0].parent_comment_id,
            author_avatar: localAvatar || currentUser?.user_metadata?.custom_avatar || currentUser?.user_metadata?.avatar_url,
          },
        ]);
        setCommentsCount((prev) => prev + 1);
      }
      setNewComment('');
      setReplyingTo(null);
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
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      const diffHours = Math.floor(diffMins / 60);
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
    <div className="py-4 px-4 hover:bg-white/[0.02] transition-colors">
      <div className="flex space-x-3">
        {/* Left Column: Avatar & Thread Line */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold overflow-hidden flex items-center justify-center shrink-0">
            {authorAvatar ? (
              <img src={authorAvatar} alt={post.author_name} className="w-full h-full object-cover" />
            ) : (
              <span>{post.author_name?.charAt(0).toUpperCase() || 'P'}</span>
            )}
          </div>
          {/* Vertical line connecting to bottom */}
          <div className="w-[1.5px] bg-[#333333] grow mt-2 mb-1" />
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0 pb-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-[15px] text-white hover:underline cursor-pointer">{post.author_name || 'Bapak Sepeda'}</h4>
              <span suppressHydrationWarning className="text-sm text-gray-500">
                {getTimeAgo(post.created_at)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {post.tipe === 'laporan_jalan' || post.tipe === 'laporan_kondisi' ? (
                <span className="text-red-400 text-[10px] font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Laporan Jalan</span>
                </span>
              ) : post.tipe === 'rekomendasi_warkop' ? (
                <span className="text-amber-400 text-[10px] font-bold">
                  ☕ Warkop
                </span>
              ) : null}

              {(isAuthor || isAdmin) && (
                <div className="flex items-center space-x-1 ml-2">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(post)}
                      className="text-gray-500 hover:text-amber-400 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(post.id)}
                      className="text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Linked Location/Route info if present */}
          {post.lokasi_patokan && (
            <LocationBadge lokasi={post.lokasi_patokan} />
          )}

          {/* Text Content */}
          <div 
            className={`mt-1 ${!isDetailView ? 'cursor-pointer group-hover/post:opacity-80 transition' : ''}`}
            onClick={() => {
              if (!isDetailView) router.push(`/forum/${post.id}`);
            }}
          >
            {post.judul && post.judul !== cleanIsiText.slice(0, post.judul.length) && (
               <h3 className="font-bold text-[15px] text-white leading-snug mb-1">
                 {post.judul}
               </h3>
            )}
            <p className="text-[15px] text-white leading-relaxed whitespace-pre-line break-words">
              {cleanIsiText}
            </p>
          </div>

          {/* Photo Attachments Preview Grid */}
          {photoUrls.length > 0 && (
            <div className="mt-3">
              <div className={`grid gap-1 rounded-xl overflow-hidden border border-[#333333] ${photoUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {photoUrls.slice(0, 4).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={`relative group/img bg-[#181818] block overflow-hidden ${photoUrls.length === 1 ? 'max-h-[500px]' : 'aspect-video'}`}
                  >
                    <img 
                      src={url} 
                      alt={`Lampiran ${i + 1}`} 
                      className={`w-full group-hover/img:scale-105 transition ${photoUrls.length === 1 ? 'h-auto max-h-[500px] object-contain mx-auto' : 'h-full object-cover'}`} 
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Minimal Action Buttons (Like Threads) */}
          <div className="flex items-center space-x-4 mt-3 text-gray-500">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 group transition ${liked ? 'text-red-500' : 'hover:text-white'}`}
            >
              <div className={`p-1.5 rounded-full group-hover:bg-white/10 transition ${liked ? 'bg-red-500/10' : ''}`}>
                <Heart className={`w-[18px] h-[18px] ${liked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[13px] font-semibold">{likesCount > 0 ? likesCount : ''}</span>
            </button>

            <button
              onClick={handleToggleComments}
              className={`flex items-center space-x-1.5 group transition ${showComments ? 'text-amber-400' : 'hover:text-white'}`}
            >
              <div className={`p-1.5 rounded-full group-hover:bg-white/10 transition ${showComments ? 'bg-amber-400/10' : ''}`}>
                <MessageSquare className={`w-[18px] h-[18px] ${showComments ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[13px] font-semibold">{commentsCount > 0 ? commentsCount : ''}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.judul, text: post.isi, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Tautan postingan disalin!');
                }
              }}
              className="p-1.5 rounded-full hover:bg-white/10 hover:text-white transition"
            >
              <Share2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pl-12 space-y-2 mt-2 pb-2">
          {comments.length === 0 ? (
            <p className="text-[13px] text-gray-500 pl-3 border-l-2 border-[#333333]">Jadilah yang pertama berkomentar!</p>
          ) : (
            <div className="space-y-4 pr-1">
              {comments.filter(c => !c.parent_comment_id).map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  {/* Parent Comment Avatar */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-black font-bold overflow-hidden flex items-center justify-center shrink-0 text-xs">
                      {comment.author_avatar ? (
                        <img src={comment.author_avatar} alt={comment.author_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{comment.author_name?.charAt(0).toUpperCase() || 'A'}</span>
                      )}
                    </div>
                    {/* Only show line if there are replies */}
                    {comments.some(r => r.parent_comment_id === comment.id) && (
                      <div className="w-[1.5px] bg-[#333333] grow mt-2 mb-1" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[14px] text-white hover:underline cursor-pointer">{comment.author_name}</span>
                      <span suppressHydrationWarning className="text-[12px] text-gray-500">
                        {getTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-[14px] text-gray-300 leading-snug mt-0.5">{comment.isi}</p>
                    <div className="flex items-center space-x-4 mt-1.5 text-gray-500">
                      <button 
                        onClick={() => setReplyingTo(comment.id)} 
                        className="text-[12px] font-bold hover:text-amber-400 transition"
                      >
                        Balas
                      </button>
                      {(comment.user_id === currentUser?.id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="hover:text-red-400 transition"
                          title="Hapus Komentar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Replies */}
                    {comments.some(r => r.parent_comment_id === comment.id) && (
                      <div className="mt-3 space-y-3">
                        {comments.filter(r => r.parent_comment_id === comment.id).map(reply => (
                          <div key={reply.id} className="flex space-x-2">
                            <div className="w-7 h-7 rounded-full bg-blue-500/80 text-white font-bold overflow-hidden flex items-center justify-center shrink-0 text-[10px]">
                              {reply.author_avatar ? (
                                <img src={reply.author_avatar} alt={reply.author_name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{reply.author_name?.charAt(0).toUpperCase() || 'A'}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-[13px] text-white hover:underline cursor-pointer">{reply.author_name}</span>
                                <span suppressHydrationWarning className="text-[11px] text-gray-500">
                                  {getTimeAgo(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-[13px] text-gray-300 leading-snug mt-0.5">{reply.isi}</p>
                              <div className="flex items-center space-x-4 mt-1 text-gray-500">
                                {(reply.user_id === currentUser?.id || isAdmin) && (
                                  <button
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="hover:text-red-400 transition"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <div className="mt-2 pl-[42px]">
            {replyingTo && (
              <div className="flex items-center justify-between bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 mb-2">
                <span className="text-[11px] text-amber-400">
                  Membalas <span className="font-bold">{comments.find(c => c.id === replyingTo)?.author_name}</span>
                </span>
                <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <form onSubmit={handleSendComment} className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center shrink-0 overflow-hidden">
                {localAvatar || currentUser?.user_metadata?.custom_avatar || currentUser?.user_metadata?.avatar_url ? (
                   <img src={localAvatar || currentUser?.user_metadata?.custom_avatar || currentUser?.user_metadata?.avatar_url} alt="You" className="w-full h-full object-cover" />
                ) : (
                   <span className="text-xs text-gray-400 font-bold">{currentUser?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'P'}</span>
                )}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={currentUser ? (replyingTo ? 'Tulis balasan...' : 'Balas postingan ini...') : 'Masuk untuk membalas'}
                  disabled={!currentUser || submittingComment}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-transparent border-b border-[#333333] focus:border-amber-500 px-1 py-1.5 text-[14px] text-white placeholder-gray-500 focus:outline-none transition disabled:opacity-50"
                />
                {newComment.trim().length > 0 && (
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="absolute right-0 top-1.5 text-amber-400 font-bold text-sm hover:text-amber-300"
                  >
                    Kirim
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Login Required Modal */}
      <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        message={loginMessage}
      />
    </div>
  );
}
