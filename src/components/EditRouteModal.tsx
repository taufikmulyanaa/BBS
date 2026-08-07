'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, Send, Trash2, MapPin, Bike, Upload, Image, Flag } from 'lucide-react';
import { supabase, Route } from '@/lib/supabase';
import MapLocationPickerModal from './MapLocationPickerModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  route: Route | null;
  currentUser: any;
};

export default function EditRouteModal({ isOpen, onClose, onSuccess, route, currentUser }: Props) {
  const [nama, setNama] = useState('');
  const [titikStart, setTitikStart] = useState('');
  const [titikFinish, setTitikFinish] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jarakKm, setJarakKm] = useState('30');
  const [elevasiM, setElevasiM] = useState('350');
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [jenisSepeda, setJenisSepeda] = useState('Semua Sepeda (All Bike)');
  const [tagsInput, setTagsInput] = useState('');
  const [gpxUrl, setGpxUrl] = useState('');
  const [gpxFileName, setGpxFileName] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapPickerTarget, setMapPickerTarget] = useState<'start' | 'finish' | null>(null);

  useEffect(() => {
    if (route) {
      setNama(route.nama || '');
      
      let cleanDesc = route.deskripsi || '';
      let startMatch = cleanDesc.match(/📍 Titik Start: (.*?)\n/);
      if (startMatch && startMatch[1]) {
        setTitikStart(startMatch[1]);
        cleanDesc = cleanDesc.replace(/📍 Titik Start: .*?\n/, '');
      }

      let finishMatch = cleanDesc.match(/🏁 Titik Finish: (.*?)\n/);
      if (finishMatch && finishMatch[1]) {
        setTitikFinish(finishMatch[1]);
        cleanDesc = cleanDesc.replace(/🏁 Titik Finish: .*?\n/, '');
      }

      let bikeMatch = cleanDesc.match(/🚴 Jenis Sepeda: (.*?)\n\n/);
      if (bikeMatch && bikeMatch[1]) {
        setJenisSepeda(bikeMatch[1]);
        cleanDesc = cleanDesc.replace(/🚴 Jenis Sepeda: .*?\n\n/, '');
      }

      setDeskripsi(cleanDesc.trim());
      setJarakKm(route.jarak_km?.toString() || '30');
      setElevasiM(route.elevasi_m?.toString() || '350');
      setLevel(route.level || 'medium');
      setTagsInput(route.tags?.join(', ') || '');
      setGpxUrl(route.gpx_file_url || '');
      setCoverUrl(route.cover_image_url || '');
    }
  }, [route]);

  if (!isOpen || !route) return null;

  const handleGpxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGpxFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const blob = new Blob([content], { type: 'application/gpx+xml' });
      const blobUrl = URL.createObjectURL(blob);
      setGpxUrl(blobUrl);
    };
    reader.readAsText(file);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk memperbarui rute.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const baseTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const tagsArray = [...new Set([...baseTags, jenisSepeda])];

      const startText = titikStart ? `📍 Titik Start: ${titikStart}\n` : '';
      const finishText = titikFinish ? `🏁 Titik Finish: ${titikFinish}\n` : '';
      const fullDeskripsi = `${startText}${finishText}🚴 Jenis Sepeda: ${jenisSepeda}\n\n${deskripsi}`;

      const { error } = await supabase
        .from('routes')
        .update({
          nama,
          deskripsi: fullDeskripsi,
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
      <div className="relative w-full max-w-lg bg-[#262626] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden p-6 text-white space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#333333] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-md">
              <Edit3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Edit Detail Rute</h3>
              <p className="text-xs text-gray-400">Perbarui informasi rute, jarak, elevasi, atau upload GPX baru</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Titik Start (Awal)</span>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('start')}
                  className="text-xs text-amber-400 hover:underline flex items-center space-x-1 font-semibold"
                  title="Pilih Lokasi dari Peta"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pilih di Peta</span>
                </button>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Gedung Sate / Indomaret KM 0"
                  value={titikStart}
                  onChange={(e) => setTitikStart(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Titik Tujuan (Finish)</span>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget('finish')}
                  className="text-xs text-green-400 hover:underline flex items-center space-x-1 font-semibold"
                  title="Pilih Lokasi dari Peta"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Pilih di Peta</span>
                </button>
              </label>
              <div className="relative">
                <Flag className="w-4 h-4 text-green-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Tangkuban Perahu / Pantai Pangandaran"
                  value={titikFinish}
                  onChange={(e) => setTitikFinish(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Kategori Sepeda (Surface)
              </label>
              <div className="relative">
                <Bike className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <select
                  value={jenisSepeda}
                  onChange={(e) => setJenisSepeda(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="Semua Sepeda (All Bike)">Semua Sepeda (All Bike)</option>
                  <option value="Road Bike / RB">Road Bike (Aspal Mulus)</option>
                  <option value="Gravel Bike">Gravel / Makadam</option>
                  <option value="MTB / Offroad">MTB / Offroad / Tanah</option>
                  <option value="Sepeda Lipat / Seli">Sepeda Lipat / City</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
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
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
              Tingkat Level Kesulitan
            </label>
            <select
              value={level}
              onChange={(e: any) => setLevel(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            >
              <option value="easy">EASY (Ramah Pemula & Datar)</option>
              <option value="medium">MEDIUM (Tanjakan Sedang)</option>
              <option value="hard">HARD (Tanjakan Ekstrem & Endurance)</option>
            </select>
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

          {/* Upload Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-[#333333]">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload GPX Baru</span>
              </label>
              <input
                type="file"
                accept=".gpx"
                onChange={handleGpxFileChange}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-2 text-xs text-gray-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
              />
              {gpxFileName && <p className="text-[11px] text-green-400 mt-1 truncate">✓ {gpxFileName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Image className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Foto Cover Baru</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-2 text-xs text-gray-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
              />
            </div>
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

      <MapLocationPickerModal
        isOpen={mapPickerTarget !== null}
        onClose={() => setMapPickerTarget(null)}
        title={mapPickerTarget === 'start' ? 'Pilih Titik Start' : 'Pilih Titik Tujuan (Finish)'}
        onSelect={(lat, lng) => {
          if (mapPickerTarget === 'start') {
            setTitikStart(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          } else {
            setTitikFinish(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          }
        }}
      />
    </div>
  );
}
