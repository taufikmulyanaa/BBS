# PRD — Bapak-Bapak Sepedahan
## Versi Komunitas Kecil, Biaya Rendah (Lean MVP)

**Status:** Draft v1.0
**Turunan dari:** Konsep produk penuh "Bapak-Bapak Sepedahan" (landing page, mobile app, 8 fase fitur)
**Filosofi dokumen ini:** Konsep aslinya sudah bagus dan lengkap, tapi dirancang untuk skala besar (12rb+ anggota, 58 chapter, marketplace dengan payment gateway, integrasi Strava). Dokumen ini mengambil visi yang sama tapi memangkas ulang **keputusan teknis dan urutan fase** supaya bisa dijalankan oleh komunitas kecil (puluhan–ratusan anggota, 1 kota/klub) dengan biaya operasional mendekati Rp0/bulan di tahap awal.

---

## 1. Ringkasan Eksekutif

Bapak-Bapak Sepedahan adalah platform komunitas untuk pesepeda — berbagi rute, mengajak gowes bareng (Open Ride), dan diskusi seputar rute/gear. Versi ini menyasar **satu komunitas/klub gowes berskala kecil** (bukan platform multi-chapter nasional), dengan prinsip: bangun hanya fitur yang benar-benar dipakai di skala kecil, tunda fitur yang baru masuk akal kalau anggota sudah ribuan.

Target: aplikasi bisa jalan dengan **infrastruktur gratis (free tier)**, tanpa biaya app store, tanpa integrasi berbayar, dan tanpa tim dev besar.

## 2. Masalah yang Diselesaikan

- Info rute gowes tersebar di grup WhatsApp, susah dicari lagi.
- Ajakan gowes bareng ("Open Ride") juga tenggelam di chat WA, sering nggak jelas siapa yang jadi, titik kumpul di mana, kuota berapa.
- Nggak ada tempat terpusat untuk simpan rute favorit dan diskusi kondisi jalan/keamanan.

## 3. Tujuan Produk (Goals)

1. Anggota bisa menemukan dan menyimpan rute gowes dengan mudah (termasuk unduh GPX).
2. Anggota bisa membuat dan bergabung ke sesi gowes bareng (Open Ride) tanpa bolak-balik cek grup WA.
3. Ada ruang diskusi ringan per rute (kondisi jalan, rekomendasi, dll).
4. Biaya operasional tahap awal **Rp0–Rp50.000/bulan** (di luar domain).
5. Bisa dipakai baik lewat browser HP maupun "install" ke home screen tanpa perlu publish ke App Store/Play Store dulu.

## 4. Non-Tujuan (Eksplisit — Ditunda Dulu)

Ini bagian penting: fitur di bawah **bukan berarti nggak penting**, tapi butuh biaya/kompleksitas yang cuma masuk akal kalau komunitas sudah besar. Ditunda ke Fase Lanjutan (lihat Bagian 8):

- Marketplace dengan cart/checkout/payment gateway/escrow
- Integrasi Strava/Garmin otomatis
- Pencarian teman gowes berbasis radius geolokasi
- Sistem multi-chapter dengan admin per kota
- Challenge dengan leaderboard & badge
- Native app iOS/Android terpisah (App Store & Play Store)

## 5. Target Pengguna & Skala

| Parameter | Asumsi MVP |
|---|---|
| Jumlah anggota aktif | 50–500 orang |
| Jumlah "klub"/komunitas | 1 (belum multi-chapter) |
| Open Ride per minggu | 5–20 sesi |
| Rute terdaftar | 20–100 rute |
| Admin/pengurus | 1–3 orang (relawan, bukan tim dedicated) |

Angka di mockup asli (12.458 anggota, 58 chapter, dst.) adalah **visi jangka panjang**, bukan target MVP ini. Baru relevan kalau produk sudah tervalidasi di skala kecil.

## 6. Prinsip Desain untuk Biaya Rendah

1. **Satu layanan backend serba bisa**, bukan banyak service terpisah — hindari biaya & kompleksitas maintenance banyak server.
2. **Satu codebase Flutter untuk Android & iOS** — hindari effort membangun ulang UI terpisah di web dan mobile; rilis Android dulu, iOS ditunda sampai ada anggaran (lihat Bagian 9).
3. **Peta gratis (OpenStreetMap)**, bukan Google Maps/Mapbox berbayar per load.
4. **Integrasi pihak ketiga lewat link, bukan API berbayar** (mis. WhatsApp via `wa.me`, bukan gateway WA berbayar; Strava via link "lihat di Strava", bukan OAuth sinkronisasi).
5. **Approval manual seminimal mungkin** — komunitas kecil = saling kenal, jangan bikin proses admin jadi bottleneck.
6. **Kuota disiplin di awal** (ukuran file, jumlah upload) supaya tetap di bawah limit free tier selama mungkin.

