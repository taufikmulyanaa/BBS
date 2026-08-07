-- 06_add_chapters.sql
-- Chapter Komunitas: sub-komunitas per kota dengan admin, forum, kalender kegiatan, dan daftar anggota sendiri.

-- 1. Enum Types
DO $$ BEGIN
    CREATE TYPE chapter_status AS ENUM ('aktif', 'nonaktif');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE chapter_member_role AS ENUM ('admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE chapter_member_status AS ENUM ('pending', 'aktif', 'ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE chapter_event_type AS ENUM ('open_ride', 'kopdar', 'lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tables

-- Chapters
CREATE TABLE IF NOT EXISTS public.chapters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama            TEXT NOT NULL,
  kota            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  deskripsi       TEXT,
  cover_image_url TEXT,
  status          chapter_status NOT NULL DEFAULT 'aktif',
  dibuat_oleh     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chapter Members (keanggotaan + role admin per-chapter + alur approval join)
CREATE TABLE IF NOT EXISTS public.chapter_members (
  chapter_id   UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role         chapter_member_role NOT NULL DEFAULT 'member',
  status       chapter_member_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at   TIMESTAMPTZ,
  decided_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (chapter_id, user_id)
);

-- Chapter Events (kalender kegiatan, termasuk open ride chapter lewat kolom "jenis")
CREATE TABLE IF NOT EXISTS public.chapter_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id    UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  jenis         chapter_event_type NOT NULL DEFAULT 'lainnya',
  judul         TEXT NOT NULL,
  deskripsi     TEXT,
  lokasi        TEXT,
  tanggal_waktu TIMESTAMPTZ NOT NULL,
  kuota_maks    INTEGER CHECK (kuota_maks IS NULL OR kuota_maks > 0),
  status        ride_status NOT NULL DEFAULT 'akan_datang',
  dibuat_oleh   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chapter Event Participants (RSVP)
CREATE TABLE IF NOT EXISTS public.chapter_event_participants (
  event_id          UUID NOT NULL REFERENCES public.chapter_events(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status_konfirmasi participant_status NOT NULL DEFAULT 'terdaftar',
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Forum Posts: extend dengan chapter_id (NULL = forum umum, terisi = forum khusus chapter)
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE;

-- 3. Helper Functions (SECURITY DEFINER supaya aman dipakai di RLS tanpa recursive-RLS issue)

CREATE OR REPLACE FUNCTION public.is_chapter_admin(p_chapter_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chapter_members
    WHERE chapter_id = p_chapter_id AND user_id = p_user_id AND role = 'admin' AND status = 'aktif'
  ) OR (SELECT role FROM public.profiles WHERE id = p_user_id) = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_chapter_member(p_chapter_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chapter_members
    WHERE chapter_id = p_chapter_id AND user_id = p_user_id AND status = 'aktif'
  ) OR (SELECT role FROM public.profiles WHERE id = p_user_id) = 'admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 4. Triggers

DROP TRIGGER IF EXISTS trg_chapters_updated_at ON public.chapters;
CREATE TRIGGER trg_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_chapter_events_updated_at ON public.chapter_events;
CREATE TRIGGER trg_chapter_events_updated_at BEFORE UPDATE ON public.chapter_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quota check for Chapter Events (skip kalau kuota_maks tidak diisi)
CREATE OR REPLACE FUNCTION public.check_event_quota()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_quota INTEGER;
BEGIN
  SELECT kuota_maks INTO max_quota FROM public.chapter_events WHERE id = NEW.event_id;
  IF max_quota IS NOT NULL THEN
    SELECT COUNT(*) INTO current_count FROM public.chapter_event_participants WHERE event_id = NEW.event_id;
    IF current_count >= max_quota THEN
      RAISE EXCEPTION 'Kuota kegiatan sudah penuh';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_event_quota ON public.chapter_event_participants;
CREATE TRIGGER trg_check_event_quota BEFORE INSERT ON public.chapter_event_participants FOR EACH ROW EXECUTE FUNCTION public.check_event_quota();

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_chapters_slug ON public.chapters(slug);
CREATE INDEX IF NOT EXISTS idx_chapter_members_user ON public.chapter_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_events_chapter ON public.chapter_events(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_events_tanggal ON public.chapter_events(tanggal_waktu);
CREATE INDEX IF NOT EXISTS idx_forum_posts_chapter ON public.forum_posts(chapter_id);

-- 6. Row Level Security (RLS)
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_event_participants ENABLE ROW LEVEL SECURITY;

-- chapters: public read, global-admin-only create/delete, chapter/global admin update
CREATE POLICY "chapters_select_all" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "chapters_insert_admin" ON public.chapters FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "chapters_update_admin" ON public.chapters FOR UPDATE
  USING (public.is_chapter_admin(id, auth.uid()));
CREATE POLICY "chapters_delete_admin" ON public.chapters FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- chapter_members: baris aktif publik, baris pending/ditolak hanya utk ybs + admin
CREATE POLICY "chapter_members_select" ON public.chapter_members FOR SELECT
  USING (status = 'aktif' OR user_id = auth.uid() OR public.is_chapter_admin(chapter_id, auth.uid()));
CREATE POLICY "chapter_members_insert" ON public.chapter_members FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND role = 'member' AND status = 'pending')
    OR public.is_chapter_admin(chapter_id, auth.uid())
  );
CREATE POLICY "chapter_members_update_admin" ON public.chapter_members FOR UPDATE
  USING (public.is_chapter_admin(chapter_id, auth.uid()));
CREATE POLICY "chapter_members_delete" ON public.chapter_members FOR DELETE
  USING (auth.uid() = user_id OR public.is_chapter_admin(chapter_id, auth.uid()));

-- chapter_events: public read, hanya member aktif chapter yg boleh posting event
CREATE POLICY "chapter_events_select_all" ON public.chapter_events FOR SELECT USING (true);
CREATE POLICY "chapter_events_insert_member" ON public.chapter_events FOR INSERT
  WITH CHECK (public.is_chapter_member(chapter_id, auth.uid()));
CREATE POLICY "chapter_events_update" ON public.chapter_events FOR UPDATE
  USING (auth.uid() = dibuat_oleh OR public.is_chapter_admin(chapter_id, auth.uid()));
CREATE POLICY "chapter_events_delete" ON public.chapter_events FOR DELETE
  USING (auth.uid() = dibuat_oleh OR public.is_chapter_admin(chapter_id, auth.uid()));

-- chapter_event_participants: public read, RSVP hanya member aktif chapter terkait
CREATE POLICY "chapter_event_participants_select_all" ON public.chapter_event_participants FOR SELECT USING (true);
CREATE POLICY "chapter_event_participants_insert" ON public.chapter_event_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_chapter_member(
      (SELECT chapter_id FROM public.chapter_events WHERE id = event_id), auth.uid()
    )
  );
CREATE POLICY "chapter_event_participants_delete_own" ON public.chapter_event_participants FOR DELETE
  USING (auth.uid() = user_id);

-- forum_posts: post ke forum chapter wajib member aktif chapter tsb; forum umum tidak berubah
DROP POLICY IF EXISTS "forum_posts_insert_authenticated" ON public.forum_posts;
CREATE POLICY "forum_posts_insert_authenticated" ON public.forum_posts FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND (chapter_id IS NULL OR public.is_chapter_member(chapter_id, auth.uid()))
  );
