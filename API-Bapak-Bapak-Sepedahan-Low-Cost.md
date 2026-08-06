# API Reference — Bapak-Bapak Sepedahan
## Versi Komunitas Kecil, Biaya Rendah (Turunan dari PRD & Skema Database v1.0)

**Status:** Draft v1.0
**Turunan dari:** `PRD-Bapak-Bapak-Sepedahan-Low-Cost.md` (Bagian 7 & 9), `DB-Schema-Bapak-Bapak-Sepedahan.md`, `Wireframes-Bapak-Bapak-Sepedahan.md`
**Arsitektur:** Tidak ada backend custom (Node/Express/dsb). Flutter app konek **langsung** ke Supabase lewat SDK `supabase_flutter`, yang membungkus 3 API bawaan Supabase — **PostgREST** (REST otomatis dari tabel Postgres), **GoTrue** (Auth), **Storage** — ditambah sedikit **Edge Function** untuk logic yang tidak bisa murni jadi CRUD (reminder H-1, dsb).

> Catatan: di kode Flutter, tim akan memanggil method SDK seperti `supabase.from('routes').select()`, bukan HTTP manual. Dokumen ini mendeskripsikan **kontrak API** di balik method tersebut — berguna untuk debugging, testing (Postman/curl), dan referensi lintas tim non-Flutter (misal kalau nanti ada admin panel web).

---

## 1. Ringkasan Arsitektur

| Layer | Teknologi | Base Path | Dipakai untuk |
|---|---|---|---|
| Auth | GoTrue | `/auth/v1/*` | Daftar, login, sesi, verifikasi email, OAuth Google |
| Data (CRUD) | PostgREST | `/rest/v1/*` | Semua tabel: `profiles`, `routes`, `open_rides`, dst |
| File | Storage API | `/storage/v1/*` | Upload GPX, foto profil, cover rute, foto forum |
| Logic custom | Edge Functions | `/functions/v1/*` | Reminder H-1, push notifikasi Open Ride baru |
| Live update (opsional) | Realtime (WebSocket) | `wss://<project-ref>.supabase.co/realtime/v1` | Auto-refresh Beranda/Forum tanpa polling |

**Base URL:** `https://<project-ref>.supabase.co`

Karena tidak ada server perantara, seluruh business rule (kuota Open Ride, limit foto, siapa boleh apa) ditegakkan di dua lapis pada Postgres: **RLS Policy** (siapa boleh SELECT/INSERT/UPDATE/DELETE row mana) dan **Trigger** (aturan lintas-baris seperti kuota & limit jumlah). Lihat Bagian 7 dokumen ini untuk bagaimana pelanggaran aturan tersebut muncul di respons API.

## 2. Header & Autentikasi Standar

Setiap request wajib menyertakan:

```http
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <access_token>
Content-Type: application/json
```

- `apikey` — selalu ada, identitas project.
- `Authorization: Bearer <access_token>` — JWT hasil login (Bagian 3). Klaim `sub` di dalamnya = `auth.uid()` yang dipakai semua RLS Policy di skema.
- `Prefer: return=representation` — tambahkan di POST/PATCH kalau ingin response balik berisi row yang baru dibuat/diubah (default PostgREST tidak mengembalikan body).
- `Prefer: count=exact` — tambahkan di GET untuk dapat total row lewat header `Content-Range` (dipakai untuk paginasi "Muat lebih banyak").

**Catatan penting (gap desain):** seluruh policy SELECT di skema (`routes_select_all`, `open_rides` select, dst) memakai `TO authenticated` — artinya endpoint di bawah ini **hanya bisa diakses user yang sudah login**. Landing page publik (Modul 0 wireframe) yang menampilkan "Rute Populer" ke pengunjung belum-login **tidak bisa** memakai endpoint `routes` yang sama secara langsung. Dua opsi realistis: (a) tambah satu policy SELECT terbatas untuk role `anon` khusus rute `status_verifikasi = 'terverifikasi'`, atau (b) landing page memakai konten statis/ter-cache yang diupdate manual oleh admin — opsi (b) lebih sesuai filosofi Rp0 di PRD karena tidak menambah permukaan akses publik. Keputusan ini belum final di PRD/skema, jadi dicatat di sini sebagai open item (lihat juga Bagian 11).

