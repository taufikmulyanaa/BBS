-- 07_add_bike_events.sql
-- Event Sepeda: event besar/formal (gran fondo, race, charity ride) dengan info, kalender minat,
-- link pendaftaran eksternal, diskusi, dan cari teman berangkat bersama.

-- 1. Tables

-- Bike Events
CREATE TABLE IF NOT EXISTS public.bike_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul            TEXT NOT NULL,
  deskripsi        TEXT,
  penyelenggara    TEXT,
  lokasi           TEXT,
  tanggal_mulai    TIMESTAMPTZ NOT NULL,
  tanggal_selesai  TIMESTAMPTZ,
  poster_url       TEXT,
  link_pendaftaran TEXT,
  status           ride_status NOT NULL DEFAULT 'akan_datang',
  dibuat_oleh      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bike Event Interests (tombol "Tertarik/Akan Ikut" untuk kalender)
CREATE TABLE IF NOT EXISTS public.bike_event_interests (
  event_id   UUID NOT NULL REFERENCES public.bike_events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Forum Posts: extend dengan event_id (diskusi event)
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.bike_events(id) ON DELETE CASCADE;

-- Cari Teman Berangkat Bersama
CREATE TABLE IF NOT EXISTS public.bike_event_travel_buddies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID NOT NULL REFERENCES public.bike_events(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titik_berangkat   TEXT NOT NULL,
  tanggal_berangkat TIMESTAMPTZ,
  moda              TEXT,
  kuota_maks        INTEGER CHECK (kuota_maks IS NULL OR kuota_maks > 0),
  catatan           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bike_event_travel_buddy_participants (
  listing_id UUID NOT NULL REFERENCES public.bike_event_travel_buddies(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (listing_id, user_id)
);

-- 2. Triggers

DROP TRIGGER IF EXISTS trg_bike_events_updated_at ON public.bike_events;
CREATE TRIGGER trg_bike_events_updated_at BEFORE UPDATE ON public.bike_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_travel_buddies_updated_at ON public.bike_event_travel_buddies;
CREATE TRIGGER trg_travel_buddies_updated_at BEFORE UPDATE ON public.bike_event_travel_buddies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Quota check for Travel Buddy listings (skip kalau kuota_maks tidak diisi)
CREATE OR REPLACE FUNCTION public.check_travel_buddy_quota()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_quota INTEGER;
BEGIN
  SELECT kuota_maks INTO max_quota FROM public.bike_event_travel_buddies WHERE id = NEW.listing_id;
  IF max_quota IS NOT NULL THEN
    SELECT COUNT(*) INTO current_count FROM public.bike_event_travel_buddy_participants WHERE listing_id = NEW.listing_id;
    IF current_count >= max_quota THEN
      RAISE EXCEPTION 'Kuota teman berangkat sudah penuh';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_travel_buddy_quota ON public.bike_event_travel_buddy_participants;
CREATE TRIGGER trg_check_travel_buddy_quota BEFORE INSERT ON public.bike_event_travel_buddy_participants FOR EACH ROW EXECUTE FUNCTION public.check_travel_buddy_quota();

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_bike_events_tanggal ON public.bike_events(tanggal_mulai);
CREATE INDEX IF NOT EXISTS idx_bike_events_status ON public.bike_events(status);
CREATE INDEX IF NOT EXISTS idx_travel_buddies_event ON public.bike_event_travel_buddies(event_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_event ON public.forum_posts(event_id);

-- 4. Row Level Security (RLS)
ALTER TABLE public.bike_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_event_travel_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_event_travel_buddy_participants ENABLE ROW LEVEL SECURITY;

-- bike_events: public read, siapapun login boleh submit, hanya pembuat/admin boleh ubah/hapus
CREATE POLICY "bike_events_select_all" ON public.bike_events FOR SELECT USING (true);
CREATE POLICY "bike_events_insert_authenticated" ON public.bike_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "bike_events_update_own_or_admin" ON public.bike_events FOR UPDATE
  USING (auth.uid() = dibuat_oleh OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "bike_events_delete_own_or_admin" ON public.bike_events FOR DELETE
  USING (auth.uid() = dibuat_oleh OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- bike_event_interests: public read, kelola milik sendiri saja
CREATE POLICY "bike_event_interests_select_all" ON public.bike_event_interests FOR SELECT USING (true);
CREATE POLICY "bike_event_interests_all_own" ON public.bike_event_interests FOR ALL USING (auth.uid() = user_id);

-- bike_event_travel_buddies: public read, hanya pemilik/admin boleh ubah/hapus listing
CREATE POLICY "travel_buddies_select_all" ON public.bike_event_travel_buddies FOR SELECT USING (true);
CREATE POLICY "travel_buddies_insert_own" ON public.bike_event_travel_buddies FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');
CREATE POLICY "travel_buddies_update_own_or_admin" ON public.bike_event_travel_buddies FOR UPDATE
  USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "travel_buddies_delete_own_or_admin" ON public.bike_event_travel_buddies FOR DELETE
  USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- bike_event_travel_buddy_participants: public read, gabung/keluar milik sendiri saja
CREATE POLICY "travel_buddy_participants_select_all" ON public.bike_event_travel_buddy_participants FOR SELECT USING (true);
CREATE POLICY "travel_buddy_participants_insert_own" ON public.bike_event_travel_buddy_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "travel_buddy_participants_delete_own" ON public.bike_event_travel_buddy_participants FOR DELETE USING (auth.uid() = user_id);
