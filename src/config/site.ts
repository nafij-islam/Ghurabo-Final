/**
 * Ghurabo Site & SEO Configuration
 */

const getSiteUrl = (): string => {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.ghurabo.com';
  }
  return 'http://localhost:3000';
};

export const siteConfig = {
  name: 'Ghurabo',
  siteUrl: getSiteUrl(),
  title: 'Ghurabo | Bangladesh Travel Community & Trip Guides',
  titleTemplate: '%s | Ghurabo',
  description:
    'Explore Bangladesh with real traveler stories, budget breakdowns, trip itineraries, travel tips and community guides. Discover and share your journeys with Ghurabo.',
  locale: 'en_BD',
  defaultOgImage: '/ghurabo-og.png',
  keywords: [
    'Bangladesh travel',
    'Bangladesh travel guide',
    'Bangladesh tour',
    'Bangladesh trips',
    'travel stories',
    'trip itineraries',
    'budget travel Bangladesh',
    'trip costs',
    'travel tips',
    'solo travel Bangladesh',
    'couple trip Bangladesh',
    'family tour Bangladesh',
    'Coxs Bazar travel guide',
    'Sajek Valley tour',
    'Saint Martin tour plan',
    'Sylhet travel guide',
    'Sreemangal trip',
    'Bandarban tour',
  ],
};

export type SiteConfig = typeof siteConfig;
