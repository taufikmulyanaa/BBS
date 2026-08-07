'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, MapPin, Tag, Send, Info } from 'lucide-react';
import { supabase, ForumPost } from '@/lib/supabase';
import MapLocationPickerModal from './MapLocationPickerModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post: ForumPost | null;
  currentUser: any;
};

export default function EditForumPostModal({ isOpen, onClose, onSuccess, post, currentUser }: Props) {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tipe, setTipe] = useState<'laporan_jalan' | 'diskusi' | 'rekomendasi_warkop'>('laporan_jalan');
  const [lokasiPatokan, setLokasiPatokan] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (post) {
      setJudul(post.judul || '');
      setIsi(post.isi || '');
      setLokasiPatokan(post.lokasi_patokan || '');

      if (post.tipe === 'laporan_kondisi' || post.tipe === 'laporan_jalan') {
        setTipe('laporan_jalan');
      } else if (post.tipe === 'rekomendasi_warkop' || post.judul.includes('[WARKOP]')) {
        setTipe('rekomendasi_warkop');
      } else {
        setTipe('diskusi');
      }
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk mengedit postingan.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const isWarkop = tipe === 'rekomendasi_warkop';
      const warkopTag = '[WARKOP]';
      
      const fullContent = isWarkop && !isi.includes(warkopTag)
        ? `${warkopTag}\n\n${lokasiPatokan ? `📍 Lokasi: ${lokasiPatokan}\n\n` : ''}${isi}`
        : lokasiPatokan && !isi.includes('📍 Lokasi:') ? `📍 Lokasi: ${lokasiPatokan}\n\n${isi}` : isi;

      const dbType = tipe === 'laporan_jalan' ? 'laporan_kondisi' : 'diskusi';
      const finalJudul = isWarkop && !judul.includes(warkopTag) 
        ? `☕ ${warkopTag} ${judul}` 
        : judul;

      const { error } = await supabase
        .from('forum_posts')
        .update({
          judul: finalJudul,
          isi: fullContent,
          tipe: dbType,
          lokasi_patokan: lokasiPatokan || null,
        })
        .eq('id', post.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating forum post:', err);
      setErrorMsg(err.message || 'Gagal mengedit postingan forum.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus postingan "${post.judul}"?`)) return;

    setDeleting(true);
    setErrorMsg(null);

    try {
      // First delete likes & comments
      await supabase.from('forum_likes').delete().eq('post_id', post.id);
      await supabase.from('forum_comments').delete().eq('post_id', post.id);

      // Then delete post
      const { error } = await supabase.from('forum_posts').delete().eq('id', post.id);
      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting forum post:', err);
      setErrorMsg(err.message || 'Gagal menghapus postingan forum.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#222222] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#333333] bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20">
              <Edit3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Edit Post Forum</h3>
              <p className="text-xs text-gray-400">Perbarui isi postingan atau hapus postingan forum Anda</p>
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
          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form id="edit-forum-post-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION 1: Judul & Kategori */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Tag className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  1. Judul & Kategori Forum
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Judul Topik / Laporan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Perbaikan Aspal di KM 12 Tanjakan Pelangi"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Kategori Post *
                </label>
                <select
                  value={tipe}
                  onChange={(e: any) => setTipe(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                >
                  <option value="laporan_jalan">🚨 Laporan Kondisi Jalan</option>
                  <option value="diskusi">💬 Diskusi Komunitas / Gear</option>
                  <option value="rekomendasi_warkop">☕ Rekomendasi Warkop Gowes</option>
                </select>
              </div>
            </div>

            {/* SECTION 2: Lokasi Patokan */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <MapPin className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  2. Lokasi / Patokan
                </h4>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Lokasi / Patokan Jalan (Opsional)
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
                    placeholder="Contoh: KM 12 Jalur Tanjakan Kertasari"
                    value={lokasiPatokan}
                    onChange={(e) => setLokasiPatokan(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Isi Pesan */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Info className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  3. Detail Informasi & Pesan
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Isi Pesan / Laporan Detail *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan info lengkap kondisi jalan, perbaikan yang sedang berlangsung, atau rekomendasi warkop..."
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500 resize-none"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#1E1E1E] border-t border-[#333333] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2.5 rounded-lg border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Hapus...' : 'Hapus Post'}</span>
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition"
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-forum-post-form"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <MapLocationPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        title="Pilih Lokasi Patokan di Peta"
        onSelect={(lat, lng) => {
          setLokasiPatokan(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        }}
      />
    </div>
  );
}