---

## 3. Autentikasi (GoTrue) — Modul 1 Wireframe

| Method | Path | Deskripsi | Wireframe terkait |
|---|---|---|---|
| POST | `/auth/v1/signup` | Daftar akun baru (email + password) | Daftar (Register) |
| POST | `/auth/v1/token?grant_type=password` | Login email + password | Login |
| GET | `/auth/v1/authorize?provider=google&redirect_to=...` | Mulai OAuth Google (dibuka via in-app browser oleh SDK) | tombol "Masuk/Daftar dengan Google" |
| POST | `/auth/v1/token?grant_type=refresh_token` | Perpanjang sesi | otomatis oleh SDK saat token hampir expired |
| POST | `/auth/v1/recover` | Kirim email reset password | (perlu ditambah link "Lupa kata sandi" di layar Login) |
| GET | `/auth/v1/user` | Ambil data auth user aktif (email, status verifikasi) | — |
| PUT | `/auth/v1/user` | Ubah email/password akun | Profil > Pengaturan Akun |
| POST | `/auth/v1/logout` | Keluar, invalidate token | Profil > Keluar |

### Contoh — Daftar akun

```http
POST /auth/v1/signup
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json

{
  "email": "ogie@contoh.id",
  "password": "katasandi-aman",
  "data": { "full_name": "Ogie Pratama" }
}
```

Response (ringkas):
```json
{
  "user": { "id": "9f2a...-uuid", "email": "ogie@contoh.id", "email_confirmed_at": null },
  "access_token": "eyJ...",
  "refresh_token": "..."
}
```

Saat baris baru masuk ke `auth.users`, trigger `on_auth_user_created` (Bagian 6.1 skema) langsung membuat baris `profiles` terkait — jadi profil sudah siap dipakai app walau `email_confirmed_at` masih `null`. Client harus cek field ini: kalau belum terisi, tampilkan layar "Cek email untuk verifikasi akun" (sesuai wireframe Daftar) dan tahan akses ke fitur utama sampai user klik link di email. Ini adalah implementasi dari keputusan PRD Bagian 7 "auto-aktif setelah verifikasi email, tanpa approval admin".

### Contoh — Login email

```http
POST /auth/v1/token?grant_type=password
apikey: <SUPABASE_ANON_KEY>
Content-Type: application/json

{ "email": "ogie@contoh.id", "password": "katasandi-aman" }
```

Login Google dari sisi Flutter memakai method SDK (`signInWithOAuth(provider: OAuthProvider.google)`) yang membuka browser/deep-link — bukan panggilan HTTP manual, sehingga tidak dirinci sebagai request/response terpisah di sini.

---

## 4. Data API (PostgREST) per Modul

Konvensi umum: filter pakai `?kolom=operator.nilai` (lihat cheatsheet Bagian 8), embed relasi pakai `select=*,tabel_lain(*)`.

### 4.1 Profil — Modul 6 (Profil)

| Method | Path | Akses (RLS) | Wireframe |
|---|---|---|---|
| GET | `/rest/v1/profiles?id=eq.<uuid>&select=*` | semua anggota login | Profil (header nama, foto, "Anggota sejak") |
| PATCH | `/rest/v1/profiles?id=eq.<uuid>` | hanya pemilik (`auth.uid() = id`) | Profil > Pengaturan Akun |

Tidak ada endpoint **POST** — baris `profiles` dibuat otomatis oleh trigger saat signup (Bagian 3), dan tidak ada policy INSERT yang mengizinkan client membuatnya manual.

Tiga angka statistik di header Profil ("12 Rute Disimpan", "8 Open Ride Diikuti", "15 Post Forum") **tidak** berasal dari kolom counter tersendiri — ambil lewat query count terpisah:

