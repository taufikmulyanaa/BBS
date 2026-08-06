# User Flow — Bapak-Bapak Sepedahan
## Versi Komunitas Kecil, Biaya Rendah (Turunan dari PRD, Wireframe, Skema Database & API v1.0)

**Status:** Draft v1.0
**Turunan dari:** `PRD-Bapak-Bapak-Sepedahan-Low-Cost.md`, `Wireframes-Bapak-Bapak-Sepedahan.md`, `DB-Schema-Bapak-Bapak-Sepedahan.md`, `API-Bapak-Bapak-Sepedahan-Low-Cost.md`
**Cakupan:** seluruh alur yang termasuk lingkup MVP Fase 1–3 (Fondasi & Rute, Open Ride, Forum Ringan), ditambah alur Admin dan alur *cold start* yang disebut di PRD Bagian 10 & 14 tapi belum pernah dirinci langkah-per-langkahnya di dokumen manapun sebelumnya.

**Legenda notasi:**
- `[ Nama Layar ]` = layar/state yang dilihat user
- `(Aksi)` = tap/aksi yang dilakukan user
- `<Pertanyaan?>` = titik keputusan (decision point) — sistem atau user memilih cabang
- `-->` = alur berlanjut ke state berikutnya
- `|-- Ya -->` / `|-- Tidak -->` = percabangan dari titik keputusan

---

## 0. Peta Perjalanan Pengguna (High-Level)

Wireframe sudah punya peta navigasi antar-layar (Information Architecture). Bagian ini melengkapinya dengan peta **status perjalanan** pengguna — dari pengunjung sampai jadi admin:

```
+--------------------+
|     Pengunjung     |   belum punya akun — hanya lihat Landing Page (Web)
+---------+----------+
          | (Daftar via Email)  atau  (Masuk/Daftar dengan Google)
          v
+--------------------------+
|  Menunggu Verifikasi     |   HANYA untuk jalur daftar email — cek link di inbox
+---------+----------------+
          | klik link verifikasi di email
          v
+--------------------------+   <-- jalur Google masuk LANGSUNG ke sini (auto-verified,
|      Anggota Aktif       |       lihat Alur 2)
+---------+----------------+
          | role = 'admin' (di-set manual di database oleh pengurus, bukan self-service)
          v
+--------------------------+
|     Admin / Pengurus     |   akses tambahan: verifikasi rute, moderasi forum, kelola ride bermasalah
+--------------------------+
```

Tabel berikut adalah daftar isi alur detail di dokumen ini, sekaligus peta silang ke 3 dokumen lain:

| # | Alur | Fase PRD | Modul Wireframe | Bagian API |
|---|---|---|---|---|
| 1 | Registrasi (Daftar Email) | Fase 1 | Modul 1 | Bagian 3 |
| 2 | Login (Email & Google) | Fase 1 | Modul 1 | Bagian 3 |
| 3 | Jelajahi, Simpan Rute & Unduh GPX | Fase 1 | Modul 3 | Bagian 4.2, 4.3, 5 |
| 4 | Buat Open Ride | Fase 2 | Modul 4 | Bagian 4.4 |
| 5 | Join Open Ride | Fase 2 | Modul 4 | Bagian 4.5 |
| 6 | Batalkan Keikutsertaan | Fase 2 | Modul 4 | Bagian 4.5 |
| 7 | Konfirmasi Kehadiran (Hari-H) | Fase 2 | Modul 4 | Bagian 4.5, 6 |
| 8 | Buat Post Forum (Diskusi/Laporan) | Fase 3 | Modul 5 | Bagian 4.6, 5 |
| 9 | Like & Komentar | Fase 3 | Modul 5 | Bagian 4.6 |
| 10 | Kelola Profil | — | Modul 6 | Bagian 4.1 |
| 11 | Admin — Verifikasi Rute | — (peran, PRD Bagian 10) | Modul 3 | Bagian 4.2 |
| 12 | Admin — Moderasi Forum | — (peran, PRD Bagian 10) | Modul 5 | Bagian 4.6 |
| 13 | Admin — Kelola Open Ride Bermasalah | — (peran, PRD Bagian 10) | Modul 4 | Bagian 4.4 |
| 14 | Cold Start Komunitas | Risiko PRD Bagian 14 | — | Bagian 11 |

---

## 1. Alur Registrasi (Daftar via Email)

