'use client';

import React, { useState } from 'react';
import { X, Navigation, Upload, Image, MapPin, Bike, Send, Flag, Layers, Gauge, Info, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MapLocationPickerModal from './MapLocationPickerModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

export default function CreateRouteModal({ isOpen, onClose, onSuccess, currentUser }: Props) {
  const [nama, setNama] = useState('');
  const [titikStart, setTitikStart] = useState('');
  const [titikFinish, setTitikFinish] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [jarakKm, setJarakKm] = useState('30');
  const [elevasiM, setElevasiM] = useState('350');
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [jenisSepeda, setJenisSepeda] = useState('Semua Sepeda (All Bike)');
  const [permukaan, setPermukaan] = useState('');
  const [tagsInput, setTagsInput] = useState('Tanjakan, Pemandangan, Kopi');
  const [gpxUrl, setGpxUrl] = useState('');
  const [gpxFileName, setGpxFileName] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFileName, setCoverFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapPickerTarget, setMapPickerTarget] = useState<'start' | 'finish' | null>(null);

  if (!isOpen) return null;

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
    setCoverFileName(file.name);

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

      const { error } = await supabase.from('routes').insert([
        {
          nama,
          deskripsi,
          jarak_km: parseFloat(jarakKm),
          elevasi_m: parseInt(elevasiM),
          level,
          tags: tagsArray,
          gpx_file_url: gpxUrl || undefined,
          cover_image_url: defaultCover,
          titik_awal: titikStart || undefined,
          titik_akhir: titikFinish || undefined,
          permukaan: permukaan || undefined,
          status_verifikasi: 'belum_diverifikasi',
          rating_avg: 0,
          rating_count: 0,
          dibuat_oleh: currentUser.id,
        },
      ]);

      if (error) throw error;

      onSuccess();
      onClose();
      // Reset form
      setNama('');
      setTitikStart('');
      setTitikFinish('');
      setPermukaan('');
      setDeskripsi('');
      setGpxUrl('');
      setGpxFileName('');
      setCoverUrl('');
      setCoverFileName('');
    } catch (err: any) {
      console.error('Error creating route:', err);
      setErrorMsg(err.message || 'Gagal menambah rute baru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#222222] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#333333] bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20">
              <Navigation className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Tambah Rute Gowes Baru</h3>
              <p className="text-xs text-gray-400">Bagikan trek gowes favorit Anda untuk komunitas</p>
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

          <form id="create-route-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION 1: Titik Lokasi Rute */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <MapPin className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  1. Informasi Nama & Jalur Lokasi
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Nama Rute Sepeda *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rute Tanjakan Kopi Kebun Teh KM 25"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Titik Start (Awal)
                    </label>
                    <button
                      type="button"
                      onClick={() => setMapPickerTarget('start')}
                      className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 rounded text-[11px] font-semibold transition flex items-center space-x-1 shrink-0"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Pilih di Peta</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Contoh: Alun-Alun Ciamis"
                      value={titikStart}
                      onChange={(e) => setTitikStart(e.target.value)}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Titik Tujuan (Finish)
                    </label>
                    <button
                      type="button"
                      onClick={() => setMapPickerTarget('finish')}
                      className="px-2 py-0.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-black border border-green-500/30 rounded text-[11px] font-semibold transition flex items-center space-x-1 shrink-0"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Pilih di Peta</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Flag className="w-4 h-4 text-green-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Contoh: Puncak Kertasari"
                      value={titikFinish}
                      onChange={(e) => setTitikFinish(e.target.value)}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Karakteristik Trek */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Gauge className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  2. Spesifikasi Trek & Kesulitan
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Kategori Sepeda (Surface)
                  </label>
                  <div className="relative">
                    <Bike className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                    <select
                      value={jenisSepeda}
                      onChange={(e) => setJenisSepeda(e.target.value)}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                    >
                      <option value="Semua Sepeda (All Bike)">Semua Sepeda (All Bike)</option>
                      <option value="Road Bike / RB">Road Bike (Aspal Mulus)</option>
                      <option value="Gravel Bike">Gravel / Makadam</option>
                      <option value="MTB / Offroad">MTB / Offroad / Tanah</option>
                      <option value="Sepeda Lipat / Seli">Sepeda Lipat / City</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Tingkat Level Kesulitan
                  </label>
                  <select
                    value={level}
                    onChange={(e: any) => setLevel(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                  >
                    <option value="easy">EASY (Ramah Pemula & Datar)</option>
                    <option value="medium">MEDIUM (Tanjakan Sedang)</option>
                    <option value="hard">HARD (Tanjakan Ekstrem & Endurance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Kondisi Permukaan Jalan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 95% Aspal, 5% Beton"
                  value={permukaan}
                  onChange={(e) => setPermukaan(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Jarak Total (KM)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={jarakKm}
                      onChange={(e) => setJarakKm(e.target.value)}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="absolute right-3 text-xs font-bold text-amber-500">KM</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Total Elevasi Gain (m)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      required
                      value={elevasiM}
                      onChange={(e) => setElevasiM(e.target.value)}
                      className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-3.5 pr-8 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="absolute right-3 text-xs font-bold text-amber-500">m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Detail Deskripsi & Tags */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Info className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  3. Detail Deskripsi & Tag Rute
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Deskripsi Lengkap Rute
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kondisi aspal, panorama, tempat pit-stop kopi, dan rintangan di jalan..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Tags Rute (Pisahkan dengan Koma)
                </label>
                <input
                  type="text"
                  placeholder="Tanjakan, Pemandangan, Kopi, Kebun Teh"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* SECTION 4: Upload Custom Dropzone */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Layers className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  4. File Trek GPX & Foto Cover
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GPX Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    File GPX (Garmin / Strava)
                  </label>
                  <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#3A3A3A] hover:border-amber-500 rounded-xl bg-[#262626] hover:bg-[#2A2A2A] transition cursor-pointer text-center group">
                    <Upload className="w-6 h-6 text-amber-400 group-hover:scale-110 transition mb-1" />
                    <span className="text-xs font-bold text-gray-200">
                      {gpxFileName ? (
                        <span className="text-green-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 inline" />
                          <span className="truncate max-w-[160px] inline-block">{gpxFileName}</span>
                        </span>
                      ) : (
                        'Pilih File .GPX'
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">Format Garmin, Wahoo, atau Strava</span>
                    <input
                      type="file"
                      accept=".gpx"
                      onChange={handleGpxFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Cover Photo Upload Zone */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Foto Cover Rute
                  </label>
                  <label className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#3A3A3A] hover:border-amber-500 rounded-xl bg-[#262626] hover:bg-[#2A2A2A] transition cursor-pointer text-center group">
                    <Image className="w-6 h-6 text-amber-400 group-hover:scale-110 transition mb-1" />
                    <span className="text-xs font-bold text-gray-200">
                      {coverFileName ? (
                        <span className="text-green-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 inline" />
                          <span className="truncate max-w-[160px] inline-block">{coverFileName}</span>
                        </span>
                      ) : (
                        'Pilih Foto Cover'
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">Format JPG / PNG (Maks 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#1E1E1E] border-t border-[#333333] flex items-center justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition"
          >
            Batal
          </button>
          <button
            type="submit"
            form="create-route-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 disabled:opacity-50 active:scale-95 cursor-pointer"
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
