'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: Props) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        setSuccessMsg('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#232322] border border-[#42403B] rounded-2xl shadow-2xl overflow-hidden p-6 text-[#F5F5F5]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E8B87] hover:text-[#F5F5F5] p-1 rounded-lg hover:bg-[#2A2A2A]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h3 className="font-heading font-extrabold text-2xl text-[#F5F5F5]">
            {isSignUp ? 'Buat Akun Baru' : 'Masuk ke Guyub Gowes'}
          </h3>
          <p className="text-xs text-[#B9BEC3] mt-1">
            {isSignUp
              ? 'Daftar untuk membuat Open Ride & simpan rute favorit'
              : 'Masuk untuk berpartisipasi dalam diskusi & ajakan gowes'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-[#D9534F]/20 border border-[#D9534F]/40 rounded-lg flex items-start space-x-2 text-xs text-[#ff9996]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-[#5DBB63]/20 border border-[#5DBB63]/40 rounded-lg flex items-start space-x-2 text-xs text-[#8ee594]">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#B9BEC3] mb-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-[#8E8B87]" />
                <input
                  type="text"
                  required
                  placeholder="Pak Bambang"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#141415] border border-[#42403B] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#B9BEC3] mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#8E8B87]" />
              <input
                type="email"
                required
                placeholder="nama@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#141415] border border-[#42403B] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#B9BEC3] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#8E8B87]" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#141415] border border-[#42403B] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F5F5F5] placeholder-[#8E8B87] focus:outline-none focus:border-[#EA9B28]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EA9B28] hover:bg-[#D98A17] text-[#141415] font-bold text-sm py-2.5 rounded-lg transition-all shadow-md shadow-[#EA9B28]/20 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isSignUp ? 'Daftar Akun' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#42403B]"></div>
          </div>
          <span className="relative bg-[#232322] px-3 text-xs text-[#8E8B87]">atau masuk dengan</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full bg-[#141415] hover:bg-[#2A2A2A] border border-[#42403B] text-[#F5F5F5] font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google Sign-In</span>
        </button>

        <div className="mt-6 text-center text-xs text-[#8E8B87]">
          {isSignUp ? (
            <p>
              Sudah punya akun?{' '}
              <button onClick={() => setIsSignUp(false)} className="text-[#EA9B28] font-bold hover:underline">
                Masuk di sini
              </button>
            </p>
          ) : (
            <p>
              Belum punya akun?{' '}
              <button onClick={() => setIsSignUp(true)} className="text-[#EA9B28] font-bold hover:underline">
                Daftar Akun Baru
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
