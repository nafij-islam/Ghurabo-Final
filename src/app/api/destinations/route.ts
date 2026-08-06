import { NextResponse } from 'next/server';
import { getMemoryDb } from '@/lib/db/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();
  const category = searchParams.get('category');
  const country = searchParams.get('country');

  const db = getMemoryDb();
  let destinations = [...db.destinations];

  if (q) {
    destinations = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    destinations = destinations.filter((d) => d.category.toLowerCase() === category.toLowerCase());
  }

  if (country) {
    destinations = destinations.filter((d) => d.country.toLowerCase() === country.toLowerCase());
  }

  // Recalculate trip counts dynamically
  destinations.forEach((dest) => {
    const matchingTrips = db.trips.filter((t) => t.destinationId === dest.id || t.destinationName === dest.name);
    if (matchingTrips.length > 0) {
      dest.totalTrips = matchingTrips.length;
    }
  });

  return NextResponse.json({
    success: true,
    total: destinations.length,
    destinations,
  });
}
