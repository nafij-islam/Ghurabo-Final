import { NextResponse } from 'next/server';
import { getMemoryDb } from '@/lib/db/mongodb';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const db = getMemoryDb();
  const slug = params.slug;

  const destination = db.destinations.find(
    (d) => d.slug === slug || d.id === slug || d.name.toLowerCase() === slug.toLowerCase()
  );

  if (!destination) {
    return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
  }

  // Get matching user trips for this destination
  const trips = db.trips.filter(
    (t) => t.destinationId === destination.id || t.destinationName.toLowerCase() === destination.name.toLowerCase()
  );

  // Dynamically calculate average costs per travel type from real approved user trips!
  const soloTrips = trips.filter((t) => t.travelType === 'Solo');
  const coupleTrips = trips.filter((t) => t.travelType === 'Couple');
  const familyTrips = trips.filter((t) => t.travelType === 'Family');
  const groupTrips = trips.filter((t) => t.travelType === 'Group');

  const calcAvg = (arr: typeof trips, fallback: number) => {
    if (arr.length === 0) return fallback;
    const sum = arr.reduce((acc, curr) => acc + curr.costBreakdown.perPersonCost, 0);
    return Math.round(sum / arr.length);
  };

  const dynamicCostStats = {
    Solo: calcAvg(soloTrips, destination.avgCostSolo),
    Couple: calcAvg(coupleTrips, destination.avgCostCouple),
    Family: calcAvg(familyTrips, destination.avgCostFamily),
    Group: calcAvg(groupTrips, destination.avgCostGroup),
  };

  return NextResponse.json({
    success: true,
    destination,
    trips,
    dynamicCostStats,
  });
}
