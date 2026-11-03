import type { MetadataRoute } from 'next';


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dailyessential.ca';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },

    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/admissions', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/library', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/news', priority: 0.6, changeFrequency: 'daily' },
    { path: '/dummi-ai', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/policies', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/access', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/login', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/signup', priority: 0.3, changeFrequency: 'yearly' },
  ];

  return [
    ...staticRoutes.map(route => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
  ];
}
