# Implementation Roadmap — Bapak-Bapak Sepedahan
## Versi Komunitas Kecil, Biaya Rendah (Turunan dari PRD, Wireframe, Skema Database, API & User Flow v1.0)

**Status:** Draft v1.0
**Turunan dari:** `PRD-Bapak-Bapak-Sepedahan-Low-Cost.md`, `Wireframes-Bapak-Bapak-Sepedahan.md`, `DB-Schema-Bapak-Bapak-Sepedahan.md`, `API-Bapak-Bapak-Sepedahan-Low-Cost.md`, `User-Flow-Bapak-Bapak-Sepedahan-Low-Cost.md`
**Tujuan dokumen ini:** menerjemahkan PRD Bagian 8 (Ruang Lingkup Fitur per Fase), Skema Database Bagian 11 (Urutan Migrasi), kontrak API, dan 14 alur di User Flow menjadi **urutan kerja konkret** — task backend, task Flutter, task deploy, dan kriteria "selesai" per fase — yang bisa langsung dieksekusi tim kecil.

**Asumsi tim & kapasitas:** dokumen sumber tidak mengunci jumlah developer secara eksplisit (hanya menyebut 1-3 admin/pengurus relawan non-teknis). Roadmap ini mengasumsikan **1 developer full-stack (Flutter + Supabase) full-time**, dibantu admin/pengurus untuk konten & testing manual. Kalau kapasitas tim berbeda, skalakan durasi minggu di bawah secara proporsional.

---

## 1. Keputusan yang Perlu Dikunci Sebelum/Selama Coding

Beberapa "gap desain" sudah ditandai di API Bagian 12 dan DB Schema, tapi belum final. Sebaiknya diputuskan eksplisit di awal supaya tidak menghambat sprint di tengah jalan. Rekomendasi default di bawah condong ke opsi paling murah/simpel (konsisten dengan filosofi Rp0 di PRD Bagian 6), tapi tim boleh override sesuai kebutuhan nyata.

| # | Keputusan | Opsi | Rekomendasi Default | Kapan diputuskan |
|---|---|---|---|---|
| 1 | Landing page publik butuh data rute, tapi RLS `routes` hanya `authenticated` | (a) tambah policy `anon` terbatas, (b) konten statis ter-cache | **(b) Statis** — admin update manual 3-6 rute unggulan di landing page secara berkala | Sebelum Fase 0 selesai |
| 2 | Notifikasi "Open Ride baru" | (a) FCM push + Edge Function + webhook, (b) Realtime + badge in-app | **(b) Realtime dulu** — lebih sedikit *moving parts*; upgrade ke (a) kalau nanti terbukti retensi butuh push proaktif | Awal Fase 2 |
| 3 | Tab Forum "Untuk Anda" / "Mengikuti" di wireframe | Skema & API saat ini hanya dukung feed "Terbaru" (belum ada tabel *follow*) | **Ciutkan ke 1 tab "Terbaru" untuk MVP** — tab lain disembunyikan atau diberi label "Segera Hadir", jangan bangun logic personalisasi yang tidak ada dasarnya di skema | Awal Fase 3 |
| 4 | Submit rating rute (badge "4.9 (210)" di wireframe) | Tabel `route_ratings` belum ada di skema | **Tampilkan kolom cache apa adanya (default 0), jangan bangun alur submit** di MVP | Fase 1 |
| 5 | Toggle approval admin manual | Kolom pendukung (`is_approved`) belum ada | **Jangan dibangun sekarang** — auto-aktif setelah verifikasi email tetap berlaku (PRD Bagian 7) | Tidak perlu aksi aktif |
| 6 | Jalur distribusi Android awal | Sideload langsung vs Firebase App Distribution vs langsung Play Store | **Firebase App Distribution untuk beta internal → link sideload publik → Play Store setelah stabil** | Fase 0 |

Catat keputusan final tim di `README.md` repo supaya tidak perlu re-diskusi tiap ada kontributor baru.

---

## 2. Ringkasan Fase & Timeline

