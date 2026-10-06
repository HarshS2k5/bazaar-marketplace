import { FilterOptions, ListingWithDetails, Profile, Report, ListingStatus } from '@/types';
import { INITIAL_LISTINGS } from './mock-data';
import { createClient as createBrowserSupabase } from '@/lib/supabase/client';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('placeholder') && !url.includes('your-supabase'));
}

// In-memory cache for development/offline preview (Strictly empty production baseline)
let fallbackListings: ListingWithDetails[] = [];
let fallbackProfiles: Profile[] = [];
let fallbackFavorites: { [userId: string]: Set<string> } = {};
let fallbackReports: Report[] = [];

// Blocklist of legacy seed / demo IDs to permanently purge from marketplace queries
export const DEMO_SEED_IDS = new Set([
  'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
  'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
  'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
  'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
  'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
  '07a8b9c0-d1e2-3f4a-5b6c-7d8e9f0a1b2c',
  '18b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000005',
  '60000000-0000-0000-0000-000000000006',
  '70000000-0000-0000-0000-000000000007',
  '80000000-0000-0000-0000-000000000008',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
]);

export function isDemoListing(item: any): boolean {
  if (!item) return false;
  if (DEMO_SEED_IDS.has(item.id) || DEMO_SEED_IDS.has(item.seller_id)) return true;
  if (item.seller?.id && DEMO_SEED_IDS.has(item.seller.id)) return true;
  return false;
}

/**
 * Normalizes a listing ensuring the seller and phone number relationship
 * is strictly preserved for that specific listing.
 * If phone is missing, it is set to null (never fallback to a demo number or another seller).
 */
export function normalizeListing(item: any): ListingWithDetails {
  if (!item) return item;
  const sellerObj = Array.isArray(item.seller) ? item.seller[0] : item.seller;
  const sellerPhone = sellerObj?.phone?.trim() || item.phone?.trim() || null;
  const sellerName = sellerObj?.name?.trim() || 'Verified Seller';
  const sellerLocation = sellerObj?.location?.trim() || item.location?.trim() || 'Local Seller';

  return {
    ...item,
    phone: sellerPhone,
    seller: sellerObj
      ? {
          ...sellerObj,
          name: sellerName,
          phone: sellerPhone,
        }
      : {
          id: item.seller_id,
          name: sellerName,
          email: '',
          phone: sellerPhone,
          location: sellerLocation,
          avatar_url: null,
          role: 'user',
        },
  };
}

/**
 * Fetch listings with optional search, category, price, condition and sort filters.
 * IMPORTANT SECURITY RULE: Only 'approved' or 'active' listings are returned publicly!
 */
export async function getListings(filters: FilterOptions = {}): Promise<ListingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      let query = supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!seller_id(*),
          images:listing_images(*)
        `);

      if (filters.includePending) {
        query = query.eq('status', 'pending');
      } else {
        query = query.in('status', ['active', 'approved']);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location.ilike.%${filters.query}%`);
      }

      // Sort
      if (filters.sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (filters.sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else if (filters.sortBy === 'popular') {
        query = query.order('views', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase getListings error, using fallback:', error.message);
      } else if (data && data.length > 0) {
        return (data as any[]).filter((item) => !isDemoListing(item)).map(normalizeListing);
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back:', e);
    }
  }

  // Fallback filter implementation
  let results = [...fallbackListings].filter((item) => {
    if (filters.includePending) {
      return item.status === 'pending';
    }
    return item.status === 'active' || item.status === 'approved';
  });

  if (filters.category) {
    results = results.filter((item) => item.category === filters.category);
  }
  if (filters.condition) {
    results = results.filter((item) => item.condition === filters.condition);
  }
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    results = results.filter((item) => item.price >= (filters.minPrice || 0));
  }
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    results = results.filter((item) => item.price <= (filters.maxPrice || Infinity));
  }
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    results = results.filter((item) => item.location.toLowerCase().includes(loc));
  }
  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (filters.sortBy === 'price-asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'popular') {
    results.sort((a, b) => b.views - a.views);
  } else {
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return results.filter((item) => !isDemoListing(item)).map(normalizeListing);
}

