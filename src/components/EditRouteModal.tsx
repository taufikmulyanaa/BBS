'use client';

import React, { useState, useEffect } from 'react';
import { X, Navigation, Edit3, Send, Trash2 } from 'lucide-react';
import { supabase, Route } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  route: Route | null;
  currentUser: any;
};

export default function EditRouteModal({ isOpen, onClose, onSuccess, route, currentUser }: Props) {
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jarakKm, setJarakKm] = useState('30');
  const [elevasiM, setElevasiM] = useState('350');
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [gpxUrl, setGpxUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (route) {
      setNama(route.nama || '');
      setDeskripsi(route.deskripsi || '');
      setJarakKm(route.jarak_km?.toString() || '30');
      setElevasiM(route.elevasi_m?.toString() || '350');
      setLevel(route.level || 'medium');
      setTagsInput(route.tags?.join(', ') || '');
      setGpxUrl(route.gpx_file_url || '');
      setCoverUrl(route.cover_image_url || '');
    }
  }, [route]);

  if (!isOpen || !route) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk memperbarui rute.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const { error } = await supabase
        .from('routes')
        .update({
          nama,
          deskripsi,
          jarak_km: parseFloat(jarakKm),
          elevasi_m: parseInt(elevasiM),
          level,
          tags: tagsArray,
          gpx_file_url: gpxUrl || route.gpx_file_url,
          cover_image_url: coverUrl || route.cover_image_url,
        })
        .eq('id', route.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating route:', err);
      setErrorMsg(err.message || 'Gagal memperbarui rute.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus rute "${route.nama}"?`)) return;

    setDeleting(true);
    try {
      const { error } = await supabase.from('routes').delete().eq('id', route.id);
      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting route:', err);
      setErrorMsg(err.message || 'Gagal menghapus rute.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#262626] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden p-6 text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-md">
              <Edit3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Edit Detail Rute</h3>
              <p className="text-xs text-gray-400">Perbarui informasi jarak, elevasi, atau deskripsi rute</p>
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
              Deskripsi Rute
            </label>
            <textarea
              rows={2}
              required
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
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3.5 py-2 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition flex items-center space-x-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Rute</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg flex items-center space-x-2 disabled:opacity-50"
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
        </form>
      </div>
    </div>
  );
}
