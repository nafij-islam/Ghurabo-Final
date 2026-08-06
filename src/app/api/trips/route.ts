import { NextResponse } from 'next/server';
import { getMemoryDb } from '@/lib/db/mongodb';
import { getCurrentUser } from '@/lib/auth/session';
import { ITrip, IGalleryItem } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();
  const destination = searchParams.get('destination')?.toLowerCase();
  const travelType = searchParams.get('travelType');
  const maxBudget = searchParams.get('maxBudget');
  const minRating = searchParams.get('minRating');
  const sort = searchParams.get('sort') || 'newest';
  const statusFilter = searchParams.get('status') || 'approved';

  const db = getMemoryDb();
  let trips = [...db.trips];

  if (statusFilter === 'all') {
    // Return all trips for admin or overview
  } else if (statusFilter === 'pending') {
    trips = db.pendingApprovals;
  } else {
    trips = trips.filter((t) => t.status === 'approved');
  }

  // Search by title, summary, or destination
  if (q) {
    trips = trips.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.destinationName.toLowerCase().includes(q)
    );
  }

  if (destination) {
    trips = trips.filter((t) => t.destinationName.toLowerCase().includes(destination));
  }

  if (travelType && travelType !== 'All') {
    trips = trips.filter((t) => t.travelType === travelType);
  }

  if (maxBudget) {
    const budgetNum = Number(maxBudget);
    trips = trips.filter((t) => t.costBreakdown.perPersonCost <= budgetNum);
  }

  if (minRating) {
    const ratingNum = Number(minRating);
    trips = trips.filter((t) => t.ratings.overall >= ratingNum);
  }

  // Sorting
  if (sort === 'popular') {
    trips.sort((a, b) => b.likesCount - a.likesCount);
  } else if (sort === 'lowest_cost') {
    trips.sort((a, b) => a.costBreakdown.perPersonCost - b.costBreakdown.perPersonCost);
  } else if (sort === 'highest_rating') {
    trips.sort((a, b) => b.ratings.overall - a.ratings.overall);
  } else {
    // Newest
    trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return NextResponse.json({
    success: true,
    total: trips.length,
    trips,
  });
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    const body = await request.json();
    const db = getMemoryDb();

    const tripId = `trip_${Date.now()}`;
    const slug = body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : `trip-${Date.now()}`;

    const newTrip: ITrip = {
      id: tripId,
      title: body.title || 'Untitled Trip Story',
      slug,
      userId: sessionUser?.id || 'user_guest',
      userName: sessionUser?.name || body.userName || 'Anonymous Traveller',
      userAvatar: sessionUser?.avatar || body.userAvatar || 'https://i.pravatar.cc/150?u=guest',
      destinationId: body.destinationId || 'dest_1',
      destinationName: body.destinationName || "Cox's Bazar Beach",
      travelDate: body.travelDate || new Date().toISOString().split('T')[0],
      travelType: body.travelType || 'Solo',
      travellersCount: Number(body.travellersCount) || 1,
      durationDays: Number(body.durationDays) || 3,
      summary: body.summary || 'A wonderful trip shared with the Ghurabo travel community.',
      story: body.story || '',
      highlights: body.highlights || [],
      challenges: body.challenges || '',
      tips: body.tips || '',
      safetyNotes: body.safetyNotes || '',
      coverImage: body.coverImage || (body.images && body.images[0]?.url) || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      images: body.images || [],
      costBreakdown: body.costBreakdown || {
        transport: 50,
        hotel: 80,
        food: 40,
        localTransport: 20,
        tickets: 10,
        guide: 0,
        shopping: 20,
        misc: 10,
        totalCost: 230,
        perPersonCost: 230,
      },
      itinerary: body.itinerary || [],
      status: body.isDraft ? 'draft' : 'pending',
      isVerified: false,
      likesCount: 0,
      savesCount: 0,
      helpfulVotesCount: 0,
      commentsCount: 0,
      ratings: body.ratings || {
        overall: 4.8,
        safety: 4.8,
        cleanliness: 4.5,
        transport: 4.7,
        accommodation: 4.8,
        food: 4.8,
        value: 4.9,
      },
      createdAt: new Date().toISOString(),
    };

    if (body.isDraft) {
      db.drafts.push(newTrip);
    } else {
      // Direct approve if auto-approve flag set or push to pending
      db.pendingApprovals.push(newTrip);
      // Also add to active trips for demo responsiveness if needed
      db.trips.unshift(newTrip);

      // Auto-sync images to gallery!
      if (newTrip.images && newTrip.images.length > 0) {
        newTrip.images.forEach((img, idx) => {
          const galleryItem: IGalleryItem = {
            id: `gal_${Date.now()}_${idx}`,
            url: img.url,
            caption: img.caption || `${newTrip.title} photo`,
            tripId: newTrip.id,
            tripTitle: newTrip.title,
            tripSlug: newTrip.slug,
            destinationName: newTrip.destinationName,
            travelType: newTrip.travelType,
            photographerName: newTrip.userName,
            photographerAvatar: newTrip.userAvatar,
            photographerId: newTrip.userId,
            likesCount: 0,
            createdAt: new Date().toISOString(),
          };
          db.gallery.unshift(galleryItem);
        });
      }
    }

    return NextResponse.json({
      success: true,
      trip: newTrip,
      message: body.isDraft ? 'Trip saved as draft' : 'Trip submitted for approval!',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save trip' }, { status: 500 });
  }
}
