export type CategorySlug =
  | 'electronics'
  | 'phones'
  | 'computers'
  | 'gaming'
  | 'vehicles'
  | 'bikes'
  | 'furniture'
  | 'clothing'
  | 'books'
  | 'sports'
  | 'home-garden'
  | 'other';

export interface Category {
  id: CategorySlug;
  name: string;
  icon: string;
  description: string;
  subcategories?: string[];
  count?: number;
}

export type ItemCondition = 'Brand New' | 'Like New' | 'Excellent' | 'Good' | 'Fair';

export type ListingStatus = 
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'sold'
  | 'removed'
  | 'active'; // Legacy compatibility for approved

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  role?: 'user' | 'admin';
  is_suspended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  storage_path?: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  slug?: string;
  description: string;
  price: number;
  category: CategorySlug;
  subcategory?: string | null;
  condition: ItemCondition;
  location: string;
  phone?: string | null;
  status: ListingStatus;
  views: number;
  moderation_notes?: string | null;
  moderation_score?: number;
  created_at: string;
  updated_at?: string;
}

export interface ListingWithDetails extends Listing {
  images: ListingImage[];
  seller?: Profile | null;
  is_favorite?: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export type ReportReason =
  | 'Scam or fraud'
  | 'Fake listing'
  | 'Prohibited item'
  | 'Illegal item'
  | 'Counterfeit item'
  | 'Dangerous item'
  | 'Stolen item'
  | 'Misleading information'
  | 'Inappropriate content'
  | 'Suspicious seller'
  | 'Other';

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: ReportReason | string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  listing?: ListingWithDetails | null;
  reporter?: Profile | null;
}

export interface FilterOptions {
  query?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  sellerId?: string;
  excludeId?: string;
  sortBy?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'popular';
  includePending?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedListings {
  items: ListingWithDetails[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ModerationResult {
  status: 'approved' | 'pending' | 'rejected';
  score: number; // 0 - 100 risk score
  publicMessage: string;
  internalFlags: string[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile | null;
}

export interface Conversation {
  id: string;
  listing_id?: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface ConversationWithDetails extends Conversation {
  listing?: ListingWithDetails | null;
  buyer?: Profile | null;
  seller?: Profile | null;
  last_message?: Message | null;
  unread_count: number;
}

export interface RecentlyViewedItem {
  id: string;
  user_id?: string;
  listing_id: string;
  viewed_at: string;
  listing?: ListingWithDetails | null;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'new_message' | 'price_drop' | 'listing_approved' | 'listing_rejected' | 'item_sold' | 'system';
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}
