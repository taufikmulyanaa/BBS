'use client';

import React, { useState, useEffect } from 'react';
import { Flag, Plus, Search, Filter } from 'lucide-react';
import { supabase, BikeEvent } from '@/lib/supabase';
import EventCard from '@/components/EventCard';
import CreateEventModal from '@/components/CreateEventModal';
import EditEventModal from '@/components/EditEventModal';

export default function EventsPage() {
  const [events, setEvents] = useState<BikeEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'akan_datang' | 'selesai' | 'dibatalkan'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BikeEvent | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const { data } = await supabase.from('bike_events').select('*').order('tanggal_mulai', { ascending: true });
      if (data) setEvents(data);
    } catch (err) {
      console.error('Error fetching bike events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.lokasi || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <Flag className="w-4 h-4" />
            <span>Event Sepeda</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">Kalender Event Sepeda</h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Gran fondo, race, charity ride, dan event lainnya. Tandai minat, cari teman berangkat, dan diskusi bareng.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Bagikan Event Baru</span>
        </button>
      </div>

      <div className="bg-[#262626] border border-[#333333] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari event atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-gray-400 font-semibold mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'akan_datang', label: 'Akan Datang' },
              { id: 'selesai', label: 'Selesai' },
              { id: 'dibatalkan', label: 'Dibatalkan' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === s.id ? 'bg-amber-500 text-black shadow-md' : 'bg-[#1A1A1A] text-gray-400 border border-[#333333] hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Memuat event sepeda...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-[#262626] border border-[#333333] rounded-2xl space-y-3">
          <Flag className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
          <h3 className="text-white font-bold text-base">Belum Ada Event Sepeda</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Jadilah yang pertama membagikan event sepeda untuk komunitas!</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Bagikan Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} currentUser={currentUser} onEdit={(e) => setEditingEvent(e)} />
          ))}
        </div>
      )}

      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchEvents} currentUser={currentUser} />

      <EditEventModal isOpen={editingEvent !== null} onClose={() => setEditingEvent(null)} onSuccess={fetchEvents} event={editingEvent} currentUser={currentUser} />
    </div>
  );
}