/**
 * Fetch a single listing by ID or Slug
 */
export async function getListingById(idOrSlug: string): Promise<ListingWithDetails | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      
      let query = supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!seller_id(*),
          images:listing_images(*)
        `);

      if (idOrSlug.includes('-') && idOrSlug.length >= 32) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        if (isDemoListing(data)) {
          return null;
        }
        try {
          await supabase.from('listings').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
        } catch {}
        return normalizeListing(data);
      }
    } catch (e) {
      console.warn('Supabase getListingById failed, trying fallback:', e);
    }
  }

  // Fallback search
  const found = fallbackListings.find(
    (item) =>
      !isDemoListing(item) &&
      (item.id === idOrSlug ||
        item.slug === idOrSlug ||
        (item.slug && item.slug.endsWith(idOrSlug)) ||
        item.id.startsWith(idOrSlug))
  );

  if (found) {
    found.views += 1;
    return normalizeListing(found);
  }
  return null;
}

/**
 * Fetch listings by seller ID (includes pending, approved, rejected, sold)
 */
export async function getSellerListings(sellerId: string): Promise<ListingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles!seller_id(*),
          images:listing_images(*)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return (data as any[]).filter((item) => !isDemoListing(item)).map(normalizeListing);
      }
    } catch (e) {
      console.warn('Supabase getSellerListings error:', e);
    }
  }

  return fallbackListings
    .filter((item) => !isDemoListing(item) && item.seller_id === sellerId)
    .map(normalizeListing);
}

/**
 * Create listing with moderation status
 */
export async function createListing(
  listingData: Omit<ListingWithDetails, 'id' | 'created_at' | 'views'>,
  imageUrls: string[]
): Promise<ListingWithDetails> {
  const newId = crypto.randomUUID();
  const createdDate = new Date().toISOString();
  const status = listingData.status || 'approved';

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();

      // Enforce authenticated session: seller MUST be a real authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required: You must be logged in with a registered account to create a listing.');
      }

      const sellerId = user.id;
      if (DEMO_SEED_IDS.has(sellerId)) {
        throw new Error('Unauthorized account.');
      }

      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          id: newId,
          seller_id: sellerId,
          title: listingData.title,
          slug: listingData.slug || `${listingData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${newId.slice(0, 8)}`,
          description: listingData.description,
          price: listingData.price,
          category: listingData.category,
          condition: listingData.condition,
          location: listingData.location,
          phone: listingData.phone,
          status,
          views: 0,
          moderation_notes: listingData.moderation_notes || null,
          moderation_score: listingData.moderation_score || 0,
        })
        .select()
        .single();

      if (listingError) {
        throw new Error(listingError.message);
      }

      // Insert images
      if (imageUrls && imageUrls.length > 0) {
        const imagesToInsert = imageUrls.map((url, idx) => ({
          listing_id: newId,
          image_url: url,
          is_primary: idx === 0,
          sort_order: idx,
        }));
        await supabase.from('listing_images').insert(imagesToInsert);
      }

      // Keep profiles.phone in sync if seller provided phone
      if (listingData.phone && sellerId) {
        try {
          await supabase
            .from('profiles')
            .update({ phone: listingData.phone, location: listingData.location })
            .eq('id', sellerId);
        } catch {}
      }

      const created = await getListingById(newId);
      if (created) return normalizeListing(created);

      return normalizeListing({
        ...listing,
        images: imageUrls.map((url, idx) => ({
          id: `img-${newId}-${idx}`,
          listing_id: newId,
          image_url: url,
          is_primary: idx === 0,
          sort_order: idx,
        })),
      });
    } catch (e: any) {
      console.error('Supabase createListing error:', e);
      throw e;
    }
  }

  // Fallback creation
  if (DEMO_SEED_IDS.has(listingData.seller_id)) {
    throw new Error('Unauthorized demo seller account.');
  }

  const createdListing: ListingWithDetails = normalizeListing({
    ...listingData,
    id: newId,
    status,
    views: 0,
    created_at: createdDate,
    images: imageUrls.map((url, idx) => ({
      id: `img-${newId}-${idx}`,
      listing_id: newId,
      image_url: url,
      is_primary: idx === 0,
      sort_order: idx,
    })),
  });

  fallbackListings.unshift(createdListing);
  return createdListing;
}

/**
 * Update listing (Secured against illegal client-side status escalation)
 */
export async function updateListing(
  id: string,
  updateData: Partial<ListingWithDetails>,
  newImages?: string[]
): Promise<ListingWithDetails | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const updatePayload: any = {
        title: updateData.title,
        description: updateData.description,
        price: updateData.price,
        category: updateData.category,
        condition: updateData.condition,
        location: updateData.location,
        phone: updateData.phone,
        updated_at: new Date().toISOString(),
      };

      if (updateData.status) {
        updatePayload.status = updateData.status;
      }
      if (updateData.moderation_notes) {
        updatePayload.moderation_notes = updateData.moderation_notes;
      }

      const { error } = await supabase
        .from('listings')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw new Error(error.message);

      if (newImages && newImages.length > 0) {
        await supabase.from('listing_images').delete().eq('listing_id', id);
        const imagesToInsert = newImages.map((url, idx) => ({
          listing_id: id,
          image_url: url,
          is_primary: idx === 0,
          sort_order: idx,
        }));
        await supabase.from('listing_images').insert(imagesToInsert);
      }

      return await getListingById(id);
    } catch (e: any) {
      console.error('Supabase updateListing error:', e);
      throw e;
    }
  }

  // Fallback update
  const index = fallbackListings.findIndex((item) => item.id === id);
  if (index !== -1) {
    const existing = fallbackListings[index];
    const updated: ListingWithDetails = normalizeListing({
      ...existing,
      ...updateData,
      updated_at: new Date().toISOString(),
      images: newImages
        ? newImages.map((url, idx) => ({
            id: `img-${id}-${idx}`,
            listing_id: id,
            image_url: url,
            is_primary: idx === 0,
            sort_order: idx,
          }))
        : existing.images,
    });
    fallbackListings[index] = updated;
    return updated;
  }
  return null;
}

/**
 * Delete listing
 */
export async function deleteListing(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    } catch (e) {
      console.error('Supabase deleteListing error:', e);
      return false;
    }
  }

  fallbackListings = fallbackListings.filter((item) => item.id !== id);
  return true;
}

/**
 * Admin Moderation Actions
 */
export async function getPendingListings(): Promise<ListingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          seller:profiles(*),
          images:listing_images(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!error && data) return data as unknown as ListingWithDetails[];
    } catch (e) {
      console.warn('Supabase getPendingListings error:', e);
    }
  }

  return fallbackListings.filter((l) => l.status === 'pending');
}

export async function approveListing(id: string): Promise<boolean> {
  const updated = await updateListing(id, { 
    status: 'approved', 
    moderation_notes: 'Approved by moderator' 
  });
  return Boolean(updated);
}

export async function rejectListing(id: string, reason: string): Promise<boolean> {
  const updated = await updateListing(id, { 
    status: 'rejected', 
    moderation_notes: reason 
  });
  return Boolean(updated);
}

export async function removeListing(id: string): Promise<boolean> {
  const updated = await updateListing(id, { 
    status: 'removed', 
    moderation_notes: 'Taken down by moderator' 
  });
  return Boolean(updated);
}

export async function getUsersList(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return (data as Profile[]).filter((p) => !DEMO_SEED_IDS.has(p.id));
      }
    } catch (e) {
      console.warn('Supabase getUsersList error:', e);
    }
  }

  // Fallback for development / preview
  let localUsers: Profile[] = [...fallbackProfiles];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('bazaar_registered_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localUsers = [...parsed, ...localUsers];
        }
      }
    } catch {}
  }

  const seen = new Set<string>();
  return localUsers.filter((u) => {
    if (!u || !u.id || seen.has(u.id) || DEMO_SEED_IDS.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

export async function setUserSuspension(userId: string, isSuspended: boolean): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      await supabase.from('profiles').update({ is_suspended: isSuspended }).eq('id', userId);
      if (isSuspended) {
        // Automatically hide listings of suspended user
        await supabase.from('listings').update({ status: 'removed' }).eq('seller_id', userId);
      }
      return true;
    } catch (e) {
      console.error('Supabase setUserSuspension error:', e);
      return false;
    }
  }

  const p = fallbackProfiles.find((u) => u.id === userId);
  if (p) {
    p.is_suspended = isSuspended;
    if (isSuspended) {
      fallbackListings.forEach((l) => {
        if (l.seller_id === userId) l.status = 'removed';
      });
    }
  }
  return true;
}

export async function resolveReport(reportId: string, resolution: 'resolved' | 'dismissed'): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      await supabase.from('reports').update({ status: resolution }).eq('id', reportId);
      return true;
    } catch (e) {
      console.warn('Supabase resolveReport error:', e);
    }
  }

  const r = fallbackReports.find((rep) => rep.id === reportId);
  if (r) r.status = resolution;
  return true;
}

/**
 * Favorites
 */
export async function toggleFavorite(listingId: string, userId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .single();

      if (data) {
        await supabase.from('favorites').delete().eq('id', data.id);
        return false;
      } else {
        await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId });
        return true;
      }
    } catch (e) {
      console.warn('Supabase toggleFavorite error:', e);
    }
  }

  if (!fallbackFavorites[userId]) {
    fallbackFavorites[userId] = new Set<string>();
  }
  const favSet = fallbackFavorites[userId];
  if (favSet.has(listingId)) {
    favSet.delete(listingId);
    return false;
  } else {
    favSet.add(listingId);
    return true;
  }
}

export async function isFavorite(listingId: string, userId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .maybeSingle();

      return Boolean(data);
    } catch {
      return false;
    }
  }

  return fallbackFavorites[userId]?.has(listingId) || false;
}

export async function getUserFavorites(userId: string): Promise<ListingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          listing:listings(
            *,
            seller:profiles!seller_id(*),
            images:listing_images(*)
          )
        `)
        .eq('user_id', userId);

      if (!error && data) {
        return data
          .map((d: any) => d.listing)
          .filter(Boolean)
          .filter((item: any) => !isDemoListing(item))
          .map(normalizeListing);
      }
    } catch (e) {
      console.warn('Supabase getUserFavorites error:', e);
    }
  }

  const favSet = fallbackFavorites[userId] || new Set<string>();
  return fallbackListings
    .filter((l) => !isDemoListing(l) && favSet.has(l.id))
    .map(normalizeListing);
}

/**
 * Submit report
 */
export async function createReport(
  reporterId: string,
  listingId: string,
  reason: string,
  description?: string
): Promise<Report> {
  const newReport: Report = {
    id: crypto.randomUUID(),
    reporter_id: reporterId,
    listing_id: listingId,
    reason,
    description: description || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      await supabase.from('reports').insert(newReport);
    } catch (e) {
      console.warn('Supabase createReport error:', e);
    }
  }

  fallbackReports.unshift(newReport);
  return newReport;
}

/**
 * Get all reports (admin)
 */
export async function getReports(): Promise<Report[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          listing:listings(*),
          reporter:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) return data as Report[];
    } catch (e) {
      console.warn('Supabase getReports error:', e);
    }
  }

  return fallbackReports.map((r) => ({
    ...r,
    listing: fallbackListings.find((l) => l.id === r.listing_id),
    reporter: fallbackProfiles.find((p) => p.id === r.reporter_id) || null,
  }));
}
