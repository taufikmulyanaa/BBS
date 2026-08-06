# Skema Database — Bapak-Bapak Sepedahan
## Turunan dari PRD MVP Biaya Rendah v1.0

**Status:** Draft v1.0
**Backend:** Supabase (Postgres + Auth + Storage + Realtime)
**Lingkup:** Fase 1–3 sesuai PRD (Fondasi & Rute, Open Ride, Forum Ringan). Tabel untuk fitur yang ditunda (Marketplace, Chapter, Event, Challenge, Cari Teman Gowes) **sengaja tidak dibuat** — lihat Bagian 9.
**Catatan:** Seluruh DDL, trigger, dan RLS policy di dokumen ini sudah dites jalan di Postgres 16 (termasuk simulasi kuota Open Ride, counter like/comment, limit foto, dan enforcement RLS antar-user) — bukan sekadar draf teoretis.

---

## 1. Pemetaan Tabel ke Fase PRD

| Fase | Tabel |
|---|---|
| Fase 1 — Fondasi & Rute | `profiles`, `routes`, `saved_routes` |
| Fase 2 — Open Ride | `open_rides`, `ride_participants`, `device_tokens` (untuk notifikasi FCM) |
| Fase 3 — Forum Ringan | `forum_posts`, `forum_post_media`, `forum_likes`, `forum_comments` |

## 2. Prinsip Desain Skema

1. **UUID sebagai primary key** (`gen_random_uuid()`) — konvensi standar Supabase, aman untuk client-side generation & realtime subscription.
2. **`auth.users` bawaan Supabase menangani email/password/OTP Google** — tabel `profiles` cuma nampung data tambahan (nama, foto, role). Email **sengaja tidak diduplikasi** ke `public.profiles` supaya tidak bocor ke semua anggota lewat RLS SELECT yang terbuka.
3. **Tags rute pakai `TEXT[]`**, bukan tabel `tags` terpisah — sesuai filosofi lean di PRD (Bagian 6): tidak perlu UI admin kelola tag terpisah untuk skala 50–500 anggota.
4. **Counter (`like_count`, `comment_count`, `rating_*`) didenormalisasi** di tabel induk + dijaga trigger, supaya query daftar (Forum, Rute) tidak perlu `COUNT()`/`JOIN` mahal tiap render.
5. **Business rule kritis (kuota Open Ride, limit 5 foto/post) ditegakkan di level database** (trigger), bukan cuma di app — supaya konsisten walau ada banyak client (Flutter app + kemungkinan admin panel nanti).
6. **RLS (Row Level Security) aktif di semua tabel** — wajib di Supabase karena `anon`/`authenticated` key dipakai langsung dari Flutter app tanpa server perantara.

