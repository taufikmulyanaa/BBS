import { Route, OpenRide, ForumPost } from './supabase';

export const INITIAL_ROUTES: Route[] = [
  {
    id: 'a1010000-0000-0000-0000-000000000001',
    nama: 'Amber Peak Loop',
    deskripsi: 'Trek gowes favorit akhir pekan dengan tanjakan sedang, pepohonan rindang, dan pemandangan perbukitan yang menakjubkan.',
    jarak_km: 32.50,
    elevasi_m: 450,
    level: 'medium',
    tags: ['Tanjakan', 'Pemandangan', 'Kopi'],
    status_verifikasi: 'terverifikasi',
    rating_avg: 4.9,
    rating_count: 210,
    gpx_file_url: 'https://lfwguyfgyyemdkpdobij.supabase.co/storage/v1/object/public/routes-gpx/amber-peak.gpx',
    cover_image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'a1010000-0000-0000-0000-000000000002',
    nama: 'Rute Santai Jalur Hijau KM0',
    deskripsi: 'Rute mendatar ramah pemula melintasi perkebunan dan spot warung kopi legendaris Mbok Joyo.',
    jarak_km: 18.20,
    elevasi_m: 120,
    level: 'easy',
    tags: ['Ramah Pemula', 'Kuliner', 'Datar'],
    status_verifikasi: 'terverifikasi',
    rating_avg: 4.8,
    rating_count: 156,
    gpx_file_url: 'https://lfwguyfgyyemdkpdobij.supabase.co/storage/v1/object/public/routes-gpx/km0-santai.gpx',
    cover_image_url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'a1010000-0000-0000-0000-000000000003',
    nama: 'Tanjakan Ekstrem Bukit Pelangi',
    deskripsi: 'Tantangan tanjakan tinggi berkesinambungan untuk pesepeda berpengalaman. Pemandangan 360 derajat di puncak.',
    jarak_km: 45.00,
    elevasi_m: 890,
    level: 'hard',
    tags: ['Tanjakan Ekstrem', 'King of Mountain', 'Pemandangan'],
    status_verifikasi: 'terverifikasi',
    rating_avg: 4.7,
    rating_count: 98,
    gpx_file_url: 'https://lfwguyfgyyemdkpdobij.supabase.co/storage/v1/object/public/routes-gpx/bukit-pelangi.gpx',
    cover_image_url: 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'a1010000-0000-0000-0000-000000000004',
    nama: 'Lingkar Waduk Jatiluhur',
    deskripsi: 'Kombinasi rute aspal mulus dan pemandangan danau luas. Tempat favorit untuk endurance training.',
    jarak_km: 62.00,
    elevasi_m: 310,
    level: 'medium',
    tags: ['Endurance', 'Danau', 'Fotografi'],
    status_verifikasi: 'terverifikasi',
    rating_avg: 4.9,
    rating_count: 184,
    gpx_file_url: 'https://lfwguyfgyyemdkpdobij.supabase.co/storage/v1/object/public/routes-gpx/jatiluhur.gpx',
    cover_image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_OPEN_RIDES: OpenRide[] = [
  {
    id: 'b2020000-0000-0000-0000-000000000001',
    judul: 'Gowes Tipis-Tipis Minggu Pagi',
    titik_kumpul: 'Alun-Alun Kota (Depan Pos Polisi)',
    tanggal_waktu: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    jarak_km: 25.00,
    level: 'easy',
    kuota_maks: 15,
    participant_count: 8,
    catatan: 'Kecepatan rata-rata 20-22 km/jam. Wajib helm & lampu depan/belakang. Bawa uang saku buat warkop!',
    status: 'akan_datang',
    created_at: new Date().toISOString()
  },
  {
    id: 'b2020000-0000-0000-0000-000000000002',
    judul: 'Endurance Ride to Amber Peak',
    titik_kumpul: 'Mini Market Simpang 3 Ciawi',
    tanggal_waktu: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    jarak_km: 50.00,
    level: 'medium',
    kuota_maks: 10,
    participant_count: 6,
    catatan: 'Target Pace: 24-27 km/jam. Regroup di KM 20 warung Mbah Kaji.',
    status: 'akan_datang',
    created_at: new Date().toISOString()
  },
  {
    id: 'b2020000-0000-0000-0000-000000000003',
    judul: 'Morning Coffee Ride KM0',
    titik_kumpul: 'Halaman Gedung Sate',
    tanggal_waktu: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    jarak_km: 18.00,
    level: 'easy',
    kuota_maks: 20,
    participant_count: 14,
    catatan: 'Casual ride santai penikmat kopi pagi. Dresscode jersey bebas teratur.',
    status: 'akan_datang',
    created_at: new Date().toISOString()
  }
];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'c3030000-0000-0000-0000-000000000001',
    route_id: 'a1010000-0000-0000-0000-000000000001',
    user_id: 'usr-1',
    author_name: 'Pak Bambang Tri',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    route_name: 'Amber Peak Loop',
    tipe: 'laporan_kondisi',
    judul: 'Info Jalanan: Jalur Amber Peak KM 12 Perbaikan',
    isi: 'FYI bapak-bapak sekalian, jalur di KM 12 dekat jembatan kayu sedang ada perbaikan jalan. Harap hati-hati banyak pasir dan krikil halus saat turunan.',
    like_count: 18,
    comment_count: 5,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c3030000-0000-0000-0000-000000000002',
    route_id: 'a1010000-0000-0000-0000-000000000002',
    user_id: 'usr-2',
    author_name: 'Om Dedi Suherman',
    author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    route_name: 'Rute Santai Jalur Hijau KM0',
    tipe: 'diskusi',
    judul: 'Rekomendasi Warkop Favorit Setelah Gowes KM0',
    isi: 'Warung Kopi Mbah Joyo recommended banget. Pisang goreng hangatnya mantap, kental manis gurih, dan area parkir sepeda berpagar aman.',
    like_count: 32,
    comment_count: 11,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];
