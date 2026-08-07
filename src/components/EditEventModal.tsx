'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Send, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import { supabase, BikeEvent } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: BikeEvent | null;
  currentUser: any;
};

export default function EditEventModal({ isOpen, onClose, onSuccess, event, currentUser }: Props) {
  const [judul, setJudul] = useState('');
  const [penyelenggara, setPenyelenggara] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [linkPendaftaran, setLinkPendaftaran] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [status, setStatus] = useState<'akan_datang' | 'selesai' | 'dibatalkan'>('akan_datang');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setJudul(event.judul || '');
      setPenyelenggara(event.penyelenggara || '');
      setLokasi(event.lokasi || '');
      setTanggalMulai(event.tanggal_mulai ? event.tanggal_mulai.slice(0, 10) : '');
      setTanggalSelesai(event.tanggal_selesai ? event.tanggal_selesai.slice(0, 10) : '');
      setLinkPendaftaran(event.link_pendaftaran || '');
      setDeskripsi(event.deskripsi || '');
      setStatus(event.status || 'akan_datang');
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('bike_events')
        .update({
          judul,
          penyelenggara: penyelenggara || null,
          lokasi: lokasi || null,
          tanggal_mulai: new Date(tanggalMulai).toISOString(),
          tanggal_selesai: tanggalSelesai ? new Date(tanggalSelesai).toISOString() : null,
          link_pendaftaran: linkPendaftaran || null,
          deskripsi: deskripsi || null,
          status,
        })
        .eq('id', event.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating bike event:', err);
      setErrorMsg(err.message || 'Gagal mengedit event.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Hapus event "${event.judul}" secara permanen?`)) return;

    setDeleting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from('bike_events').delete().eq('id', event.id);
      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error deleting bike event:', err);
      setErrorMsg(err.message || 'Gagal menghapus event.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#222222] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#333333] bg-[#1E1E1E] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/20">
              <Edit3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">Edit Event Sepeda</h3>
              <p className="text-xs text-gray-400">Perbarui detail atau hapus event ini</p>
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

          <form id="edit-event-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Nama Event *</label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Penyelenggara</label>
                <input
                  type="text"
                  value={penyelenggara}
                  onChange={(e) => setPenyelenggara(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Lokasi</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Tanggal Mulai *</label>
                <input
                  type="date"
                  required
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Tanggal Selesai</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Link Pendaftaran</label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={linkPendaftaran}
                  onChange={(e) => setLinkPendaftaran(e.target.value)}
                  className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition cursor-pointer"
              >
                <option value="akan_datang">Akan Datang</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">Deskripsi</label>
              <textarea
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3A3A] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-4 sm:p-5 bg-[#1E1E1E] border-t border-[#333333] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2.5 rounded-lg border border-red-500/40 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Hapus...' : 'Hapus Event'}</span>
          </button>

          <div className="flex space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#333333] text-gray-300 text-sm font-semibold hover:bg-[#333333] transition">
              Batal
            </button>
            <button
              type="submit"
              form="edit-event-form"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center space-x-2 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading ? <span>Menyimpan...</span> : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
