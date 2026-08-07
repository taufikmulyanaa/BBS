import React, { useState, useEffect } from 'react';
import { OpenRide, supabase } from '@/lib/supabase';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  UserPlus,
  Info,
  ShieldCheck,
  UserCheck,
  UserX,
  Share2,
  Bike,
  Gauge,
  Edit3,
  Trash2,
} from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';

type Participant = {
  id: string;
  ride_id: string;
  user_id: string;
  status: 'terkonfirmasi' | 'hadir' | 'tidak_hadir';
  created_at?: string;
  user_name?: string;
  user_avatar?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ride: OpenRide | null;
  currentUser: any;
  onRideUpdated?: () => void;
  onEditRequested?: (ride: OpenRide) => void;
};

export default function OpenRideDetailModal({
  isOpen,
  onClose,
  ride,
  currentUser,
  onRideUpdated,
  onEditRequested,
}: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<{ name: string; avatar: string }>({
    name: 'Pengurus Gowes',
    avatar: '',
  });

  const isCreatorOrAdmin =
    isAdmin ||
    (currentUser &&
      ride &&
      ((ride.creator_id && currentUser.id === ride.creator_id) ||
        (ride.dibuat_oleh && currentUser.id === ride.dibuat_oleh)));

  useEffect(() => {
    if (!isOpen || !ride) return;

    fetchRideData();
  }, [isOpen, ride]);

  const fetchRideData = async () => {
    if (!ride) return;
    setLoadingParticipants(true);

    try {
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }

      // 1. Fetch Creator Info
      const creatorId = ride.dibuat_oleh || ride.creator_id;
      if (creatorId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nama_lengkap, foto_profil_url')
          .eq('id', creatorId)
          .single();

        if (profile) {
          setCreatorProfile({
            name: profile.nama_lengkap || 'Pengurus Gowes',
            avatar: profile.foto_profil_url || '',
          });
        }
      }

      // 2. Fetch Participants
      const { data, error } = await supabase
        .from('ride_participants')
        .select('*, profiles:user_id(nama_lengkap, foto_profil_url)')
        .eq('ride_id', ride.id);

      if (!error && data) {
        const formatted: Participant[] = data.map((p: any) => ({
          id: p.id,
          ride_id: p.ride_id,
          user_id: p.user_id,
          status: p.status || 'terkonfirmasi',
          created_at: p.created_at,
          user_name: p.profiles?.nama_lengkap || 'Anggota Gowes',
          user_avatar: p.profiles?.foto_profil_url || '',
        }));

        setParticipants(formatted);

        if (currentUser) {
          const userJoined = formatted.some((p) => p.user_id === currentUser.id);
          setIsJoined(userJoined);
        }
      }
    } catch (err) {
      console.error('Error fetching ride detail:', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  if (!isOpen || !ride) return null;

  const isFull = participants.length >= ride.kuota_maks;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (e) {
      return isoString;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return (
        date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB'
      );
    } catch (e) {
      return '06:00 WIB';
    }
  };

  const handleJoinToggle = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    setJoining(true);

    try {
      if (isJoined) {
        // Leave
        await supabase
          .from('ride_participants')
          .delete()
          .match({ ride_id: ride.id, user_id: currentUser.id });

        setParticipants((prev) => prev.filter((p) => p.user_id !== currentUser.id));
        setIsJoined(false);
      } else {
        if (isFull) return;

        // Join
        const userName =
          currentUser.user_metadata?.full_name ||
          currentUser.email?.split('@')[0] ||
          'Anggota Gowes';
        const userAvatar =
          currentUser.user_metadata?.custom_avatar ||
          currentUser.user_metadata?.avatar_url ||
          '';

        const { data, error } = await supabase
          .from('ride_participants')
          .insert([
            {
              ride_id: ride.id,
              user_id: currentUser.id,
              status: 'terkonfirmasi',
            },
          ])
          .select();

        if (!error && data) {
          const newPart: Participant = {
            id: data[0].id,
            ride_id: ride.id,
            user_id: currentUser.id,
            status: 'terkonfirmasi',
            user_name: userName,
            user_avatar: userAvatar,
          };
          setParticipants((prev) => [...prev, newPart]);
          setIsJoined(true);
        }
      }

      if (onRideUpdated) onRideUpdated();
    } catch (err) {
      console.error('Error toggling join status:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateStatus = async (participantUserId: string, newStatus: 'hadir' | 'tidak_hadir' | 'terkonfirmasi') => {
    if (!isCreatorOrAdmin) return;

    try {
      await supabase
        .from('ride_participants')
        .update({ status: newStatus })
        .match({ ride_id: ride.id, user_id: participantUserId });

      setParticipants((prev) =>
        prev.map((p) => (p.user_id === participantUserId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Error updating participant status:', err);
    }
  };

  const handleCancelRide = async () => {
    if (!isAdmin) return;
    if (!confirm('Peringatan Admin: Apakah Anda yakin ingin MEMBATALKAN Open Ride ini? Tindakan ini tidak dapat diurungkan.')) return;

    try {
      await supabase
        .from('open_rides')
        .update({ status: 'dibatalkan' })
        .eq('id', ride?.id);

      if (onRideUpdated) onRideUpdated();
      onClose();
    } catch (err) {
      console.error('Error cancelling ride:', err);
      alert('Gagal membatalkan ride.');
    }
  };

  const handleRemoveParticipant = async (participantUserId: string) => {
    if (!isCreatorOrAdmin) return;
    if (!confirm('Keluarkan anggota ini dari daftar peserta Open Ride?')) return;

    try {
      await supabase
        .from('ride_participants')
        .delete()
        .match({ ride_id: ride.id, user_id: participantUserId });

      setParticipants((prev) => prev.filter((p) => p.user_id !== participantUserId));
      if (participantUserId === currentUser?.id) {
        setIsJoined(false);
      }
      if (onRideUpdated) onRideUpdated();
    } catch (err) {
      console.error('Error removing participant:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: ride.judul,
          text: `Ayo ikutan Open Ride "${ride.judul}" pada ${formatDate(ride.tanggal_waktu)}!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan Open Ride berhasil disalin ke clipboard!');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-3xl bg-[#1E1E1F] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
          
          {/* Header Banner */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-950/60 via-[#262626] to-[#1E1E1F] border-b border-[#333333] shrink-0 space-y-3">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center border border-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 pr-10">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(ride.tanggal_waktu)}</span>
              </span>

              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                  ride.level === 'easy'
                    ? 'bg-green-500/20 border-green-500/40 text-green-300'
                    : ride.level === 'medium'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-red-500/20 border-red-500/40 text-red-300'
                }`}
              >
                Pace {ride.level}
              </span>
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
              {ride.judul}
            </h2>

            {/* Host info */}
            <div className="flex items-center space-x-2.5 pt-1">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 overflow-hidden flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                {creatorProfile.avatar ? (
                  <img src={creatorProfile.avatar} alt={creatorProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{creatorProfile.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-xs">
                <span className="text-gray-400">Dibuat oleh </span>
                <span className="font-bold text-white">{creatorProfile.name}</span>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#262626] border border-[#333333] p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Waktu Kumpul</span>
                </span>
                <span className="font-heading font-extrabold text-sm text-white block">
                  {formatTime(ride.tanggal_waktu)}
                </span>
              </div>

              <div className="bg-[#262626] border border-[#333333] p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                  <Bike className="w-3.5 h-3.5 text-amber-400" />
                  <span>Jarak Estimasi</span>
                </span>
                <span className="font-heading font-extrabold text-sm text-amber-400 block">
                  {ride.jarak_km} km
                </span>
              </div>

              <div className="bg-[#262626] border border-[#333333] p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target Pace</span>
                </span>
                <span className="font-heading font-extrabold text-sm text-white block capitalize">
                  {ride.level === 'easy' ? '18-22 km/h (Santai)' : ride.level === 'medium' ? '22-26 km/h (Sedang)' : '26+ km/h (Kencang)'}
                </span>
              </div>

              <div className="bg-[#262626] border border-[#333333] p-3.5 rounded-xl space-y-1">
                <span className="text-[11px] text-gray-400 font-semibold flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kuota Peserta</span>
                </span>
                <span className="font-heading font-extrabold text-sm text-white block">
                  {participants.length} / {ride.kuota_maks} Peserta
                </span>
              </div>
            </div>

            {/* Titik Kumpul & Lokasi */}
            <div className="bg-[#262626] border border-[#333333] p-4 sm:p-5 rounded-xl space-y-2">
              <h3 className="font-heading font-bold text-sm text-white flex items-center space-x-2 border-b border-[#333333] pb-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Titik Kumpul & Keberangkatan</span>
              </h3>
              <p className="text-sm font-semibold text-amber-300 pt-1">
                {ride.titik_kumpul}
              </p>
              <p className="text-xs text-gray-400">
                Harap tiba 15 menit sebelum waktu keberangkatan untuk briefing rute dan berdoa bersama.
              </p>
            </div>

            {/* Catatan & Instruksi */}
            {ride.catatan && (
              <div className="bg-[#262626] border border-[#333333] p-4 sm:p-5 rounded-xl space-y-2">
                <h3 className="font-heading font-bold text-sm text-white flex items-center space-x-2 border-b border-[#333333] pb-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Catatan & Perlengkapan Gowes</span>
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line pt-1">
                  {ride.catatan}
                </p>
              </div>
            )}

            {/* Daftar Peserta (Participants List) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Daftar Peserta Terdaftar ({participants.length}/{ride.kuota_maks})</span>
                </h3>

                {isCreatorOrAdmin && (
                  <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Anda {isAdmin ? 'Admin' : 'Host'} (Kelola Kehadiran)</span>
                  </span>
                )}
              </div>

              {loadingParticipants ? (
                <div className="text-center py-6 text-xs text-gray-400">Memuat daftar peserta...</div>
              ) : participants.length === 0 ? (
                <div className="bg-[#262626] border border-[#333333] p-6 rounded-xl text-center space-y-2">
                  <Users className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
                  <p className="text-white font-bold text-xs">Belum Ada Peserta</p>
                  <p className="text-[11px] text-gray-400">Jadilah yang pertama bergabung ke Open Ride ini!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#262626] border border-[#333333] p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden pr-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 overflow-hidden flex items-center justify-center text-amber-400 text-xs font-bold shrink-0">
                          {p.user_avatar ? (
                            <img src={p.user_avatar} alt={p.user_name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{p.user_name?.charAt(0).toUpperCase() || 'P'}</span>
                          )}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-xs text-white block truncate">
                            {p.user_name}
                            {p.user_id === currentUser?.id && (
                              <span className="text-[10px] text-amber-400 ml-1">(Anda)</span>
                            )}
                          </span>
                          <span
                            className={`text-[10px] font-semibold ${
                              p.status === 'hadir'
                                ? 'text-green-400'
                                : p.status === 'tidak_hadir'
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                          >
                            {p.status === 'hadir'
                              ? '✓ Hadir di Lokasi'
                              : p.status === 'tidak_hadir'
                              ? '✕ Tidak Hadir'
                              : 'Terdaftar'}
                          </span>
                        </div>
                      </div>

                      {/* Host Actions for this Participant */}
                      {isCreatorOrAdmin ? (
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(p.user_id, 'hadir')}
                            className={`p-1.5 rounded-lg border transition ${
                              p.status === 'hadir'
                                ? 'bg-green-500 text-black border-green-500'
                                : 'bg-[#1A1A1A] text-green-400 border-[#333333] hover:bg-green-500/20'
                            }`}
                            title="Tandai Hadir"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(p.user_id, 'tidak_hadir')}
                            className={`p-1.5 rounded-lg border transition ${
                              p.status === 'tidak_hadir'
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-[#1A1A1A] text-red-400 border-[#333333] hover:bg-red-500/20'
                            }`}
                            title="Tandai Tidak Hadir"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(p.user_id)}
                            className="p-1.5 rounded-lg bg-[#1A1A1A] text-gray-400 border border-[#333333] hover:text-red-400 hover:border-red-500/40 transition"
                            title="Keluarkan Peserta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'hadir'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : p.status === 'tidak_hadir'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {p.status === 'hadir' ? 'Hadir' : p.status === 'tidak_hadir' ? 'Absen' : 'Terdaftar'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Footer Action Controls */}
          <div className="p-4 border-t border-[#333333] bg-[#141415] shrink-0 flex items-center justify-between gap-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333333] border border-[#333333] text-xs font-bold text-gray-300 hover:text-white flex items-center space-x-1.5 transition shrink-0"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Bagikan</span>
            </button>

            {isCreatorOrAdmin && onEditRequested && (
              <button
                onClick={() => {
                  onClose();
                  onEditRequested(ride);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-[#262626] hover:bg-amber-500 hover:text-black border border-[#333333] text-xs font-bold text-amber-400 transition flex items-center space-x-1.5 shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit / Hapus</span>
              </button>
            )}

            {isAdmin && ride.status !== 'dibatalkan' && (
              <button
                onClick={handleCancelRide}
                className="px-3.5 py-2.5 rounded-xl bg-[#262626] hover:bg-red-500 hover:text-white border border-[#333333] text-xs font-bold text-red-400 transition flex items-center space-x-1.5 shrink-0"
                title="Batalkan Ride Paksa (Admin)"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Batal (Admin)</span>
              </button>
            )}

            <button
              onClick={handleJoinToggle}
              disabled={joining || (isFull && !isJoined)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                isJoined
                  ? 'bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30'
                  : isFull
                  ? 'bg-[#262626] text-gray-500 border border-[#333333] cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
              }`}
            >
              {isJoined ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span>Terdaftar (Klik untuk Batal)</span>
                </>
              ) : isFull ? (
                <span>Kuota Telah Penuh</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Gabung Gowes Bareng</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Silakan masuk terlebih dahulu untuk bergabung ke Open Ride dan gowes bareng komunitas."
      />
    </>
  );
}
