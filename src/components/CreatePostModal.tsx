'use client';

import React, { useState } from 'react';
import { X, MessageSquare, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { ForumPost } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newPost: ForumPost) => void;
};

export default function CreatePostModal({ isOpen, onClose, onCreate }: Props) {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tipe, setTipe] = useState<'diskusi' | 'laporan_kondisi'>('diskusi');
  const [routeName, setRouteName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      user_id: 'usr-current',
      author_name: 'Saya (Bapak Gowes)',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      route_name: routeName || undefined,
      tipe,
      judul,
      isi,
      like_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
    };

    onCreate(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#232322] border border-[#42403B] rounded-2xl p-6 text-[#F5F5F5] space-y-5">
        <div className="flex items-center justify-between border-b border-[#42403B] pb-4">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-[#F5F5F5]">Tulis Post Forum Komunitas</h3>
            <p className="text-xs text-[#B9BEC3] mt-0.5">Berbagi pengalaman rute atau beri info laporan jalan</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8E8B87] hover:text-[#F5F5F5] hover:bg-[#141415]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#B9BEC3] mb-1">Tipe Topik</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipe('diskusi')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center space-x-2 border transition-all ${
                  tipe === 'diskusi'
                    ? 'bg-[#EA9B28]/20 border-[#EA9B28] text-[#EA9B28]'
                    : 'bg-[#141415] border-[#42403B] text-[#8E8B87]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Diskusi Rute</span>
              </button>

              <button
                type="button"
                onClick={() => setTipe('laporan_kondisi')}
                className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center space-x-2 border transition-all ${
                  tipe === 'laporan_kondisi'
                    ? 'bg-[#D9534F]/20 border-[#D9534F] text-[#ff9996]'
                    : 'bg-[#141415] border-[#42403B] text-[#8E8B87]'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Laporan Jalan</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#B9BEC3] mb-1">Judul Post</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kondisi Tanjakan Amber Peak Setelah Hujan"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full bg-[#141415] border border-[#42403B] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#B9BEC3] mb-1">Terkait Rute (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Amber Peak Loop"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full bg-[#141415] border border-[#42403B] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#B9BEC3] mb-1">Isi Post / Pesan</label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan pengalaman gowes, rekomendasi warung kopi, atau detail kondisi jalanan..."
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              className="w-full bg-[#141415] border border-[#42403B] rounded-lg p-3 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
            />
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#141415] hover:bg-[#2A2A2A] text-[#B9BEC3] border border-[#42403B] py-2.5 rounded-xl font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] font-bold py-2.5 rounded-xl shadow-md shadow-[#EA9B28]/20"
            >
              Posting Diskusi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
