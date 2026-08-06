'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, Search, Filter, Plus } from 'lucide-react';
import { supabase, Route } from '@/lib/supabase';
import RouteCard from '@/components/RouteCard';
import CreateRouteModal from '@/components/CreateRouteModal';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      const { data } = await supabase.from('routes').select('*').order('created_at', { ascending: false });
      if (data) setRoutes(data);
    } catch (err) {
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        const { data: saved } = await supabase
          .from('saved_routes')
          .select('route_id')
          .eq('user_id', user.id);
        if (saved) {
          setSavedRouteIds(saved.map((s) => s.route_id));
        }
      }
    });

    fetchRoutes();
  }, []);

  const handleSaveRoute = async (routeId: string) => {
    if (!currentUser) {
      alert('Silakan masuk terlebih dahulu untuk menyimpan rute favorit.');
      return;
    }

    const isSaved = savedRouteIds.includes(routeId);

    try {
      if (isSaved) {
        await supabase
          .from('saved_routes')
          .delete()
          .match({ route_id: routeId, user_id: currentUser.id });

        setSavedRouteIds((prev) => prev.filter((id) => id !== routeId));
      } else {
        await supabase
          .from('saved_routes')
          .insert([{ route_id: routeId, user_id: currentUser.id }]);

        setSavedRouteIds((prev) => [...prev, routeId]);
      }
    } catch (err) {
      console.error('Error saving route bookmark:', err);
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || route.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Create Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <Navigation className="w-4 h-4" />
            <span>Katalog Rute Komunitas</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Direktori Rute Gowes & GPX
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Unduh file GPX rute favorit, pelajari elevasi & tingkat kesulitan sebelum gowes bersama komunitas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Tambah Rute Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#262626] border border-[#333333] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Live Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari rute, tanjakan, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-gray-400 font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Level:</span>
          </span>

          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedLevel === level
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-[#1A1A1A] text-gray-400 border border-[#333333] hover:text-white'
              }`}
            >
              {level === 'all' ? 'Semua Level' : level}
            </button>
          ))}
        </div>
      </div>

      {/* Route Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Memuat katalog rute...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onSave={handleSaveRoute}
              isSaved={savedRouteIds.includes(route.id)}
            />
          ))}
        </div>
      )}

      {!loading && filteredRoutes.length === 0 && (
        <div className="text-center py-16 bg-[#262626] border border-[#333333] rounded-2xl space-y-3">
          <p className="text-base text-white font-bold">Rute tidak ditemukan</p>
          <p className="text-xs text-gray-400">Coba ubah kata kunci pencarian atau reset filter level.</p>
        </div>
      )}

      {/* Create Route Modal */}
      <CreateRouteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchRoutes}
        currentUser={currentUser}
      />
    </div>
  );
}
