'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bike, Navigation, Calendar, MessageSquare, ShieldCheck, Download, Users, ArrowRight, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { supabase, Route, OpenRide, ForumPost } from '@/lib/supabase';
import { INITIAL_ROUTES, INITIAL_OPEN_RIDES, INITIAL_FORUM_POSTS } from '@/lib/mockData';
import RouteCard from '@/components/RouteCard';
import OpenRideCard from '@/components/OpenRideCard';
import ForumPostCard from '@/components/ForumPostCard';

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [openRides, setOpenRides] = useState<OpenRide[]>(INITIAL_OPEN_RIDES);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);

  useEffect(() => {
    // Try fetching from Supabase database
    const fetchData = async () => {
      try {
        const { data: dbRoutes } = await supabase.from('routes').select('*').limit(3);
        if (dbRoutes && dbRoutes.length > 0) {
          setRoutes(dbRoutes);
        }

        const { data: dbRides } = await supabase.from('open_rides').select('*').eq('status', 'akan_datang').limit(3);
        if (dbRides && dbRides.length > 0) {
          setOpenRides(dbRides);
        }

        const { data: dbPosts } = await supabase.from('forum_posts').select('*').limit(2);
        if (dbPosts && dbPosts.length > 0) {
          setForumPosts(dbPosts);
        }
      } catch (err) {
        console.log('Using local fallback data');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 border-b border-[#42403B]/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#EA9B28]/15 via-[#141415] to-[#141415] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-[#EA9B28]/10 border border-[#EA9B28]/30 px-3.5 py-1.5 rounded-full text-xs text-[#F7C56A] font-medium">
                <Sparkles className="w-4 h-4 text-[#EA9B28]" />
                <span>Komunitas Gowes Bapak-Bapak Indonesia</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#F5F5F5] tracking-tight leading-[1.15]">
                Gowes Lebih Seru, <br className="hidden sm:inline" />
                <span className="amber-gradient-text">Guyub Bareng Komunitas.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#B9BEC3] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Temukan rute sepeda pilihan dengan GPX gratis, bikin ajakan gowes bareng (Open Ride) tanpa riuh di WhatsApp, dan dapatkan laporan kondisi jalan terbaru.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/open-rides"
                  className="w-full sm:w-auto bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] font-extrabold text-base px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-[#EA9B28]/25 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5 stroke-[2.5]" />
                  <span>Gabung Open Ride</span>
                </Link>

                <Link
                  href="/routes"
                  className="w-full sm:w-auto bg-[#232322] hover:bg-[#2A2A2A] text-[#F5F5F5] border border-[#42403B] font-bold text-base px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-5 h-5 text-[#EA9B28]" />
                  <span>Jelajahi Rute GPX</span>
                </Link>
              </div>

              {/* Social Proof Stats */}
              <div className="pt-8 border-t border-[#232322] grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="block font-heading font-extrabold text-2xl text-[#F5F5F5]">500+</span>
                  <span className="text-xs text-[#8E8B87]">Anggota Aktif</span>
                </div>
                <div>
                  <span className="block font-heading font-extrabold text-2xl text-[#F5F5F5]">50+</span>
                  <span className="text-xs text-[#8E8B87]">Rute Terverifikasi</span>
                </div>
                <div>
                  <span className="block font-heading font-extrabold text-2xl text-[#F5F5F5]">20+</span>
                  <span className="text-xs text-[#8E8B87]">Open Ride / Bulan</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden glass-card p-6 space-y-5 border border-[#EA9B28]/30 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#42403B]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#EA9B28] text-[#141415] font-extrabold flex items-center justify-center">
                      <Bike className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-[#F5F5F5]">Open Ride Terdekat</h4>
                      <span className="text-[11px] text-[#8E8B87]">Minggu Ini</span>
                    </div>
                  </div>
                  <span className="bg-[#5DBB63]/20 text-[#8ee594] border border-[#5DBB63]/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Sisa 4 Kuota
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="font-heading font-extrabold text-lg text-[#F7C56A]">
                    Gowes Tipis-Tipis Amber Peak
                  </h3>
                  <div className="space-y-1.5 text-xs text-[#B9BEC3]">
                    <p className="flex items-center space-x-2">
                      <span className="text-[#EA9B28] font-bold">Titik Kumpul:</span>
                      <span>Simpang Alun-Alun Depan Pos</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="text-[#EA9B28] font-bold">Waktu:</span>
                      <span>Minggu, 06:00 WIB</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="text-[#EA9B28] font-bold">Target Pace:</span>
                      <span>20 - 22 km/jam (Santai)</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/open-rides"
                    className="w-full bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <span>Lihat Detail & Daftar</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Routes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs text-[#EA9B28] font-bold uppercase tracking-wider mb-1">
              <Navigation className="w-4 h-4" />
              <span>Rute Unggulan</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl text-[#F5F5F5]">
              Direktori Rute Gowes Pilihan
            </h2>
          </div>
          <Link
            href="/routes"
            className="inline-flex items-center space-x-2 text-sm font-bold text-[#EA9B28] hover:text-[#F7C56A] transition-colors"
          >
            <span>Lihat Semua Rute</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.slice(0, 3).map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </section>

      {/* Upcoming Open Rides Section */}
      <section className="bg-[#232322]/50 border-y border-[#42403B] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs text-[#EA9B28] font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Gowes Bareng</span>
              </div>
              <h2 className="font-heading font-extrabold text-3xl text-[#F5F5F5]">
                Open Ride Akan Datang
              </h2>
            </div>
            <Link
              href="/open-rides"
              className="inline-flex items-center space-x-2 text-sm font-bold text-[#EA9B28] hover:text-[#F7C56A] transition-colors"
            >
              <span>Lihat Jadwal Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openRides.slice(0, 3).map((ride) => (
              <OpenRideCard key={ride.id} ride={ride} />
            ))}
          </div>
        </div>
      </section>

      {/* Community Forum Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs text-[#EA9B28] font-bold uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Diskusi & Laporan</span>
            </div>
            <h2 className="font-heading font-extrabold text-3xl text-[#F5F5F5]">
              Kondisi Jalan & Diskusi Ter Hangat
            </h2>
          </div>
          <Link
            href="/forum"
            className="inline-flex items-center space-x-2 text-sm font-bold text-[#EA9B28] hover:text-[#F7C56A] transition-colors"
          >
            <span>Masuk Forum</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forumPosts.slice(0, 2).map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
