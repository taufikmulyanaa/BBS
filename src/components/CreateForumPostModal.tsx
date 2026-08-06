'use client';

import React, { useState } from 'react';
import { X, MessageSquare, MapPin, Tag, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

export default function CreateForumPostModal({ isOpen, onClose, onSuccess, currentUser }: Props) {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tipe, setTipe] = useState<'laporan_jalan' | 'diskusi' | 'rekomendasi_warkop'>('laporan_jalan');
  const [lokasiPatokan, setLokasiPatokan] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk membuat postingan forum.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const fullContent = lokasiPatokan
        ? `📍 Lokasi: ${lokasiPatokan}\n\n${isi}`
        : isi;

      const dbType = tipe === 'laporan_jalan' ? 'laporan_kondisi' : 'diskusi';

      const { error } = await supabase.from('forum_posts').insert([
        {
          judul,
          isi: fullContent,
          tipe: dbType,
          user_id: currentUser.id,
        },
      ]);

      if (error) throw error;

      onSuccess();
      onClose();
      // Reset form
      setJudul('');
      setIsi('');
      setLokasiPatokan('');
    } catch (err: any) {
      console.error('Error creating forum post:', err);
      setErrorMsg(err.message || 'Gagal mengirim postingan forum.');
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
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Post Diskusi / Laporan Baru</h3>
              <p className="text-xs text-gray-400">Bagikan info kondisi jalan, gear, atau warkop favorit</p>
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
              Judul Topik / Laporan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Perbaikan Aspal di KM 12 Tanjakan Pelangi"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Kategori Post
              </label>
              <select
                value={tipe}
                onChange={(e: any) => setTipe(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value="laporan_jalan">🚨 Laporan Kondisi Jalan</option>
                <option value="diskusi">💬 Diskusi Komunitas / Gear</option>
                <option value="rekomendasi_warkop">☕ Rekomendasi Warkop Gowes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Lokasi / Patokan (Opsional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="KM 12 Jalur Tanjakan"
                  value={lokasiPatokan}
                  onChange={(e) => setLokasiPatokan(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Isi Pesan / Laporan Detail
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan info lengkap kondisi jalan, perbaikan yang sedang berlangsung, atau saran untuk anggota gowes lainnya..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition resize-none"
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
                <span>Kirim...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Postingan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