```http
GET /rest/v1/saved_routes?user_id=eq.<uuid>&select=route_id
Prefer: count=exact
```
Total ada di header response `Content-Range: 0-11/12`. Pola yang sama dipakai untuk `ride_participants?user_id=eq...` dan `forum_posts?user_id=eq...`.

### 4.2 Rute & GPX — Modul 3 (Rute)

| Method | Path | Akses | Wireframe |
|---|---|---|---|
| GET | `/rest/v1/routes?select=*&order=created_at.desc&limit=10&offset=0` | semua anggota login | Direktori Rute + "Muat lebih banyak" |
| GET | `/rest/v1/routes?level=eq.medium` | — | tab `[Easy][Medium][Hard]` |
| GET | `/rest/v1/routes?nama=ilike.*lembang*` | — | `[ Cari rute... ]` (pakai index trigram) |
| GET | `/rest/v1/routes?id=eq.<uuid>&select=*` | — | Detail Rute |
| POST | `/rest/v1/routes` | pembuat = `auth.uid()` | (form buat rute, belum ada di wireframe MVP tapi ditegakkan skema) |
| PATCH | `/rest/v1/routes?id=eq.<uuid>` | pemilik atau admin | admin verifikasi rute (`status_verifikasi`) |
| DELETE | `/rest/v1/routes?id=eq.<uuid>` | pemilik atau admin | — |

**Upload GPX / cover** dua langkah (Storage lalu DB), karena file dan metadata disimpan di layanan berbeda:

```http
1) POST /storage/v1/object/routes-gpx/<user_id>/braga-lembang.gpx     (body: binary file)
2) PATCH /rest/v1/routes?id=eq.<uuid>
   { "gpx_file_url": "https://<project-ref>.supabase.co/storage/v1/object/public/routes-gpx/<user_id>/braga-lembang.gpx" }
```

Tombol **[Unduh GPX]** di wireframe cukup `GET` langsung ke URL publik tersebut (bucket `routes-gpx` publik-read) — tidak perlu panggilan API tambahan.

### 4.3 Rute Favorit / Saved Routes — Modul 3

| Method | Path | Akses |
|---|---|---|
| GET | `/rest/v1/saved_routes?user_id=eq.<uuid>&select=created_at,routes(*)` | milik sendiri |
| POST | `/rest/v1/saved_routes` — body `{ "user_id": "...", "route_id": "..." }` | milik sendiri — tombol **[Simpan]** |
| DELETE | `/rest/v1/saved_routes?user_id=eq.<uuid>&route_id=eq.<uuid>` | milik sendiri — un-simpan |

### 4.4 Open Ride — Modul 4

| Method | Path | Akses | Wireframe |
|---|---|---|---|
| GET | `/rest/v1/open_rides?select=*,ride_participants(count)&order=tanggal_waktu.asc` | semua anggota login | Daftar Open Ride (progres "6/10 peserta") |
| GET | `...&tanggal_waktu=gte.<hari_ini>&tanggal_waktu=lte.<+7hari>` | — | tab `[Minggu ini]` |
| GET | `/rest/v1/open_rides?id=eq.<uuid>&select=*,profiles(nama_lengkap,foto_profil_url),ride_participants(user_id,status_konfirmasi,profiles(nama_lengkap,foto_profil_url))` | — | Detail Open Ride (host + avatar peserta) |
| POST | `/rest/v1/open_rides` | pembuat = `auth.uid()` | **Buat Open Ride** (judul, titik_kumpul, tanggal_waktu, jarak_km, level, kuota_maks, catatan) |
| PATCH | `/rest/v1/open_rides?id=eq.<uuid>` | pembuat atau admin | edit ride / ubah `status` jadi `dibatalkan`/`selesai` |
| DELETE | `/rest/v1/open_rides?id=eq.<uuid>` | pembuat atau admin | — |

### 4.5 Join / Batal Open Ride — Modul 4

