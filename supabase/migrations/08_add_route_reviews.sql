-- 08_add_route_reviews.sql
-- route_reviews sudah dipakai di kode web (RouteDetailModal.tsx, routes/page.tsx) tapi belum pernah
-- ada di migration manapun. Ditambahkan di sini (idempotent) supaya web & Flutter mobile app bisa
-- diandalkan mengaksesnya, plus trigger rekalkulasi rating otomatis (menggantikan update manual di client).

CREATE TABLE IF NOT EXISTS public.route_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id    UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name   TEXT,
  user_avatar TEXT,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_route_reviews_route ON public.route_reviews(route_id);

-- Rekalkulasi rating_avg/rating_count otomatis (pola sama dengan update_post_like_count di 01_initial_schema.sql)
CREATE OR REPLACE FUNCTION public.update_route_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_route_id UUID := COALESCE(NEW.route_id, OLD.route_id);
BEGIN
  UPDATE public.routes r SET
    rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.route_reviews WHERE route_id = target_route_id), 0),
    rating_count = (SELECT COUNT(*) FROM public.route_reviews WHERE route_id = target_route_id)
  WHERE r.id = target_route_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_route_reviews_rating ON public.route_reviews;
CREATE TRIGGER trg_route_reviews_rating AFTER INSERT OR UPDATE OR DELETE ON public.route_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_route_rating();

ALTER TABLE public.route_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "route_reviews_select_all" ON public.route_reviews FOR SELECT USING (true);
CREATE POLICY "route_reviews_insert_own" ON public.route_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "route_reviews_delete_own" ON public.route_reviews FOR DELETE USING (auth.uid() = user_id);
