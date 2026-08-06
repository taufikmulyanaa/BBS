-- 01_initial_schema.sql
-- Database schema for Bapak-Bapak Sepedahan (Guyub Gowes)

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE route_level AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE route_verification_status AS ENUM ('belum_diverifikasi', 'terverifikasi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ride_status AS ENUM ('akan_datang', 'selesai', 'dibatalkan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE participant_status AS ENUM ('terdaftar', 'hadir', 'tidak_hadir');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('diskusi', 'laporan_kondisi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE device_platform AS ENUM ('android', 'ios', 'web');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Core Tables

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap    TEXT NOT NULL,
  foto_profil_url TEXT,
  role            user_role NOT NULL DEFAULT 'member',
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Routes
CREATE TABLE IF NOT EXISTS public.routes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama              TEXT NOT NULL,
  deskripsi         TEXT,
  jarak_km          NUMERIC(6,2) NOT NULL CHECK (jarak_km > 0),
  elevasi_m         INTEGER CHECK (elevasi_m IS NULL OR elevasi_m >= 0),
  level             route_level NOT NULL,
  gpx_file_url      TEXT,
  cover_image_url   TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  status_verifikasi route_verification_status NOT NULL DEFAULT 'belum_diverifikasi',
  rating_avg        NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating_avg BETWEEN 0 AND 5),
  rating_count      INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  dibuat_oleh       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved Routes
CREATE TABLE IF NOT EXISTS public.saved_routes (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  route_id   UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, route_id)
);

-- Open Rides
CREATE TABLE IF NOT EXISTS public.open_rides (
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

-- Ride Participants
CREATE TABLE IF NOT EXISTS public.ride_participants (
  open_ride_id      UUID NOT NULL REFERENCES public.open_rides(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status_konfirmasi participant_status NOT NULL DEFAULT 'terdaftar',
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (open_ride_id, user_id)
);

-- Forum Posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
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

-- Forum Post Media
CREATE TABLE IF NOT EXISTS public.forum_post_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  media_url    TEXT NOT NULL,
  file_size_kb INTEGER CHECK (file_size_kb IS NULL OR file_size_kb <= 5120),
  urutan       SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forum Likes
CREATE TABLE IF NOT EXISTS public.forum_likes (
  post_id    UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Forum Comments
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  isi        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Device Tokens
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fcm_token  TEXT NOT NULL UNIQUE,
  platform   device_platform NOT NULL DEFAULT 'android',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Functions & Triggers

-- Auto create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, foto_profil_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_routes_updated_at ON public.routes;
CREATE TRIGGER trg_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_open_rides_updated_at ON public.open_rides;
CREATE TRIGGER trg_open_rides_updated_at BEFORE UPDATE ON public.open_rides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_forum_posts_updated_at ON public.forum_posts;
CREATE TRIGGER trg_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quota check for Open Rides
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

DROP TRIGGER IF EXISTS trg_check_ride_quota ON public.ride_participants;
CREATE TRIGGER trg_check_ride_quota BEFORE INSERT ON public.ride_participants FOR EACH ROW EXECUTE FUNCTION public.check_ride_quota();

-- Media limit per forum post (max 5)
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

DROP TRIGGER IF EXISTS trg_check_media_limit ON public.forum_post_media;
CREATE TRIGGER trg_check_media_limit BEFORE INSERT ON public.forum_post_media FOR EACH ROW EXECUTE FUNCTION public.check_media_limit();

-- Like counter denormalization
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_forum_likes_count ON public.forum_likes;
CREATE TRIGGER trg_forum_likes_count AFTER INSERT OR DELETE ON public.forum_likes FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

-- Comment counter denormalization
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_forum_comments_count ON public.forum_comments;
CREATE TRIGGER trg_forum_comments_count AFTER INSERT OR DELETE ON public.forum_comments FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_routes_nama_trgm ON public.routes USING gin (nama gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_routes_level ON public.routes(level);
CREATE INDEX IF NOT EXISTS idx_routes_status_verifikasi ON public.routes(status_verifikasi);
CREATE INDEX IF NOT EXISTS idx_routes_dibuat_oleh ON public.routes(dibuat_oleh);
CREATE INDEX IF NOT EXISTS idx_saved_routes_route ON public.saved_routes(route_id);
CREATE INDEX IF NOT EXISTS idx_open_rides_tanggal ON public.open_rides(tanggal_waktu);
CREATE INDEX IF NOT EXISTS idx_open_rides_level ON public.open_rides(level);
CREATE INDEX IF NOT EXISTS idx_open_rides_status ON public.open_rides(status);
CREATE INDEX IF NOT EXISTS idx_open_rides_dibuat_oleh ON public.open_rides(dibuat_oleh);
CREATE INDEX IF NOT EXISTS idx_ride_participants_user ON public.ride_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_route ON public.forum_posts(route_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON public.forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_tipe ON public.forum_posts(tipe);
CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user ON public.forum_likes(user_id);

-- 6. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.open_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Public & Authenticated Read Policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "routes_select_all" ON public.routes FOR SELECT USING (true);
CREATE POLICY "routes_insert_authenticated" ON public.routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "saved_routes_all" ON public.saved_routes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "open_rides_select_all" ON public.open_rides FOR SELECT USING (true);
CREATE POLICY "open_rides_insert_authenticated" ON public.open_rides FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "ride_participants_select_all" ON public.ride_participants FOR SELECT USING (true);
CREATE POLICY "ride_participants_insert_own" ON public.ride_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ride_participants_delete_own" ON public.ride_participants FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "forum_posts_select_all" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "forum_posts_insert_authenticated" ON public.forum_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "forum_likes_select_all" ON public.forum_likes FOR SELECT USING (true);
CREATE POLICY "forum_likes_all_own" ON public.forum_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "forum_comments_select_all" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "forum_comments_insert_own" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
