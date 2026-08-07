'use client';

import React, { useState, useEffect } from 'react';
import { X, Navigation, Mountain, Download, MapPin, CheckCircle, Star, MessageSquare, Send, User, Calendar, Shield, ThumbsUp } from 'lucide-react';
import { supabase, Route } from '@/lib/supabase';
import LeafletMap from './LeafletMap';
import LoginRequiredModal from './LoginRequiredModal';

export type RouteReview = {
  id: string;
  route_id: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  route: Route | null;
  currentUser?: any;
  onReviewAdded?: () => void;
};

const DUMMY_REVIEWS: Record<string, RouteReview[]> = {
  default: [
    {
      id: 'rev-1',
      route_id: 'default',
      user_name: 'Kang Asep Gowes',
      user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Jalur sangat mantap! Pemandangan sawah di km 15 indah sekali. Ada warkop legendaris pisang goreng hangat di pertengahan rute.',
      created_at: '2026-08-01T08:30:00Z',
    },
    {
      id: 'rev-2',
      route_id: 'default',
      user_name: 'Bapak Yudi MTB',
      user_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      rating: 4,
      comment: 'Tanjakannya lumayan bikin betis pegal tapi terbayar dengan turunan mulus. Cocok untuk gowes santai hari Minggu.',
      created_at: '2026-07-28T14:20:00Z',
    },
  ],
};

