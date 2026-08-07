-- 09_add_route_map_info.sql
-- Adds the "Info Rute" fields (Titik Awal, Titik Akhir, Permukaan) shown in the
-- Detail Rute design (stitch_bapak_sepedahan_design_system/detail_rute) but never
-- added to the schema. Nullable free-text — existing routes have none of this data
-- yet, and it's filled in by whoever verifies/edits the route.

ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS titik_awal  TEXT,
  ADD COLUMN IF NOT EXISTS titik_akhir TEXT,
  ADD COLUMN IF NOT EXISTS permukaan   TEXT;
