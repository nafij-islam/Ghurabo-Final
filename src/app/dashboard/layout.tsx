import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Dashboard | Ghurabo',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
