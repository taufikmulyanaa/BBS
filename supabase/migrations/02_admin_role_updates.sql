-- 02_admin_role_updates.sql

-- 1. Update the handle_new_user trigger to assign admin role to specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  IF NEW.email = 'antahbrantahhh@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'member';
  END IF;

  INSERT INTO public.profiles (id, nama_lengkap, foto_profil_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    assigned_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update existing user to admin if email matches
DO $$ 
DECLARE 
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'antahbrantahhh@gmail.com' LIMIT 1;
  IF target_user_id IS NOT NULL THEN
    UPDATE public.profiles SET role = 'admin' WHERE id = target_user_id;
  END IF;
END $$;

-- 3. Add RLS policy so admins can update any profile (especially to change roles)
-- First drop if exists
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Create the policy
CREATE POLICY "profiles_update_admin" ON public.profiles 
FOR UPDATE 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
