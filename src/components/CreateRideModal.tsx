'use client';

import React, { useState } from 'react';
import { X, Calendar, MapPin, Navigation, Users, AlignLeft } from 'lucide-react';
import { OpenRide } from '@/lib/supabase';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#232322] border border-[#42403B] rounded-2xl p-6 text-[#F5F5F5] space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#42403B] pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#F5F5F5]">Buat Ajakan Gowes (Open Ride)</h3>
            <p className="text-xs text-[#B9BEC3] mt-0.5">Undang bapak-bapak lain gowes bareng akhir pekan ini</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8E8B87] hover:text-[#F5F5F5] hover:bg-[#141415]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#B9BEC3] mb-1">Judul Gowes Bareng</label>
            <input
              type="text"
              required
              placeholder="Contoh: Morning Ride Santai ke Kopi KM0"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full bg-[#141415] border border-[#42403B] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#B9BEC3] mb-1">Titik Kumpul / Start</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#EA9B28]" />
              <input
                type="text"
                required
                placeholder="Pos Polisi Simpang Alun-Alun"
                value={titikKumpul}
                onChange={(e) => setTitikKumpul(e.target.value)}
                className="w-full bg-[#141415] border border-[#42403B] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#B9BEC3] mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-[#141415] border border-[#42403B] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#EA9B28]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#B9BEC3] mb-1">Jam Start (WIB)</label>
              <input
                type="time"
                required
                value={jam}
                onChange={(e) => setJam(e.target.value)}
                className="w-full bg-[#141415] border border-[#42403B] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#EA9B28]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#B9BEC3] mb-1">Jarak (km)</label>
              <input
                type="number"
                required
                min={1}
                value={jarakKm}
                onChange={(e) => setJarakKm(Number(e.target.value))}
                className="w-full bg-[#141415] border border-[#42403B] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#EA9B28]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#B9BEC3] mb-1">Tingkat Kesulitan</label>
              <select
                value={level}
                onChange={(e: any) => setLevel(e.target.value)}
                className="w-full bg-[#141415] border border-[#42403B] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#EA9B28]"
              >
                <option value="easy">Easy (Santai)</option>
                <option value="medium">Medium (Sedang)</option>
                <option value="hard">Hard (Berat)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#B9BEC3] mb-1">Kuota Maksimal</label>
              <input
                type="number"
                required
                min={2}
                max={100}
                value={kuotaMaks}
                onChange={(e) => setKuotaMaks(Number(e.target.value))}
                className="w-full bg-[#141415] border border-[#42403B] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#EA9B28]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#B9BEC3] mb-1">Catatan Tambahan (Pace, Perlengkapan, dll)</label>
            <textarea
              rows={3}
              placeholder="Contoh: Pace rata-rata 20-22 km/jam. Regroup di KM 15 warung kopi Mbok."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-[#141415] border border-[#42403B] rounded-lg p-3 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
            />
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#141415] hover:bg-[#2A2A2A] text-[#B9BEC3] border border-[#42403B] py-2.5 rounded-xl font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] font-bold py-2.5 rounded-xl shadow-md shadow-[#EA9B28]/20"
            >
              Publish Open Ride
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
