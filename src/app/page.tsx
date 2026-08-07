'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bike, Navigation, Calendar, MessageSquare, ShieldCheck, Download, Users, ArrowRight, Sparkles, CheckCircle2, Star } from 'lucide-react';
import { supabase, Route, OpenRide, ForumPost } from '@/lib/supabase';
import RouteCard from '@/components/RouteCard';
import OpenRideCard from '@/components/OpenRideCard';
import ForumPostCard from '@/components/ForumPostCard';

export default function Home() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [openRides, setOpenRides] = useState<OpenRide[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [stats, setStats] = useState({ members: 0, routes: 0, openRides: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: dbRoutes } = await supabase.from('routes').select('*').limit(3);
        if (dbRoutes) setRoutes(dbRoutes);

        const { data: dbRides } = await supabase.from('open_rides').select('*').limit(3);
        if (dbRides) setOpenRides(dbRides);

        const { data: dbPosts } = await supabase.from('forum_posts').select('*').limit(2);
        if (dbPosts) setForumPosts(dbPosts);

        // Fetch counts for stats
        const { count: memberCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: routeCount } = await supabase.from('routes').select('*', { count: 'exact', head: true });
        const { count: rideCount } = await supabase.from('open_rides').select('*', { count: 'exact', head: true });
        
        setStats({
          members: memberCount || 0,
          routes: routeCount || 0,
          openRides: rideCount || 0,
        });
      } catch (err) {
        console.error('Error fetching database data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:py-32 border-b border-[#42403B]/60 flex flex-col justify-center min-h-[85vh]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop" 
            alt="Cyclists Background" 
            className="w-full h-full object-cover object-center"
          />
          {/* Overlays for depth and text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/80 to-[#111111]/20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141415] via-transparent to-[#141415]/40 pointer-events-none" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-[#EA9B28]/10 border border-[#EA9B28]/30 px-3.5 py-1.5 rounded-full text-xs text-[#F7C56A] font-medium backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-[#EA9B28]" />
                <span>Komunitas Gowes Bapak-Bapak Indonesia</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#F5F5F5] tracking-tight leading-[1.15] drop-shadow-lg">
                Gowes Lebih Seru, <br className="hidden sm:inline" />
                <span className="amber-gradient-text">Guyub Bareng Komunitas.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#D1D5DB] max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md font-medium">
                Temukan rute sepeda pilihan dengan GPX gratis, bikin ajakan gowes bareng (Open Ride) tanpa riuh di WhatsApp, dan dapatkan laporan kondisi jalan terbaru.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/routes"
                  className="w-full sm:w-auto bg-amber-500 text-black font-extrabold text-base px-7 py-3.5 rounded-lg transition-all hover:bg-amber-400 flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/20"
                >
                  <Navigation className="w-5 h-5 stroke-[2.5]" />
                  <span>Jelajahi Rute</span>
                </Link>

                <Link
                  href="/open-rides"
                  className="w-full sm:w-auto bg-black/40 backdrop-blur-md border border-white/30 text-white font-medium text-base px-6 py-3.5 rounded-lg transition-all hover:border-amber-400 hover:text-amber-400 flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span>Buat Open Ride</span>
                </Link>
              </div>

              {/* Social Proof Stats */}
              <div className="pt-10 mt-6 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="block font-heading font-black text-2xl text-amber-400 drop-shadow-md">{stats.members.toLocaleString()}</span>
                  <span className="text-xs text-gray-300 mt-1 font-medium">Anggota Aktif</span>
                </div>
                <div>
                  <span className="block font-heading font-black text-2xl text-amber-400 drop-shadow-md">{stats.routes.toLocaleString()}</span>
                  <span className="text-xs text-gray-300 mt-1 font-medium">Rute Terverifikasi</span>
                </div>
                <div>
                  <span className="block font-heading font-black text-2xl text-amber-400 drop-shadow-md">{stats.openRides.toLocaleString()}</span>
                  <span className="text-xs text-gray-300 mt-1 font-medium">Open Ride</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 relative hidden md:block">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden bg-[#262626]/80 backdrop-blur-xl p-6 space-y-5 border border-white/10 hover:border-amber-500/50 transition shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-extrabold flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Bike className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-white">Open Ride Terdekat</h4>
                      <span className="text-[11px] text-gray-300">Minggu Ini</span>
                    </div>
                  </div>
                  <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    Sisa 4 Kuota
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="font-heading font-extrabold text-lg text-white">
                    Gowes Tipis-Tipis Amber Peak
                  </h3>
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <p className="flex items-center space-x-2">
                      <span className="text-amber-400 font-bold">Titik Kumpul:</span>
                      <span>Simpang Alun-Alun Depan Pos</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="text-amber-400 font-bold">Waktu:</span>
                      <span>Minggu, 06:00 WIB</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <span className="text-amber-400 font-bold">Target Pace:</span>
                      <span>20 - 22 km/jam (Santai)</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/open-rides"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all shadow-md"
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
            <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
              <Navigation className="w-4 h-4" />
              <span>Rute Unggulan</span>
            </div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white">
              Direktori Rute Gowes Pilihan
            </h2>
          </div>
          <Link
            href="/routes"
            className="inline-flex items-center space-x-2 text-sm font-bold text-amber-400 hover:underline transition-all"
          >
            <span>Lihat semua →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {routes.slice(0, 3).map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </section>

      {/* Upcoming Open Rides Section */}
      <section className="bg-[#1A1A1A] border-y border-[#333333] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4" />
                <span>Gowes Bareng</span>
              </div>
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-white">
                Open Ride Terdekat
              </h2>
            </div>
            <Link
              href="/open-rides"
              className="inline-flex items-center space-x-2 text-sm font-bold text-amber-400 hover:underline transition-all"
            >
              <span>Lihat semua →</span>
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
            <div className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Diskusi & Laporan</span>
            </div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white">
              Kondisi Jalan & Diskusi Ter Hangat
            </h2>
          </div>
          <Link
            href="/forum"
            className="inline-flex items-center space-x-2 text-sm font-bold text-amber-400 hover:underline transition-all"
          >
            <span>Masuk Forum →</span>
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
