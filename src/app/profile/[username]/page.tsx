import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProfileViewClient from '@/components/profile/ProfileViewClient';
import { usersApi } from '@/lib/api/users.api';
import { tripsApi } from '@/lib/api/trips.api';
import { adaptBackendPublicProfileToIUser, adaptBackendTripToITrip } from '@/lib/api/adapters';
import { siteConfig } from '@/config/site';
import { sanitizePlainText, truncateText } from '@/lib/seo/sanitize';
import { getProfilePageJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd';
import { ITrip, IUser } from '@/types';

interface ProfilePageProps {
  params: { username: string };
}

/**
 * Dynamic Metadata for Public Traveler Profiles (Phases 23-25)
 */
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const username = params.username;

  try {
    const profile = await usersApi.getPublicProfile(username);
    if (!profile) {
      return {
        title: 'Traveler Profile Not Found | Ghurabo',
        robots: { index: false, follow: false },
      };
    }

    const displayName = profile.fullName || profile.username;
    const title = `${displayName} (@${profile.username}) | Ghurabo`;
    const description =
      truncateText(profile.bio, 160) ||
      `Explore trips and travel stories shared by ${displayName} on the Ghurabo travel community.`;

    const canonicalUrl = `${siteConfig.siteUrl}/profile/${encodeURIComponent(profile.username)}`;
    const avatarUrl = profile.avatar?.url || `${siteConfig.siteUrl}${siteConfig.defaultOgImage}`;

    // Phase 25: Thin Profile Heuristic
    const tripsCount = profile.stats?.tripsCount ?? profile.tripsCount ?? 0;
    const hasMeaningfulContent = tripsCount > 0 || (profile.bio && profile.bio.trim().length > 15);

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'profile',
        title,
        description,
        url: canonicalUrl,
        siteName: siteConfig.name,
        locale: siteConfig.locale,
        images: [
          {
            url: avatarUrl,
            width: 400,
            height: 400,
            alt: `${displayName}'s profile photo`,
          },
        ],
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [avatarUrl],
      },
      robots: {
        index: !!hasMeaningfulContent,
        follow: true,
      },
    };
  } catch {
    return {
      title: `${username} | Ghurabo`,
      description: `Explore traveler profile on the Ghurabo travel community.`,
      robots: { index: false, follow: true },
    };
  }
}

/**
 * Server Component Wrapper for Public Profiles
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const username = params.username;
  let profileUser: IUser | null = null;
  let userTrips: ITrip[] = [];

  try {
    const profileData = await usersApi.getPublicProfile(username);
    if (profileData) {
      profileUser = adaptBackendPublicProfileToIUser(profileData);
      try {
        const tripsRes = await tripsApi.getTrips({
          author: profileData.id || (profileData as unknown as { _id?: string })._id,
          limit: 50,
        });
        if (tripsRes?.data) {
          userTrips = tripsRes.data.map(adaptBackendTripToITrip);
        }
      } catch {
        // Non-blocking
      }
    }
  } catch {
    // If not found, profileViewClient handles fallback/client retry
  }

  const profileJsonLd = profileUser ? getProfilePageJsonLd(profileUser) : null;

  return (
    <>
      {profileJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileJsonLd) }}
        />
      )}
      <ProfileViewClient
        username={username}
        initialProfile={profileUser}
        initialTrips={userTrips}
      />
    </>
  );
}