| Fase | Nama | Fokus | Estimasi Durasi | Selaras dengan |
|---|---|---|---|---|
| 0 | Setup Proyek & Infrastruktur | Repo, Supabase, Firebase, scaffold Flutter, landing page skeleton | Minggu 0-2 | Prasyarat (ditambah di roadmap ini, belum eksplisit di PRD) |
| 1 | Fondasi & Rute | Auth, Profil, Direktori Rute, GPX, Rute Favorit | Minggu 3-7 | PRD Fase 1 (bulan 1-2) |
| 2 | Open Ride | Buat/Join/Batal Ride, Reminder H-1, FCM | Minggu 8-11 | PRD Fase 2 (bulan 2-3) |
| 3 | Forum Ringan | Post, Like, Komentar, Upload Foto, Laporan Kondisi | Minggu 12-15 | PRD Fase 3 (bulan 3-4) |
| 4 | Hardening, Admin Tools & Rilis | Regresi menyeluruh, tools admin, build rilis, opsional Play Store | Minggu 16-18 | PRD Bagian 9 & 14 |
| 5 | Cold Start & Pasca-Peluncuran | Isi data awal, undang komunitas, monitoring free tier | Minggu 19+ (berkelanjutan) | PRD Bagian 14 (cold start), Bagian 13 (metrik) |

**Total sampai siap diundang ke komunitas (akhir Fase 4): ~14-18 minggu (±3.5-4.5 bulan)** — konsisten dengan estimasi "bulan 1-4" di PRD Bagian 8, ditambah buffer setup awal & hardening akhir yang belum eksplisit disebut angka di PRD.

---

## 3. Fase 0 — Setup Proyek & Infrastruktur (Minggu 0-2)

### 3.1 Backend / Infrastruktur
- [ ] Buat akun & 1 project Supabase (pilih region Singapore untuk latensi Indonesia)
- [ ] Install Supabase CLI → `supabase init` di repo → `supabase login` → `supabase link --project-ref <ref>`
- [ ] Jalankan Supabase lokal untuk dev (`supabase start`, butuh Docker) — supaya migrasi & RLS dites lokal dulu sebelum `db push` ke project hosted, mencegah trial-error langsung di data yang nanti dipakai anggota
- [ ] Buat project Firebase baru khusus FCM (dihubungkan `google-services.json` nanti di Fase 2)
- [ ] Setup Google Cloud OAuth Client (Web + Android) untuk Google Sign-In, daftarkan SHA-1 debug & release keystore
- [ ] Beli domain (.com/.id), siapkan untuk diarahkan ke Vercel

### 3.2 Repo & Tooling
- [ ] Buat repo Flutter (`bapak-bapak-sepedahan-app`) dan repo/folder landing page (`bapak-bapak-sepedahan-web`) — monorepo atau repo terpisah, sesuai preferensi tim
- [ ] `flutter create` project, set application id (co: `id.bapakbapaksepedahan.app`)
- [ ] Tambahkan dependency inti ke `pubspec.yaml`:
  ```yaml
  dependencies:
    supabase_flutter: ^2.x
    flutter_riverpod: ^2.x
    go_router: ^14.x
    flutter_map: ^7.x
    latlong2: ^0.9.x
    firebase_core: ^3.x
    firebase_messaging: ^15.x
    flutter_local_notifications: ^17.x
    image_picker: ^1.x
    flutter_image_compress: ^2.x
    cached_network_image: ^3.x
    url_launcher: ^6.x
    share_plus: ^10.x
    intl: ^0.19.x
    permission_handler: ^11.x
  ```
- [ ] Susun struktur folder feature-based (detail Bagian 9)
- [ ] Setup `--dart-define`/`.env` untuk `SUPABASE_URL` & `SUPABASE_ANON_KEY` — jangan hardcode, jangan commit key ke repo
- [ ] Aktifkan `flutter_lints` + format check
- [ ] Setup CI dasar di GitHub Actions (detail Bagian 10)

### 3.3 Landing Page (Web)
- [ ] Scaffold Next.js (App Router), deploy skeleton kosong ke Vercel dulu untuk validasi pipeline
- [ ] Bangun 1 halaman statis sesuai Wireframe Modul 0 (hero, rute populer **data manual/hardcoded**, footer link Instagram/Grup WhatsApp)
- [ ] Halaman Privacy Policy sederhana (dibutuhkan untuk consent screen Google OAuth, dan nanti listing Play Store)
- [ ] Hubungkan domain custom ke project Vercel