| Method | Path | Akses | Wireframe |
|---|---|---|---|
| POST | `/rest/v1/ride_participants` — body `{ "open_ride_id": "...", "user_id": "..." }` | milik sendiri | tombol **[JOIN]** / **[JOIN RIDE INI]** |
| DELETE | `/rest/v1/ride_participants?open_ride_id=eq.<uuid>&user_id=eq.<uuid>` | milik sendiri | "Batalkan keikutsertaan" |
| GET | `/rest/v1/ride_participants?open_ride_id=eq.<uuid>&select=user_id,status_konfirmasi,profiles(nama_lengkap,foto_profil_url)` | semua anggota login | render baris avatar peserta |
| PATCH | `/rest/v1/ride_participants?open_ride_id=eq.<uuid>&user_id=eq.<uuid>` — body `{ "status_konfirmasi": "hadir" }` | host ride atau admin | konfirmasi kehadiran hari-H (PRD Bagian 12, langkah 7) |

**Perilaku kuota (trigger `check_ride_quota`):** kalau `POST /rest/v1/ride_participants` dikirim saat peserta sudah penuh, request ditolak — lihat Bagian 7 untuk format error persisnya. App **tidak perlu** cek kuota manual sebelum submit; cukup tangani error ini di UI (misal nonaktifkan tombol JOIN begitu error diterima, atau tampilkan toast "Kuota penuh").

### 4.6 Forum — Modul 5

**Posts**

| Method | Path | Akses |
|---|---|---|
| GET | `/rest/v1/forum_posts?select=*,profiles(nama_lengkap,foto_profil_url),forum_post_media(media_url)&order=created_at.desc` | semua anggota login — tab `[Terbaru]` |
| GET | `...&route_id=eq.<uuid>` | — tab **[Diskusi]** di Detail Rute |
| GET | `...&tipe=eq.laporan_kondisi` | — filter laporan kondisi jalan |
| GET | `/rest/v1/forum_posts?id=eq.<uuid>&select=*,profiles(*),forum_post_media(*),forum_comments(*,profiles(nama_lengkap))` | Detail Diskusi + Komentar |
| POST | `/rest/v1/forum_posts` | milik sendiri — **Buat Post** (`route_id` nullable, `tipe`, `judul`, `isi`) |
| PATCH / DELETE | `/rest/v1/forum_posts?id=eq.<uuid>` | pemilik atau admin |

**Foto Post** (maks 5 file, ditegakkan trigger `check_media_limit`)

```http
1) POST /storage/v1/object/forum-media/<post_id>/1.jpg      (upload dulu ke Storage)
2) POST /rest/v1/forum_post_media
   { "post_id": "...", "media_url": "https://.../forum-media/<post_id>/1.jpg", "file_size_kb": 380, "urutan": 0 }
```
Upload foto ke-6 pada post yang sama akan ditolak — lihat Bagian 7.

**Like (toggle)**

| Method | Path | Catatan |
|---|---|---|
| POST | `/rest/v1/forum_likes` — body `{ "post_id": "...", "user_id": "..." }` | trigger `update_post_like_count` menaikkan `like_count` di `forum_posts` |
| DELETE | `/rest/v1/forum_likes?post_id=eq.<uuid>&user_id=eq.<uuid>` | menurunkan `like_count` |

Client menentukan POST atau DELETE berdasar apakah baris like milik user tersebut sudah ada di data yang sudah dimuat (tidak perlu GET tambahan tiap tap tombol suka).

**Komentar**

| Method | Path |
|---|---|
| GET | `/rest/v1/forum_comments?post_id=eq.<uuid>&select=*,profiles(nama_lengkap)&order=created_at.asc` |
| POST | `/rest/v1/forum_comments` — body `{ "post_id": "...", "user_id": "...", "isi": "..." }` (trigger menaikkan `comment_count`) |
| DELETE | `/rest/v1/forum_comments?id=eq.<uuid>` — pemilik atau admin |

### 4.7 Device Tokens (FCM) — pendukung notifikasi Fase 2

Tidak muncul langsung sebagai layar di wireframe, tapi dibutuhkan agar Firebase Cloud Messaging tahu ke mana mengirim push.

