import { MetadataRoute } from 'next';
import { getListings } from '@/lib/data/listings';
import { CATEGORIES } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bazaar-marketplace.vercel.app';
  const listings = await getListings();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sell`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${baseUrl}/category/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Listing routes
  const listingRoutes: MetadataRoute.Sitemap = listings.map((item) => ({
    url: `${baseUrl}/listing/${item.slug || item.id}`,
    lastModified: new Date(item.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
