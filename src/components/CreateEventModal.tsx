'use client';

import React, { useState } from 'react';
import { X, Flag, Calendar, MapPin, Link as LinkIcon, Image as ImageIcon, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

export default function CreateEventModal({ isOpen, onClose, onSuccess, currentUser }: Props) {
  const [judul, setJudul] = useState('');
  const [penyelenggara, setPenyelenggara] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [linkPendaftaran, setLinkPendaftaran] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setJudul('');
    setPenyelenggara('');
    setLokasi('');
    setTanggalMulai('');
    setTanggalSelesai('');
    setLinkPendaftaran('');
    setDeskripsi('');
    setPosterFile(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk membagikan event.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      let posterUrl: string | null = null;
      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop();
        const filePath = `event-posters/${currentUser.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('forum-media').upload(filePath, posterFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('forum-media').getPublicUrl(filePath);
        posterUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('bike_events').insert([
        {
          judul,
          penyelenggara: penyelenggara || null,
          lokasi: lokasi || null,
          tanggal_mulai: new Date(tanggalMulai).toISOString(),
          tanggal_selesai: tanggalSelesai ? new Date(tanggalSelesai).toISOString() : null,
          link_pendaftaran: linkPendaftaran || null,
          deskripsi: deskripsi || null,
          poster_url: posterUrl,
          dibuat_oleh: currentUser.id,
          status: 'akan_datang',
        },
      ]);

      if (error) throw error;

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating bike event:', err);
      setErrorMsg(err.message || 'Gagal membagikan event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#222222] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#333333] bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20">
              <Flag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Bagikan Event Sepeda</h3>
              <p className="text-xs text-gray-400">Gran fondo, race, charity ride, atau event lainnya</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-[#333333] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-white">
          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form id="create-event-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Info className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">1. Informasi Event</h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Nama Event *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tour de Bogor Gran Fondo 2026"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Penyelenggara</label>
                  <input
                    type="text"
                    placeholder="Contoh: KOMINFO Kota Bogor"
                    value={penyelenggara}
                    onChange={(e) => setPenyelenggara(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                  />
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
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Deskripsi</label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan detail event ini..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Poster Event</label>
                <label className="flex items-center justify-center space-x-2 border border-dashed border-[#3A3A3A] rounded-lg px-3.5 py-4 text-xs text-gray-400 hover:border-amber-500 hover:text-amber-400 transition cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  <span>{posterFile ? posterFile.name : 'Pilih gambar poster'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPosterFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Calendar className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">2. Jadwal</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Tanggal Mulai *</label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Tanggal Selesai (opsional)</label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <LinkIcon className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">3. Link Pendaftaran</h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">URL Pendaftaran</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkPendaftaran}
                  onChange={(e) => setLinkPendaftaran(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-5 bg-[#1E1E1E] border-t border-[#333333] flex items-center justify-end space-x-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition">
            Batal
          </button>
          <button
            type="submit"
            form="create-event-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? 'Menyimpan...' : 'Bagikan Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
