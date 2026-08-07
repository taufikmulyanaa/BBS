'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Flag,
  Calendar,
  MapPin,
  Star,
  Link as LinkIcon,
  MessageSquare,
  Users,
  Plus,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { supabase, BikeEvent, ForumPost, TravelBuddyListing } from '@/lib/supabase';
import ForumPostCard from '@/components/ForumPostCard';
import CreateForumPostModal from '@/components/CreateForumPostModal';
import EditForumPostModal from '@/components/EditForumPostModal';
import TravelBuddyCard from '@/components/TravelBuddyCard';
import CreateTravelBuddyModal from '@/components/CreateTravelBuddyModal';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<BikeEvent | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [interested, setInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);

  const [activeTab, setActiveTab] = useState<'diskusi' | 'cari-teman'>('diskusi');

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);

  const [listings, setListings] = useState<TravelBuddyListing[]>([]);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);

  const fetchEvent = useCallback(async () => {
    const { data } = await supabase.from('bike_events').select('*').eq('id', eventId).maybeSingle();
    if (!data) {
      setNotFound(true);
      setLoading(false);
      return null;
    }
    setEvent(data);
    setLoading(false);
    return data as BikeEvent;
  }, [eventId]);

  const fetchInterest = useCallback(async (id: string, userId?: string) => {
    const { count } = await supabase.from('bike_event_interests').select('*', { count: 'exact', head: true }).eq('event_id', id);
    setInterestCount(count || 0);

    if (userId) {
      const { data } = await supabase.from('bike_event_interests').select('user_id').eq('event_id', id).eq('user_id', userId).maybeSingle();
      setInterested(!!data);
    }
  }, []);

  const fetchPosts = useCallback(async (id: string) => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles:user_id(nama_lengkap, foto_profil_url), forum_comments(count)')
      .eq('event_id', id)
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

  const fetchListings = useCallback(async (id: string) => {
    const { data } = await supabase
      .from('bike_event_travel_buddies')
      .select('*, profiles:user_id(nama_lengkap, foto_profil_url)')
      .eq('event_id', id)
      .order('created_at', { ascending: false });
    if (data) {
      const formatted = data.map((l: any) => ({
        ...l,
        author_name: l.profiles?.nama_lengkap || 'Anggota Gowes',
        author_avatar: l.profiles?.foto_profil_url || '',
      }));
      setListings(formatted);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const eventData = await fetchEvent();
      if (!eventData) return;

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') setIsAdmin(true);
      }

      await Promise.all([
        fetchInterest(eventData.id, user?.id),
        fetchPosts(eventData.id),
        fetchListings(eventData.id),
      ]);
    })();
  }, [eventId]);

  const handleToggleInterest = async () => {
    if (!currentUser || !event) return;
    try {
      if (interested) {
        await supabase.from('bike_event_interests').delete().match({ event_id: event.id, user_id: currentUser.id });
        setInterested(false);
        setInterestCount((prev) => Math.max(0, prev - 1));
      } else {
        await supabase.from('bike_event_interests').insert([{ event_id: event.id, user_id: currentUser.id }]);
        setInterested(true);
        setInterestCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling event interest:', err);
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

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400 text-sm">Memuat event...</div>;
  }

  if (notFound || !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Flag className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
        <h1 className="text-white font-bold text-lg">Event Tidak Ditemukan</h1>
        <Link href="/events" className="inline-flex items-center space-x-1.5 text-amber-400 text-sm font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Event</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header / Informasi Event */}
      <div className="bg-[#262626] border border-[#333333] rounded-2xl overflow-hidden">
        <div className="h-40 sm:h-56 bg-[#1A1A1A] relative">
          {event.poster_url ? (
            <img src={event.poster_url} alt={event.judul} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Flag className="w-12 h-12 text-amber-500/30" />
            </div>
          )}
          {event.status !== 'akan_datang' && (
            <span
              className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                event.status === 'selesai' ? 'bg-[#333333]/90 border-[#444444] text-gray-300' : 'bg-[#D9534F]/90 border-[#D9534F] text-white'
              }`}
            >
              {event.status === 'selesai' ? 'Selesai' : 'Dibatalkan'}
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">{event.judul}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span suppressHydrationWarning>
                    {formatDate(event.tanggal_mulai)}
                    {event.tanggal_selesai ? ` – ${formatDate(event.tanggal_selesai)}` : ''}
                  </span>
                </div>
                {event.lokasi && (
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{event.lokasi}</span>
                  </div>
                )}
                {event.penyelenggara && (
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{event.penyelenggara}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleToggleInterest}
                disabled={!currentUser}
                className={`text-xs font-bold px-4 py-2.5 rounded-lg border transition flex items-center space-x-1.5 disabled:opacity-50 ${
                  interested
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300'
                    : 'bg-[#1A1A1A] border-[#333333] text-gray-300 hover:border-amber-500 hover:text-amber-400'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${interested ? 'fill-current' : ''}`} />
                <span>{interested ? 'Tertarik/Akan Ikut' : 'Tandai Tertarik'}</span>
              </button>
              {event.link_pendaftaran && (
                <a
                  href={event.link_pendaftaran}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition flex items-center space-x-1.5"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Daftar di Sini</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-white">{interestCount}</span>
            <span>anggota tertarik/akan ikut</span>
          </div>

          {event.deskripsi && <p className="text-sm text-gray-400 max-w-2xl whitespace-pre-line">{event.deskripsi}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'diskusi', label: 'Diskusi Event', icon: MessageSquare },
            { id: 'cari-teman', label: 'Cari Teman Berangkat', icon: Users },
          ] as const
        ).map((tab) => {
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
            </button>
          );
        })}
      </div>

      {/* Diskusi Event Tab */}
      {activeTab === 'diskusi' && (
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <div
            onClick={() => (currentUser ? setIsCreatePostOpen(true) : undefined)}
            className={`flex items-center space-x-4 p-4 border border-[#333333] rounded-xl bg-[#262626] ${currentUser ? 'cursor-text group' : 'opacity-60 cursor-not-allowed'}`}
          >
            <div className="text-gray-500 text-sm flex-1">
              {currentUser ? 'Mulai diskusi tentang event ini...' : 'Masuk untuk mulai diskusi'}
            </div>
            {currentUser && (
              <button className="bg-[#1A1A1A] group-hover:bg-[#333333] text-white font-bold text-xs px-4 py-2 rounded-full transition-colors border border-[#444444]">
                Posting
              </button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12 bg-[#262626] border border-[#333333] rounded-2xl space-y-2">
              <MessageSquare className="w-8 h-8 text-amber-500 mx-auto opacity-80" />
              <p className="text-xs text-gray-400">Belum ada diskusi untuk event ini.</p>
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

      {/* Cari Teman Berangkat Tab */}
      {activeTab === 'cari-teman' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {currentUser && (
              <button
                onClick={() => setIsCreateListingOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Buat Listing Berangkat</span>
              </button>
            )}
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16 bg-[#262626] border border-[#333333] rounded-2xl space-y-3">
              <Users className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
              <h3 className="text-white font-bold text-base">Belum Ada Listing Teman Berangkat</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">Jadilah yang pertama cari teman berangkat bareng ke event ini!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((listing) => (
                <TravelBuddyCard key={listing.id} listing={listing} currentUser={currentUser} isAdmin={isAdmin} onChanged={() => fetchListings(event.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateForumPostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSuccess={() => fetchPosts(event.id)}
        currentUser={currentUser}
        eventId={event.id}
      />

      <EditForumPostModal
        isOpen={editingPost !== null}
        onClose={() => setEditingPost(null)}
        onSuccess={() => fetchPosts(event.id)}
        post={editingPost}
        currentUser={currentUser}
      />

      <CreateTravelBuddyModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSuccess={() => fetchListings(event.id)}
        currentUser={currentUser}
        eventId={event.id}
      />
    </div>
  );
}
