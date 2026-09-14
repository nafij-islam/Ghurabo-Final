import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Bangladesh Travel Photos & Community Gallery | Ghurabo',
  description:
    'Explore travel photos, destinations and real journeys shared by the Ghurabo travel community across Bangladesh and beyond.',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Bangladesh Travel Photos & Community Gallery | Ghurabo',
    description:
      'Explore travel photos, destinations and real journeys shared by the Ghurabo travel community across Bangladesh and beyond.',
    url: `${siteConfig.siteUrl}/gallery`,
    type: 'website',
    images: [
      {
        url: `${siteConfig.siteUrl}${siteConfig.defaultOgImage}`,
        width: 1200,
        height: 630,
        alt: 'Bangladesh Travel Photos & Community Gallery - Ghurabo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bangladesh Travel Photos & Community Gallery | Ghurabo',
    description:
      'Explore travel photos, destinations and real journeys shared by the Ghurabo travel community across Bangladesh and beyond.',
    images: [`${siteConfig.siteUrl}${siteConfig.defaultOgImage}`],
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
