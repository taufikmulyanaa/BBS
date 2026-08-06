import React from 'react';
import Link from 'next/link';
import { Bike, Heart, MapPin, Shield, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#141415] border-t border-[#42403B] pt-12 pb-8 text-[#B9BEC3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F7C56A] via-[#EA9B28] to-[#D98A17] flex items-center justify-center">
                <Bike className="w-5 h-5 text-[#141415] stroke-[2.5]" />
              </div>
              <span className="font-heading font-extrabold text-lg text-[#F5F5F5]">GUYUB GOWES</span>
            </div>
            <p className="text-xs text-[#8E8B87] leading-relaxed">
              Platform komunitas independen pesepeda bapak-bapak. Berbagi rute gowes, bikin Open Ride bareng, dan diskusi seputar gear & jalur.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#F5F5F5] uppercase tracking-wider mb-3">Navigasi</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-[#EA9B28] transition-colors">Beranda Utama</Link></li>
              <li><Link href="/routes" className="hover:text-[#EA9B28] transition-colors">Direktori Rute & GPX</Link></li>
              <li><Link href="/open-rides" className="hover:text-[#EA9B28] transition-colors">Jadwal Open Ride</Link></li>
              <li><Link href="/forum" className="hover:text-[#EA9B28] transition-colors">Forum Diskusi Komunitas</Link></li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#F5F5F5] uppercase tracking-wider mb-3">Komunitas</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-[#EA9B28]" />
                <span>Keselamatan Gowes Utama</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#EA9B28]" />
                <span>Format GPX Gratis</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#EA9B28]" />
                <span>Grup WhatsApp Guyub</span>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#F5F5F5] uppercase tracking-wider mb-3">Teknis</h4>
            <p className="text-xs text-[#8E8B87] mb-2">
              Dikembangkan dengan Next.js, Supabase, Vercel & OpenStreetMap. 100% Lean MVP Biaya Rendah.
            </p>
            <div className="inline-block bg-[#232322] border border-[#42403B] px-3 py-1 rounded text-[11px] text-[#F7C56A] font-mono">
              Status: Live Production v1.0
            </div>
          </div>
        </div>

        <div className="border-t border-[#232322] pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-[#8E8B87]">
          <p>© {new Date().getFullYear()} Guyub Gowes — Bapak-Bapak Sepedahan Komunitas.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-[#D9534F] fill-current" />
            <span>untuk Komunitas Gowes Indonesia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