### 3.4 Deliverable Fase 0
Repo Flutter & web bisa di-build, terhubung ke Supabase project kosong, landing page live di domain custom dengan konten placeholder, CI jalan untuk lint & test dasar.

---

## 4. Fase 1 — Fondasi & Rute (Minggu 3-7)

### 4.1 Backend — Database & Auth
Ikuti urutan migrasi DB Schema Bagian 11 langkah 1-4:
- [ ] Migration: extension `pgcrypto`, `pg_trgm`
- [ ] Migration: enum `user_role`, `route_level`, `route_verification_status`
- [ ] Migration: tabel `profiles` + trigger `handle_new_user`/`on_auth_user_created` (DB Schema 6.1) — tes lokal: signup dummy user, pastikan baris `profiles` otomatis muncul
- [ ] Migration: tabel `routes`, `saved_routes` + trigger `set_updated_at` untuk `routes`
- [ ] Index: `idx_routes_nama_trgm`, `idx_routes_level`, `idx_routes_status_verifikasi`, `idx_routes_dibuat_oleh`, `idx_saved_routes_route`
- [ ] RLS: `profiles_select_all`, `profiles_update_own`, `routes_select_all`, `routes_insert_own`, `routes_update_owner_or_admin`, `routes_delete_owner_or_admin`, + policy `saved_routes` (semua operasi milik sendiri)
- [ ] Storage buckets: `avatars`, `routes-gpx`, `routes-cover` (publik-read) — via Dashboard atau `supabase storage` CLI
- [ ] Konfigurasi GoTrue: aktifkan provider Google, set redirect URL, template email verifikasi (boleh pakai default Supabase dulu)
- [ ] `supabase db push` ke project hosted setelah semua tervalidasi lokal

**Tes wajib sebelum lanjut ke frontend:**
- [ ] User A tidak bisa INSERT `routes` atas nama user B
- [ ] User A tidak bisa UPDATE `profiles` milik user B (0 baris berubah)
- [ ] Signup baru otomatis membuat baris `profiles`

### 4.2 Frontend — Flutter
Mengikuti Alur 1-3 di User Flow:
- [ ] **Splash screen** — cek sesi aktif (`supabase.auth.currentSession`), redirect ke Login atau Beranda
- [ ] **Login screen** — form email/password, tombol "Masuk dengan Google" (`signInWithOAuth`)
- [ ] **Register screen** — form nama/email/password + checkbox T&C, redirect ke layar "Cek email"
- [ ] **Layar "Cek Email"** — blokir akses ke Beranda sampai `email_confirmed_at` terisi (kecuali jalur Google yang auto-verified)
- [ ] Riverpod: `authStateProvider` (stream `onAuthStateChange`) + router guard di `go_router` berdasar status login & verifikasi
- [ ] **Bottom nav shell** (Home/Rute/Ride/Forum/Profil) — tab Ride & Forum boleh placeholder "Segera Hadir" dulu sampai Fase 2-3
- [ ] **Direktori Rute** — list + search (`ilike`) + filter level, pagination "Muat lebih banyak" (`limit`/`offset` + `Prefer: count=exact`)
- [ ] **Detail Rute** — peta preview (`flutter_map` + tile OSM), tombol Unduh GPX (`url_launcher` ke public Storage URL), tombol Simpan (`POST saved_routes`), tombol Bagikan
- [ ] **Rute Favorit** — list dari `saved_routes` join `routes`
- [ ] **Profil (dasar)** — tampilkan nama/foto/"Anggota sejak", form edit nama/foto (upload ke bucket `avatars`)
- [ ] Bangun util kompresi gambar (`flutter_image_compress`) sebagai fungsi reusable — dipakai lagi di Fase 3 untuk foto forum