export default function RouteDetailModal({ isOpen, onClose, route, currentUser, onReviewAdded }: Props) {
  const [reviews, setReviews] = useState<RouteReview[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'info' | 'map' | 'reviews'>('info');

  useEffect(() => {
    if (!route || !isOpen) return;

    const fetchReviews = async () => {
      let loadedReviews: RouteReview[] = [];

      try {
        // Try fetching from Supabase DB table route_reviews
        const { data, error } = await supabase
          .from('route_reviews')
          .select('*')
          .eq('route_id', route.id)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          loadedReviews = data;
        }
      } catch (err) {
        console.error('Error fetching DB reviews:', err);
      }

      // Check localStorage for local cached reviews
      if (typeof window !== 'undefined') {
        try {
          const localData = localStorage.getItem(`bbs_reviews_${route.id}`);
          if (localData) {
            const parsed: RouteReview[] = JSON.parse(localData);
            // Merge with loaded, avoiding duplicates by id
            const existingIds = new Set(loadedReviews.map((r) => r.id));
            parsed.forEach((item) => {
              if (!existingIds.has(item.id)) {
                loadedReviews.unshift(item);
              }
            });
          }
        } catch (e) {
          console.error('Error loading local reviews:', e);
        }
      }

      // If still empty, use sample reviews
      if (loadedReviews.length === 0) {
        loadedReviews = DUMMY_REVIEWS.default.map((rev) => ({
          ...rev,
          route_id: route.id,
        }));
      }

      setReviews(loadedReviews);
    };

    fetchReviews();
  }, [route, isOpen]);

  if (!isOpen || !route) return null;

  const handleDownloadGpx = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (route.gpx_file_url) {
      window.open(route.gpx_file_url, '_blank');
    } else {
      const dummyGpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Bapak-Bapak Sepedahan">
  <trk>
    <name>${route.nama}</name>
    <trkseg>
      <trkpt lat="-6.8915" lon="107.6107"><ele>750</ele></trkpt>
      <trkpt lat="-6.8700" lon="107.6200"><ele>920</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;
      const blob = new Blob([dummyGpxContent], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${route.nama.toLowerCase().replace(/\s+/g, '-')}.gpx`;
      a.click();
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    if (!newComment.trim()) {
      alert('Silakan tulis ulasan singkat Anda.');
      return;
    }

    setSubmitting(true);

    const userName =
      currentUser.user_metadata?.full_name ||
      currentUser.email?.split('@')[0] ||
      'Anggota Gowes';
    const userAvatar =
      currentUser.user_metadata?.custom_avatar ||
      currentUser.user_metadata?.avatar_url ||
      '';

    const newRevObj: RouteReview = {
      id: `rev-${Date.now()}`,
      route_id: route.id,
      user_id: currentUser.id,
      user_name: userName,
      user_avatar: userAvatar,
      rating: newRating,
      comment: newComment.trim(),
      created_at: new Date().toISOString(),
    };

    // Update state immediately
    const updatedList = [newRevObj, ...reviews];
    setReviews(updatedList);

    // Save to localStorage for instant persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`bbs_reviews_${route.id}`, JSON.stringify(updatedList));
      } catch (err) {
        console.error('Error saving local review:', err);
      }
    }

    // Try inserting into Supabase route_reviews table
    try {
      await supabase.from('route_reviews').insert([
        {
          route_id: route.id,
          user_id: currentUser.id,
          user_name: userName,
          user_avatar: userAvatar,
          rating: newRating,
          comment: newComment.trim(),
        },
      ]);

      // Calculate new avg rating and count
      const totalRatings = updatedList.reduce((acc, r) => acc + r.rating, 0);
      const avgRatingNum = Number((totalRatings / updatedList.length).toFixed(1));

      await supabase
        .from('routes')
        .update({
          rating_avg: avgRatingNum,
          rating_count: updatedList.length,
        })
        .eq('id', route.id);
    } catch (err) {
      console.error('Error inserting review to DB:', err);
    }

    setNewComment('');
    setNewRating(5);
    setSubmitting(false);

    if (onReviewAdded) onReviewAdded();
  };

  // Compute live average rating
  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : route.rating_avg;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-4xl bg-[#1E1E1F] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
          
          {/* Header Banner */}
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-black shrink-0">
            <img
              src={
                route.cover_image_url && !route.cover_image_url.includes('1544197150-b99a580bb7a8')
                  ? route.cover_image_url
                  : 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
              }
              alt={route.nama}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1F] via-[#1E1E1F]/50 to-black/60" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center border border-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Details Overlay */}
            <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                    route.level === 'easy'
                      ? 'bg-green-600 text-white'
                      : route.level === 'medium'
                      ? 'bg-amber-500 text-black'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  Level {route.level}
                </span>
                {route.status_verifikasi === 'terverifikasi' && (
                  <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Terverifikasi Komunitas</span>
                  </span>
                )}
              </div>

              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white drop-shadow-md">
                {route.nama}
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-[#141415] px-4 py-2 border-b border-[#333333] shrink-0 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'info'
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#262626]'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Detail & Elevasi</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#262626]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Peta Lintasan</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'reviews'
                  ? 'bg-amber-500 text-black'
                  : 'text-gray-400 hover:text-white hover:bg-[#262626]'
              }`}
            >
              <Star className="w-4 h-4 fill-current text-amber-400" />
              <span>Ulasan & Rating ({reviews.length})</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* TAB 1: INFO & ELEVATION */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Stats Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#262626] border border-[#333333] p-3.5 rounded-xl space-y-1">
                    <span className="text-[11px] text-gray-400 font-semibold block">Total Jarak</span>
                    <span className="font-heading font-extrabold text-xl text-amber-400">
                      {route.jarak_km} <span className="text-xs font-normal text-white">km</span>
                    </span>
                  </div>

                  <div className="bg-[#262626] border border-[#333333] p-3.5 rounded-xl space-y-1">
                    <span className="text-[11px] text-gray-400 font-semibold block">Total Elevasi</span>
                    <span className="font-heading font-extrabold text-xl text-white">
                      {route.elevasi_m || 350} <span className="text-xs font-normal text-gray-400">m</span>
                    </span>
                  </div>

                  <div className="bg-[#262626] border border-[#333333] p-3.5 rounded-xl space-y-1">
                    <span className="text-[11px] text-gray-400 font-semibold block">Rating Komunitas</span>
                    <div className="flex items-center space-x-1 font-heading font-extrabold text-xl text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{avgRating}</span>
                      <span className="text-xs font-normal text-gray-400">({reviews.length})</span>
                    </div>
                  </div>

                  <div className="bg-[#262626] border border-[#333333] p-3.5 rounded-xl space-y-1">
                    <span className="text-[11px] text-gray-400 font-semibold block">Tingkat Kesulitan</span>
                    <span className="font-heading font-bold text-sm uppercase text-amber-300 block pt-0.5">
                      {route.level}
                    </span>
                  </div>
                </div>

                {/* Deskripsi Rute */}
                <div className="bg-[#262626] border border-[#333333] p-5 rounded-xl space-y-3">
                  <h3 className="font-heading font-bold text-base text-white border-b border-[#333333] pb-2 flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>Deskripsi & Karakteristik Rute</span>
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {route.deskripsi || 'Rute gowes favorit komunitas dengan karakter jalan bervariasi, pemandangan indah, serta titik istirahat warkop yang nyaman.'}
                  </p>

                  {/* Tags */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {route.tags?.map((tag) => (
                      <span key={tag} className="text-xs bg-[#1A1A1A] text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Map Preview Banner */}
                <div className="bg-[#262626] border border-[#333333] p-4 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">Ingin melihat peta interaktif rute ini?</h4>
                    <p className="text-xs text-gray-400">Lihat lintasan lengkap, titik kumpul, dan titik elevasi di peta.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-lg transition shrink-0"
                  >
                    Buka Peta
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE LEAFLET MAP */}
            {activeTab === 'map' && (
              <div className="space-y-4">
                <div className="h-[400px] w-full rounded-xl overflow-hidden border border-[#333333] bg-black">
                  <LeafletMap routeName={route.nama} routeDescription={route.deskripsi} className="w-full h-full" />
                </div>
                <p className="text-xs text-gray-400 italic">
                  * Peta menampilkan lintasan utama rute dan titik elevasi. Anda juga dapat mengunduh file GPX rute ini di bawah.
                </p>
              </div>
            )}

            {/* TAB 3: REVIEWS & RATING */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                
                {/* Rating Overview Header */}
                <div className="bg-[#262626] border border-[#333333] p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4 text-center sm:text-left">
                    <div className="text-center">
                      <span className="font-heading font-black text-5xl text-amber-400 block">{avgRating}</span>
                      <div className="flex items-center justify-center space-x-1 mt-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-gray-400 block mt-1">Berdasarkan {reviews.length} ulasan</span>
                    </div>

                    <div className="hidden sm:block border-l border-[#333333] pl-6 space-y-1">
                      <p className="text-xs text-gray-300 font-medium">
                        Ulasan nyata dari anggota komunitas pesepeda.
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Bagikan pengalaman gowes Anda di rute ini untuk membantu rekan gowes lainnya!
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setShowLoginModal(true);
                      } else {
                        const formElem = document.getElementById('review-form');
                        formElem?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shrink-0 flex items-center space-x-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Tulis Ulasan</span>
                  </button>
                </div>

                {/* Submit Review Form */}
                <div id="review-form" className="bg-[#262626] border border-[#333333] p-5 rounded-xl space-y-4">
                  <h4 className="font-heading font-bold text-sm text-white flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Beri Rating & Ulasan Rute Ini</span>
                  </h4>

                  <form onSubmit={handleAddReview} className="space-y-4">
                    {/* Star Rating Picker */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-300">Rating Anda:</label>
                      <div className="flex items-center space-x-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= (hoverRating || newRating)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-amber-400 ml-2">
                          {hoverRating || newRating} / 5 Bintang
                        </span>
                      </div>
                    </div>

                    {/* Comment Textarea */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-300">Ulasan Pengalaman Gowes:</label>
                      <textarea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Contoh: Jalanannya mulus, tapi ada tanjakan curam di km 10. Cocok buat sepeda roadbike atau gravel..."
                        className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-md"
                      >
                        <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{submitting ? 'Sending...' : 'Kirim Ulasan'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="space-y-3">
                  <h4 className="font-heading font-bold text-sm text-white">Daftar Ulasan Komunitas</h4>

                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#262626] border border-[#333333] p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 overflow-hidden flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                            {rev.user_avatar ? (
                              <img src={rev.user_avatar} alt={rev.user_name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{rev.user_name.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-white block">{rev.user_name}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(rev.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center space-x-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed pl-10">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

          {/* Footer Action Bar */}
          <div className="p-4 bg-[#141415] border-t border-[#333333] flex items-center justify-between gap-4 shrink-0">
            <div className="text-xs text-gray-400 hidden sm:block">
              Unduh GPX untuk dimasukkan ke Cyclocomputer / Garmin / Strava.
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#333333] text-gray-300 text-xs font-semibold hover:bg-[#262626] transition"
              >
                Tutup
              </button>

              <button
                onClick={handleDownloadGpx}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition shadow-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Unduh GPX Rute</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Silakan masuk terlebih dahulu untuk memberikan ulasan dan rating pada rute ini."
      />
    </>
  );
}
