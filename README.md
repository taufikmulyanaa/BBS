# Guyub Gowes — Bapak-Bapak Sepedahan (BBS)

Aplikasi Web & Platform Komunitas Pesepeda Bapak-Bapak (Lean MVP Biaya Rendah).

---

## 🚴 Fitur Utama

- **Hero & Landing Page Komunitas:** Tampilan dark mode modern (Golden Amber & Dark Asphalt `#EA9B28` & `#141415`).
- **Direktori Rute & GPX:** Katalog rute terverifikasi, filter tingkat kesulitan (Easy, Medium, Hard), preview peta interaktif Leaflet.js / OpenStreetMap, dan unduh file GPX gratis.
- **Open Ride (Gowes Bareng):** Jadwal ajakan gowes bersama, detail titik kumpul & jam start, indikator kuota peserta real-time, serta tombol join / batal join.
- **Forum Diskusi & Laporan Jalan:** Ruang diskusi terikat rute, laporan kondisi jalanan / perbaikan real-time, serta fitur like & komentar.
- **Profil Anggota:** Statistik keikutsertaan, rute favorit tersimpan, dan pengeditan bio profil.
- **Otentikasi Supabase:** Dukungan masuk / daftar email dan Google Sign-In.

---

## 🛠️ Tech Stack & Biaya (Rp0/bulan)

- **Frontend App:** Next.js 14+ (App Router), React, Tailwind CSS, Leaflet.js, Lucide Icons.
- **Backend & Database:** Supabase Postgres, Auth, Realtime, Storage.
- **Hosting & Deploy:** Vercel Production.
- **Maps:** OpenStreetMap (Free, tanpa kuota API key berbayar).

---

## 📦 Struktur Migrasi Database Supabase

Proyek Supabase: `https://supabase.com/dashboard/project/lfwguyfgyyemdkpdobij`

File skema database & data awal terdapat pada folder `supabase/`:
- `supabase/migrations/01_initial_schema.sql` (Tabel `profiles`, `routes`, `saved_routes`, `open_rides`, `ride_participants`, `forum_posts`, `forum_comments`, `forum_likes`, triggers, index, & RLS policies).
- `supabase/seed.sql` (Data awal rute, open ride, dan forum).

### Jalankan SQL di Supabase SQL Editor
Salin isi file `supabase/migrations/01_initial_schema.sql` dan `supabase/seed.sql` ke SQL Editor di Supabase Dashboard Anda.

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.local .env

# 3. Jalankan server pengembang
npm run dev
```

Buka `http://localhost:3000` pada browser Anda.

---

## 🌐 Deployment ke Vercel

```bash
npx vercel --prod
```

---

## 📜 Lisensi & Komunitas

Dikembangkan untuk Komunitas Gowes Indonesia. Dipelihara secara independen.