| Method | Path | Dipanggil saat |
|---|---|---|
| POST | `/rest/v1/device_tokens` — body `{ "user_id": "...", "fcm_token": "...", "platform": "android" }` (header `Prefer: resolution=merge-duplicates` agar token yang sama tidak duplikat) | app start / setelah login |
| DELETE | `/rest/v1/device_tokens?fcm_token=eq.<token>` | logout / uninstall terdeteksi token invalid |

---

## 5. Storage API (Upload File)

| Bucket | Isi | Publik? | Contoh path |
|---|---|---|---|
| `avatars` | Foto profil | Ya (read) | `avatars/<user_id>.jpg` |
| `routes-gpx` | File GPX rute | Ya (read) | `routes-gpx/<user_id>/<slug>.gpx` |
| `routes-cover` | Foto sampul rute | Ya (read) | `routes-cover/<route_id>.jpg` |
| `forum-media` | Foto post/laporan forum | Ya (read) | `forum-media/<post_id>/<urutan>.jpg` |

**Upload:**
```http
POST /storage/v1/object/<bucket>/<path>
apikey: <SUPABASE_ANON_KEY>
Authorization: Bearer <access_token>
Content-Type: image/jpeg

<binary file>
```
Response: `{ "Key": "<bucket>/<path>" }`

**Ambil URL publik** (tanpa Authorization, karena bucket publik-read):
```
GET https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
```

Batas ukuran (5 file/post, maks 5MB/file — PRD Bagian 7) ditegakkan dua lapis: **kompresi di sisi Flutter sebelum upload** + kolom `CHECK (file_size_kb <= 5120)` saat insert ke `forum_post_media`. Storage sendiri tidak dijadikan satu-satunya penjaga limit karena setting limit ukuran project-level lebih sulit dibuat spesifik per-bucket.

---

## 6. Edge Functions (Logic Custom di Luar CRUD)

MVP ini sengaja minim Edge Function — sebagian besar sudah tertangani PostgREST + trigger. Dua kandidat yang tetap butuh kode custom:

### 6.1 `send-ride-reminder` — reminder H-1
- **Dipicu:** `pg_cron` terjadwal (misal setiap hari jam 18:00 WIB), bukan dipanggil user/app.
- **Logic:** query `open_rides` yang `tanggal_waktu` jatuh besok → ambil `ride_participants` terkait → ambil `device_tokens` tiap peserta → kirim via FCM Admin API.
- Endpoint `POST /functions/v1/send-ride-reminder` bersifat internal (dipicu scheduler, disegel dengan service key) — **tidak** dipanggil dari Flutter app.

### 6.2 `notify-new-open-ride` (opsional)
- **Dipicu:** Database Webhook pada `INSERT` di tabel `open_rides`.
- **Logic:** loop `device_tokens` seluruh anggota (atau anggota yang subscribe) → kirim push "Open Ride baru: ...".
- **Alternatif lebih murah:** kalau tim mau lebih sederhana daripada FCM+webhook, cukup pakai **Realtime** (Bagian 7) + badge notifikasi in-app tanpa push native — sesuai catatan PRD Fase 2 yang membuka opsi "email atau web push gratis". Dua pendekatan ini valid; pilih salah satu sesuai prioritas tim (push native = pengalaman lebih baik tapi lebih banyak moving parts, Realtime = lebih simpel tapi hanya aktif kalau app dibuka).

---

## 7. Realtime (Opsional, Gratis dari Supabase)

Tidak wajib untuk MVP, tapi tersedia gratis di free tier dan bisa menyederhanakan kebutuhan "notifikasi Open Ride baru" tanpa Edge Function:

```dart
supabase.channel('public:open_rides')
  .onPostgresChanges(
    event: PostgresChangeEvent.insert,
    schema: 'public',
    table: 'open_rides',
    callback: (payload) { /* update daftar Open Ride Terdekat di Beranda */ },
  )
  .subscribe();
```

