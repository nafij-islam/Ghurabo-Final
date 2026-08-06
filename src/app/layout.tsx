import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingSocialBar from '@/components/layout/FloatingSocialBar';

export const metadata: Metadata = {
  title: 'Ghurabo | Real Travel Community & Trip Sharing Platform',
  description: 'Share authentic travel stories, itemized budget breakdowns, day-by-day itineraries, and explore verified solo, couple, family, and group tours around the world.',
  keywords: ['travel community', 'trip sharing', 'budget travel', 'travel itinerary', 'coxs bazar', 'sajek valley', 'st martin'],
  authors: [{ name: 'Ghurabo Community' }],
  icons: {
    icon: '/logo-ghurabo.png',
    apple: '/logo-ghurabo.png',
  },
  openGraph: {
    title: 'Ghurabo | Real Travel Community & Trip Sharing Platform',
    description: 'Explore verified community trips, cost breakdowns, and high-resolution photo galleries.',
    type: 'website',
    url: 'https://ghurabo.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <FloatingSocialBar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
