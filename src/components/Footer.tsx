import React from 'react';
import Link from 'next/link';
import { Bike, Heart, MapPin, Shield, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#222222] py-12 px-4 text-gray-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/50 flex items-center justify-center bg-black/50">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Bapak-Bapak Sepedahan</span>
              <p className="text-[10px] text-amber-400 uppercase tracking-wider">Gowes Bareng • Guyub Rukun • Sehat & Bahagia</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-xs mt-2">
            Platform komunitas pesepeda — berbagi rute, gowes bareng, dan diskusi seputar sepeda.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-white mb-1">Navigasi</span>
          <Link href="/" className="text-gray-500 hover:text-amber-400 transition">Beranda Utama</Link>
          <Link href="/routes" className="text-gray-500 hover:text-amber-400 transition">Direktori Rute & GPX</Link>
          <Link href="/open-rides" className="text-gray-500 hover:text-amber-400 transition">Jadwal Open Ride</Link>
          <Link href="/forum" className="text-gray-500 hover:text-amber-400 transition">Forum Diskusi Komunitas</Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-white mb-1">Komunitas</span>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-400 transition">Instagram</a>
          <a href="https://wa.me/62812345678" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-400 transition">Grup WhatsApp</a>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-white mb-1">Lainnya</span>
          <Link href="/privacy" className="text-gray-500 hover:text-amber-400 transition">Kebijakan Privasi</Link>
          <span className="text-xs text-amber-400 font-mono mt-1">Status: Live Production v1.0</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-[#222222] text-sm text-center text-gray-600 flex items-center justify-center space-x-1">
        <span>© 2026 Bapak-Bapak Sepedahan Club. Gowes Bareng, Guyub Rukun, Sehat & Bahagia. Dibuat dengan</span>
        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline mx-1" />
        <span>untuk Komunitas Gowes Indonesia.</span>
      </div>
    </footer>
  );
}
