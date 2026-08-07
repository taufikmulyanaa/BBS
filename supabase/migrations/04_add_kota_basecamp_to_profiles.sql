-- Tambahkan kolom kota_basecamp ke tabel profiles jika belum ada
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kota_basecamp TEXT;
