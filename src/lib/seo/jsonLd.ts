/**
 * Structured Data (JSON-LD) Generators & Safe Serializer
 */

import { siteConfig } from '@/config/site';
import { ITrip, IUser } from '@/types';
import { sanitizePlainText, truncateText } from './sanitize';

/**
 * Safely serialize JSON-LD to prevent XSS script tag breakout
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Organization Schema for Ghurabo (Homepage / About)
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/logo.png`,
    description: siteConfig.description,
  };
}

/**
 * WebSite Schema for Ghurabo Homepage
 */
export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    description: siteConfig.description,
    inLanguage: 'en-BD',
  };
}

/**
 * BreadcrumbList Schema
 */
export function getBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.siteUrl}${item.url}`,
    })),
  };
}

/**
 * Article / BlogPosting Schema for Public Approved Trips
 */
export function getTripArticleJsonLd(trip: ITrip) {
  const tripUrl = `${siteConfig.siteUrl}/trips/${trip.slug}`;
  const authorUrl = `${siteConfig.siteUrl}/profile/${encodeURIComponent(trip.authorUsername || trip.userName)}`;
  const description = truncateText(trip.summary || trip.story || '', 160);

  const images: string[] = [];
  if (trip.coverImage) {
    images.push(trip.coverImage);
  }
  if (Array.isArray(trip.images)) {
    trip.images.forEach((img) => {
      if (img.url && !images.includes(img.url)) {
        images.push(img.url);
      }
    });
  }
  if (images.length === 0) {
    images.push(`${siteConfig.siteUrl}${siteConfig.defaultOgImage}`);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': tripUrl,
    },
    headline: sanitizePlainText(trip.title),
    description,
    image: images,
    datePublished: trip.createdAt,
    dateModified: (trip as unknown as { updatedAt?: string }).updatedAt || trip.createdAt,
    author: {
      '@type': 'Person',
      name: sanitizePlainText(trip.userName),
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.siteUrl}/logo.png`,
      },
    },
    articleSection: trip.travelType ? `${trip.travelType} Travel` : 'Travel Guide',
    keywords: [
      trip.destinationName,
      `${trip.destinationName} travel guide`,
      `${trip.travelType} tour Bangladesh`,
      'Bangladesh travel community',
    ].filter(Boolean),
  };
}

/**
 * ProfilePage Schema for Public Traveler Profiles
 */
export function getProfilePageJsonLd(user: IUser) {
  const profileUrl = `${siteConfig.siteUrl}/profile/${encodeURIComponent(user.id || user.name)}`;
  const description = user.bio
    ? sanitizePlainText(user.bio)
    : `Explore trips and travel stories shared by ${user.name} on the Ghurabo travel community.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: sanitizePlainText(user.name),
      description,
      image: user.avatar || `${siteConfig.siteUrl}/logo.png`,
      url: profileUrl,
      ...(user.location ? { homeLocation: { '@type': 'Place', name: user.location } } : {}),
    },
  };
}
