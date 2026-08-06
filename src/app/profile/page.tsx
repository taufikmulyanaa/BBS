'use client';

import React, { useState, useEffect } from 'react';
import { User, Bookmark, Calendar, MessageSquare, Shield, Edit3, Bike, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('Anggota Komunitas Guyub Gowes Bapak-Bapak Sepedahan. Hobi gowes pagi penikmat pisang goreng.');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [stats, setStats] = useState({ savedRoutes: 0, ridesJoined: 0, forumPosts: 0 });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Fetch real stats from Supabase
        const { count: savedCount } = await supabase.from('saved_routes').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const { count: ridesCount } = await supabase.from('ride_participants').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        const { count: postsCount } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        
        setStats({
          savedRoutes: savedCount || 0,
          ridesJoined: ridesCount || 0,
          forumPosts: postsCount || 0,
        });

        // Try fetching user profile bio
        const { data: profile } = await supabase.from('profiles').select('bio').eq('id', user.id).single();
        if (profile?.bio) setBio(profile.bio);
      } else {
        // Fallback count from public tables
        const { count: routesCount } = await supabase.from('routes').select('*', { count: 'exact', head: true });
        const { count: ridesCount } = await supabase.from('open_rides').select('*', { count: 'exact', head: true });
        const { count: postsCount } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true });
        setStats({
          savedRoutes: routesCount || 0,
          ridesJoined: ridesCount || 0,
          forumPosts: postsCount || 0,
        });
      }
    });
  }, []);

  const handleSaveBio = async () => {
    setIsEditing(false);
    setSavedSuccess(true);
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, bio, updated_at: new Date().toISOString() });
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Banner & Info */}
      <div className="bg-[#232322] border border-[#42403B] rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#EA9B28]/10 to-transparent pointer-events-none rounded-bl-full" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F7C56A] via-[#EA9B28] to-[#D98A17] text-[#141415] font-extrabold text-3xl flex items-center justify-center border-2 border-[#EA9B28] shadow-lg shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'P'}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-heading font-extrabold text-2xl text-[#F5F5F5]">
                  {user?.user_metadata?.full_name || 'Anggota Gowes'}
                </h1>
                <p className="text-xs text-[#8E8B87]">{user?.email || 'anggota@guyubgowes.com'}</p>
              </div>

              <span className="self-center sm:self-auto bg-[#EA9B28]/15 border border-[#EA9B28]/30 text-[#EA9B28] text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Anggota Terverifikasi</span>
              </span>
            </div>

            {/* Bio Editor */}
            {isEditing ? (
              <div className="space-y-2 pt-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#141415] border border-[#42403B] rounded-lg p-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#EA9B28]"
                />
                <button
                  onClick={handleSaveBio}
                  className="bg-[#EA9B28] text-[#141415] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Bio</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pt-1">
                <p className="text-xs text-[#B9BEC3] italic">"{bio}"</p>
                <button onClick={() => setIsEditing(true)} className="text-[#8E8B87] hover:text-[#EA9B28] p-1">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {savedSuccess && (
              <p className="text-[11px] text-[#5DBB63]">Bio berhasil diperbarui!</p>
            )}
          </div>
        </div>

        {/* Member Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#42403B] text-center">
          <div className="bg-[#141415] p-3 rounded-xl border border-[#42403B]">
            <span className="block font-heading font-extrabold text-xl text-[#EA9B28]">{stats.savedRoutes}</span>
            <span className="text-[11px] text-[#8E8B87]">Rute Favorit</span>
          </div>
          <div className="bg-[#141415] p-3 rounded-xl border border-[#42403B]">
            <span className="block font-heading font-extrabold text-xl text-[#EA9B28]">{stats.ridesJoined}</span>
            <span className="text-[11px] text-[#8E8B87]">Open Ride Diikuti</span>
          </div>
          <div className="bg-[#141415] p-3 rounded-xl border border-[#42403B]">
            <span className="block font-heading font-extrabold text-xl text-[#EA9B28]">{stats.forumPosts}</span>
            <span className="text-[11px] text-[#8E8B87]">Diskusi Forum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