```
[Landing Page] --(tap "Daftar")--> [Form Daftar]
                                        |
                          isi Nama, Email, Kata Sandi
                          centang "Setuju Syarat & Ketentuan"
                                        |
                                (tap DAFTAR)
                                        |
                              <Email sudah terdaftar?>
                                  |-- Ya --> tampil error "Email sudah digunakan" --> balik ke Form Daftar
                                  |-- Tidak --> sistem buat akun + kirim email verifikasi
                                                    |
                                                    v
                                        [Layar "Cek email untuk verifikasi"]
                                                    |
                                        (user buka email, klik link verifikasi)
                                                    |
                                                    v
                                          [Beranda] — akun aktif
```

| Langkah | Aksi User | Respons Sistem | Ref |
|---|---|---|---|
| 1 | Isi form & tap DAFTAR | `POST /auth/v1/signup` | API Bagian 3 |
| 2 | — | Trigger `on_auth_user_created` otomatis membuat baris `profiles` | DB Schema 6.1 |
| 3 | — | Email verifikasi terkirim otomatis (GoTrue) | — |
| 4 | Klik link di email | `email_confirmed_at` terisi | — |
| 5 | — | App mengizinkan akses fitur utama | — |

**Catatan desain:** tidak ada langkah approval manual oleh admin di sini — sesuai keputusan PRD Bagian 7 ("auto-aktif setelah verifikasi email"). Sebelum link diklik, app harus menahan akses ke Beranda dan menampilkan layar "Cek email" berulang setiap kali dibuka.

## 2. Alur Login

```
[Splash] --> [Form Login]
                  |
        <Email atau Google?>
          |
          |-- Email --> isi email+password --(tap MASUK)
          |                    |
          |             <Kredensial valid?>
          |               |-- Tidak --> error "Email/kata sandi salah" --> balik ke form
          |               |-- Ya --> <Email sudah terverifikasi?>
          |                             |-- Belum --> [Layar "Cek email"]
          |                             |-- Sudah --> [Beranda]
          |
          |-- Google --(tap "Masuk dengan Google")--> [Consent Google, in-app browser]
                               |
                       <User setuju akses?>
                         |-- Tidak --> balik ke [Form Login]
                         |-- Ya --> akun otomatis terverifikasi --> [Beranda]
```

Login Google selalu langsung `email_confirmed_at` terisi (identitas sudah divalidasi Google), jadi tidak pernah masuk ke layar "Cek email" — beda dengan jalur email di Alur 1.

## 3. Alur Jelajahi, Simpan Rute & Unduh GPX

```
[Beranda] --(tap tab Rute)--> [Direktori Rute]
                                    |
                        <Cari atau filter level?>
                          |-- Ya --> ketik keyword / pilih [Easy][Medium][Hard] --> daftar terfilter
                          |-- Tidak --> tampil semua rute, urut terbaru
                                    |
                        (tap salah satu rute) --> [Detail Rute]
                                    |
                    +---------------+---------------+
                    |               |               |
              (Unduh GPX)       (Simpan)         (Bagikan)
                    |               |               |
            file GPX terdownload  rute masuk    link/gambar rute
            langsung dari         "Rute Favorit"  dibagikan ke
            Storage publik        milik user      luar app (WA, dst)
```

| Langkah | Aksi User | Respons Sistem | Ref |
|---|---|---|---|
| 1 | Cari/filter rute | `GET /rest/v1/routes?nama=ilike...&level=eq...` | API 4.2 |
| 2 | Tap rute | `GET /rest/v1/routes?id=eq.<uuid>` + tab Diskusi | API 4.2, 4.6 |
| 3 | Tap Unduh GPX | `GET` langsung ke public URL bucket `routes-gpx` (tanpa panggilan API tambahan) | API 5 |
| 4 | Tap Simpan | `POST /rest/v1/saved_routes` | API 4.3 |
| 5 | Buka tab Profil > Rute Favorit | `GET /rest/v1/saved_routes?user_id=eq...&select=*,routes(*)` | API 4.3 |

**Edge case:** rute dengan badge "belum diverifikasi" (lihat Alur 11) tetap bisa dilihat, disimpan, dan GPX-nya diunduh — status verifikasi hanya penanda kualitas, bukan pembatas akses (PRD Bagian 14: mitigasi lewat tag, bukan blokir).

## 4. Alur Buat Open Ride

