'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Bookmark, Calendar, MessageSquare, Shield, Edit3, Bike, Check, Camera, LogOut, Upload, Mail, Award, Navigation, ChevronRight, LogIn, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [bio, setBio] = useState('Anggota Komunitas Guyub Gowes Bapak-Bapak Sepedahan. Hobi gowes pagi penikmat pisang goreng.');
  const [fotoProfilUrl, setFotoProfilUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ savedRoutes: 0, ridesJoined: 0, forumPosts: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        setNamaLengkap(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anggota Gowes');
        
        // Priority 1: localStorage custom avatar
        const localAvatar = typeof window !== 'undefined' ? localStorage.getItem(`bbs_avatar_${user.id}`) : null;
        if (localAvatar) {
          setFotoProfilUrl(localAvatar);
        }

        // Priority 2: Supabase DB profile
        let liveAvatar = localAvatar || '';
        try {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if (profile) {
            if (profile.bio) setBio(profile.bio);
            if (profile.nama_lengkap) setNamaLengkap(profile.nama_lengkap);
            if (profile.role === 'admin') setIsAdmin(true);
            
            if (profile.foto_profil_url) {
              liveAvatar = profile.foto_profil_url;
              if (liveAvatar.startsWith('http') && typeof window !== 'undefined') {
                localStorage.setItem(`bbs_avatar_${user.id}`, liveAvatar);
                setFotoProfilUrl(liveAvatar);
              }
            }
          }
        } catch (e) {
          console.error('Error fetching profile:', e);
        }

        if (!liveAvatar) {
          liveAvatar = user.user_metadata?.custom_avatar || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
          setFotoProfilUrl(liveAvatar);
        }

        // Fetch real stats from Supabase
        const { count: savedCount } = await supabase.from('saved_routes').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const { count: ridesCount } = await supabase.from('ride_participants').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const { count: postsCount } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        
        setStats({
          savedRoutes: savedCount || 0,
          ridesJoined: ridesCount || 0,
          forumPosts: postsCount || 0,
        });
      }
      setLoading(false);
    };

    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) return;
    setSaving(true);

    try {
      // 1. Show immediately in UI using object URL
      const localUrl = URL.createObjectURL(file);
      setFotoProfilUrl(localUrl);

      // 2. Upload original file directly to Supabase Storage
      const fileName = `${user.id}-avatar-${Date.now()}.jpg`;
      const { error: storageErr } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      let urlToSave = localUrl;

      if (!storageErr) {
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        if (publicData?.publicUrl) {
          urlToSave = publicData.publicUrl;
        }
      } else {
        console.error('Storage upload error:', storageErr);
        alert(`Gagal mengunggah foto ke server: ${storageErr.message || 'Storage error'}`);
        // We will continue with the object URL locally, but it won't persist cross-device well.
      }

      // 3. Update UI to use the final public URL (if successful)
      setFotoProfilUrl(urlToSave);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`bbs_avatar_${user.id}`, urlToSave);
      }

      // 4. Update Supabase profiles table
      const { error: dbErr } = await supabase.from('profiles').upsert({
        id: user.id,
        nama_lengkap: namaLengkap || user.user_metadata?.full_name || 'Anggota Gowes',
        bio,
        foto_profil_url: urlToSave,
        updated_at: new Date().toISOString(),
      });
      
      if (dbErr) {
        console.error('DB profiles upsert error:', dbErr);
        alert(`Gagal menyimpan ke database: ${dbErr.message}. Pastikan RLS di tabel profiles mengizinkan UPDATE.`);
        // We shouldn't proceed if DB fails to avoid desync
        setSaving(false);
        return;
      }

      // 5. Update auth user metadata
      const { error: authErr } = await supabase.auth.updateUser({
        data: { custom_avatar: urlToSave, foto_profil_url: urlToSave }
      });
      if (authErr) {
        console.error('Auth updateUser error:', authErr);
        alert(`Gagal menyimpan profil akun: ${authErr.message}`);
      }

      // 6. Notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bbs_avatar_updated'));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error in handleAvatarFileChange:', err);
      alert('Terjadi kesalahan saat mengganti foto.');
    } finally {
      setSaving(false);
      // Reset input value so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (user) {
        if (fotoProfilUrl && typeof window !== 'undefined') {
          localStorage.setItem(`bbs_avatar_${user.id}`, fotoProfilUrl);
          window.dispatchEvent(new Event('bbs_avatar_updated'));
        }

        const { error: dbErr } = await supabase.from('profiles').upsert({
          id: user.id,
          nama_lengkap: namaLengkap,
          bio,
          foto_profil_url: fotoProfilUrl,
          updated_at: new Date().toISOString(),
        });
        
        if (dbErr) {
          console.error('DB profiles upsert error:', dbErr);
          alert(`Gagal menyimpan ke database: ${dbErr.message}. Pastikan RLS di tabel profiles mengizinkan UPDATE.`);
          setSaving(false);
          return;
        }

        await supabase.auth.updateUser({
          data: { full_name: namaLengkap, custom_avatar: fotoProfilUrl, foto_profil_url: fotoProfilUrl }
        });
      }
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleToggleAdmin = async () => {
    if (!user) return;
    const newRole = isAdmin ? 'member' : 'admin';
    if (!confirm(`Ubah role Anda menjadi ${newRole.toUpperCase()}? (Ini adalah fitur khusus demo)`)) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
      if (error) throw error;
      
      setIsAdmin(newRole === 'admin');
      alert(`Berhasil! Silakan refresh halaman atau coba fitur ${newRole}.`);
    } catch (err: any) {
      console.error('Error updating role:', err);
      alert('Gagal mengubah role: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Memuat profil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 shadow-xl">
          <Lock className="w-10 h-10" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Akses Dibatasi
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Halaman profil hanya dapat diakses oleh anggota yang sudah masuk ke akun. Silakan masuk atau daftar akun terlebih dahulu.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open_auth_modal'))}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
          >
            <LogIn className="w-4 h-4 stroke-[2.5]" />
            <span>Masuk / Daftar Sekarang</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto bg-[#262626] hover:bg-[#333333] border border-[#42403B] text-gray-300 font-semibold text-sm px-6 py-3 rounded-xl transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>Profil Pengguna & Keanggotaan</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
          Profil Anggota Gowes
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl">
          Kelola informasi akun, statistik gowes bareng, dan foto profil Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Member Card & Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#262626] border border-[#333333] rounded-2xl p-6 space-y-6 relative overflow-hidden shadow-xl text-center flex flex-col items-center">
            
            {/* Ambient background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Avatar & Change Picture Button */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#F7C56A] via-[#EA9B28] to-[#D98A17] text-black font-extrabold text-4xl flex items-center justify-center border-4 border-[#333333] shadow-2xl overflow-hidden shrink-0">
                {fotoProfilUrl ? (
                  <img
                    src={fotoProfilUrl}
                    alt={namaLengkap}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{namaLengkap?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'P'}</span>
                )}
              </div>

              {/* Change Picture Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-amber-500 hover:bg-amber-400 text-black p-2 rounded-xl shadow-lg border border-black/20 transition-transform group-hover:scale-110 cursor-pointer"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2.5 w-full">
              <h2 className="font-heading font-extrabold text-xl text-white">
                {namaLengkap}
              </h2>
              <p className="text-xs text-gray-400 flex items-center justify-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{user?.email || 'anggota@guyubgowes.com'}</span>
              </p>

              <div className="pt-2 flex justify-center">
                <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-3.5 py-1 rounded-full flex items-center space-x-1.5">
                  <Shield className="w-4 h-4" />
                  <span>{isAdmin ? 'Admin / Pengurus' : 'Anggota Terverifikasi'}</span>
                </span>
              </div>
            </div>

            {/* Bio Box */}
            <div className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 border-b border-[#2A2A2A] pb-2">
                <span>Bio Komunitas</span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-[#262626] text-gray-300 font-semibold text-xs py-1.5 rounded-lg border border-[#3A3A3A]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-1.5 rounded-lg flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{saving ? 'Simpan...' : 'Simpan'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-300 leading-relaxed italic">"{bio}"</p>
                  
                  {/* Demo Role Toggle Button */}
                  <button
                    onClick={handleToggleAdmin}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border flex items-center space-x-1 transition ${
                      isAdmin 
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' 
                        : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>Demo: Jadikan Saya {isAdmin ? 'Member Biasa' : 'Admin'}</span>
                  </button>
                </div>
              )}

              {savedSuccess && (
                <p className="text-[11px] text-green-400 font-semibold pt-1">✓ Profil & Foto berhasil diperbarui!</p>
              )}
            </div>

            {/* Change Picture Action Link */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#1A1A1A] hover:bg-[#333333] border border-[#333333] text-amber-400 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Ganti Foto Profil</span>
            </button>

            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/30 text-red-400 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun (Sign Out)</span>
              </button>
            )}

          </div>
        </div>

        {/* Right Column: Statistics & Quick Access */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Member Activity Stats */}
          <div className="bg-[#262626] border border-[#333333] rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-base text-white flex items-center space-x-2 border-b border-[#333333] pb-3">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Statistik Aktivitas Komunitas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333333] space-y-1 text-center">
                <span className="block font-heading font-extrabold text-3xl text-amber-400">{stats.savedRoutes}</span>
                <span className="text-xs text-gray-400 font-medium">Rute Favorit</span>
              </div>
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333333] space-y-1 text-center">
                <span className="block font-heading font-extrabold text-3xl text-amber-400">{stats.ridesJoined}</span>
                <span className="text-xs text-gray-400 font-medium">Open Ride Diikuti</span>
              </div>
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333333] space-y-1 text-center">
                <span className="block font-heading font-extrabold text-3xl text-amber-400">{stats.forumPosts}</span>
                <span className="text-xs text-gray-400 font-medium">Diskusi Forum</span>
              </div>
            </div>
          </div>

          {/* Quick Nav Options */}
          <div className="bg-[#262626] border border-[#333333] rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-base text-white flex items-center space-x-2 border-b border-[#333333] pb-3">
              <Bike className="w-4 h-4 text-amber-400" />
              <span>Akses Cepat Layanan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/routes"
                className="bg-[#1A1A1A] hover:border-amber-500/50 p-4 rounded-xl border border-[#333333] flex items-center justify-between group transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition">Jelajah Rute Gowes</h4>
                    <p className="text-xs text-gray-400">Temukan jalur & lintasan sepeda terbaik</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition" />
              </Link>

              <Link
                href="/open-rides"
                className="bg-[#1A1A1A] hover:border-amber-500/50 p-4 rounded-xl border border-[#333333] flex items-center justify-between group transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition">Jadwal Open Ride</h4>
                    <p className="text-xs text-gray-400">Ikut sesi gowes bareng komunitas</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition" />
              </Link>

              <Link
                href="/forum"
                className="bg-[#1A1A1A] hover:border-amber-500/50 p-4 rounded-xl border border-[#333333] flex items-center justify-between group transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition">Forum Komunitas</h4>
                    <p className="text-xs text-gray-400">Diskusi rute & info warkop gowes</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 transition" />
              </Link>

              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-[#333333] flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Status Komunitas</h4>
                  <p className="text-xs text-green-400 font-semibold">Aktif & Terverifikasi</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

