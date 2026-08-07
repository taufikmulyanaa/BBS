'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, MapPin, Tag, Send, Info, Camera, Image as ImageIcon, Navigation, Plus } from 'lucide-react';
import { supabase, Route } from '@/lib/supabase';
import MapLocationPickerModal from './MapLocationPickerModal';

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
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch routes for dropdown selection
    supabase
      .from('routes')
      .select('id, nama')
      .order('nama', { ascending: true })
      .then(({ data }) => {
        if (data) setRoutes(data as Route[]);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (photos.length + selected.length > 5) {
        alert('Maksimal 5 foto lampiran per postingan.');
        return;
      }
      setPhotos((prev) => [...prev, ...selected].slice(0, 5));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk membuat postingan forum.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const isWarkop = tipe === 'rekomendasi_warkop';
      const warkopTag = '[WARKOP]';
      
      let fullContent = isWarkop && !isi.includes(warkopTag)
        ? `${warkopTag}\n\n${lokasiPatokan ? `📍 Lokasi: ${lokasiPatokan}\n\n` : ''}${isi}`
        : lokasiPatokan ? `📍 Lokasi: ${lokasiPatokan}\n\n${isi}` : isi;

      let uploadedUrls: string[] = [];
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const file = photos[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${currentUser.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('forum-media')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('forum-media')
            .getPublicUrl(filePath);
            
          if (publicUrlData) {
            uploadedUrls.push(publicUrlData.publicUrl);
          }
        }
      }

      if (uploadedUrls.length > 0) {
        fullContent += `\n\n📷 Foto Lampiran:\n${uploadedUrls.join('\n')}`;
      }

      const dbType = tipe === 'laporan_jalan' ? 'laporan_kondisi' : 'diskusi';
      const finalJudul = isWarkop && !judul.includes(warkopTag) 
        ? `☕ ${warkopTag} ${judul}` 
        : judul;

      const payload: any = {
        judul: finalJudul,
        isi: fullContent,
        tipe: dbType,
        user_id: currentUser.id,
      };

      if (selectedRouteId) {
        payload.route_id = selectedRouteId;
      }

      const { error } = await supabase.from('forum_posts').insert([payload]);

      if (error) throw error;

      onSuccess();
      onClose();
      // Reset form
      setJudul('');
      setIsi('');
      setLokasiPatokan('');
      setSelectedRouteId('');
      setPhotos([]);
    } catch (err: any) {
      console.error('Error creating forum post:', err);
      setErrorMsg(err.message || 'Gagal mengirim postingan forum.');
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
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Post Diskusi / Laporan Baru</h3>
              <p className="text-xs text-gray-400">Bagikan info kondisi jalan, rekomendasi warkop, atau gear gowes</p>
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

          <form id="create-forum-post-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION 1: Judul, Kategori & Tautan Rute */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Tag className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  1. Judul, Kategori & Tautan Rute
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Tautkan ke Rute (Opsional)
                  </label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
                  >
                    <option value="">-- Tanpa Tautan Rute --</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        🚴 {r.nama}
                      </option>
                    ))}
                  </select>
                </div>
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

            {/* SECTION 3: Isi Pesan & Foto Lampiran */}
            <div className="space-y-4 bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-[#2A2A2A] pb-2.5">
                <Info className="w-4 h-4" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                  3. Detail Pesan & Lampiran Foto (Maks 5 Foto)
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

              {/* Photo Attachments File Input */}
              <div className="space-y-3 pt-2 border-t border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Foto Lampiran ({photos.length}/5)</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {photos.map((file, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#333333] group bg-black/50">
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover opacity-80" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#444444] hover:border-amber-500 flex flex-col items-center justify-center cursor-pointer transition text-gray-500 hover:text-amber-500 bg-[#1A1A1A]">
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold">Upload</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  )}
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
            form="create-forum-post-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <span>Mengirim...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Postingan</span>
              </>
            )}
          </button>
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