```
[Daftar Open Ride] atau [Beranda] --(tap "+ BUAT OPEN RIDE")--> [Form Buat Open Ride]
                                                                        |
                                        isi Judul, Tanggal & Waktu, Jarak, Level,
                                        Titik Kumpul, Maks Peserta, Catatan (opsional)
                                                                        |
                                                              (tap BUAT RIDE)
                                                                        |
                                                        <Semua field wajib valid?>
                                                          |-- Tidak --> tampil error per field --> user perbaiki
                                                          |-- Ya --> ride tersimpan (status: akan_datang)
                                                                        |
                                                                        v
                                                          [Detail Open Ride] (host diarahkan otomatis)
                                                                        |
                                                          muncul juga di [Beranda] > "Open Ride Terdekat"
                                                          dan [Daftar Open Ride] milik semua anggota
```

| Langkah | Aksi User | Respons Sistem | Ref |
|---|---|---|---|
| 1 | Isi form, tap BUAT RIDE | `POST /rest/v1/open_rides` (`dibuat_oleh` = user aktif) | API 4.4 |
| 2 | — | Ride langsung terlihat semua anggota (RLS SELECT terbuka untuk `authenticated`) | DB Schema 8 |
| 3 | (opsional) anggota lain membuka app saat ride baru masuk | update otomatis lewat Realtime channel `open_rides`, atau muncul saat refresh manual | API 7 |

## 5. Alur Join Open Ride

```
[Daftar Open Ride] atau [Detail Open Ride] --(tap JOIN)
                                    |
                          <Kuota masih tersisa?>
                            |-- Tidak --> pesan "Kuota Open Ride sudah penuh" --> tombol JOIN nonaktif
                            |-- Ya --> user tercatat sebagai peserta (status_konfirmasi: terdaftar)
                                             |
                                     tombol berubah jadi "Batalkan keikutsertaan"
                                     avatar user muncul di baris "Peserta (x/y)"
                                             |
                                     (H-1) sistem kirim reminder via FCM ke device_tokens user
```

| Langkah | Aksi User | Respons Sistem | Ref |
|---|---|---|---|
| 1 | Tap JOIN | `POST /rest/v1/ride_participants` | API 4.5 |
| 2 | — | Trigger `check_ride_quota` menolak kalau penuh — lihat error di API Bagian 8 | DB Schema 6.3 |
| 3 | — (H-1) | Edge Function `send-ride-reminder` terpicu `pg_cron`, kirim FCM | API 6.1 |

**Catatan UX:** app **tidak perlu** menghitung kuota sendiri sebelum submit — cukup kirim request JOIN dan tangani pesan error dari trigger di langkah 2 kalau ternyata sudah penuh (mis. race condition dua user tap JOIN bersamaan di slot terakhir).

## 6. Alur Batalkan Keikutsertaan

```
[Detail Open Ride] (status: sudah join) --(tap "Batalkan keikutsertaan")
                                    |
                          (opsional: dialog konfirmasi "Yakin batal?")
                                    |
                              <Konfirmasi?>
                                |-- Tidak --> tetap terdaftar, dialog tertutup
                                |-- Ya --> baris ride_participants dihapus
                                              |
                                      kuota bertambah 1 slot, tombol balik jadi [JOIN]
```

`DELETE /rest/v1/ride_participants?open_ride_id=eq.<uuid>&user_id=eq.<uuid>` (API 4.5). Karena RLS hanya mengizinkan hapus baris milik sendiri, user tidak bisa membatalkan keikutsertaan orang lain lewat jalur ini.

## 7. Alur Konfirmasi Kehadiran (Host, Hari-H)

```
Hari-H tiba --> Host buka [Detail Open Ride] --> lihat "Daftar Peserta Final"
                                    |
                        untuk setiap peserta, host menandai:
                                    |
                              <Hadir di lokasi kumpul?>
                                |-- Ya --> status_konfirmasi = "hadir"
                                |-- Tidak --> status_konfirmasi = "tidak_hadir"
```

`PATCH /rest/v1/ride_participants?open_ride_id=eq.<uuid>&user_id=eq.<uuid>` — hanya bisa dilakukan host ride tersebut atau admin (RLS `ride_participants_update_host_or_admin`, API 4.5). Ini adalah implementasi langsung dari PRD Bagian 12 langkah 7 ("konfirmasi kehadiran manual di lokasi").

## 8. Alur Buat Post Forum (Diskusi / Laporan Kondisi Jalan)

