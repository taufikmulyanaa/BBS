import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lfwguyfgyyemdkpdobij.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmd2d1eWZneXllbWRrcGRvYmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMzg3OTQsImV4cCI6MjEwMTYxNDc5NH0.WFOAwMvWj00OYaqJFOrixXapXQ-KRkW00dTs_peuHRs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Handled explicitly in Navbar.tsx instead — the automatic URL-based
    // detection races with that explicit handler on the OAuth redirect
    // and can leave the ?code= param unexchanged.
    detectSessionInUrl: false,
  },
});

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
  titik_awal?: string;
  titik_akhir?: string;
  permukaan?: string;
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
  chapter_id?: string;
  event_id?: string;
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

export type Chapter = {
  id: string;
  nama: string;
  kota: string;
  slug: string;
  deskripsi?: string;
  cover_image_url?: string;
  status: 'aktif' | 'nonaktif';
  dibuat_oleh?: string;
  created_at: string;
};

export type ChapterMember = {
  chapter_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'pending' | 'aktif' | 'ditolak';
  requested_at: string;
  decided_at?: string;
  decided_by?: string;
};

export type ChapterEvent = {
  id: string;
  chapter_id: string;
  jenis: 'open_ride' | 'kopdar' | 'lainnya';
  judul: string;
  deskripsi?: string;
  lokasi?: string;
  tanggal_waktu: string;
  kuota_maks?: number;
  status: 'akan_datang' | 'selesai' | 'dibatalkan';
  dibuat_oleh?: string;
  created_at: string;
  participant_count?: number;
};

export type ChapterEventParticipant = {
  event_id: string;
  user_id: string;
  status_konfirmasi: 'terdaftar' | 'hadir' | 'tidak_hadir';
  joined_at: string;
};

export type BikeEvent = {
  id: string;
  judul: string;
  deskripsi?: string;
  penyelenggara?: string;
  lokasi?: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  poster_url?: string;
  link_pendaftaran?: string;
  status: 'akan_datang' | 'selesai' | 'dibatalkan';
  dibuat_oleh?: string;
  created_at: string;
  interest_count?: number;
};

export type BikeEventInterest = {
  event_id: string;
  user_id: string;
  created_at: string;
};

export type TravelBuddyListing = {
  id: string;
  event_id: string;
  user_id: string;
  titik_berangkat: string;
  tanggal_berangkat?: string;
  moda?: string;
  kuota_maks?: number;
  catatan?: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
};

export type TravelBuddyParticipant = {
  listing_id: string;
  user_id: string;
  joined_at: string;
};
