'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  MapPin,
  MessageSquare,
  Calendar,
  Shield,
  Plus,
  Check,
  X as XIcon,
  Clock,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
} from 'lucide-react';
import { supabase, Chapter, ChapterMember, ChapterEvent, ForumPost } from '@/lib/supabase';
import ForumPostCard from '@/components/ForumPostCard';
import CreateForumPostModal from '@/components/CreateForumPostModal';
import EditForumPostModal from '@/components/EditForumPostModal';
import ChapterEventCard from '@/components/ChapterEventCard';
import CreateChapterEventModal from '@/components/CreateChapterEventModal';

type MemberRow = ChapterMember & { nama_lengkap?: string; foto_profil_url?: string };

export default function ChapterDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [globalAdmin, setGlobalAdmin] = useState(false);
  const [myMembership, setMyMembership] = useState<ChapterMember | null>(null);
  const [memberCount, setMemberCount] = useState(0);

  const [activeTab, setActiveTab] = useState<'forum' | 'kalender' | 'anggota' | 'admin'>('forum');

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);

  const [events, setEvents] = useState<ChapterEvent[]>([]);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  const [activeMembers, setActiveMembers] = useState<MemberRow[]>([]);
  const [pendingMembers, setPendingMembers] = useState<MemberRow[]>([]);

  const isChapterAdmin = globalAdmin || (myMembership?.role === 'admin' && myMembership?.status === 'aktif');
  const isChapterMember = globalAdmin || myMembership?.status === 'aktif';

  const fetchChapter = useCallback(async () => {
    const { data } = await supabase.from('chapters').select('*').eq('slug', slug).maybeSingle();
    if (!data) {
      setNotFound(true);
      setLoading(false);
      return null;
    }
    setChapter(data);
    setLoading(false);
    return data as Chapter;
  }, [slug]);

  const fetchMemberCount = useCallback(async (chapterId: string) => {
    const { count } = await supabase
      .from('chapter_members')
      .select('*', { count: 'exact', head: true })
      .eq('chapter_id', chapterId)
      .eq('status', 'aktif');
    setMemberCount(count || 0);
  }, []);

  const fetchMyMembership = useCallback(async (chapterId: string, userId: string) => {
    const { data } = await supabase
      .from('chapter_members')
      .select('*')
      .eq('chapter_id', chapterId)
      .eq('user_id', userId)
      .maybeSingle();
    setMyMembership(data);
  }, []);

  const fetchPosts = useCallback(async (chapterId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles:user_id(nama_lengkap, foto_profil_url), forum_comments(count)')
      .eq('chapter_id', chapterId)
      .order('created_at', { ascending: false });
    if (data) {
      const formatted = data.map((p: any) => ({
        ...p,
        comment_count: p.forum_comments?.[0]?.count || 0,
        author_name: p.profiles?.nama_lengkap || 'Anggota Gowes',
        author_avatar: p.profiles?.foto_profil_url || '',
      }));
      setPosts(formatted);
    }
  }, []);

  const fetchEvents = useCallback(async (chapterId: string) => {
    const { data } = await supabase
      .from('chapter_events')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('tanggal_waktu', { ascending: true });
    if (data) setEvents(data);
  }, []);

  const fetchMembers = useCallback(async (chapterId: string) => {
    const { data } = await supabase
      .from('chapter_members')
      .select('*, profiles:user_id(nama_lengkap, foto_profil_url)')
      .eq('chapter_id', chapterId)
      .order('requested_at', { ascending: false });
    if (data) {
      const formatted: MemberRow[] = data.map((m: any) => ({
        ...m,
        nama_lengkap: m.profiles?.nama_lengkap || 'Anggota Gowes',
        foto_profil_url: m.profiles?.foto_profil_url || '',
      }));
      setActiveMembers(formatted.filter((m) => m.status === 'aktif'));
      setPendingMembers(formatted.filter((m) => m.status === 'pending'));
    }
  }, []);

  useEffect(() => {
    (async () => {
      const chapterData = await fetchChapter();
      if (!chapterData) return;

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') setGlobalAdmin(true);
        await fetchMyMembership(chapterData.id, user.id);
      }

      await Promise.all([
        fetchMemberCount(chapterData.id),
        fetchPosts(chapterData.id),
        fetchEvents(chapterData.id),
        fetchMembers(chapterData.id),
      ]);
    })();
  }, [slug]);

  const handleJoin = async () => {
    if (!currentUser || !chapter) return;
    try {
      if (myMembership?.status === 'ditolak') {
        await supabase.from('chapter_members').delete().match({ chapter_id: chapter.id, user_id: currentUser.id });
      }
      const { error } = await supabase.from('chapter_members').insert([
        { chapter_id: chapter.id, user_id: currentUser.id, role: 'member', status: 'pending' },
      ]);
      if (error) throw error;
      await fetchMyMembership(chapter.id, currentUser.id);
    } catch (err) {
      console.error('Error requesting to join:', err);
    }
  };

  const handleLeaveOrCancel = async () => {
    if (!currentUser || !chapter) return;
    if (myMembership?.status === 'aktif' && !confirm('Keluar dari chapter ini?')) return;
    try {
      await supabase.from('chapter_members').delete().match({ chapter_id: chapter.id, user_id: currentUser.id });
      setMyMembership(null);
      await fetchMemberCount(chapter.id);
      await fetchMembers(chapter.id);
    } catch (err) {
      console.error('Error leaving chapter:', err);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!chapter || !currentUser) return;
    try {
      const { error } = await supabase
        .from('chapter_members')
        .update({ status: 'aktif', decided_at: new Date().toISOString(), decided_by: currentUser.id })
        .match({ chapter_id: chapter.id, user_id: userId });
      if (error) throw error;
      await Promise.all([fetchMembers(chapter.id), fetchMemberCount(chapter.id)]);
    } catch (err) {
      console.error('Error approving member:', err);
    }
  };

  const handleReject = async (userId: string) => {
    if (!chapter || !currentUser) return;
    try {
      const { error } = await supabase
        .from('chapter_members')
        .update({ status: 'ditolak', decided_at: new Date().toISOString(), decided_by: currentUser.id })
        .match({ chapter_id: chapter.id, user_id: userId });
      if (error) throw error;
      await fetchMembers(chapter.id);
    } catch (err) {
      console.error('Error rejecting member:', err);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (!chapter) return;
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (!confirm(`Ubah role anggota ini menjadi ${newRole.toUpperCase()}?`)) return;
    try {
      const { error } = await supabase.from('chapter_members').update({ role: newRole }).match({ chapter_id: chapter.id, user_id: userId });
      if (error) throw error;
      await fetchMembers(chapter.id);
    } catch (err) {
      console.error('Error updating member role:', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!chapter) return;
    if (!confirm('Keluarkan anggota ini dari chapter?')) return;
    try {
      const { error } = await supabase.from('chapter_members').delete().match({ chapter_id: chapter.id, user_id: userId });
      if (error) throw error;
      await Promise.all([fetchMembers(chapter.id), fetchMemberCount(chapter.id)]);
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Hapus postingan ini secara permanen?')) return;
    try {
      const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-sm">Memuat chapter...</div>;
  }

  if (notFound || !chapter) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Users className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
        <h1 className="text-white font-bold text-lg">Chapter Tidak Ditemukan</h1>
        <Link href="/chapter" className="inline-flex items-center space-x-1.5 text-amber-400 text-sm font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Chapter</span>
        </Link>
      </div>
    );
  }

  const tabs: { id: 'forum' | 'kalender' | 'anggota' | 'admin'; label: string; icon: React.ElementType }[] = [
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'kalender', label: 'Kalender Kegiatan', icon: Calendar },
    { id: 'anggota', label: 'Anggota', icon: Users },
    ...(isChapterAdmin ? [{ id: 'admin' as const, label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-[#262626] border border-[#333333] rounded-2xl overflow-hidden">
        <div className="h-36 sm:h-44 bg-[#1A1A1A] relative">
          {chapter.cover_image_url ? (
            <img src={chapter.cover_image_url} alt={chapter.nama} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-12 h-12 text-amber-500/30" />
            </div>
          )}
        </div>
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{chapter.kota}</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">{chapter.nama}</h1>
              <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-white">{memberCount}</span>
                <span>Anggota Aktif</span>
              </div>
            </div>

            {currentUser && !globalAdmin && (
              <div>
                {myMembership?.status === 'aktif' ? (
                  <button
                    onClick={handleLeaveOrCancel}
                    className="text-xs font-bold px-4 py-2.5 rounded-lg bg-[#5DBB63]/20 border border-[#5DBB63]/40 text-[#8ee594] hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Anggota Aktif</span>
                  </button>
                ) : myMembership?.status === 'pending' ? (
                  <button
                    onClick={handleLeaveOrCancel}
                    className="text-xs font-bold px-4 py-2.5 rounded-lg bg-[#EA9B28]/20 border border-[#EA9B28]/40 text-[#F7C56A] hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition flex items-center space-x-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Menunggu Persetujuan (Batalkan)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    className="text-sm font-bold px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition"
                  >
                    {myMembership?.status === 'ditolak' ? 'Ajukan Lagi' : 'Gabung Chapter'}
                  </button>
                )}
              </div>
            )}
          </div>

          {chapter.deskripsi && <p className="text-sm text-gray-400 max-w-2xl">{chapter.deskripsi}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center space-x-2 ${
                activeTab === tab.id ? 'bg-amber-500 text-black' : 'bg-[#262626] text-gray-400 hover:text-amber-400 hover:bg-[#333333] border border-[#333333]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'admin' && pendingMembers.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'admin' ? 'bg-black text-amber-500' : 'bg-red-500 text-white'}`}>
                  {pendingMembers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Forum Tab */}
      {activeTab === 'forum' && (
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <div
            onClick={() => (isChapterMember ? setIsCreatePostOpen(true) : undefined)}
            className={`flex items-center space-x-4 p-4 border border-[#333333] rounded-xl bg-[#262626] ${isChapterMember ? 'cursor-text group' : 'opacity-60 cursor-not-allowed'}`}
          >
            <div className="text-gray-500 text-sm flex-1">
              {isChapterMember ? 'Mulai diskusi khusus chapter ini...' : 'Gabung chapter untuk mulai diskusi'}
            </div>
            {isChapterMember && (
              <button className="bg-[#1A1A1A] group-hover:bg-[#333333] text-white font-bold text-xs px-4 py-2 rounded-full transition-colors border border-[#444444]">
                Posting
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-[#262626] border border-[#333333] rounded-2xl space-y-2">
              <MessageSquare className="w-8 h-8 text-amber-500 mx-auto opacity-80" />
              <p className="text-xs text-gray-400">Belum ada postingan di forum chapter ini.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#333333] bg-[#181818] border border-[#333333] rounded-xl overflow-hidden">
              {posts.map((post) => (
                <ForumPostCard key={post.id} post={post} onEdit={(p) => setEditingPost(p)} onDelete={handleDeletePost} currentUser={currentUser} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kalender Tab */}
      {activeTab === 'kalender' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {isChapterMember && (
              <button
                onClick={() => setIsCreateEventOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Kegiatan</span>
              </button>
            )}
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 bg-[#262626] border border-[#333333] rounded-2xl space-y-3">
              <Calendar className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
              <h3 className="text-white font-bold text-base">Belum Ada Kegiatan Terjadwal</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">Open ride, kopdar, atau kegiatan chapter lainnya akan muncul di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => (
                <ChapterEventCard
                  key={event.id}
                  event={event}
                  currentUser={currentUser}
                  isMember={isChapterMember}
                  canManage={isChapterAdmin || currentUser?.id === event.dibuat_oleh}
                  onChanged={() => fetchEvents(chapter.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Anggota Tab */}
      {activeTab === 'anggota' && (
        <div className="bg-[#262626] border border-[#333333] rounded-2xl p-5 space-y-2">
          {activeMembers.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">Belum ada anggota aktif di chapter ini.</p>
          ) : (
            activeMembers.map((m) => (
              <div key={m.user_id} className="bg-[#1A1A1A] border border-[#333333] p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                    {m.foto_profil_url ? (
                      <img src={m.foto_profil_url} alt={m.nama_lengkap} className="w-full h-full object-cover" />
                    ) : (
                      m.nama_lengkap?.charAt(0).toUpperCase() || 'A'
                    )}
                  </div>
                  <span className="text-sm text-white font-semibold">{m.nama_lengkap}</span>
                </div>
                {m.role === 'admin' && (
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Admin Chapter</span>
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Admin Tab */}
      {activeTab === 'admin' && isChapterAdmin && (
        <div className="space-y-6">
          {/* Pending Requests */}
          <div className="bg-[#262626] border border-[#333333] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Permintaan Bergabung</span>
              </h3>
              {pendingMembers.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingMembers.length} Baru</span>
              )}
            </div>

            {pendingMembers.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Tidak ada permintaan bergabung yang menunggu.</p>
            ) : (
              <div className="space-y-2">
                {pendingMembers.map((m) => (
                  <div key={m.user_id} className="bg-[#1A1A1A] border border-[#333333] p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {m.foto_profil_url ? (
                          <img src={m.foto_profil_url} alt={m.nama_lengkap} className="w-full h-full object-cover" />
                        ) : (
                          m.nama_lengkap?.charAt(0).toUpperCase() || 'A'
                        )}
                      </div>
                      <span className="text-sm text-white font-semibold">{m.nama_lengkap}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApprove(m.user_id)}
                        className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black transition"
                        title="Setujui"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(m.user_id)}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition"
                        title="Tolak"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manage Active Members */}
          <div className="bg-[#262626] border border-[#333333] rounded-2xl p-5 sm:p-6 space-y-4">
            <h3 className="font-heading font-bold text-base text-white flex items-center space-x-2 border-b border-[#333333] pb-3">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Kelola Anggota Aktif</span>
            </h3>

            {activeMembers.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada anggota aktif.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {activeMembers.map((m) => (
                  <div key={m.user_id} className="bg-[#1A1A1A] border border-[#333333] p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {m.foto_profil_url ? (
                          <img src={m.foto_profil_url} alt={m.nama_lengkap} className="w-full h-full object-cover" />
                        ) : (
                          m.nama_lengkap?.charAt(0).toUpperCase() || 'A'
                        )}
                      </div>
                      <div>
                        <span className="text-sm text-white font-semibold block">{m.nama_lengkap}</span>
                        {m.role === 'admin' && <span className="text-[10px] text-amber-400 font-bold">Admin Chapter</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleRole(m.user_id, m.role)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition flex items-center space-x-1"
                      >
                        {m.role === 'admin' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
                        <span>{m.role === 'admin' ? 'Cabut Admin' : 'Jadikan Admin'}</span>
                      </button>
                      <button
                        onClick={() => handleRemoveMember(m.user_id)}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                        title="Keluarkan dari Chapter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateForumPostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSuccess={() => fetchPosts(chapter.id)}
        currentUser={currentUser}
        chapterId={chapter.id}
      />

      <EditForumPostModal
        isOpen={editingPost !== null}
        onClose={() => setEditingPost(null)}
        onSuccess={() => fetchPosts(chapter.id)}
        post={editingPost}
        currentUser={currentUser}
      />

      <CreateChapterEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onSuccess={() => fetchEvents(chapter.id)}
        currentUser={currentUser}
        chapterId={chapter.id}
      />
    </div>
  );
}
