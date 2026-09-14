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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.ghurabo.com'),
  title: 'Ghurabo | Real Travel Community & Trip Sharing Platform',
  description: 'Share authentic travel stories, itemized budget breakdowns, day-by-day itineraries, and explore verified solo, couple, family, and group tours in Bangladesh.',
  keywords: ['travel community', 'trip sharing', 'budget travel', 'travel itinerary', 'coxs bazar', 'sajek valley', 'st martin', 'bangladesh tourism'],
  authors: [{ name: 'Ghurabo Community' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Ghurabo | Real Travel Community & Trip Sharing Platform',
    description: 'Explore verified community trips, cost breakdowns, and high-resolution photo galleries across Bangladesh.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.ghurabo.com',
  },
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