```
[Forum] --(tap "+ BUAT POST")--> [Form Buat Post]
                                        |
                        pilih Tipe Post: <Diskusi atau Laporan Kondisi Jalan?>
                                        |
                        isi Judul & Isi
                        (opsional) tautkan ke rute tertentu
                        (opsional) tambah foto, maks 5
                                        |
                              <Upload foto ke-6?>
                                |-- Ya --> ditolak, pesan "Maksimal 5 foto per post"
                                |-- Tidak --> foto tersimpan
                                        |
                                  (tap POSTING)
                                        |
                              <Judul & Isi terisi?>
                                |-- Tidak --> error validasi, field wajib disorot
                                |-- Ya --> post tampil di [Daftar Diskusi] tab [Terbaru]
                                              dan di tab [Diskusi] Detail Rute (kalau ditautkan)
```

| Langkah | Aksi User | Respons Sistem | Ref |
|---|---|---|---|
| 1 | Tambah foto | Upload dulu ke Storage bucket `forum-media`, lalu `POST /rest/v1/forum_post_media` | API 5, 4.6 |
| 2 | — | Trigger `check_media_limit` menolak foto ke-6 | DB Schema 6.4 |
| 3 | Tap POSTING | `POST /rest/v1/forum_posts` | API 4.6 |

## 9. Alur Like & Komentar

```
[Detail Diskusi] --(tap ikon suka)
        |
  <Sudah like sebelumnya?>
    |-- Belum --> POST forum_likes --> like_count +1 --> ikon jadi terisi
    |-- Sudah --> DELETE forum_likes --> like_count -1 --> ikon jadi outline

[Detail Diskusi] --(ketik di kolom komentar)--(tap kirim)
        |
  komentar baru tersimpan --> muncul di bawah daftar komentar --> comment_count +1
```

Toggle like ditentukan di sisi client (cek apakah baris like user sudah ada di data yang termuat), bukan lewat endpoint terpisah — konsisten dengan API Bagian 4.6. Counter `like_count`/`comment_count` diperbarui otomatis oleh trigger (DB Schema 6.5), jadi app tidak perlu hitung ulang manual.

## 10. Alur Kelola Profil

```
[Profil] --> lihat statistik: Rute Disimpan | Open Ride Diikuti | Post Forum
                    |
      +-------------+-------------+----------------+
      |             |             |                |
(Rute Favorit  (Open Ride    (Post & Komentar  (Pengaturan
   Saya)          Saya)          Saya)             Akun)
      |             |             |                |
 list rute      list ride     list post/       ubah nama,
 tersimpan      dibuat &      komentar milik    foto profil,
 (Alur 3)       diikuti       sendiri           password
```

`(Keluar)` di menu Profil memicu `POST /auth/v1/logout` (API Bagian 3) — sesi lokal dihapus dan `device_tokens` milik user sebaiknya ikut di-`DELETE` (API 4.7) supaya tidak terus menerima push setelah logout di device tersebut.

## 11. Alur Admin — Verifikasi Rute

```
Rute baru diupload (oleh admin atau anggota pembuat rute)
        |
status_verifikasi default: "belum_diverifikasi" --> badge tampil di Detail Rute
        |
Anggota lain memberi komentar/review lewat tab [Diskusi] (Alur 8, tipe: diskusi)
        |
Admin memantau tab [Diskusi] rute tersebut secara berkala
        |
  <Cukup review positif & rute dianggap valid?>
    |-- Ya --> Admin ubah status_verifikasi jadi "terverifikasi" --> badge berubah/hilang
    |-- Tidak, dan rute keliru/berbahaya --> Admin hapus rute (DELETE)
    |-- Belum cukup data --> tetap "belum_diverifikasi", tunggu review lebih banyak
```

Ini adalah implementasi konkret dari mitigasi risiko "kualitas data rute tanpa verifikasi ketat" di PRD Bagian 14. Tidak ada tombol khusus "Verifikasi" di wireframe MVP saat ini — alur ini berjalan lewat `PATCH /rest/v1/routes?id=eq.<uuid>` (API 4.2) yang RLS-nya sudah mengizinkan admin, tapi UI tombolnya perlu ditambahkan kalau belum ada di layar Detail Rute versi admin.

## 12. Alur Admin — Moderasi Forum