## 7. Keputusan Teknis MVP (Jawaban atas Pertanyaan Teknis)

Ini pemetaan langsung ke tabel pertanyaan teknis yang sudah disusun, dengan keputusan yang paling murah tapi tetap layak untuk komunitas kecil.

| Modul | Pertanyaan | Keputusan MVP (Biaya Rendah) | Alasan |
|---|---|---|---|
| Authentication | Login pakai apa? | Email + Google Sign-In saja | Apple Sign-In butuh Apple Developer Program (~$99/tahun) yang belum perlu; OTP SMS berbayar per pesan |
| Authentication | Verifikasi email/HP? | Verifikasi email saja | Verifikasi email gratis lewat provider auth; OTP SMS ada biaya per kirim |
| Authentication | Approval admin sebelum aktif? | Tidak — auto-aktif setelah verifikasi email | Komunitas kecil saling kenal; approval manual jadi beban admin relawan. Bisa di-toggle jadi manual kalau komunitas mau lebih selektif |
| Authorization | Role apa saja? | Admin & Member saja | Moderator/Seller/Chapter Admin baru relevan saat skala & fitur terkait (marketplace, chapter) dibangun |
| Maps & Routing | Platform peta? | OpenStreetMap + Leaflet.js | Gratis tanpa API key/kuota; Google Maps/Mapbox mengenakan biaya per load setelah kuota gratis habis |
| Route & GPX | GPX dari mana? | Upload manual oleh admin/pembuat rute | Sinkronisasi otomatis dari layanan lain butuh integrasi & maintenance tambahan yang belum perlu |
| Integrasi Strava | Sejauh mana? | Tidak ada di MVP — cukup tombol "Lihat di Strava" (link keluar) | Sinkronisasi aktivitas otomatis butuh OAuth + rate limit handling; nilai tambahnya kecil untuk komunitas kecil |
| Media Storage | Disimpan berapa lama, ada batas? | Disimpan selama akun aktif; batas 5 file/post, maks 5MB/file, kompres otomatis saat upload | Menjaga penggunaan storage tetap di bawah limit free tier |
| Marketplace | Sejauh mana? | Ditunda dari MVP; kalau dibangun, cukup listing + tombol kontak WhatsApp (tanpa cart/payment) | Payment gateway (Midtrans/Xendit) kena biaya transaksi & effort integrasi yang belum sepadan di skala kecil |
| Open Ride | Alur join? | Peserta langsung bergabung otomatis sampai kuota penuh, tanpa approval host | Approval manual per peserta memperlambat alur untuk komunitas yang saling percaya |
| Chapter | Hak akses admin chapter? | Tidak dibangun di MVP (1 komunitas = tidak perlu multi-chapter) | Baru relevan kalau sudah ada permintaan ekspansi ke kota lain |
| Event | Sejauh mana? | Info + link pendaftaran eksternal (Google Form/WA) | QR check-in & pembayaran built-in menambah kompleksitas backend yang belum perlu |
| Challenge | Data dari mana? | Tidak dibangun di MVP | Integrasi GPS/Strava/Garmin untuk validasi butuh effort besar untuk manfaat yang masih bisa didapat lewat WA group biasa |
| Client Framework | Web atau native? | Flutter (Riverpod) — satu codebase Android & iOS | Konsisten dengan stack Matchly yang sudah dikuasai; hindari maintenance dua codebase (web + native) terpisah |
| Distribusi Android | Play Store atau sideload? | Sideload APK gratis untuk komunitas tertutup di awal, upgrade ke Play Store ($25 sekali bayar) kalau mau jangkauan lebih luas | Play Store 2026 mewajibkan closed testing 12 tester selama 14–20 hari untuk akun personal sebelum rilis publik — sideload melewati proses ini di tahap awal |
| Distribusi iOS | Rilis sekarang atau ditunda? | Ditunda — Apple Developer Program ($99/tahun, berulang) baru dibayar kalau ada permintaan nyata dari anggota pengguna iPhone | Mayoritas anggota komunitas gowes Indonesia kemungkinan besar Android; ini biaya tahunan berulang termahal di seluruh stack |
| Notifikasi | Push notification native? | Firebase Cloud Messaging (FCM) | Gratis, dan pengalamannya lebih baik dari web push karena sudah pakai app native |

## 8. Ruang Lingkup Fitur per Fase