### 4.3 Landing Page
- [ ] Isi landing page dengan 3-6 rute unggulan (data manual, sesuai Keputusan #1)
- [ ] Tombol "Download App" mengarah ke link distribusi beta (Firebase App Distribution, sesuai Keputusan #6)

### 4.4 Deploy & QA Fase 1
- [ ] Build APK debug/internal, upload ke Firebase App Distribution, undang 2-3 tester (developer + 1-2 admin)
- [ ] QA manual mengikuti Alur 1-3 User Flow + edge case "email belum diverifikasi"
- [ ] Cek konsumsi Storage (foto profil, cover rute, GPX) tetap wajar

### 4.5 Definition of Done Fase 1
Anggota bisa daftar (email/Google), verifikasi email, login, jelajahi & cari rute, lihat detail rute di peta, unduh GPX, simpan rute favorit, dan edit profil dasar. Admin bisa upload rute lewat Supabase Studio langsung (UI admin khusus belum perlu di fase ini).

---

## 5. Fase 2 — Open Ride (Minggu 8-11)

### 5.1 Backend
Ikuti DB Schema Bagian 11 langkah 5, 7-8 untuk tabel terkait:
- [ ] Migration: enum `ride_status`, `participant_status`, `device_platform`
- [ ] Migration: tabel `open_rides`, `ride_participants`, `device_tokens` + trigger `set_updated_at` untuk `open_rides`
- [ ] Trigger `check_ride_quota` (DB Schema 6.3) — **tes wajib**: kuota 2, peserta ke-3 ditolak dengan pesan `Kuota Open Ride sudah penuh`
- [ ] Index: `idx_open_rides_tanggal`, `idx_open_rides_level`, `idx_open_rides_status`, `idx_open_rides_dibuat_oleh`, `idx_ride_participants_user`
- [ ] RLS: `open_rides` (select semua, insert milik sendiri, update/delete pembuat-atau-admin), `ride_participants` (select semua, insert/delete milik sendiri, update host-atau-admin), `device_tokens` (semua operasi milik sendiri)
- [ ] Edge Function `send-ride-reminder` (API Bagian 6.1): query ride besok → ambil peserta → ambil token → kirim FCM Admin API. Deploy via `supabase functions deploy send-ride-reminder`, amankan dengan service role key (tidak dipanggil dari app)
- [ ] Jadwalkan via `pg_cron` (mis. jam 18:00 WIB tiap hari)
- [ ] Aktifkan Realtime replication untuk tabel `open_rides` (dipakai untuk Keputusan #2 — badge "Open Ride baru" tanpa Edge Function tambahan)

### 5.2 Frontend
Mengikuti Alur 4-7 User Flow:
- [ ] **Daftar Open Ride** — filter `[Semua][Minggu ini][Level]`, progres peserta via `select=*,ride_participants(count)`
- [ ] **Form Buat Open Ride** — validasi field wajib, submit `POST open_rides`, redirect otomatis ke Detail Ride
- [ ] **Detail Open Ride** — info ride, daftar avatar peserta, tombol JOIN/Batalkan dengan handling error kuota penuh (tangkap pesan trigger, nonaktifkan tombol)
- [ ] **Beranda** — hubungkan section "Open Ride Terdekat" ke data asli (placeholder sejak Fase 1)
- [ ] Subscribe channel Realtime `open_rides` di Beranda/Daftar Ride untuk auto-refresh
- [ ] **Konfirmasi kehadiran (host)** — tampil hanya untuk `auth.uid() == dibuat_oleh` atau admin, `PATCH ride_participants` per peserta set `hadir`/`tidak_hadir`
- [ ] Integrasi FCM: minta izin notifikasi (Android 13+), daftarkan token ke `device_tokens` saat app start/login (`Prefer: resolution=merge-duplicates`), hapus token saat logout
- [ ] Handle notifikasi masuk (foreground & background), tap notifikasi reminder → buka Detail Ride terkait

### 5.3 Deploy & QA Fase 2
- [ ] Build & distribusikan APK beta baru via Firebase App Distribution
- [ ] Tes race condition kuota: 2 device tap JOIN nyaris bersamaan di slot terakhir — pastikan hanya 1 yang berhasil
- [ ] Tes end-to-end reminder H-1: buat ride bertanggal besok, trigger manual Edge Function saat testing (jangan tunggu cron asli), pastikan FCM diterima di device fisik
- [ ] Tes RLS: user selain host tidak bisa `PATCH status_konfirmasi` peserta lain

### 5.4 Definition of Done Fase 2
Anggota bisa membuat Open Ride, melihatnya realtime di Beranda/Daftar Ride, join sampai kuota, batal ikut, menerima reminder H-1 via push notification, dan host bisa konfirmasi kehadiran manual di hari-H.

---

## 6. Fase 3 — Forum Ringan (Minggu 12-15)

### 6.1 Backend
DB Schema Bagian 11 langkah 6:
- [ ] Migration: enum `post_type`
- [ ] Migration: tabel `forum_posts`, `forum_post_media`, `forum_likes`, `forum_comments` + trigger `set_updated_at` untuk `forum_posts`
- [ ] Trigger `check_media_limit` (DB Schema 6.4) — **tes wajib**: foto ke-6 pada post yang sama ditolak
- [ ] Trigger `update_post_like_count` & `update_post_comment_count` (DB Schema 6.5) — **tes wajib**: like/unlike & tambah/hapus komentar mengubah counter dengan benar
- [ ] Index: `idx_forum_posts_route`, `idx_forum_posts_created`, `idx_forum_posts_tipe`, `idx_forum_comments_post`, `idx_forum_likes_user`
- [ ] RLS: `forum_posts` (select semua, insert milik sendiri, update/delete pemilik-atau-admin), `forum_post_media` (select semua, insert oleh pemilik post terkait, delete pemilik-atau-admin), `forum_likes` & `forum_comments` (pola serupa)
- [ ] Storage bucket `forum-media` (publik-read)

### 6.2 Frontend
Mengikuti Alur 8-9 User Flow, dengan penyesuaian Keputusan #3:
- [ ] **Forum — Daftar Diskusi**: implementasikan tab **[Terbaru]** saja untuk MVP (`order=created_at.desc`); tab `[Untuk Anda]`/`[Mengikuti]` disembunyikan atau diberi label "Segera Hadir"
- [ ] **Detail Diskusi + Komentar** — post + media + like/comment count, list komentar, input komentar baru
- [ ] **Buat Post** — toggle tipe (Diskusi/Laporan Kondisi Jalan), dropdown "Tautkan ke Rute" (opsional), upload s.d. 5 foto (reuse util kompresi dari Fase 1), validasi jumlah foto di client sebelum upload
- [ ] Like toggle — cek client-side apakah baris like user sudah ada di data termuat (bukan GET tambahan tiap tap)
- [ ] **Tab Diskusi di Detail Rute** — hubungkan ke `forum_posts?route_id=eq.<uuid>` (kerangka sudah ada sejak Fase 1, sekarang diisi data asli)
- [ ] (Opsional) Realtime badge "post baru" di tab Forum, pola sama dengan channel `open_rides`

### 6.3 Admin Tools (mulai di sini, dilanjut Fase 4)
- [ ] Tombol **Verifikasi Rute** di Detail Rute — hanya tampil untuk role admin (belum ada di wireframe MVP awal, ditambah sesuai catatan API Bagian 12 & User Flow Alur 11), `PATCH routes.status_verifikasi`
- [ ] Tombol hapus post/komentar untuk admin di Forum (moderasi, User Flow Alur 12)

### 6.4 Deploy & QA Fase 3
- [ ] Build & distribusikan APK beta
- [ ] Tes upload foto ke-6 ditolak dengan pesan yang benar, foto ke-1 s.d. 5 berhasil
- [ ] Tes like/unlike dan komentar dari 2 akun berbeda, verifikasi counter akurat
- [ ] Tes admin bisa hapus post orang lain, member biasa tidak bisa

### 6.5 Definition of Done Fase 3
Anggota bisa posting diskusi/laporan kondisi jalan (opsional tautkan rute, s.d. 5 foto), like & komentar, dan admin bisa moderasi + verifikasi rute langsung dari app.

---

## 7. Fase 4 — Hardening, Admin Tools & Rilis (Minggu 16-18)

### 7.1 Regresi & QA Menyeluruh
- [ ] Jalankan ulang **seluruh 14 alur** di User Flow doc sebagai regression checklist (tabel ringkasan Bagian 11 dokumen ini)
- [ ] Verifikasi 6 edge case di User Flow Bagian 15 tertangani (email belum verifikasi, kuota penuh, foto ke-6, edit/hapus milik orang lain, data kosong saat baru rilis, ride dibatalkan admin — poin terakhir **belum otomatis**, pastikan admin tahu proses manual via WA)
- [ ] Audit RLS sistematis: untuk tiap tabel, coba INSERT/UPDATE/DELETE dari akun bukan pemilik, pastikan ditolak/0-baris-berubah — bukan cuma asumsi
- [ ] Cek tidak ada kebocoran email lewat `profiles` SELECT (email memang sengaja tidak diduplikasi ke `public.profiles`, DB Schema Bagian 2)

### 7.2 Persiapan Rilis Teknis
- [ ] Generate keystore rilis (upload keystore), setel `key.properties`, jangan commit ke repo
- [ ] `flutter build apk --release --split-per-abi`, verifikasi versionCode/versionName
- [ ] App icon & splash screen final (bukan default Flutter)
- [ ] (Opsional, disarankan) Setup Sentry atau Firebase Crashlytics gratis untuk crash reporting pasca-rilis
- [ ] Cek ukuran APK & waktu install wajar untuk koneksi rata-rata Indonesia

### 7.3 Distribusi
Dua jalur, tidak saling eksklusif (PRD Bagian 7 & 9):
- [ ] **Sideload publik**: host APK final di link publik (GitHub Releases, bucket Storage publik, atau link Firebase App Distribution publik) → tautkan dari tombol "Download App" di landing page
- [ ] **(Opsional) Play Store**: buat akun Google Play Console ($25 sekali bayar), siapkan listing (screenshot, feature graphic, deskripsi, link Privacy Policy dari Fase 0), submit ke **closed testing track dengan 12 tester** — proses **14-20 hari** untuk akun personal sebelum bisa rilis publik. Mulai proses ini **paralel** dengan akhir Fase 3/awal Fase 4, jangan menunggu semua QA selesai dulu, supaya tidak jadi bottleneck rilis

### 7.4 Definition of Done Fase 4
APK rilis final siap sideload (dan opsional sudah masuk antrean closed testing Play Store), semua regresi 14 alur lolos, tidak ada bypass RLS yang ditemukan, admin punya tools verifikasi rute + moderasi forum + kelola ride bermasalah yang berfungsi.

---

## 8. Fase 5 — Cold Start & Pasca-Peluncuran (Minggu 19+, Berkelanjutan)

Eksekusi konkret dari User Flow Alur 14 & PRD Bagian 14:
- [ ] Admin login pertama kali, isi **20-30 rute awal** secara manual (upload GPX + cover + tags) supaya Direktori Rute tidak kosong saat anggota pertama masuk
- [ ] Admin buat **1-2 Open Ride pertama** supaya Beranda tidak kosong
- [ ] Bagikan link download (sideload atau Play Store kalau sudah lolos closed testing) ke grup WA komunitas existing
- [ ] Undang anggota bertahap — mulai dari pengurus inti sebagai tester awal, baru grup lebih luas
- [ ] Pantau metrik PRD Bagian 13 (Open Ride/minggu, rute tersimpan/anggota, retensi bulanan) dan **konsumsi Storage vs limit free tier** (DB Schema Bagian 10 — foto forum + GPX paling berpotensi jadi bottleneck, bukan ukuran database)
- [ ] Siapkan proses eskalasi biaya: kalau Storage/DB mendekati limit free tier, upgrade ke Supabase Pro (~$25/bulan) sebagai keputusan terencana, bukan migrasi darurat mendadak
- [ ] Kumpulkan feedback anggota, petakan ke roadmap Fase Lanjutan (PRD Bagian 15: cari teman gowes sederhana → marketplace listing tanpa payment → evaluasi kebutuhan lain → chapter kalau ada ekspansi kota → event QR check-in → challenge/Strava paling akhir)

---

## 9. Struktur Folder Flutter (Disarankan)

```
lib/
├── core/
│   ├── config/          # Supabase client init, wrapper env/dart-define
│   ├── router/          # konfigurasi go_router + auth guard
│   ├── theme/           # design tokens, ThemeData
│   └── utils/           # util kompresi gambar, formatter tanggal, dsb
├── features/
│   ├── auth/            # login, register, verifikasi email
│   ├── routes/          # direktori rute, detail rute, rute favorit
│   ├── open_ride/       # daftar, buat, detail, join/batal ride
│   ├── forum/           # daftar diskusi, detail, buat post
│   ├── profile/         # profil, pengaturan akun
│   └── admin/           # verifikasi rute, moderasi forum (role-gated)
├── shared/
│   └── widgets/         # button, card, bottom nav, dsb reusable antar fitur
└── main.dart
```

Tiap `features/<nama>/` disarankan berisi `data/` (wrapper query Supabase), `providers/` (Riverpod), `screens/`, `widgets/` — supaya panggilan API (Bagian 4 dokumen API) tidak tersebar di widget, memudahkan perubahan skema nanti.

---

## 10. CI/CD Sederhana (GitHub Actions, Gratis)

Dua workflow terpisah supaya hemat *minutes* Actions:

**`.github/workflows/ci.yml`** — jalan tiap push/PR:
```yaml
- flutter pub get
- flutter analyze
- flutter test
```

**`.github/workflows/release.yml`** — jalan manual (`workflow_dispatch`) atau saat tag `v*`:
```yaml
- flutter build apk --release --split-per-abi
- upload artifact ke GitHub Release atau Firebase App Distribution
```

Migrasi Supabase (`supabase db push`) **tidak** direkomendasikan otomatis lewat CI untuk MVP ini — jalankan manual oleh developer setelah tes lokal, supaya tiap perubahan skema di database production selalu melalui langkah review sadar. Ini cukup untuk tim kecil yang belum butuh pipeline approval berlapis.

---

## 11. Checklist Regresi 14 Alur (Referensi Cepat untuk Fase 4)

| # | Alur | Lolos? |
|---|---|---|
| 1 | Registrasi (Daftar Email) | [ ] |
| 2 | Login (Email & Google) | [ ] |
| 3 | Jelajahi, Simpan Rute & Unduh GPX | [ ] |
| 4 | Buat Open Ride | [ ] |
| 5 | Join Open Ride | [ ] |
| 6 | Batalkan Keikutsertaan | [ ] |
| 7 | Konfirmasi Kehadiran (Hari-H) | [ ] |
| 8 | Buat Post Forum | [ ] |
| 9 | Like & Komentar | [ ] |
| 10 | Kelola Profil | [ ] |
| 11 | Admin — Verifikasi Rute | [ ] |
| 12 | Admin — Moderasi Forum | [ ] |
| 13 | Admin — Kelola Open Ride Bermasalah | [ ] |
| 14 | Cold Start Komunitas | [ ] |

---

## 12. Risiko Implementasi Tambahan (Di Luar yang Sudah Dicatat PRD)

| Risiko | Mitigasi |
|---|---|
| Closed testing Play Store (14-20 hari) jadi bottleneck kalau baru dimulai di akhir Fase 4 | Mulai proses closed testing paralel sejak akhir Fase 3, bukan menunggu semua QA selesai |
| Developer tunggal jadi *single point of failure* selama 4-5 bulan development | Dokumentasikan keputusan teknis (Bagian 1) & migrasi skema di repo supaya onboarding developer lain cepat kalau diperlukan |
| Kesalahan konfigurasi RLS baru ketahuan setelah rilis | Jadikan audit RLS sistematis (Bagian 7.1) gate wajib sebelum rilis, bukan opsional |
| Race condition kuota Open Ride tidak tertangkap testing manual biasa | Simulasikan eksplisit dengan 2 device/emulator submit nyaris bersamaan sebelum Fase 2 dianggap selesai |
| Perubahan kebijakan/behaviour package `firebase_messaging` di versi mendatang | Uji ulang alur notifikasi tiap kali upgrade versi major package terkait |

---

## 13. Lampiran — Perintah CLI Penting

**Supabase:**
```bash
supabase init
supabase login
supabase link --project-ref <project-ref>
supabase start                    # jalankan Postgres lokal via Docker
supabase migration new <nama>     # buat file migrasi baru
supabase db push                  # apply migrasi ke project hosted
supabase functions deploy send-ride-reminder
supabase functions deploy notify-new-open-ride   # jika Keputusan #2 dialihkan ke opsi (a)
```

**Flutter:**
```bash
flutter create bapak_bapak_sepedahan
flutter pub get
flutter analyze && flutter test
flutter build apk --release --split-per-abi
```

---

*Dokumen ini menerjemahkan visi & spesifikasi di PRD, Wireframe, Skema Database, API, dan User Flow menjadi urutan kerja yang bisa langsung dieksekusi. Seperti dokumen lain di seri ini, roadmap ini terbuka untuk revisi begitu ada temuan nyata selama development — terutama 6 "Keputusan" di Bagian 1 yang sengaja belum final di dokumen sumber.*
