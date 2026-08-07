'use client';

import React, { useState } from 'react';
import { X, Users, MapPin, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function CreateChapterModal({ isOpen, onClose, onSuccess, currentUser }: Props) {
  const [nama, setNama] = useState('');
  const [kota, setKota] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [deskripsi, setDeskripsi] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNamaChange = (value: string) => {
    setNama(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const resetForm = () => {
    setNama('');
    setKota('');
    setSlug('');
    setSlugTouched(false);
    setDeskripsi('');
    setCoverFile(null);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      let coverImageUrl: string | null = null;
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const filePath = `chapter-covers/${slug}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('forum-media').upload(filePath, coverFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('forum-media').getPublicUrl(filePath);
        coverImageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('chapters')
        .insert([
          {
            nama,
            kota,
            slug,
            deskripsi: deskripsi || null,
            cover_image_url: coverImageUrl,
            dibuat_oleh: currentUser.id,
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        await supabase.from('chapter_members').insert([
          { chapter_id: data[0].id, user_id: currentUser.id, role: 'admin', status: 'aktif', decided_by: currentUser.id, decided_at: new Date().toISOString() },
        ]);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating chapter:', err);
      setErrorMsg(err.message || 'Gagal membuat chapter.');
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
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Buat Chapter Baru</h3>
              <p className="text-xs text-gray-400">Bentuk sub-komunitas untuk kota tertentu</p>
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

          <form id="create-chapter-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Nama Chapter *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Chapter Bogor"
                value={nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Kota *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bogor"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Slug URL *</label>
              <input
                type="text"
                required
                placeholder="chapter-bogor"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500"
              />
              <p className="text-[11px] text-gray-500 mt-1">URL: /chapter/{slug || '...'}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Deskripsi</label>
              <textarea
                rows={3}
                placeholder="Ceritakan tentang chapter ini..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition placeholder:text-gray-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Foto Cover</label>
              <label className="flex items-center justify-center space-x-2 border border-dashed border-[#3A3A3A] rounded-lg px-3.5 py-4 text-xs text-gray-400 hover:border-amber-500 hover:text-amber-400 transition cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <span>{coverFile ? coverFile.name : 'Pilih gambar cover'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-5 bg-[#1E1E1E] border-t border-[#333333] flex items-center justify-end space-x-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition">
            Batal
          </button>
          <button
            type="submit"
            form="create-chapter-form"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? 'Menyimpan...' : 'Buat Chapter'}
          </button>
        </div>
      </div>
    </div>
  );
}
