'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Smile, MoreHorizontal, FileText } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
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
  const [tipe, setTipe] = useState<'laporan_jalan' | 'diskusi' | 'rekomendasi_warkop'>('diskusi');
  const [lokasiPatokan, setLokasiPatokan] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (post) {
      setJudul(post.judul || '');
      
      let initialIsi = post.isi || '';
      let extractedLokasi = '';

      const locationRegex = /📍 Lokasi: (.*?)\n\n/;
      const match = initialIsi.match(locationRegex);
      if (match) {
        extractedLokasi = match[1];
        initialIsi = initialIsi.replace(locationRegex, '');
      }

      setIsi(initialIsi.trim());
      setLokasiPatokan(extractedLokasi);

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

  const handleSubmit = async () => {
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk mengedit postingan.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const isWarkop = tipe === 'rekomendasi_warkop';
      const warkopTag = '[WARKOP]';
      
      const cleanIsi = isi.trim();
      const fullContent = isWarkop && !cleanIsi.includes(warkopTag)
        ? `${warkopTag}\n\n${lokasiPatokan ? `📍 Lokasi: ${lokasiPatokan}\n\n` : ''}${cleanIsi}`
        : lokasiPatokan ? `📍 Lokasi: ${lokasiPatokan}\n\n${cleanIsi}` : cleanIsi;

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
    if (!confirm(`Apakah Anda yakin ingin menghapus postingan ini?`)) return;

    setDeleting(true);
    setErrorMsg(null);

    try {
      await supabase.from('forum_likes').delete().eq('post_id', post.id);
      await supabase.from('forum_comments').delete().eq('post_id', post.id);

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

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    setIsi(e.target.value);
  };

  const localAvatar = currentUser && typeof window !== 'undefined' ? localStorage.getItem(`bbs_avatar_${currentUser.id}`) : null;
  const avatarUrl = localAvatar || currentUser?.user_metadata?.custom_avatar || currentUser?.user_metadata?.avatar_url;
  const username = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Anggota Gowes';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 sm:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full h-full sm:h-auto sm:max-w-[600px] bg-[#181818] sm:border sm:border-[#333333] sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up sm:animate-none">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 shrink-0 border-b border-[#262626] sm:border-none">
          <button
            onClick={onClose}
            className="text-[15px] text-white hover:text-gray-300 transition"
          >
            Cancel
          </button>
          <h3 className="font-bold text-[16px] text-white absolute left-1/2 -translate-x-1/2">
            Edit Postingan
          </h3>
          <div className="flex items-center space-x-4">
             <button 
               onClick={handleDelete}
               disabled={deleting}
               className="text-red-500 hover:text-red-400 font-bold transition disabled:opacity-50"
             >
               {deleting ? 'Menghapus...' : 'Hapus'}
             </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 text-white">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="flex">
            {/* Left Column (Avatar + Line) */}
            <div className="flex flex-col items-center shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-gray-400 font-bold">{username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="w-[2px] bg-[#333333] grow my-2 min-h-[40px]"></div>
              <div className="w-4 h-4 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center overflow-hidden shrink-0 mt-1 opacity-50">
                 {avatarUrl ? (
                  <img src={avatarUrl} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[8px] text-gray-400 font-bold">{username.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Right Column (Content) */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center flex-wrap gap-1 mb-1">
                <span className="font-bold text-[15px] hover:underline cursor-pointer">{username}</span>
                <span className="text-gray-500 mx-1">›</span>
                <select
                  value={tipe}
                  onChange={(e: any) => setTipe(e.target.value)}
                  className="bg-transparent text-gray-400 text-[15px] font-medium focus:outline-none focus:text-amber-400 cursor-pointer appearance-none hover:text-gray-300"
                >
                  <option className="bg-[#181818] text-white" value="diskusi">Diskusi / Umum</option>
                  <option className="bg-[#181818] text-white" value="laporan_jalan">Laporan Jalan</option>
                  <option className="bg-[#181818] text-white" value="rekomendasi_warkop">Warkop</option>
                </select>
              </div>

              {judul && (
                <input
                  type="text"
                  placeholder="Judul (opsional)"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full bg-transparent text-[15px] font-bold text-white focus:outline-none placeholder:text-gray-600 mb-2"
                />
              )}

              <textarea
                placeholder="What's new?"
                value={isi}
                onChange={handleTextareaInput}
                className="w-full bg-transparent text-[15px] text-white focus:outline-none placeholder:text-gray-500 resize-none min-h-[24px] py-1"
                rows={1}
                style={{ overflow: 'hidden' }}
              />

              {/* Location Badge */}
              {lokasiPatokan && (
                <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[200px]">{lokasiPatokan}</span>
                  <button onClick={() => setLokasiPatokan('')} className="ml-1 hover:text-white">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center space-x-4 mt-3 text-gray-500">
                <button 
                  onClick={() => setShowMapPicker(true)}
                  className="hover:text-white transition" 
                  title="Add Location"
                >
                  <MapPin className="w-[18px] h-[18px]" />
                </button>
                
                <div className="relative" ref={emojiPickerRef}>
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`hover:text-white transition ${showEmojiPicker ? 'text-amber-400' : ''}`}
                    title="Add Emoji"
                  >
                    <Smile className="w-[18px] h-[18px]" />
                  </button>
                  {showEmojiPicker && (
                    <div 
                      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmojiPicker(false);
                      }}
                    >
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="shadow-2xl rounded-lg overflow-hidden border border-[#333333]"
                      >
                        <EmojiPicker 
                          theme={Theme.DARK}
                          onEmojiClick={(emojiData) => {
                            setIsi((prev) => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pb-2">
                 <span className="text-[15px] text-gray-600">Simpan perubahan ke diskusi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between shrink-0">
          <button className="text-[15px] text-gray-500 hover:text-gray-300 transition flex items-center space-x-2">
             <span>Anyone can reply</span>
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !isi.trim()}
            className={`px-5 py-1.5 rounded-full font-bold text-[15px] transition ${
              isi.trim() && !loading
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-[#262626] text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Menyimpan...' : 'Update'}
          </button>
        </div>
      </div>

      <MapLocationPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        title="Pilih Lokasi"
        onSelect={(lat, lng, placeName) => {
          let locString = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
          if (placeName) {
            locString += ` - ${placeName.split(',')[0]}`;
          }
          setLokasiPatokan(locString);
        }}
      />
    </div>
  );
}
