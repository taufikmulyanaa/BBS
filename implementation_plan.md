# Implementation Plan — Bapak-Bapak Sepedahan (Guyub Gowes)

Implementasi aplikasi web **Bapak-Bapak Sepedahan (Guyub Gowes)**, penyetelan database **Supabase** (`lfwguyfgyyemdkpdobij`), peluncuran ke **Vercel**, serta pengunggahan (*commit & push*) ke repository GitHub `https://github.com/taufikmulyanaa/BBS.git`.

## User Review Required

> [!IMPORTANT]
> - **Supabase Project:** Database akan dikonfigurasi pada proyek Supabase `https://supabase.com/dashboard/project/lfwguyfgyyemdkpdobij` (Project Ref: `lfwguyfgyyemdkpdobij`).
> - **GitHub Repository:** Seluruh kode sumber dan file konfigurasi akan di-commit dan di-push ke remote `https://github.com/taufikmulyanaa/BBS.git`.
> - **Vercel Deployment:** Aplikasi web Next.js akan di-build dan di-deploy ke Vercel untuk lingkungan produksi.

## Proposed Changes

### Database & Supabase Integration (`supabase/`)

#### [NEW] [01_initial_schema.sql](file:///c:/Project%20App/BBS/supabase/migrations/01_initial_schema.sql)
- Menyusun ekstensi Postgres (`pgcrypto`, `pg_trgm`).
- Tipe enum (`user_role`, `route_level`, `route_verification_status`, `ride_status`, `participant_status`, `post_type`, `device_platform`).
- Tabel inti: `profiles`, `routes`, `saved_routes`, `open_rides`, `ride_participants`, `forum_posts`, `forum_post_media`, `forum_likes`, `forum_comments`, `device_tokens`.
- Trigger otomatis: auto-create profil dari `auth.users`, kuota maks Open Ride, limit 5 media per post, denormalisasi counter `like_count` & `comment_count`.
- Kebijakan keamanan Row Level Security (RLS) dan index performa pencarian.

#### [NEW] [seed.sql](file:///c:/Project%20App/BBS/supabase/seed.sql)
- Data awal rute populer (Amber Peak, Rute Kopi KM0, Rute Waduk Jatiluhur, dll.).
- Data awal Open Ride gowes bersama.
- Post awal forum & diskusi rute.

---

### Web Application (`web/` / Root Next.js App)

#### [NEW] Next.js 14+ / React Web App
- **Design System:** Implementasi tema **Golden Amber & Asphalt Dark Mode** (`#EA9B28` primary, `#141415` dark background, `#232322` surface) sesuai spesifikasi wireframe `color_palette_reference_guyub_gowes.md`.
- **Halaman Utama / Landing Page:** Hero banner, statistik komunitas, rute unggulan, ajakan gowes (Open Ride) terbaru, dan footer.
- **Autentikasi:** Modal/Halaman login & register terintegrasi dengan Supabase Auth (Email & Google OAuth).
- **Direktori Rute (`/routes`):** Filter tingkat kesulitan (Easy, Medium, Hard), fitur pencarian live, preview peta interaktif Leaflet.js, unduh file GPX, serta simpan rute favorit.
- **Open Ride (`/open-rides`):** List ajakan gowes, detail titik kumpul, status kuota peserta, dan tombol Join / Batal Join terintegrasi database real-time.
- **Forum Diskusi (`/forum`):** Feed diskusi rute, filter tag (Diskusi / Laporan Kondisi), fitur Like, Komentar, dan posting baru.
- **Profil Pengguna (`/profile`):** Tampilan profil anggota, daftar rute favorit tersimpan, dan Open Ride yang diikuti.

---

### Deployment & Version Control

#### [NEW] [vercel.json](file:///c:/Project%20App/BBS/vercel.json)
- Konfigurasi build dan environment variable Vercel.

#### Git Commit & Push
- `git init`, set branch utama ke `main`, hubungkan remote `https://github.com/taufikmulyanaa/BBS.git`.
- Commit seluruh file proyek dan push ke GitHub.

## Verification Plan

### Automated & Build Verification
- Menjalankan linting dan TypeScript compiler checks (`npm run build`).
- Verifikasi skema SQL Supabase dapat dieksekusi tanpa error sintaks.

### Manual Verification
- Uji coba responsivitas tampilan (Mobile & Desktop).
- Uji coba fungsi navigasi antar halaman (Landing, Rute, Open Ride, Forum, Auth).
- Verifikasi keberhasilan deploy di Vercel URL dan ketersediaan repositori di GitHub.
