-- Create storage buckets for forum media and avatars
insert into storage.buckets (id, name, public) 
values 
  ('forum-media', 'forum-media', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up Row Level Security (RLS) for storage buckets
-- Note: 'storage.objects' is the table where files are stored

-- Policy for viewing forum media (Public)
create policy "Public Access to Forum Media"
  on storage.objects for select
  using ( bucket_id = 'forum-media' );

-- Policy for authenticated users to upload forum media
create policy "Authenticated Users Can Upload Forum Media"
  on storage.objects for insert
  with check ( bucket_id = 'forum-media' and auth.role() = 'authenticated' );

-- Policy for viewing avatars (Public)
create policy "Public Access to Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy for authenticated users to upload avatars
create policy "Authenticated Users Can Upload Avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Policy for users to update and delete their own files
create policy "Users Can Update Own Files"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( auth.uid() = owner );

create policy "Users Can Delete Own Files"
  on storage.objects for delete
  using ( auth.uid() = owner );
