'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, MapPin, MoreHorizontal, FileText, Smile } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { supabase, Route } from '@/lib/supabase';
import MapLocationPickerModal from './MapLocationPickerModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

export default function CreateForumPostModal({ isOpen, onClose, onSuccess, currentUser }: Props) {
  const [isi, setIsi] = useState('');
  const [tipe, setTipe] = useState<'laporan_jalan' | 'diskusi' | 'rekomendasi_warkop'>('diskusi');
  const [lokasiPatokan, setLokasiPatokan] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset when closed
      setIsi('');
      setLokasiPatokan('');
      setPhotos([]);
      setErrorMsg(null);
      setTipe('diskusi');
      return;
    }

    if (currentUser && typeof window !== 'undefined') {
      setLocalAvatar(localStorage.getItem(`bbs_avatar_${currentUser.id}`));
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

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
    // reset input value so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setErrorMsg('Silakan masuk terlebih dahulu untuk membuat postingan forum.');
      return;
    }
    if (!isi.trim()) return;

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
      
      // Auto-generate judul
      let generatedJudul = isi.trim().substring(0, 40);
      if (isi.trim().length > 40) generatedJudul += '...';
      
      const activeTag = (() => {
        if (tipe === 'rekomendasi_warkop') return warkopTag;
        if (tipe === 'jual_beli') return '[JUAL_BELI]';
        if (tipe === 'event') return '[EVENT]';
        if (tipe === 'tips') return '[TIPS]';
        if (tipe === 'bengkel') return '[BENGKEL]';
        return null;
      })();
      
      const finalJudul = activeTag && !generatedJudul.includes(activeTag) 
        ? `${activeTag === warkopTag ? '☕ ' : ''}${activeTag} ${generatedJudul}` 
        : generatedJudul;

      const payload: any = {
        judul: finalJudul || 'Diskusi Baru',
        isi: fullContent,
        tipe: dbType,
        user_id: currentUser.id,
      };

      const { error } = await supabase.from('forum_posts').insert([payload]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating forum post:', err);
      setErrorMsg(err.message || 'Gagal mengirim postingan forum.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    setIsi(e.target.value);
  };

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
            Postingan Baru
          </h3>
          <div className="flex items-center space-x-4">
             <button className="text-gray-400 hover:text-white transition hidden sm:block">
               <FileText className="w-5 h-5" />
             </button>
             <button className="text-gray-400 hover:text-white transition">
               <MoreHorizontal className="w-5 h-5" />
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
                  className="bg-transparent text-gray-400 text-[15px] focus:outline-none focus:text-amber-400 cursor-pointer appearance-none hover:text-gray-300"
                >
                  <option className="bg-[#181818] text-white" value="diskusi">Diskusi / Umum</option>
                  <option className="bg-[#181818] text-white" value="laporan_jalan">Laporan Jalan</option>
                  <option className="bg-[#181818] text-white" value="rekomendasi_warkop">Warkop</option>
                  <option className="bg-[#181818] text-white" value="jual_beli">Jual Beli</option>
                  <option className="bg-[#181818] text-white" value="event">Event / Acara</option>
                  <option className="bg-[#181818] text-white" value="tips">Tips & Trik</option>
                  <option className="bg-[#181818] text-white" value="bengkel">Bengkel & Perbaikan</option>
                </select>
              </div>

              <textarea
                placeholder="What's new?"
                value={isi}
                onChange={handleTextareaInput}
                className="w-full bg-transparent text-[15px] text-white focus:outline-none placeholder:text-gray-500 resize-none min-h-[24px] py-1"
                rows={1}
                style={{ overflow: 'hidden' }}
              />

              {/* Photos Preview */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photos.map((file, idx) => (
                    <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden group border border-[#333333]">
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

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
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:text-white transition" 
                  title="Add Image"
                >
                  <ImageIcon className="w-[18px] h-[18px]" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  multiple 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                />

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
                 <span className="text-[15px] text-gray-600">Tambahkan ke diskusi</span>
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
            {loading ? 'Posting...' : 'Post'}
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