Roadmap asli (8 fase) dikompres jadi **3 fase inti** + fase lanjutan yang eksplisit ditunda.

### Fase 1 — Fondasi & Rute (bulan 1–2)
- Landing page komunitas
- Login (email + Google), profil anggota sederhana
- Direktori rute + detail rute
- Unduh GPX
- Simpan rute favorit
- *(Gear review ditunda ke Fase 3 — bisa jadi bagian dari forum diskusi per rute, tidak perlu modul terpisah dulu)*

### Fase 2 — Open Ride (bulan 2–3)
Ini fitur dengan nilai tertinggi untuk komunitas kecil — gantikan koordinasi manual di WA:
- Buat ajakan gowes (titik kumpul, tanggal/jam, jarak, level, batas peserta, catatan)
- Tombol join (auto-join sampai kuota)
- Daftar peserta & konfirmasi kehadiran
- Notifikasi sederhana (email atau web push gratis) saat ada Open Ride baru

### Fase 3 — Forum Ringan (bulan 3–4)
- Diskusi terikat ke rute (bukan feed generik seperti Threads dulu — lebih murah dibangun, lebih relevan untuk komunitas kecil)
- Like & komentar
- Upload foto (dengan batas ukuran/jumlah, lihat Bagian 7)
- Laporan kondisi jalan/lalu lintas/keamanan sebagai tag khusus di post

### Fase Lanjutan — Ditunda Sampai Ada Sinyal Kebutuhan Nyata
Dibangun **hanya jika** komunitas sudah tumbuh dan butuhnya jelas (bukan default roadmap):

| Fitur asli | Kenapa ditunda | Sinyal untuk mulai bangun |
|---|---|---|
| Cari teman gowes (radius/geolokasi) | Komunitas kecil biasanya sudah saling kenal lewat WA group | Anggota >500 dan mulai lintas-komunitas |
| Chapter komunitas | Perlu admin per kota + arsitektur data tambahan | Ada permintaan konkret ekspansi ke kota lain |
| Marketplace + payment | Payment gateway ada biaya transaksi & compliance | Volume jual-beli lewat forum sudah tinggi & butuh trust system |
| Event dengan QR check-in & pembayaran | Kompleksitas backend tinggi untuk manfaat yang masih bisa dicapai manual | Event >100 peserta yang sulit dikelola manual |
| Challenge + leaderboard + Strava/Garmin | Integrasi API pihak ketiga + effort gamifikasi besar | Ada permintaan eksplisit dari anggota untuk fitur kompetisi |

## 9. Tech Stack & Estimasi Biaya

| Komponen | Pilihan | Biaya | Catatan |
|---|---|---|---|
| App utama | Flutter (Riverpod), satu codebase Android & iOS | Rp0 (SDK gratis) | Konsisten dengan stack Matchly — tim tidak perlu belajar tool baru |
| Landing page publik | Halaman statis sederhana (Next.js/HTML, bukan Flutter Web) di Vercel | Rp0 | Flutter Web kurang SEO-friendly untuk halaman publik yang perlu ditemukan lewat pencarian; app tetap 100% Flutter |
| Backend + Database | Supabase (Postgres + Auth + Storage + Realtime dalam satu layanan, via `supabase_flutter`) | Rp0 pada free tier | Free tier: ~500MB DB, 1GB storage, 50rb MAU — jauh cukup untuk 50–500 anggota |
| Peta (dalam app) | `flutter_map` + tile OpenStreetMap | Rp0 | Tanpa API key/kuota berbayar |
| Notifikasi | Firebase Cloud Messaging (FCM) | Rp0 | Push notification native gratis, pengalaman lebih baik dari web push |
| Distribusi Android | Sideload APK gratis di awal → Play Store ($25 sekali bayar) saat siap jangkauan lebih luas | Rp0–$25 sekali | Play Store 2026 mewajibkan closed testing 12 tester 14–20 hari untuk akun personal |
| Distribusi iOS | Ditunda sampai ada permintaan nyata | $0 di awal | Apple Developer Program $99/tahun — biaya berulang, baru masuk akal kalau porsi anggota iPhone signifikan |
| Kontak penjual/host (WA) | `url_launcher` ke link `wa.me` | Rp0 | Tanpa gateway WA berbayar |
| Domain (untuk landing page) | Domain .com/.id | ~Rp150–200rb/tahun | Satu-satunya biaya wajib di awal |

**Total estimasi: Rp0–50rb/bulan** kalau sideload APK dan skip Play Store dulu, atau **+$25 sekali bayar** kalau langsung rilis di Play Store. iOS ($99/tahun) baru dipertimbangkan setelah ada sinyal permintaan nyata. Backend upgrade ke Supabase Pro (~$25/bulan) baru relevan kalau anggota/trafik sudah melewati limit free tier.

