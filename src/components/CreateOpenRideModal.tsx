'use client';

import React, { useState } from 'react';
import { X, Calendar, MapPin, Navigation, Users, AlignLeft, Bike } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

export default function CreateOpenRideModal({ isOpen, onClose, onSuccess, currentUser }: Props) {
  const [judul, setJudul] = useState('');
  const [titikKumpul, setTitikKumpul] = useState('');
  const [tanggalWaktu, setTanggalWaktu] = useState('');
  const [jarakKm, setJarakKm] = useState('25');
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [kuotaMaks, setKuotaMaks] = useState('15');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk membuat Open Ride.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.from('open_rides').insert([
        {
          judul,
          titik_kumpul: titikKumpul,
          tanggal_waktu: new Date(tanggalWaktu).toISOString(),
          jarak_km: parseFloat(jarakKm),
          level,
          kuota_maks: parseInt(kuotaMaks),
          catatan,
          creator_id: currentUser.id,
          status: 'akan_datang',
        },
      ]).select();

      if (error) throw error;

      // Automatically add creator as first participant
      if (data && data[0]) {
        await supabase.from('ride_participants').insert([
          {
            ride_id: data[0].id,
            user_id: currentUser.id,
            status: 'terkonfirmasi',
          },
        ]);
      }

      onSuccess();
      onClose();
      // Reset form
      setJudul('');
      setTitikKumpul('');
      setTanggalWaktu('');
      setCatatan('');
    } catch (err: any) {
      console.error('Error creating open ride:', err);
      setErrorMsg(err.message || 'Gagal membuat Open Ride.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#262626] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden p-6 text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-md">
              <Bike className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Buat Open Ride Baru</h3>
              <p className="text-xs text-gray-400">Ajak anggota komunitas gowes bareng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#333333] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Judul Ajakan Gowes
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gowes Tipis-Tipis Minggu Pagi Kebun Teh"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Titik Kumpul (Meeting Point)</span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setTitikKumpul(`Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`);
                        },
                        () => alert('Gagal mengambil lokasi GPS. Silakan ketik nama lokasi secara manual.')
                      );
                    }
                  }}
                  className="text-[10px] text-amber-400 hover:underline flex items-center space-x-0.5"
                  title="Deteksi Lokasi GPS Saat Ini"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Pin GPS</span>
                </button>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Alun-Alun Depan Pos Polisi"
                  value={titikKumpul}
                  onChange={(e) => setTitikKumpul(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Tanggal & Jam Gowes
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="datetime-local"
                  required
                  value={tanggalWaktu}
                  onChange={(e) => setTanggalWaktu(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Jarak (KM)
              </label>
              <input
                type="number"
                required
                min="1"
                value={jarakKm}
                onChange={(e) => setJarakKm(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Target Level
              </label>
              <select
                value={level}
                onChange={(e: any) => setLevel(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value="easy">EASY (Santai)</option>
                <option value="medium">MEDIUM (Sedang)</option>
                <option value="hard">HARD (Tanjakan/Cepat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Kuota Maks
              </label>
              <input
                type="number"
                required
                min="2"
                max="100"
                value={kuotaMaks}
                onChange={(e) => setKuotaMaks(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Catatan Gowes & Perlengkapan
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Kecepatan rata-rata 20-22 km/jam. Wajib helm, lampu depan/belakang, dan uang saku buat warkop Mbah Kaji!"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Terbitkan Open Ride</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
