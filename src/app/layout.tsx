import type { Metadata } from 'next';
import { Oswald, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingSocialBar from '@/components/layout/FloatingSocialBar';
import { PreferencesProvider } from '@/context/PreferencesContext';
import { NewsletterModalProvider } from '@/context/NewsletterModalContext';
import dynamic from 'next/dynamic';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import FloatingShareTripCTA from '@/components/layout/FloatingShareTripCTA';
import { siteConfig } from '@/config/site';

const NewsletterModal = dynamic(() => import('@/components/newsletter/NewsletterModal'), {
  ssr: false,
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: 'Ghurabo Travel Community', url: siteConfig.siteUrl }],
  creator: 'Ghurabo',
  publisher: 'Ghurabo',
  category: 'travel',
  keywords: siteConfig.keywords,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: `${siteConfig.siteUrl}${siteConfig.defaultOgImage}`,
        width: 1200,
        height: 630,
        alt: 'Ghurabo - Bangladesh Travel Community & Trip Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.siteUrl}${siteConfig.defaultOgImage}`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION || process.env.BING_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
          other: process.env.BING_SITE_VERIFICATION
            ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
            : undefined,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${oswald.variable} ${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white font-body">
        <PreferencesProvider>
          <NewsletterModalProvider>
            <SmoothScrollProvider>
              <Navbar />
              <FloatingSocialBar />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
              <FloatingShareTripCTA />
              <NewsletterModal />
            </SmoothScrollProvider>
          </NewsletterModalProvider>
        </PreferencesProvider>
      </body>

    </html>
  );
}
