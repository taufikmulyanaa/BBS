'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, Search, Filter, Download } from 'lucide-react';
import { Route } from '@/lib/supabase';
import { INITIAL_ROUTES } from '@/lib/mockData';
import RouteCard from '@/components/RouteCard';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>([]);

  const handleSaveRoute = (routeId: string) => {
    setSavedRouteIds((prev) =>
      prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId]
    );
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = route.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || route.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-1.5 text-xs text-[#EA9B28] font-bold uppercase tracking-wider">
          <Navigation className="w-4 h-4" />
          <span>Katalog Rute Komunitas</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#F5F5F5]">
          Direktori Rute Gowes & GPX
        </h1>
        <p className="text-sm text-[#B9BEC3] max-w-2xl">
          Unduh file GPX rute favorit, pelajari elevasi & tingkat kesulitan sebelum gowes bersama komunitas.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#232322] border border-[#42403B] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Live Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8E8B87]" />
          <input
            type="text"
            placeholder="Cari rute, tanjakan, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141415] border border-[#42403B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-[#8E8B87] font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Level:</span>
          </span>

          {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedLevel === level
                  ? 'bg-[#EA9B28] text-[#141415] shadow-md'
                  : 'bg-[#141415] text-[#B9BEC3] border border-[#42403B] hover:text-[#F5F5F5]'
              }`}
            >
              {level === 'all' ? 'Semua Level' : level}
            </button>
          ))}
        </div>
      </div>

      {/* Route Cards Grid */}
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

      {filteredRoutes.length === 0 && (
        <div className="text-center py-16 bg-[#232322] border border-[#42403B] rounded-2xl space-y-3">
          <p className="text-base text-[#F5F5F5] font-bold">Rute tidak ditemukan</p>
          <p className="text-xs text-[#8E8B87]">Coba ubah kata kunci pencarian atau reset filter level.</p>
        </div>
      )}
    </div>
  );
}
