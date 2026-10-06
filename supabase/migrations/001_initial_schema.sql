-- ========================================================
-- BAZAAR MARKETPLACE - POSTGRESQL & SUPABASE INITIAL SCHEMA
-- Complete schema with tables, constraints, indexes, triggers & RLS
-- ========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. PROFILES TABLE
-- Mirrors Supabase auth.users and holds public profile metadata
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to automatically create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, phone, location, avatar_url, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'location',
        new.raw_user_meta_data->>'avatar_url',
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Excellent', 'Good', 'Fair')),
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived')),
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. LISTING IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, listing_id)
);

-- 5. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location);

-- Full text search index on title, description and location
CREATE INDEX IF NOT EXISTS idx_listings_search ON public.listings 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || location));

CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON public.listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_sort_order ON public.listing_images(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON public.reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- LISTINGS POLICIES
CREATE POLICY "Active listings are viewable by everyone" 
    ON public.listings FOR SELECT 
    USING (
        status = 'active' 
        OR auth.uid() = seller_id 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Authenticated users can create listings" 
    ON public.listings FOR INSERT 
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" 
    ON public.listings FOR UPDATE 
    USING (
        auth.uid() = seller_id 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can delete their own listings" 
    ON public.listings FOR DELETE 
    USING (
        auth.uid() = seller_id 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- LISTING IMAGES POLICIES
CREATE POLICY "Images are viewable by everyone" 
    ON public.listing_images FOR SELECT 
    USING (true);

CREATE POLICY "Sellers can insert images for their listings" 
    ON public.listing_images FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = listing_id AND seller_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can update images for their listings" 
    ON public.listing_images FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = listing_id AND seller_id = auth.uid()
        )
    );

CREATE POLICY "Sellers can delete images for their listings" 
    ON public.listing_images FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = listing_id AND seller_id = auth.uid()
        )
    );

-- FAVORITES POLICIES
CREATE POLICY "Users can view their own favorites" 
    ON public.favorites FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
    ON public.favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites" 
    ON public.favorites FOR DELETE 
    USING (auth.uid() = user_id);

-- REPORTS POLICIES
CREATE POLICY "Authenticated users can submit reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins or reporters can view reports" 
    ON public.reports FOR SELECT 
    USING (
        auth.uid() = reporter_id 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Only admins can update reports" 
    ON public.reports FOR UPDATE 
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ========================================================
-- STORAGE BUCKET CONFIGURATION
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for listing-images
CREATE POLICY "Public Access to listing images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (
        bucket_id = 'listing-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update and delete their uploaded images" 
    ON storage.objects FOR DELETE 
    USING (
        bucket_id = 'listing-images' 
        AND auth.uid() = owner
    );