## 3. Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- index pencarian ILIKE cepat (nama rute)
```

## 4. Enum Types

```sql
CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE route_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE route_verification_status AS ENUM ('belum_diverifikasi', 'terverifikasi');
CREATE TYPE ride_status AS ENUM ('akan_datang', 'selesai', 'dibatalkan');
CREATE TYPE participant_status AS ENUM ('terdaftar', 'hadir', 'tidak_hadir');
CREATE TYPE post_type AS ENUM ('diskusi', 'laporan_kondisi');
CREATE TYPE device_platform AS ENUM ('android', 'ios', 'web');
```

`route_verification_status` memetakan langsung ke mitigasi risiko di PRD Bagian 14 ("Tandai rute 'belum diverifikasi' sampai ada beberapa review"). `role` sengaja cuma 2 nilai sesuai PRD Bagian 10 — Moderator/Seller/Chapter Admin baru ditambah kalau fitur terkait dibangun.

## 5. Tabel Inti

### 5.1 `profiles` — 1:1 dengan `auth.users`
```sql
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap    TEXT NOT NULL,
  foto_profil_url TEXT,
  role            user_role NOT NULL DEFAULT 'member',
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(), -- "Anggota sejak ..." di wireframe Profil
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.2 `routes`
```sql
CREATE TABLE public.routes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama              TEXT NOT NULL,
  deskripsi         TEXT,
  jarak_km          NUMERIC(6,2) NOT NULL CHECK (jarak_km > 0),
  elevasi_m         INTEGER CHECK (elevasi_m IS NULL OR elevasi_m >= 0),
  level             route_level NOT NULL,
  gpx_file_url      TEXT,
  cover_image_url   TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}', -- co: {Tanjakan,Pemandangan,Kopi}
  status_verifikasi route_verification_status NOT NULL DEFAULT 'belum_diverifikasi',
  rating_avg        NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating_avg BETWEEN 0 AND 5),
  rating_count      INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  dibuat_oleh       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
> `rating_avg`/`rating_count` di wireframe (co: "4.9 (210)") disiapkan sebagai kolom cache. MVP saat ini **belum ada alur submit rating** di wireframe — kalau nanti dibutuhkan, tambah tabel `route_ratings (route_id, user_id, rating SMALLINT, UNIQUE(route_id, user_id))` + trigger yang update dua kolom ini.

### 5.3 `saved_routes` — rute favorit
```sql
CREATE TABLE public.saved_routes (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_id   UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route_id)
);
```

### 5.4 `open_rides`
```sql
CREATE TABLE public.open_rides (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul         TEXT NOT NULL,
  titik_kumpul  TEXT NOT NULL,
  tanggal_waktu TIMESTAMPTZ NOT NULL,
  jarak_km      NUMERIC(6,2) NOT NULL CHECK (jarak_km > 0),
  level         route_level NOT NULL,
  kuota_maks    INTEGER NOT NULL CHECK (kuota_maks > 0),
  catatan       TEXT,
  status        ride_status NOT NULL DEFAULT 'akan_datang',
  dibuat_oleh   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.5 `ride_participants`
```sql
CREATE TABLE public.ride_participants (
  open_ride_id      UUID NOT NULL REFERENCES public.open_rides(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status_konfirmasi participant_status NOT NULL DEFAULT 'terdaftar',
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (open_ride_id, user_id)
);
```
> "Batalkan keikutsertaan" di wireframe = `DELETE` baris ini. `status_konfirmasi` diubah manual oleh host jadi `hadir`/`tidak_hadir` di hari-H (sesuai alur PRD Bagian 12 langkah 7).

### 5.6 `forum_posts`
```sql
CREATE TABLE public.forum_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id      UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipe          post_type NOT NULL DEFAULT 'diskusi',
  judul         TEXT NOT NULL,
  isi           TEXT NOT NULL,
  like_count    INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  comment_count INTEGER NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.7 `forum_post_media`
```sql
CREATE TABLE public.forum_post_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  media_url    TEXT NOT NULL,
  file_size_kb INTEGER CHECK (file_size_kb IS NULL OR file_size_kb <= 5120),
  urutan       SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
> Batas "maks 5 file/post, maks 5MB/file" dari PRD Bagian 7 ditegakkan dua lapis: `CHECK` untuk ukuran file, trigger untuk jumlah file (lihat Bagian 6.4).

### 5.8 `forum_likes`
```sql
CREATE TABLE public.forum_likes (
  post_id    UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
```

### 5.9 `forum_comments`
```sql
CREATE TABLE public.forum_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  isi        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.10 `device_tokens` — untuk push notification FCM
```sql
CREATE TABLE public.device_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fcm_token  TEXT NOT NULL UNIQUE,
  platform   device_platform NOT NULL DEFAULT 'android',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
> Reminder H-1 (PRD Bagian 12) dijalankan via scheduled job (`pg_cron` di Supabase atau Edge Function terjadwal) yang query `open_rides` untuk besok → kirim FCM ke `device_tokens` milik `ride_participants` terkait. Tidak perlu tabel log notifikasi terpisah di MVP.

## 6. Functions & Triggers

### 6.1 Auto-buat profil saat user baru daftar
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, foto_profil_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6.2 Auto-update `updated_at`
```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_routes_updated_at BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_open_rides_updated_at BEFORE UPDATE ON public.open_rides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### 6.3 Cegah join Open Ride kalau kuota penuh
```sql
CREATE OR REPLACE FUNCTION public.check_ride_quota()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_quota INTEGER;
BEGIN
  SELECT kuota_maks INTO max_quota FROM public.open_rides WHERE id = NEW.open_ride_id;
  SELECT COUNT(*) INTO current_count FROM public.ride_participants WHERE open_ride_id = NEW.open_ride_id;
  IF current_count >= max_quota THEN
    RAISE EXCEPTION 'Kuota Open Ride sudah penuh';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_ride_quota BEFORE INSERT ON public.ride_participants
  FOR EACH ROW EXECUTE FUNCTION public.check_ride_quota();
```
✅ Diuji: kuota 2, peserta ke-3 ditolak dengan error `Kuota Open Ride sudah penuh`.

### 6.4 Batasi maks 5 foto per post
```sql
CREATE OR REPLACE FUNCTION public.check_media_limit()
RETURNS TRIGGER AS $$
DECLARE
  media_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO media_count FROM public.forum_post_media WHERE post_id = NEW.post_id;
  IF media_count >= 5 THEN
    RAISE EXCEPTION 'Maksimal 5 foto per post';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_media_limit BEFORE INSERT ON public.forum_post_media
  FOR EACH ROW EXECUTE FUNCTION public.check_media_limit();
```
✅ Diuji: foto ke-6 ditolak dengan error `Maksimal 5 foto per post`.

### 6.5 Denormalisasi `like_count` & `comment_count`
```sql
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_forum_likes_count
  AFTER INSERT OR DELETE ON public.forum_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_forum_comments_count
  AFTER INSERT OR DELETE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();
```
✅ Diuji: like/unlike dan komentar update counter dengan benar (naik/turun sesuai aksi).

## 7. Indexes

```sql
CREATE INDEX idx_routes_nama_trgm ON public.routes USING gin (nama gin_trgm_ops); -- untuk [Cari rute...]
CREATE INDEX idx_routes_level ON public.routes(level);
CREATE INDEX idx_routes_status_verifikasi ON public.routes(status_verifikasi);
CREATE INDEX idx_routes_dibuat_oleh ON public.routes(dibuat_oleh);

CREATE INDEX idx_saved_routes_route ON public.saved_routes(route_id);

CREATE INDEX idx_open_rides_tanggal ON public.open_rides(tanggal_waktu); -- untuk filter [Minggu ini]
CREATE INDEX idx_open_rides_level ON public.open_rides(level);
CREATE INDEX idx_open_rides_status ON public.open_rides(status);
CREATE INDEX idx_open_rides_dibuat_oleh ON public.open_rides(dibuat_oleh);

CREATE INDEX idx_ride_participants_user ON public.ride_participants(user_id); -- untuk "Open Ride Saya"

CREATE INDEX idx_forum_posts_route ON public.forum_posts(route_id);
CREATE INDEX idx_forum_posts_created ON public.forum_posts(created_at DESC); -- untuk tab [Terbaru]
CREATE INDEX idx_forum_posts_tipe ON public.forum_posts(tipe);

CREATE INDEX idx_forum_comments_post ON public.forum_comments(post_id);
CREATE INDEX idx_forum_likes_user ON public.forum_likes(user_id);
```

## 8. Row Level Security (RLS)

Semua tabel `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` — wajib karena Flutter app konek langsung ke Supabase pakai `anon`/`authenticated` key tanpa server perantara.

### Contoh lengkap — `profiles`, `routes`, `ride_participants`
```sql
-- profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- routes
CREATE POLICY "routes_select_all" ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "routes_insert_own" ON public.routes FOR INSERT TO authenticated WITH CHECK (auth.uid() = dibuat_oleh);
CREATE POLICY "routes_update_owner_or_admin" ON public.routes FOR UPDATE TO authenticated USING (
  auth.uid() = dibuat_oleh OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "routes_delete_owner_or_admin" ON public.routes FOR DELETE TO authenticated USING (
  auth.uid() = dibuat_oleh OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ride_participants (host/admin boleh ubah status kehadiran, peserta cuma boleh join/batal diri sendiri)
CREATE POLICY "ride_participants_select_all" ON public.ride_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "ride_participants_insert_own" ON public.ride_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ride_participants_delete_own" ON public.ride_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ride_participants_update_host_or_admin" ON public.ride_participants FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.open_rides WHERE id = ride_participants.open_ride_id AND dibuat_oleh = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
```
✅ Diuji: user A **tidak bisa** insert `routes` atas nama user B (ditolak RLS), dan **tidak bisa** update `profiles` milik user lain (0 baris ter-update).

### Ringkasan policy tabel lainnya (pola sama — tinggal ganti nama tabel & kondisi kepemilikan)

| Tabel | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `saved_routes` | milik sendiri | milik sendiri | – | milik sendiri |
| `open_rides` | semua anggota | milik sendiri (`dibuat_oleh`) | pembuat / admin | pembuat / admin |
| `forum_posts` | semua anggota | milik sendiri | pemilik / admin | pemilik / admin |
| `forum_post_media` | semua anggota | pemilik post terkait | – | pemilik post / admin |
| `forum_likes` | semua anggota | milik sendiri | – | milik sendiri |
| `forum_comments` | semua anggota | milik sendiri | pemilik | pemilik / admin |
| `device_tokens` | milik sendiri | milik sendiri | – | milik sendiri |

## 9. Storage Buckets (Supabase Storage)

| Bucket | Isi | Publik? |
|---|---|---|
| `avatars` | Foto profil anggota | Publik (read) |
| `routes-gpx` | File GPX rute | Publik (read) |
| `routes-cover` | Foto sampul rute | Publik (read) |
| `forum-media` | Foto post/laporan forum | Publik (read) |

Kolom `*_url` di tabel (`foto_profil_url`, `gpx_file_url`, `cover_image_url`, `media_url`) menyimpan **URL publik hasil upload**, bukan file-nya sendiri. Kompresi otomatis (PRD Bagian 7) dilakukan di sisi app (Flutter) sebelum upload, bukan di database.

## 10. Estimasi Kapasitas vs Free Tier Supabase

Free tier Supabase: ~500MB database, **1GB storage**, 50rb MAU. Untuk skala 50–500 anggota (PRD Bagian 5), **jumlah baris tabel nyaris tidak akan jadi masalah** — proyeksi setahun penuh (ratusan rute, ribuan Open Ride/forum post/komentar) masih dalam orde puluhan MB di database.

**Yang justru berpotensi jadi bottleneck lebih dulu: Storage, dari foto forum + GPX** — bukan ukuran tabel. Ilustrasi kasar:

> 100 post forum/bulan × 2 foto rata-rata × 400KB (setelah kompresi) ≈ **80MB/bulan** → kalau forum cukup aktif, kuota 1GB storage bisa habis dalam ~12 bulan.

Ini bukan proyeksi presisi (tergantung aktivitas riil), tapi cukup untuk jadi sinyal awal: kalau nanti komunitas ramai, pantau **Storage usage**, bukan cuma ukuran database — dan itu jadi trigger paling realistis untuk upgrade ke Supabase Pro (~$25/bulan), sejalan dengan catatan di PRD Bagian 9.

## 11. Urutan Eksekusi Migrasi

1. Extensions (Bagian 3)
2. Enum types (Bagian 4)
3. Tabel `profiles` → trigger `on_auth_user_created` (butuh tabel ini sudah ada)
4. Tabel `routes`, `saved_routes`
5. Tabel `open_rides`, `ride_participants`
6. Tabel `forum_posts`, `forum_post_media`, `forum_likes`, `forum_comments`
7. Tabel `device_tokens`
8. Functions & triggers (Bagian 6)
9. Indexes (Bagian 7)
10. RLS policies (Bagian 8)
11. Buat Storage buckets (Bagian 9) — lewat Supabase Dashboard atau `supabase storage` CLI, bukan SQL

## 12. Catatan Skema untuk Fase Lanjutan

Skema di atas sengaja **tidak** mengunci diri — begini kira-kira tabel tambahan akan menempel kalau sinyal kebutuhan di PRD Bagian 8/15 muncul:

| Fitur | Tabel baru | Catatan |
|---|---|---|
| Cari teman gowes | *(tidak perlu tabel baru dulu)* | Query `profiles` + filter level/hari dari data yang sudah ada; radius/geolokasi (PostGIS) baru kalau skala >500 anggota |
| Marketplace (listing only) | `listings (id, seller_id, judul, harga, foto, kontak_wa, status)` | Tanpa cart/payment — tombol kontak langsung ke `wa.me`, konsisten Bagian 7 PRD |
| Chapter komunitas | `chapters (id, nama_kota)` + kolom `chapter_id` nullable di `profiles`/`routes`/`open_rides` | `user_role` perlu tambah nilai `chapter_admin` |
| Event + QR check-in | `events (mirip open_rides + link_pendaftaran_eksternal)` | QR/pembayaran baru masuk kalau event >100 peserta sulit dikelola manual |
| Challenge + Strava/Garmin | `challenges`, `challenge_participants`, `strava_connections (oauth token)` | Paling terakhir — effort integrasi OAuth + rate limit tertinggi di seluruh roadmap |

---

*Skema ini konsisten dengan keputusan teknis di PRD Bagian 7 & 9 (Supabase, OpenStreetMap, tanpa payment gateway, tanpa Strava OAuth). Semua tabel "fase lanjutan" di atas eksplisit **belum dibuat** — baru ditambah kalau ada sinyal kebutuhan nyata dari komunitas.*
