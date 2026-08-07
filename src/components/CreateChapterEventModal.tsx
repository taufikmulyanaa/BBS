'use client';

import React, { useState } from 'react';
import { X, Calendar, MapPin, Info, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
  chapterId: string;
};

export default function CreateChapterEventModal({ isOpen, onClose, onSuccess, currentUser, chapterId }: Props) {
  const [jenis, setJenis] = useState<'open_ride' | 'kopdar' | 'lainnya'>('open_ride');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [kuotaMaks, setKuotaMaks] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setJenis('open_ride');
    setJudul('');
    setDeskripsi('');
    setLokasi('');
    setTanggal('');
    setWaktu('');
    setKuotaMaks('');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from('chapter_events')
        .insert([
          {
            chapter_id: chapterId,
            jenis,
            judul,
            deskripsi: deskripsi || null,
            lokasi: lokasi || null,
            tanggal_waktu: new Date(`${tanggal}T${waktu}`).toISOString(),
            kuota_maks: kuotaMaks ? parseInt(kuotaMaks) : null,
            dibuat_oleh: currentUser.id,
            status: 'akan_datang',
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        await supabase.from('chapter_event_participants').insert([{ event_id: data[0].id, user_id: currentUser.id }]);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating chapter event:', err);
      setErrorMsg(err.message || 'Gagal membuat kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#222222] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#333333] bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20">
              <Calendar className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Tambah Kegiatan Chapter</h3>
              <p className="text-xs text-gray-400">Open ride, kopdar, atau kegiatan lainnya</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#333333] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-white">
          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form id="create-chapter-event-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Jenis Kegiatan *</label>
              <select
                value={jenis}
                onChange={(e: any) => setJenis(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="open_ride">Open Ride</option>
                <option value="kopdar">Kopdar</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Judul Kegiatan *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Gowes Pagi Sabtu Alun-Alun Bogor"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Tanggal *</label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Jam *</label>
                <input
                  type="time"
                  required
                  value={waktu}
                  onChange={(e) => setWaktu(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Lokasi</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Contoh: Alun-Alun Kota Bogor"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Kuota Maksimal (opsional)</label>
              <div className="relative">
                <Users className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="1"
                  placeholder="Kosongkan jika tidak dibatasi"
                  value={kuotaMaks}
                  onChange={(e) => setKuotaMaks(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Catatan</label>
              <textarea
                rows={3}
                placeholder="Info tambahan tentang kegiatan ini..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500 resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-5 bg-[#1E1E1E] border-t border-[#333333] flex items-center justify-end space-x-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition">
            Batal
          </button>
          <button
            type="submit"
            form="create-chapter-event-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? 'Menyimpan...' : 'Terbitkan Kegiatan'}
          </button>
        </div>
      </div>
    </div>
  );
}
