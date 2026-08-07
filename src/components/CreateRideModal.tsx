'use client';

import React, { useState } from 'react';
import { X, Calendar, MapPin, Navigation, Users, AlignLeft, Bike, Info, Gauge } from 'lucide-react';
import { OpenRide } from '@/lib/supabase';
import MapLocationPickerModal from './MapLocationPickerModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newRide: OpenRide) => void;
};

export default function CreateRideModal({ isOpen, onClose, onCreate }: Props) {
  const [judul, setJudul] = useState('');
  const [titikKumpul, setTitikKumpul] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('06:00');
  const [jarakKm, setJarakKm] = useState(25);
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [kuotaMaks, setKuotaMaks] = useState(15);
  const [catatan, setCatatan] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const datetimeIso = new Date(`${tanggal || new Date().toISOString().split('T')[0]}T${jam}:00`).toISOString();

    const newRide: OpenRide = {
      id: `ride-${Date.now()}`,
      judul,
      titik_kumpul: titikKumpul,
      tanggal_waktu: datetimeIso,
      jarak_km: Number(jarakKm),
      level,
      kuota_maks: Number(kuotaMaks),
      catatan,
      status: 'akan_datang',
      participant_count: 1,
      created_at: new Date().toISOString(),
    };

    onCreate(newRide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#222222] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#333333] bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20">
              <Bike className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Buat Ajakan Gowes (Open Ride)</h3>
              <p className="text-xs text-gray-400">Undang anggota komunitas untuk gowes bareng akhir pekan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#333333] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-white">
          <form id="create-ride-modal-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION 1: Informasi & Jadwal */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Calendar className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  1. Judul & Jadwal Gowes
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Judul Gowes Bareng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Morning Ride Santai ke Kopi KM0"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Tanggal Gowes
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Jam Start (WIB)
                  </label>
                  <input
                    type="time"
                    required
                    value={jam}
                    onChange={(e) => setJam(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Titik Kumpul (Meeting Point) */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <MapPin className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  2. Lokasi Titik Kumpul (Meeting Point)
                </h4>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Titik Kumpul / Start *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Pilih di Peta</span>
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pos Polisi Simpang Alun-Alun"
                    value={titikKumpul}
                    onChange={(e) => setTitikKumpul(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Spesifikasi & Kuota */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Gauge className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  3. Spesifikasi Gowes & Kuota Peserta
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Jarak Target (KM)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      min={1}
                      value={jarakKm}
                      onChange={(e) => setJarakKm(Number(e.target.value))}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="absolute right-3 text-xs font-bold text-amber-500">KM</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Target Level
                  </label>
                  <select
                    value={level}
                    onChange={(e: any) => setLevel(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                  >
                    <option value="easy">EASY (Santai)</option>
                    <option value="medium">MEDIUM (Sedang)</option>
                    <option value="hard">HARD (Berat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Kuota Maksimal
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      min={2}
                      max={100}
                      value={kuotaMaks}
                      onChange={(e) => setKuotaMaks(Number(e.target.value))}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-3.5 pr-14 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="absolute right-3 text-xs font-bold text-amber-500">Orang</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Catatan Gowes */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Info className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  4. Catatan Gowes & Perlengkapan
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Catatan Tambahan (Pace, Regroup, Perlengkapan)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Pace rata-rata 20-22 km/jam. Regroup di KM 15 warung kopi Mbok."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500 resize-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#1E1E1E] border-t border-[#333333] flex items-center justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition"
          >
            Batal
          </button>
          <button
            type="submit"
            form="create-ride-modal-form"
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Terbitkan Open Ride</span>
          </button>
        </div>
      </div>

      <MapLocationPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        title="Pilih Titik Kumpul (Meeting Point)"
        onSelect={(lat, lng) => {
          setTitikKumpul(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        }}
      />
    </div>
  );
}

