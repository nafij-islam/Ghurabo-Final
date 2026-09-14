import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact Ghurabo Team | Ghurabo',
  description:
    'Get in touch with the Ghurabo travel community team for questions, feedback, partnerships, or trip verification.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Ghurabo Team | Ghurabo',
    description:
      'Get in touch with the Ghurabo travel community team for questions, feedback, partnerships, or trip verification.',
    url: `${siteConfig.siteUrl}/contact`,
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
