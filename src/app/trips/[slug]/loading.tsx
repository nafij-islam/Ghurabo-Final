import { TripDetailsSkeleton } from '@/components/ui/Skeletons';

export default function Loading() {
  return (
    <div className="w-full pt-28 pb-20 bg-slate-950 min-h-screen">
      <TripDetailsSkeleton />
    </div>
  );
}
