import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bazaar-marketplace.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/sell', '/reset-password'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
