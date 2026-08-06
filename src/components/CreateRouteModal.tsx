'use client';

import React, { useState } from 'react';
import { X, Navigation, Mountain, Tag, Image, FileText, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

export default function CreateRouteModal({ isOpen, onClose, onSuccess, currentUser }: Props) {
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jarakKm, setJarakKm] = useState('30');
  const [elevasiM, setElevasiM] = useState('350');
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tagsInput, setTagsInput] = useState('Tanjakan, Pemandangan, Kopi');
  const [gpxUrl, setGpxUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk menambah rute baru.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const defaultCover =
        coverUrl ||
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80';

      const defaultGpx =
        gpxUrl ||
        'https://lfwguyfgyyemdkpdobij.supabase.co/storage/v1/object/public/routes-gpx/amber-peak.gpx';

      const { error } = await supabase.from('routes').insert([
        {
          nama,
          deskripsi,
          jarak_km: parseFloat(jarakKm),
          elevasi_m: parseInt(elevasiM),
          level,
          tags: tagsArray,
          gpx_file_url: defaultGpx,
          cover_image_url: defaultCover,
          status_verifikasi: 'terverifikasi',
          rating_avg: 4.8,
          rating_count: 1,
          dibuat_oleh: currentUser.id,
        },
      ]);

      if (error) throw error;

      onSuccess();
      onClose();
      // Reset form
      setNama('');
      setDeskripsi('');
      setGpxUrl('');
      setCoverUrl('');
    } catch (err: any) {
      console.error('Error creating route:', err);
      setErrorMsg(err.message || 'Gagal menambah rute baru.');
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
              <Navigation className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Tambah Rute Gowes Baru</h3>
              <p className="text-xs text-gray-400">Bagikan trek rute sepeda favorit untuk komunitas</p>
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
              Nama Rute Sepeda
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Rute Tanjakan Kopi Kebun Teh KM 25"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Jarak (KM)
              </label>
              <input
                type="number"
                required
                step="0.1"
                value={jarakKm}
                onChange={(e) => setJarakKm(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Elevasi (m)
              </label>
              <input
                type="number"
                required
                value={elevasiM}
                onChange={(e) => setElevasiM(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Tingkat Level
              </label>
              <select
                value={level}
                onChange={(e: any) => setLevel(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value="easy">EASY</option>
                <option value="medium">MEDIUM</option>
                <option value="hard">HARD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Deskripsi Singkat Rute
            </label>
            <textarea
              rows={2}
              required
              placeholder="Deskripsi trek gowes, jenis aspal/tanah, pemandangan, dan tempat istirahat..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Tags Rute (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Tanjakan, Kuliner, Pemandangan"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                URL Gambar Cover (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                URL File GPX (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://.../route.gpx"
                value={gpxUrl}
                onChange={(e) => setGpxUrl(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
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
                  <Send className="w-4 h-4" />
                  <span>Simpan Rute</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
