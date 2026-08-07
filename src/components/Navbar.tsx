'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bike, Navigation, Calendar, MessageSquare, User, LogIn, LogOut, Menu, X, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        let currentAvatar = '';
        try {
          const { data: profile } = await supabase.from('profiles').select('foto_profil_url').eq('id', user.id).maybeSingle();
          if (profile?.foto_profil_url) {
            currentAvatar = profile.foto_profil_url;
          }
        } catch {
          // ignore
        }

        if (!currentAvatar) {
          currentAvatar = user.user_metadata?.custom_avatar || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
        }

        setAvatarUrl(currentAvatar);
      }
    };

    loadUserAndProfile();

    const handleAvatarUpdate = () => {
      loadUserAndProfile();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('bbs_avatar_updated', handleAvatarUpdate);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserAndProfile();
      }
    });

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('bbs_avatar_updated', handleAvatarUpdate);
      }
      subscription.unsubscribe();
    };
  }, []);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Bike },
    { href: '/routes', label: 'Direktori Rute', icon: Navigation },
    { href: '/open-rides', label: 'Open Ride', icon: Calendar },
    { href: '/forum', label: 'Forum', icon: MessageSquare },
    { href: '/profile', label: 'Profil', icon: User },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          !scrolled && pathname === '/' 
            ? 'bg-transparent border-transparent' 
            : 'bg-[#141415]/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center font-black shadow-lg group-hover:bg-amber-400 transition-colors">
                <Bike className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-white uppercase tracking-wide group-hover:text-amber-400 transition-colors">
                  Bapak-Bapak Sepedahan
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Gowes Bareng • Guyub Rukun • Sehat & Bahagia
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-[#262626]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : ''}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 bg-[#232322] hover:bg-[#2A2A2A] border border-[#42403B] px-3 py-1.5 rounded-lg text-sm text-[#F5F5F5] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-amber-500/40">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{user.email?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="truncate max-w-[120px]">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1.5 text-sm text-[#8E8B87] hover:text-[#EA9B28] px-3 py-1.5 rounded-lg transition-colors"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center space-x-2 bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-md shadow-[#EA9B28]/20"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Masuk / Daftar</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-[#B9BEC3] hover:text-[#F5F5F5] hover:bg-[#232322]"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#141415] border-b border-[#42403B] px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-[#EA9B28]/20 text-[#EA9B28] font-bold'
                      : 'text-[#B9BEC3] hover:text-[#F5F5F5] hover:bg-[#232322]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-[#42403B]">
              {user ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-[#232322] text-[#D9534F] border border-[#42403B] py-2.5 rounded-lg text-sm font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-[#EA9B28] text-[#141415] py-2.5 rounded-lg text-sm font-bold shadow-md"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Masuk / Daftar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