```
Admin menemukan/dilaporkan konten bermasalah di [Forum]
        |
  <Jenis masalah?>
    |-- Post/komentar spam atau tidak pantas --> Admin hapus (DELETE forum_posts / forum_comments)
    |-- Laporan kondisi jalan sudah tidak relevan (sudah diperbaiki) --> Admin hapus atau minta pembuat update
    |-- User bermasalah berulang --> ditangani manual di luar app (chat pribadi/WA) — MVP belum ada fitur banned/suspend user
```

Sesuai mitigasi PRD Bagian 14 ("batasi dulu ke diskusi per rute, bukan feed umum terbuka") — lingkup moderasi sengaja sempit karena tim relawan kecil, bukan proses ticketing formal.

## 13. Alur Admin — Kelola Open Ride Bermasalah

```
Ride dilaporkan bermasalah (host tidak hadir, info salah, dsb — biasanya lewat WA, di luar app)
        |
Admin buka [Detail Open Ride] terkait
        |
  <Perlu dibatalkan total atau cukup diedit?>
    |-- Dibatalkan --> Admin ubah status jadi "dibatalkan"
    |                       |
    |             (catatan: MVP belum ada auto-notifikasi pembatalan ke peserta —
    |              admin perlu infokan manual lewat WA group sampai fitur ini dibangun)
    |
    |-- Cukup diedit --> Admin PATCH field yang salah (titik kumpul, waktu, dst)
```

Ini eksplisit menandai **gap** di MVP saat ini: perubahan status ride ke `dibatalkan` tidak otomatis memicu notifikasi ke peserta terdaftar (beda dengan reminder H-1 di Alur 5 yang sudah otomatis). Kalau ini jadi kebutuhan nyata, solusinya konsisten dengan pola Edge Function `notify-new-open-ride` di API Bagian 6.2 — tinggal tambah trigger serupa pada `UPDATE ... SET status = 'dibatalkan'`.

## 14. Alur Cold Start Komunitas (Peluncuran Awal)

```
Komunitas memutuskan pindah dari WA group ke app
        |
Admin/pengurus login pertama kali (Alur 1/2)
        |
Admin isi beberapa rute awal secara manual (Alur 3, upload GPX + cover)
        |
Admin buat 1-2 Open Ride pertama (Alur 4) supaya Beranda tidak kosong
        |
Admin bagikan link download APK (sideload) ke grup WA komunitas
        |
Anggota satu per satu mendaftar (Alur 1) --> melihat rute & Open Ride sudah terisi
        |
Anggota mulai buat Open Ride & posting forum sendiri secara organik
```

Ini adalah versi langkah-per-langkah dari mitigasi "cold start" di PRD Bagian 14 ("admin/pengurus mengisi rute & Open Ride pertama secara manual sebelum ajak anggota lain") — sebelumnya hanya disebut sebagai satu kalimat mitigasi, belum pernah dipetakan sebagai alur.

---

## 15. Ringkasan Edge Case & Penanganan

| Situasi | Di mana muncul | Penanganan UI |
|---|---|---|
| Email belum diverifikasi | Setelah daftar via email (Alur 1) | Tahan di layar "Cek email", jangan izinkan masuk Beranda |
| Kuota Open Ride penuh | Tap JOIN (Alur 5) | Tangkap pesan error trigger, nonaktifkan tombol JOIN |
| Upload foto ke-6 di satu post | Buat Post (Alur 8) | Tangkap pesan error trigger, kunci tombol tambah foto di angka 5 |
| Coba edit/hapus rute atau ride orang lain | Alur 3, 4, 8 | RLS mengembalikan 0 baris berubah — app harus cek hasil, bukan asumsi sukses (lihat API Bagian 8) |
| Rute/Open Ride masih kosong (baru rilis) | Beranda, Direktori Rute | Ditangani proaktif lewat Alur 14 (Cold Start), bukan lewat UI kosong yang dibiarkan |
| Ride dibatalkan admin | Alur 13 | **Belum otomatis** — perlu komunikasi manual sampai fitur notifikasi pembatalan dibangun |

---

*Dokumen ini melengkapi PRD, Wireframe, Skema Database, dan API dengan urutan langkah yang dilalui pengguna nyata — termasuk tiga alur (Admin Verifikasi Rute, Admin Kelola Ride Bermasalah, Cold Start) yang sebelumnya hanya disebut sebagai kalimat mitigasi/peran di PRD, belum pernah dirinci per langkah. Alur untuk fitur yang ditunda (Marketplace, Chapter, Event, Challenge, Cari Teman Gowes) sengaja belum dibuat, konsisten dengan Bagian 4 PRD.*