Kegunaan lain: badge "post baru" di tab Forum, auto-refresh jumlah peserta di Detail Open Ride saat ada yang join/batal.

---

## 8. Error Handling & Kode Status

| HTTP Status | Arti | Contoh kasus |
|---|---|---|
| 200 | OK | GET sukses |
| 201 | Created | POST sukses (dengan `Prefer: return=representation`) |
| 204 | No Content | PATCH/DELETE sukses tanpa body balik |
| 400 | Bad Request | Trigger menolak aksi (kuota penuh, limit foto), atau `CHECK` constraint gagal (mis. `jarak_km <= 0`) |
| 401 | Unauthorized | Token tidak ada/tidak valid/expired |
| 403 | Forbidden | INSERT/UPDATE melanggar `WITH CHECK`/`USING` di RLS Policy |
| 404 | Not Found | Endpoint atau id salah |
| 409 | Conflict | Unique constraint (mis. `fcm_token` duplikat tanpa `Prefer: resolution=merge-duplicates`) |
| 422 | Unprocessable Entity | Body tidak sesuai tipe kolom |

**Catatan perilaku RLS yang sering bikin bingung:** untuk `SELECT`, RLS hanya **menyaring** baris (hasil kosong, bukan error). Untuk `INSERT` yang gagal `WITH CHECK`, Postgres mengembalikan error yang PostgREST petakan ke **403**. Untuk `UPDATE`/`DELETE` pada baris yang tidak lolos `USING` (misal coba edit rute orang lain), hasilnya biasanya **0 baris berubah** (status 204, tanpa error eksplisit) — jadi app harus cek jumlah baris yang terdampak, bukan cuma status code, untuk tahu apakah aksi benar-benar berhasil.

**Pesan error dari trigger business rule:**

| Aksi | Trigger | Pesan error (di body response) |
|---|---|---|
| `POST ride_participants` saat kuota penuh | `check_ride_quota` | `Kuota Open Ride sudah penuh` |
| `POST forum_post_media` foto ke-6 | `check_media_limit` | `Maksimal 5 foto per post` |

---

## 9. Konvensi Filter, Sort, Paginasi (Cheatsheet PostgREST)

| Kebutuhan | Contoh |
|---|---|
| Filter sama dengan | `?level=eq.medium` |
| Pencarian teks (case-insensitive) | `?nama=ilike.*lembang*` |
| Rentang tanggal | `?tanggal_waktu=gte.2026-05-10&tanggal_waktu=lte.2026-05-17` |
| Kombinasi AND | gabung dengan `&`, mis. `?level=eq.easy&status=eq.akan_datang` |
| Kombinasi OR | `?or=(level.eq.easy,level.eq.medium)` |
| Urutkan | `?order=created_at.desc` |
| Paginasi | `?limit=10&offset=0` (untuk "Muat lebih banyak") |
| Ambil relasi (join) | `?select=*,profiles(nama_lengkap,foto_profil_url)` |
| Hitung baris relasi | `?select=*,ride_participants(count)` |
| Total count | header `Prefer: count=exact` → baca `Content-Range` di response |

---

## 10. Ringkasan Cepat — Semua Endpoint

| Modul | Method | Path | Akses |
|---|---|---|---|
| Auth | POST | `/auth/v1/signup` | publik |
| Auth | POST | `/auth/v1/token?grant_type=password` | publik |
| Auth | GET | `/auth/v1/authorize?provider=google` | publik |
| Auth | POST | `/auth/v1/logout` | login |
| Profil | GET/PATCH | `/rest/v1/profiles` | login / milik sendiri |
| Rute | GET/POST/PATCH/DELETE | `/rest/v1/routes` | login / pemilik-admin |
| Rute Favorit | GET/POST/DELETE | `/rest/v1/saved_routes` | milik sendiri |
| Open Ride | GET/POST/PATCH/DELETE | `/rest/v1/open_rides` | login / pembuat-admin |
| Peserta Ride | GET/POST/PATCH/DELETE | `/rest/v1/ride_participants` | login / milik sendiri / host-admin |
| Forum Post | GET/POST/PATCH/DELETE | `/rest/v1/forum_posts` | login / pemilik-admin |
| Foto Post | POST | `/rest/v1/forum_post_media` | pemilik post |
| Like | POST/DELETE | `/rest/v1/forum_likes` | milik sendiri |
| Komentar | GET/POST/DELETE | `/rest/v1/forum_comments` | login / pemilik-admin |
| Device Token | POST/DELETE | `/rest/v1/device_tokens` | milik sendiri |
| File | POST/GET | `/storage/v1/object/...` | login (upload) / publik (baca) |
| Reminder H-1 | POST | `/functions/v1/send-ride-reminder` | internal (cron) |

