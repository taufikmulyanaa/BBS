import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lfwguyfgyyemdkpdobij.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd2d1eWZneXllbWRrcGRvYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg3OTQsImV4cCI6MjEwMTYxNDc5NH0.WFOAwMvWj00OYaqJFOrixXapXQ-KRkW00dTs_peuHRs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  nama_lengkap: string;
  foto_profil_url?: string;
  role: 'admin' | 'member';
  bio?: string;
  created_at: string;
};

export type Route = {
  id: string;
  nama: string;
  deskripsi?: string;
  jarak_km: number;
  elevasi_m?: number;
  level: 'easy' | 'medium' | 'hard';
  gpx_file_url?: string;
  cover_image_url?: string;
  tags: string[];
  status_verifikasi: 'belum_diverifikasi' | 'terverifikasi';
  rating_avg: number;
  rating_count: number;
  dibuat_oleh?: string;
  created_at: string;
};

export type OpenRide = {
  id: string;
  judul: string;
  titik_kumpul: string;
  tanggal_waktu: string;
  jarak_km: number;
  level: 'easy' | 'medium' | 'hard';
  kuota_maks: number;
  catatan?: string;
  status: 'akan_datang' | 'selesai' | 'dibatalkan';
  creator_id?: string;
  dibuat_oleh?: string;
  created_at: string;
  participant_count?: number;
};

export type ForumPost = {
  id: string;
  route_id?: string;
  user_id?: string;
  author_id?: string;
  tipe: 'diskusi' | 'laporan_kondisi' | 'laporan_jalan' | 'rekomendasi_warkop' | 'jual_beli' | 'event' | 'tips' | 'bengkel';
  judul: string;
  isi: string;
  lokasi_patokan?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  route_name?: string;
};
