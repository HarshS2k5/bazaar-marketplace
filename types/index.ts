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
  count?: number;
}

export type ItemCondition = 'Brand New' | 'Like New' | 'Excellent' | 'Good' | 'Fair';

export type ListingStatus = 'active' | 'sold' | 'archived';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  role?: 'user' | 'admin';
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
  condition: ItemCondition;
  location: string;
  phone: string;
  status: ListingStatus;
  views: number;
  created_at: string;
  updated_at?: string;
}

export interface ListingWithDetails extends Listing {
  images: ListingImage[];
  seller?: Profile;
  is_favorite?: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  listing?: Listing;
  reporter?: Profile;
}

export interface FilterOptions {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}
