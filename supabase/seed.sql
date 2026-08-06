-- seed.sql
-- Initial seed data for Bapak-Bapak Sepedahan (Guyub Gowes)

-- 1. Insert sample routes
INSERT INTO public.routes (id, nama, deskripsi, jarak_km, elevasi_m, level, tags, status_verifikasi, rating_avg, rating_count, gpx_file_url, cover_image_url)
VALUES
(
  'a1010000-0000-0000-0000-000000000001',
  'Amber Peak Loop',
  'Trek gowes favorit akhir pekan dengan tanjakan sedang dan pemandangan perbukitan yang menakjubkan.',
  32.50,
  450,
  'medium',
  ARRAY['Tanjakan', 'Pemandangan', 'Kopi'],
  'terverifikasi',
  4.9,
  210,
  'https://lfwguyfgyyemdkpdobij.supabase.co/storage/v1/object/public/routes-gpx/amber-peak.gpx',
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80'
),
(
  'a1010000-0000-0000-0000-000000000002',
  'Rute Santai Jalur Hijau KM0',
  'Rute mendatar ramah pemula melintasi pedesaan dan spot warung kopi legendaris.',
  18.20,
  120,
  'easy',
  ARRAY['Ramah Pemula', 'Kuliner', 'Datar'],
  'terverifikasi',
  4.8,
  156,
  'https://lfwguyfgyyemdkpdobij.supabase.co/storage/v1/object/public/routes-gpx/km0-santai.gpx',
  'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=800&q=80'
),
(
  'a1010000-0000-0000-0000-000000000003',
  'Tanjakan Ekstrem Bukit Pelangi',
  'Tantangan tanjakan tinggi untuk pesepeda berpengalaman. Pemandangan di puncak luar biasa.',
  45.00,
  890,
  'hard',
  ARRAY['Tanjakan Ekstrem', 'King of Mountain', 'Pemandangan'],
  'terverifikasi',
  4.7,
  98,
  'https://lfwguyfgyyemdkpdobij.supabase.co/storage/v1/object/public/routes-gpx/bukit-pelangi.gpx',
  'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?auto=format&fit=crop&w=800&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert sample open rides
INSERT INTO public.open_rides (id, judul, titik_kumpul, tanggal_waktu, jarak_km, level, kuota_maks, catatan, status)
VALUES
(
  'b2020000-0000-0000-0000-000000000001',
  'Gowes Tipis-Tipis Minggu Pagi',
  'Alun-Alun Kota (Depan Pos Polisi)',
  NOW() + INTERVAL '2 days',
  25.00,
  'easy',
  15,
  'Kecepatan rata-rata 20-22 km/jam. Wajib helm & lampu depan/belakang. Bawa uang saku buat warkop!',
  'akan_datang'
),
(
  'b2020000-0000-0000-0000-000000000002',
  'Endurance Ride to Amber Peak',
  'Mini Market Simpang 3',
  NOW() + INTERVAL '5 days',
  50.00,
  'medium',
  10,
  'Target Pace: 24-27 km/jam. Regroup di KM 20 warung Mbah Kaji.',
  'akan_datang'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert sample admin user in auth.users & profiles if not exists
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@guyubgowes.com',
  '$2a$10$abcdefghijklmnopqrstuvwxyz012345',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Pak Bambang Tri"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, nama_lengkap, role, bio)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Pak Bambang Tri',
  'admin',
  'Pengurus Komunitas Guyub Gowes Bapak-Bapak Sepedahan'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert sample forum posts
INSERT INTO public.forum_posts (id, route_id, user_id, tipe, judul, isi, like_count, comment_count, created_at)
VALUES
(
  'c3030000-0000-0000-0000-000000000001',
  'a1010000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'laporan_kondisi',
  'Kondisi Jalan Jalur Amber Peak KM 12 Ada Perbaikan',
  'FYI bapak-bapak sekalian, jalur di KM 12 dekat jembatan kayu sedang ada perbaikan jalan. Harap hati-hati banyak pasir dan krikil halus.',
  12,
  5,
  NOW() - INTERVAL '1 day'
),
(
  'c3030000-0000-0000-0000-000000000002',
  'a1010000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'diskusi',
  'Rekomendasi Warkop Favorit Setelah Gowes KM0',
  'Warung Kopi Mbah Joyo recommended banget. Pisang goreng hangatnya mantap dan parkir sepeda aman berpagar.',
  24,
  8,
  NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;
