import { createClient as createBrowserSupabase } from '@/lib/supabase/client';
import { isSupabaseConfigured, getListingById, normalizeListing, isDemoListing } from './listings';
import { ListingWithDetails } from '@/types';

const STORAGE_KEY = 'bazaar_recently_viewed';
const MAX_RECENT_ITEMS = 20;

interface StoredRecent {
  listingId: string;
  viewedAt: string;
}

function getLocalRecent(): StoredRecent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item.listingId === 'string');
    }
  } catch {}
  return [];
}

function saveLocalRecent(items: StoredRecent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT_ITEMS)));
  } catch {}
}

/**
 * Record a listing view for the user (guest or authenticated)
 */
export async function addRecentlyViewed(listingId: string, userId?: string): Promise<void> {
  if (!listingId) return;

  const now = new Date().toISOString();

  // 1. Update local storage (works for guests & logged in)
  const local = getLocalRecent();
  const filtered = local.filter((item) => item.listingId !== listingId);
  filtered.unshift({ listingId, viewedAt: now });
  saveLocalRecent(filtered);

  // 2. If authenticated & Supabase configured, persist to database
  if (userId && isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      // Delete existing entry to avoid duplicate key conflicts, then insert fresh timestamp
      await supabase
        .from('recently_viewed')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);

      await supabase.from('recently_viewed').insert({
        user_id: userId,
        listing_id: listingId,
        viewed_at: now,
      });
    } catch (e) {
      // Non-critical background telemetry error, ignore silently
    }
  }
}

/**
 * Fetch recently viewed listings for display
 */
export async function getRecentlyViewed(
  userId?: string,
  limit: number = 8
): Promise<ListingWithDetails[]> {
  const listingMap = new Map<string, ListingWithDetails>();

  // 1. If user is logged in, try fetching from Supabase first
  if (userId && isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from('recently_viewed')
        .select(`
          listing_id,
          viewed_at,
          listing:listings(
            *,
            seller:profiles!seller_id(*),
            images:listing_images(*)
          )
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (!error && data) {
        for (const item of data) {
          const l = item.listing as any;
          if (l && (l.status === 'active' || l.status === 'approved') && !isDemoListing(l)) {
            listingMap.set(l.id, normalizeListing(l));
          }
        }
      }
    } catch (e) {
      console.warn('Supabase getRecentlyViewed error:', e);
    }
  }

  // 2. If we need more items or user is guest, fill from localStorage
  if (listingMap.size < limit) {
    const local = getLocalRecent();
    for (const item of local) {
      if (listingMap.size >= limit) break;
      if (!listingMap.has(item.listingId)) {
        try {
          const l = await getListingById(item.listingId);
          if (l && (l.status === 'active' || l.status === 'approved') && !isDemoListing(l)) {
            listingMap.set(l.id, l);
          }
        } catch {}
      }
    }
  }

  return Array.from(listingMap.values()).slice(0, limit);
}

/**
 * Clear recently viewed history
 */
export async function clearRecentlyViewed(userId?: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  if (userId && isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabase();
      await supabase.from('recently_viewed').delete().eq('user_id', userId);
    } catch (e) {
      console.warn('Supabase clearRecentlyViewed error:', e);
    }
  }
}
