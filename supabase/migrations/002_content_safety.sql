-- ========================================================
-- BAZAAR MARKETPLACE - CONTENT SAFETY & MODERATION MIGRATION
-- Adds moderation columns, status constraints & anti-tamper RLS
-- ========================================================

-- 1. Extend profiles with suspension flag
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

-- 2. Extend listings with moderation metadata
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderation_score INTEGER NOT NULL DEFAULT 0;

-- 3. Update status constraint to include full moderation lifecycle
ALTER TABLE public.listings 
DROP CONSTRAINT IF EXISTS listings_status_check;

ALTER TABLE public.listings 
ADD CONSTRAINT listings_status_check 
CHECK (status IN ('active', 'approved', 'pending', 'rejected', 'sold', 'removed'));

-- 4. Update listings index for performance
CREATE INDEX IF NOT EXISTS idx_listings_moderation_status ON public.listings(status, moderation_score);

-- ========================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES FOR SAFETY
-- ========================================================

-- Drop old listing select policy to enforce moderation
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;

-- New select policy: ONLY 'active' or 'approved' listings are public!
CREATE POLICY "Public can only view approved active listings"
    ON public.listings FOR SELECT
    USING (
        (status IN ('active', 'approved') AND (
            SELECT is_suspended FROM public.profiles WHERE id = seller_id
        ) = false)
        OR auth.uid() = seller_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Block suspended users from inserting new listings
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;
CREATE POLICY "Non-suspended users can create listings"
    ON public.listings FOR INSERT
    WITH CHECK (
        auth.uid() = seller_id
        AND (SELECT COALESCE(is_suspended, false) FROM public.profiles WHERE id = auth.uid()) = false
    );

-- Anti-tampering update policy: Users can only edit their own listings and CANNOT self-escalate to 'approved'
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
CREATE POLICY "Users can update own listings safely"
    ON public.listings FOR UPDATE
    USING (
        (
            auth.uid() = seller_id 
            AND (SELECT COALESCE(is_suspended, false) FROM public.profiles WHERE id = auth.uid()) = false
        )
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        -- If user is NOT admin, they cannot escalate rejected/pending items directly to approved
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        OR (auth.uid() = seller_id AND status != 'approved')
    );

-- Anti-tampering delete policy
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
CREATE POLICY "Users can delete their own listings"
    ON public.listings FOR DELETE
    USING (
        auth.uid() = seller_id
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Block suspended users from creating reports
DROP POLICY IF EXISTS "Authenticated users can submit reports" ON public.reports;
CREATE POLICY "Non-suspended users can submit reports"
    ON public.reports FOR INSERT
    WITH CHECK (
        auth.uid() = reporter_id
        AND (SELECT COALESCE(is_suspended, false) FROM public.profiles WHERE id = auth.uid()) = false
    );
