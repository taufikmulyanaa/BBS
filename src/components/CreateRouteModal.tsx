'use client';

import React, { useState } from 'react';
import { X, Navigation, Upload, Image, MapPin, Bike, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

export default function CreateRouteModal({ isOpen, onClose, onSuccess, currentUser }: Props) {
  const [nama, setNama] = useState('');
  const [titikStart, setTitikStart] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jarakKm, setJarakKm] = useState('30');
  const [elevasiM, setElevasiM] = useState('350');
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [jenisSepeda, setJenisSepeda] = useState('Semua Sepeda (All Bike)');
  const [tagsInput, setTagsInput] = useState('Tanjakan, Pemandangan, Kopi');
  const [gpxUrl, setGpxUrl] = useState('');
  const [gpxFileName, setGpxFileName] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGpxFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGpxFileName(file.name);

    // Read GPX file content or create blob object URL
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

    // Create Data URL for instant photo preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk menambah rute baru.');
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

      const defaultCover =
        coverUrl ||
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80';

      const fullDeskripsi = titikStart
        ? `📍 Titik Start: ${titikStart}\n🚴 Jenis Sepeda: ${jenisSepeda}\n\n${deskripsi}`
        : `🚴 Jenis Sepeda: ${jenisSepeda}\n\n${deskripsi}`;

      const { error } = await supabase.from('routes').insert([
        {
          nama,
          deskripsi: fullDeskripsi,
          jarak_km: parseFloat(jarakKm),
          elevasi_m: parseInt(elevasiM),
          level,
          tags: tagsArray,
          gpx_file_url: gpxUrl || undefined,
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
      setTitikStart('');
      setDeskripsi('');
      setGpxUrl('');
      setGpxFileName('');
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
      <div className="relative w-full max-w-lg bg-[#262626] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden p-6 text-white space-y-5 max-h-[92vh] overflow-y-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Titik Kumpul / Start</span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setTitikStart(`Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`);
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
                  placeholder="Alun-Alun / Indomaret KM 0"
                  value={titikStart}
                  onChange={(e) => setTitikStart(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

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
              placeholder="Tanjakan, Pemandangan, Kopi"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {/* Upload Section (Direct File Pickers) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-[#333333]">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload File GPX (Garmin/Strava)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".gpx"
                  onChange={handleGpxFileChange}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-2 text-xs text-gray-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                />
              </div>
              {gpxFileName && (
                <p className="text-[11px] text-green-400 mt-1 truncate">✓ {gpxFileName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Image className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Foto Cover Rute</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg p-2 text-xs text-gray-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
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
