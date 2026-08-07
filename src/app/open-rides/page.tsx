'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { supabase, OpenRide } from '@/lib/supabase';
import OpenRideCard from '@/components/OpenRideCard';
import CreateOpenRideModal from '@/components/CreateOpenRideModal';
import EditOpenRideModal from '@/components/EditOpenRideModal';

export default function OpenRidesPage() {
  const [rides, setRides] = useState<OpenRide[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<OpenRide | null>(null);
  const [joinedRideIds, setJoinedRideIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    try {
      const { data } = await supabase
        .from('open_rides')
        .select('*')
        .order('tanggal_waktu', { ascending: true });
      if (data) setRides(data);
    } catch (err) {
      console.error('Error fetching open rides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        // Fetch joined rides for current user
        const { data: participants } = await supabase
          .from('ride_participants')
          .select('open_ride_id')
          .eq('user_id', user.id);
        if (participants) {
          setJoinedRideIds(participants.map((p) => p.open_ride_id));
        }
      }
    });

    fetchRides();
  }, []);

  const handleJoinRide = (rideId: string) => {
    setJoinedRideIds((prev) =>
      prev.includes(rideId) ? prev.filter((id) => id !== rideId) : [...prev, rideId]
    );
  };

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.titik_kumpul.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || ride.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Create Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Gowes Bareng Komunitas</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Jadwal Open Ride Terdekat
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Bergabung dengan sesi gowes bareng atau buat ajakan baru untuk anggota komunitas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Buat Open Ride Baru</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-[#262626] border border-[#333333] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ajakan gowes atau titik kumpul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-gray-400 font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Pace:</span>
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
              {level === 'all' ? 'Semua Pace' : level}
            </button>
          ))}
        </div>
      </div>

      {/* Ride Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Memuat jadwal Open Ride...</div>
      ) : filteredRides.length === 0 ? (
        <div className="text-center py-16 bg-[#262626] border border-[#333333] rounded-2xl space-y-3">
          <Calendar className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
          <h3 className="text-white font-bold text-base">Belum Ada Ajakan Gowes</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Jadilah yang pertama membuat ajakan Open Ride untuk teman-teman komunitas!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Open Ride</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredRides.map((ride) => (
            <OpenRideCard
              key={ride.id}
              ride={ride}
              onJoin={handleJoinRide}
              onEdit={(r) => setEditingRide(r)}
              isJoined={joinedRideIds.includes(ride.id)}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* Modal Create */}
      <CreateOpenRideModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchRides}
        currentUser={currentUser}
      />

      {/* Modal Edit & Delete */}
      <EditOpenRideModal
        isOpen={editingRide !== null}
        onClose={() => setEditingRide(null)}
        onSuccess={fetchRides}
        ride={editingRide}
        currentUser={currentUser}
      />
    </div>
  );
}

