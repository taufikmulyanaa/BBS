'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Bookmark, Calendar, MessageSquare, Shield, Edit3, Bike, Check, Camera, LogOut, Upload, Mail, Award, Navigation, ChevronRight, LogIn, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [namaLengkap, setNamaLengkap] = useState('');
  const [bio, setBio] = useState('Anggota Komunitas Guyub Gowes Bapak-Bapak Sepedahan. Hobi gowes pagi penikmat pisang goreng.');
  const [kotaBasecamp, setKotaBasecamp] = useState('');
  const [fotoProfilUrl, setFotoProfilUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ savedRoutes: 0, ridesJoined: 0, forumPosts: 0 });
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [unverifiedRoutes, setUnverifiedRoutes] = useState<any[]>([]);
  const [loadingUnverified, setLoadingUnverified] = useState(false);
  const [activeTab, setActiveTab] = useState<'statistik' | 'layanan' | 'admin' | 'verifikasi'>('statistik');

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedProvId, setSelectedProvId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      // Avoid setting loading to true here to prevent screen flashing on subsequent loads
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
            if (profile.kota_basecamp) setKotaBasecamp(profile.kota_basecamp);
            
            if (profile.role === 'admin') {
              setIsAdmin(true);
              fetchAdminProfiles();
              fetchUnverifiedRoutes();
            }
            
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Only reload profile on explicit SIGNED_IN or USER_UPDATED to prevent auto-refresh loops
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        loadProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAdminProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setAllProfiles(data);
    } catch (err) {
      console.error('Error fetching all profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const fetchUnverifiedRoutes = async () => {
    setLoadingUnverified(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id, 
          nama, 
          created_at, 
          dibuat_oleh,
          profiles:dibuat_oleh(nama_lengkap)
        `)
        .eq('status_verifikasi', 'belum_diverifikasi')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setUnverifiedRoutes(data);
    } catch (err) {
      console.error('Error fetching unverified routes:', err);
    } finally {
      setLoadingUnverified(false);
    }
  };

  useEffect(() => {
    if (isEditing && provinces.length === 0) {
      fetch('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json')
        .then((res) => res.json())
        .then((data) => setProvinces(data))
        .catch((err) => console.error('Error fetching provinces:', err));
    }
  }, [isEditing, provinces.length]);

  useEffect(() => {
    if (selectedProvId) {
      fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${selectedProvId}.json`)
        .then((res) => res.json())
        .then((data) => setCities(data))
        .catch((err) => console.error('Error fetching cities:', err));
    } else {
      setCities([]);
    }
  }, [selectedProvId]);

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
          kota_basecamp: kotaBasecamp,
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
    // This is the old demo function, keeping it just in case, but no longer exposed in the UI.
    if (!user) return;
    const newRole = isAdmin ? 'member' : 'admin';
    if (!confirm(`Ubah role Anda menjadi ${newRole.toUpperCase()}?`)) return;
    
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

  const handleDelegateRole = async (targetUserId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (!confirm(`Ubah role pengguna ini menjadi ${newRole.toUpperCase()}?`)) return;

    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', targetUserId);
      if (error) throw error;

      // Update local state
      setAllProfiles((prev) => 
        prev.map(p => p.id === targetUserId ? { ...p, role: newRole } : p)
      );
    } catch (err: any) {
      console.error('Error delegating role:', err);
      alert('Gagal mengubah role pengguna.');
    }
  };

  const handleRemoveUserClick = (targetUserId: string, userName: string) => {
    setUserToDelete({ id: targetUserId, name: userName });
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userToDelete.id });
      if (error) throw error;

      setAllProfiles((prev) => prev.filter(p => p.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(`Gagal menghapus pengguna: ${err.message}`);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleVerifyRoute = async (routeId: string) => {
    try {
      const { error } = await supabase.from('routes').update({ status_verifikasi: 'terverifikasi' }).eq('id', routeId);
      if (error) throw error;
      setUnverifiedRoutes(prev => prev.filter(r => r.id !== routeId));
    } catch (err) {
      console.error('Error verifying route:', err);
      alert('Gagal memverifikasi rute.');
    }
  };

  const handleRejectRoute = async (routeId: string) => {
    if (!confirm('Tolak rute ini? Tindakan ini akan menghapus rute secara permanen dari database.')) return;
    try {
      const { error } = await supabase.from('routes').delete().eq('id', routeId);
      if (error) throw error;
      setUnverifiedRoutes(prev => prev.filter(r => r.id !== routeId));
    } catch (err) {
      console.error('Error rejecting route:', err);
      alert('Gagal menghapus rute.');
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
              {kotaBasecamp && (
                <p className="text-xs text-gray-400 flex items-center justify-center space-x-1.5 mt-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{kotaBasecamp}</span>
                </p>
              )}

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

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Pilih Provinsi</label>
                    <select
                      value={selectedProvId}
                      onChange={(e) => setSelectedProvId(e.target.value)}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 mb-2"
                    >
                      <option value="">-- Pilih Provinsi --</option>
                      {provinces.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </select>

                    <label className="block text-[11px] font-bold text-gray-400 mb-1">Pilih Kota / Kabupaten (Basecamp)</label>
                    <select
                      value={kotaBasecamp}
                      onChange={(e) => setKotaBasecamp(e.target.value)}
                      disabled={!selectedProvId || cities.length === 0}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    >
                      <option value="">-- Pilih Kota/Kabupaten --</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
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

        {/* Right Column: Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex overflow-x-auto space-x-2 border-b border-[#333333] pb-2 custom-scrollbar">
            <button
              onClick={() => setActiveTab('statistik')}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'statistik' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-amber-400 hover:bg-[#333333]'}`}
            >
              Statistik Aktivitas
            </button>
            <button
              onClick={() => setActiveTab('layanan')}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'layanan' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-amber-400 hover:bg-[#333333]'}`}
            >
              Akses Cepat Layanan
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'admin' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-amber-400 hover:bg-[#333333]'}`}
                >
                  Kelola Anggota
                </button>
                <button
                  onClick={() => setActiveTab('verifikasi')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center space-x-2 ${activeTab === 'verifikasi' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-amber-400 hover:bg-[#333333]'}`}
                >
                  <span>Antrean Verifikasi</span>
                  {unverifiedRoutes.length > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'verifikasi' ? 'bg-black text-amber-500' : 'bg-red-500 text-white'}`}>
                      {unverifiedRoutes.length}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Member Activity Stats */}
          {activeTab === 'statistik' && (
            <div className="bg-[#262626] border border-[#333333] rounded-2xl p-6 space-y-4 shadow-xl animate-fade-in">
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
          )}

          {/* Quick Nav Options */}
          {activeTab === 'layanan' && (
            <div className="bg-[#262626] border border-[#333333] rounded-2xl p-6 space-y-4 shadow-xl animate-fade-in">
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
          )}

          {/* Admin Management Section */}
          {isAdmin && activeTab === 'admin' && (
            <div className="bg-[#262626] border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#333333] pb-3">
                <h3 className="font-heading font-bold text-base text-amber-400 flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin Tools: Kelola Anggota</span>
                </h3>
              </div>

              {loadingProfiles ? (
                <p className="text-xs text-gray-400 italic">Memuat daftar anggota...</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {allProfiles.map((p) => (
                    <div key={p.id} className="bg-[#1A1A1A] border border-[#333333] p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {p.foto_profil_url ? (
                            <img src={p.foto_profil_url} alt={p.nama_lengkap} className="w-full h-full object-cover" />
                          ) : (
                            p.nama_lengkap?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{p.nama_lengkap}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.role === 'admin' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-[#333333] text-gray-400'}`}>
                            {p.role === 'admin' ? 'Admin' : 'Member'}
                          </span>
                        </div>
                      </div>
                      
                      {p.id !== user.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelegateRole(p.id, p.role)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                              p.role === 'admin'
                                ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                            }`}
                          >
                            {p.role === 'admin' ? 'Cabut Admin' : 'Jadikan Admin'}
                          </button>
                          
                          <button
                            onClick={() => handleRemoveUserClick(p.id, p.nama_lengkap)}
                            className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition flex items-center justify-center"
                            title="Hapus Pengguna Secara Permanen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin Verification Dashboard */}
          {isAdmin && activeTab === 'verifikasi' && (
            <div className="bg-[#262626] border border-green-500/30 rounded-2xl p-6 space-y-4 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#333333] pb-3">
                <h3 className="font-heading font-bold text-base text-green-400 flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Admin Tools: Antrean Verifikasi</span>
                </h3>
                {unverifiedRoutes.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unverifiedRoutes.length} Baru
                  </span>
                )}
              </div>

              {loadingUnverified ? (
                <p className="text-xs text-gray-400 italic">Memuat antrean rute...</p>
              ) : unverifiedRoutes.length === 0 ? (
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mb-2">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-gray-300">Semua Rute Sudah Terverifikasi!</p>
                  <p className="text-xs text-gray-500">Tidak ada antrean rute baru saat ini.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {unverifiedRoutes.map((route) => (
                    <div key={route.id} className="bg-[#1A1A1A] border border-[#333333] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 hover:border-green-500/30 transition">
                      <div className="flex-1">
                        <Link href={`/routes?id=${route.id}`} className="hover:underline">
                          <h4 className="font-bold text-sm text-white">{route.nama}</h4>
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">
                          Oleh: <span className="font-semibold text-gray-300">{route.profiles?.nama_lengkap || 'Pengguna'}</span>
                          <span className="mx-2">•</span>
                          {new Date(route.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2 sm:shrink-0">
                        <button
                          onClick={() => handleRejectRoute(route.id)}
                          className="flex-1 sm:flex-none p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition flex items-center justify-center"
                          title="Tolak & Hapus Rute"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyRoute(route.id)}
                          className="flex-1 sm:flex-none p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black font-semibold transition flex items-center justify-center"
                          title="Setujui & Verifikasi"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUserToDelete(null)} />
          <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400 border-b border-[#333333] pb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-lg">Konfirmasi Hapus</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <span className="font-bold text-white">{userToDelete.name}</span> secara permanen?
            </p>
            <p className="text-xs text-red-400/80 italic">
              Semua data terkait pengguna ini akan hilang dan tidak dapat dipulihkan.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 bg-[#262626] hover:bg-[#333333] border border-[#42403B] text-gray-300 font-semibold text-sm py-2.5 rounded-xl transition"
                disabled={isDeletingUser}
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold text-sm py-2.5 rounded-xl transition flex items-center justify-center space-x-2"
                disabled={isDeletingUser}
              >
                {isDeletingUser ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{isDeletingUser ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

