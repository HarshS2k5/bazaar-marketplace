-- ========================================================
-- BAZAAR MARKETPLACE - CUSTOMER PROFILES & DATABASE SCHEMA
-- Migration: 004_customer_profiles_and_database.sql
-- Enhances customer database with bio, safety indexes,
-- and RLS policies for self-service customer profile management.
-- ========================================================

-- 1. Ensure bio column exists in profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Indexes for fast customer database queries and searching
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);

-- 3. RLS policy allowing authenticated customers to insert their initial profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 4. RLS policy allowing admins full read/update access to customer database
DROP POLICY IF EXISTS "Admins can manage all customer profiles" ON public.profiles;
CREATE POLICY "Admins can manage all customer profiles"
    ON public.profiles FOR ALL
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 5. Updated handle_new_user() trigger for automatic customer profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, phone, location, bio, avatar_url, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'location',
        new.raw_user_meta_data->>'bio',
        new.raw_user_meta_data->>'avatar_url',
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = COALESCE(EXCLUDED.name, public.profiles.name),
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        location = COALESCE(EXCLUDED.location, public.profiles.location),
        bio = COALESCE(EXCLUDED.bio, public.profiles.bio),
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