## 10. Skema Peran & Hak Akses (MVP)

| Role | Hak Akses |
|---|---|
| **Admin** | Kelola anggota, verifikasi/hapus rute, moderasi forum, kelola Open Ride bermasalah |
| **Member** | Lihat & simpan rute, buat Open Ride, join Open Ride, posting & komentar di forum |

Tidak ada role Moderator/Seller/Chapter Admin di MVP — cukup 2 role untuk komunitas kecil yang dikelola relawan.

## 11. Skema Data Tingkat Tinggi

Entitas inti (disederhanakan, tanpa tabel marketplace/chapter/event/challenge di MVP):

- **users** — id, nama, email, foto profil, role, tanggal join
- **routes** — id, nama, jarak, elevasi, level, file GPX, dibuat_oleh, rating
- **saved_routes** — user_id, route_id (rute favorit)
- **open_rides** — id, judul, titik_kumpul, tanggal_waktu, jarak, level, kuota_maks, dibuat_oleh, catatan
- **ride_participants** — open_ride_id, user_id, status_konfirmasi
- **forum_posts** — id, route_id (nullable), user_id, isi, tipe (diskusi/laporan_kondisi), media_urls
- **forum_comments** — id, post_id, user_id, isi

## 12. Alur Pengguna Utama — Membuat & Bergabung Open Ride

1. Member buka menu "Open Ride" → tekan "Buat Open Ride"
2. Isi judul, titik kumpul, tanggal & jam, jarak, level, kuota peserta, catatan opsional
3. Sistem publish Open Ride ke daftar "Open Ride Terdekat"
4. Member lain melihat daftar → tekan "Join"
5. Sistem otomatis menambahkan ke daftar peserta selama kuota belum penuh
6. H-1 (atau sesuai setting), sistem kirim notifikasi/email pengingat ke peserta terdaftar
7. Hari-H, host bisa lihat daftar peserta final untuk konfirmasi kehadiran manual di lokasi

## 13. Metrik Keberhasilan (MVP)

- % anggota terdaftar yang join minimal 1 Open Ride/bulan
- Jumlah Open Ride dibuat per minggu
- Jumlah rute tersimpan sebagai favorit per anggota
- Retensi anggota aktif bulanan
- Biaya infrastruktur aktual vs proyeksi (validasi asumsi free tier)

## 14. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Cold start — sedikit anggota, sedikit rute, sedikit Open Ride di awal | Admin/pengurus mengisi rute & Open Ride pertama secara manual sebelum ajak anggota lain |
| Moderasi forum dengan tim relawan kecil | Batasi dulu ke diskusi per rute (lingkup sempit), bukan feed umum terbuka |
| Kualitas data rute/GPX tanpa verifikasi ketat | Tandai rute "belum diverifikasi" sampai ada beberapa review dari anggota lain |
| Free tier vendor bisa berubah kebijakan/limit | Pilih vendor mainstream (Supabase, Vercel) dengan jalur upgrade jelas, bukan layanan niche |
| Anggota berharap fitur seperti di mockup penuh (marketplace, Strava, dll) | Komunikasikan roadmap secara transparan: fase lanjutan akan dibangun setelah ada sinyal kebutuhan nyata |
| Proses closed testing Play Store (12 tester, 14–20 hari) menunda rilis publik Android | Rencanakan buffer waktu rilis; libatkan pengurus/anggota inti sebagai closed tester sejak awal pengembangan |

## 15. Roadmap Setelah MVP (Jika Komunitas Tumbuh)

Urutan yang disarankan berdasarkan rasio nilai/biaya, bukan urutan asli:

1. Cari teman gowes sederhana (tanpa radius kompleks — cukup daftar anggota + filter level/hari)
2. Marketplace listing tanpa payment (baru tambah payment gateway kalau volume tinggi)
3. Native app (kalau retensi web/PWA sudah baik dan anggota minta pengalaman native)
4. Chapter komunitas (kalau ada ekspansi kota nyata)
5. Event dengan pendaftaran & QR check-in
6. Challenge & integrasi Strava/Garmin (paling terakhir — biaya integrasi tertinggi, kebutuhan validasi paling rendah di komunitas kecil)

---

*Dokumen ini adalah versi MVP biaya rendah. Semua keputusan "ditunda" di atas bisa direvisi kapan saja begitu ada data pemakaian nyata yang menunjukkan fitur tersebut dibutuhkan.*
