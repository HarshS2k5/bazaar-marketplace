import { FilterOptions, ListingWithDetails, Profile, Report } from '@/types';
import { INITIAL_LISTINGS, SEED_PROFILES } from './mock-data';
import { createClient as createBrowserSupabase } from '@/lib/supabase/client';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('placeholder') && !url.includes('your-supabase'));
}

// In-memory cache for development/offline fallback state
let fallbackListings: ListingWithDetails[] = [...INITIAL_LISTINGS];
let fallbackFavorites: { [userId: string]: Set<string> } = {
  'test-user': new Set<string>(['a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d']),
};
let fallbackReports: Report[] = [];

/**
 * Fetch listings with optional search, category, price, condition and sort filters
 */
export async function getListings(filters: FilterOptions = {}): Promise<ListingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      let query = supabase
        .from('listings')
        .select(`
          *,
          seller:profiles(*),
          images:listing_images(*)
        `)
        .eq('status', 'active');

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
        // Search title or description
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
        return data as unknown as ListingWithDetails[];
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back:', e);
    }
  }

  // Fallback filter implementation
  let results = [...fallbackListings].filter((item) => item.status === 'active');

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

  return results;
}

/**
 * Fetch a single listing by ID or Slug
 */
export async function getListingById(idOrSlug: string): Promise<ListingWithDetails | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      
      // Try by ID first, then slug
      let query = supabase
        .from('listings')
        .select(`
          *,
          seller:profiles(*),
          images:listing_images(*)
        `);

      if (idOrSlug.includes('-') && idOrSlug.length >= 32) {
        query = query.eq('id', idOrSlug);
      } else {
        query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        // Increment views
        try {
          await supabase.from('listings').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
        } catch {}
        return data as unknown as ListingWithDetails;
      }
    } catch (e) {
      console.warn('Supabase getListingById failed, trying fallback:', e);
    }
  }

  // Fallback search
  const found = fallbackListings.find(
    (item) =>
      item.id === idOrSlug ||
      item.slug === idOrSlug ||
      (item.slug && item.slug.endsWith(idOrSlug)) ||
      item.id.startsWith(idOrSlug)
  );

  if (found) {
    found.views += 1;
    return found;
  }
  return null;
}

/**
 * Fetch listings by seller ID
 */
export async function getSellerListings(sellerId: string): Promise<ListingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          images:listing_images(*)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as unknown as ListingWithDetails[];
      }
    } catch (e) {
      console.warn('Supabase getSellerListings error:', e);
    }
  }

  return fallbackListings.filter((item) => item.seller_id === sellerId);
}

/**
 * Create listing
 */
export async function createListing(
  listingData: Omit<ListingWithDetails, 'id' | 'created_at' | 'views'>,
  imageUrls: string[]
): Promise<ListingWithDetails> {
  const newId = crypto.randomUUID();
  const createdDate = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          id: newId,
          seller_id: listingData.seller_id,
          title: listingData.title,
          slug: listingData.slug || `${listingData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${newId.slice(0, 8)}`,
          description: listingData.description,
          price: listingData.price,
          category: listingData.category,
          condition: listingData.condition,
          location: listingData.location,
          phone: listingData.phone,
          status: 'active',
          views: 0,
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

      return await getListingById(newId) || {
        ...listing,
        images: imageUrls.map((url, idx) => ({
          id: `img-${newId}-${idx}`,
          listing_id: newId,
          image_url: url,
          is_primary: idx === 0,
          sort_order: idx,
        })),
      };
    } catch (e: any) {
      console.error('Supabase createListing error:', e);
      throw e;
    }
  }

  // Fallback creation
  const createdListing: ListingWithDetails = {
    ...listingData,
    id: newId,
    views: 0,
    created_at: createdDate,
    images: imageUrls.map((url, idx) => ({
      id: `img-${newId}-${idx}`,
      listing_id: newId,
      image_url: url,
      is_primary: idx === 0,
      sort_order: idx,
    })),
  };

  fallbackListings.unshift(createdListing);
  return createdListing;
}

/**
 * Update listing
 */
export async function updateListing(
  id: string,
  updateData: Partial<ListingWithDetails>,
  newImages?: string[]
): Promise<ListingWithDetails | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase
        .from('listings')
        .update({
          title: updateData.title,
          description: updateData.description,
          price: updateData.price,
          category: updateData.category,
          condition: updateData.condition,
          location: updateData.location,
          phone: updateData.phone,
          status: updateData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw new Error(error.message);

      if (newImages && newImages.length > 0) {
        // Delete previous and insert new
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
    const updated: ListingWithDetails = {
      ...existing,
      ...updateData,
      updated_at: new Date().toISOString(),
    };
    if (newImages) {
      updated.images = newImages.map((url, idx) => ({
        id: `img-${id}-${idx}`,
        listing_id: id,
        image_url: url,
        is_primary: idx === 0,
        sort_order: idx,
      }));
    }
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
 * Toggle listing favorite
 */
export async function toggleFavorite(listingId: string, userId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      // Check if already favorited
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

/**
 * Check if a listing is favorited
 */
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

/**
 * Get user favorites
 */
export async function getUserFavorites(userId: string): Promise<ListingWithDetails[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          listing:listings(
            *,
            seller:profiles(*),
            images:listing_images(*)
          )
        `)
        .eq('user_id', userId);

      if (!error && data) {
        return data.map((d: any) => d.listing).filter(Boolean);
      }
    } catch (e) {
      console.warn('Supabase getUserFavorites error:', e);
    }
  }

  const favSet = fallbackFavorites[userId] || new Set<string>();
  return fallbackListings.filter((l) => favSet.has(l.id));
}

/**
 * Submit report
 */
export async function createReport(
  reporterId: string,
  listingId: string,
  reason: string,
  description: string
): Promise<Report> {
  const newReport: Report = {
    id: crypto.randomUUID(),
    reporter_id: reporterId,
    listing_id: listingId,
    reason,
    description,
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

  fallbackReports.push(newReport);
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
    reporter: SEED_PROFILES[0],
  }));
}
