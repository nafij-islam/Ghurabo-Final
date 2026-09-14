import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Share Your Travel Story | Ghurabo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ShareTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
