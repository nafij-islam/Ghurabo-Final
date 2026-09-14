import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Dynamic Robots.txt Generator (Phases 39, 88)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/auth',
          '/auth/*',
          '/trips/share',
          '/api',
          '/api/*',
        ],
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
