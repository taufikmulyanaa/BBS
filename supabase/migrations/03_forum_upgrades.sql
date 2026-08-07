-- 1. Tambah kolom parent_comment_id untuk mendukung komentar bersarang (balas komentar)
ALTER TABLE public.forum_comments 
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE;

-- 2. Buat Storage Bucket untuk foto-foto forum
INSERT INTO storage.buckets (id, name, public) 
VALUES ('forum-media', 'forum-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set RLS Policies untuk bucket forum-media
-- Mengizinkan siapapun (publik) untuk melihat/membaca gambar
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'forum-media' );

-- Mengizinkan pengguna terautentikasi (login) untuk mengunggah gambar
CREATE POLICY "Auth Users Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'forum-media' AND auth.role() = 'authenticated' );

-- Mengizinkan pemilik gambar untuk menghapusnya
CREATE POLICY "Auth Users Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'forum-media' AND auth.uid() = owner );
