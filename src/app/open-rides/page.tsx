'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { OpenRide } from '@/lib/supabase';
import { INITIAL_OPEN_RIDES } from '@/lib/mockData';
import OpenRideCard from '@/components/OpenRideCard';
import CreateRideModal from '@/components/CreateRideModal';

export default function OpenRidesPage() {
  const [rides, setRides] = useState<OpenRide[]>(INITIAL_OPEN_RIDES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joinedRideIds, setJoinedRideIds] = useState<string[]>([]);

  const handleCreateRide = (newRide: OpenRide) => {
    setRides((prev) => [newRide, ...prev]);
  };

  const handleJoinRide = (rideId: string) => {
    setJoinedRideIds((prev) =>
      prev.includes(rideId) ? prev.filter((id) => id !== rideId) : [...prev, rideId]
    );
  };

  const filteredRides = rides.filter((ride) => {
    const matchesSearch = ride.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.titik_kumpul.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || ride.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Create Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs text-[#EA9B28] font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Gowes Bareng Komunitas</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#F5F5F5]">
            Jadwal Open Ride Terdekat
          </h1>
          <p className="text-sm text-[#B9BEC3] max-w-2xl">
            Bergabung dengan sesi gowes bareng atau buat ajakan baru untuk anggota komunitas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#EA9B28]/20 flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Buat Open Ride Baru</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-[#232322] border border-[#42403B] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8E8B87]" />
          <input
            type="text"
            placeholder="Cari ajakan gowes atau titik kumpul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141415] border border-[#42403B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-[#8E8B87] font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Pace:</span>
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
              {level === 'all' ? 'Semua Pace' : level}
            </button>
          ))}
        </div>
      </div>

      {/* Ride Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredRides.map((ride) => (
          <OpenRideCard
            key={ride.id}
            ride={ride}
            onJoin={handleJoinRide}
            isJoined={joinedRideIds.includes(ride.id)}
          />
        ))}
      </div>

      {/* Modal */}
      <CreateRideModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRide}
      />
    </div>
  );
}