---

## 11. Contoh Alur End-to-End: Buat & Join Open Ride

Mengikuti alur pengguna di PRD Bagian 12, dipetakan ke panggilan API konkret:

1. Member buka tab Open Ride → `GET /rest/v1/open_rides?select=*,ride_participants(count)&order=tanggal_waktu.asc`
2. Tekan **Buat Open Ride**, isi form → `POST /rest/v1/open_rides` (`dibuat_oleh` = `auth.uid()` user yang login)
3. Ride otomatis muncul di daftar member lain lewat query yang sama di langkah 1 (atau lebih instan lewat channel Realtime `open_rides`, Bagian 7)
4. Member lain tekan **JOIN** → `POST /rest/v1/ride_participants`
5. Kalau kuota sudah penuh, request ditolak dengan pesan `Kuota Open Ride sudah penuh` (Bagian 8) — tombol JOIN di UI dinonaktifkan/diberi feedback sesuai error ini
6. H-1, Edge Function `send-ride-reminder` (dipicu `pg_cron`, bukan dipanggil app) mengirim FCM ke `device_tokens` milik peserta terdaftar
7. Hari-H, host membuka Detail Ride → `PATCH /rest/v1/ride_participants?open_ride_id=eq.<uuid>&user_id=eq.<uuid>` untuk tiap peserta, set `status_konfirmasi` jadi `hadir`/`tidak_hadir`

---

## 12. Catatan Terbuka / Asumsi yang Perlu Diklarifikasi

Konsisten dengan gaya "Risiko & Mitigasi" di PRD dan "Catatan Skema" di DB Schema — beberapa hal berikut sengaja **belum** dikunci karena butuh keputusan tim, bukan kesalahan:

| Isu | Status saat ini | Opsi |
|---|---|---|
| Landing page publik butuh data rute, tapi RLS `routes` cuma `authenticated` | Belum ada policy `anon` | (a) tambah policy SELECT terbatas untuk `anon` pada rute terverifikasi, atau (b) landing page pakai konten statis ter-cache (lebih sesuai filosofi Rp0) |
| Toggle approval admin manual (disebut PRD Bagian 7 "bisa di-toggle") | Belum ada kolom pendukung (mis. `is_approved`) di skema | Tambah kolom + policy tambahan hanya kalau toggle ini benar-benar diaktifkan komunitas |
| Notifikasi "Open Ride baru" (Fase 2) | Dua pendekatan sama-sama valid | FCM push (Edge Function + webhook, pengalaman native) vs Realtime + badge in-app (lebih ringan, tanpa Edge Function tambahan) |
| Rating rute ("4.9 (210)" di wireframe) | Kolom cache sudah ada, alur submit belum | Baru perlu endpoint `POST /rest/v1/route_ratings` kalau tabel tersebut dibuat (lihat DB Schema Bagian 5.2) |

---

*Dokumen ini adalah kontrak API untuk MVP biaya rendah — 100% di atas layanan bawaan Supabase (PostgREST, GoTrue, Storage) plus Edge Function minimal, tanpa server custom. Semua endpoint untuk fitur yang ditunda di PRD (Marketplace, Chapter, Event, Challenge, Cari Teman Gowes) juga sengaja belum dibuat di sini — konsisten dengan Bagian 4 PRD dan Bagian 12 DB Schema.*
