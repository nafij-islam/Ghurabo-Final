import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { tripsApi } from '@/lib/api/trips.api';

/**
 * Dynamic Scalable Sitemap Generator (Phases 36-38, 71, 72)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl;

  // 1. Legitimate Public Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/trips`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Dynamic Approved Public Trips
  const dynamicTripRoutes: MetadataRoute.Sitemap = [];
  const authorUsernames = new Set<string>();

  try {
    const res = await tripsApi.getTrips({
      limit: 100,
    });

    if (res?.data && Array.isArray(res.data)) {
      for (const trip of res.data) {
        // Phase 32: Only approved public trips belong in the sitemap
        const status = (trip as unknown as { status?: string }).status || 'approved';
        if (status !== 'approved') continue;

        const slug = trip.slug;
        if (!slug) continue;

        // Phase 71: Use real updatedAt / publishedAt / createdAt date
        const rawDate =
          (trip as unknown as { updatedAt?: string }).updatedAt ||
          (trip as unknown as { publishedAt?: string }).publishedAt ||
          trip.createdAt;
        const lastModified = rawDate ? new Date(rawDate) : undefined;

        dynamicTripRoutes.push({
          url: `${baseUrl}/trips/${encodeURIComponent(slug)}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: (trip as unknown as { isFeatured?: boolean }).isFeatured ? 0.9 : 0.8,
        });

        // Collect public author usernames for creator discovery (Phase 37)
        const authorName =
          (trip as unknown as { authorUsername?: string }).authorUsername ||
          (typeof trip.author === 'object' && trip.author !== null
            ? (trip.author as { username?: string }).username
            : undefined);

        if (authorName && typeof authorName === 'string' && authorName.trim()) {
          authorUsernames.add(authorName.trim());
        }
      }
    }
  } catch (err) {
    console.error('[Sitemap] Failed to fetch trips for sitemap:', err);
  }

  // 3. Discovered Public Author Profiles
  const profileRoutes: MetadataRoute.Sitemap = Array.from(authorUsernames).map((username) => ({
    url: `${baseUrl}/profile/${encodeURIComponent(username)}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...dynamicTripRoutes, ...profileRoutes];
}
