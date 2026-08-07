import { PopularTripsSkeleton } from '@/components/ui/Skeletons';

export default function Loading() {
  return (
    <div className="w-full pt-28 pb-20 bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="w-64 h-10 bg-slate-900 rounded-2xl animate-pulse" />
        <PopularTripsSkeleton />
      </div>
    </div>
  );
}
