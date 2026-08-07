import { NextResponse } from 'next/server';
import { connectToDatabase, getMemoryDb } from '@/lib/db/mongodb';
import { TripModel, GalleryModel, DestinationModel, UserModel } from '@/lib/db/models';
import { getCurrentUser } from '@/lib/auth/session';

// Card field projections for listing optimization
const TRIP_CARD_FIELDS = 'id slug title coverImage destinationId destinationName travelType travellersCount durationDays costBreakdown ratings isVerified isPopular status userName userAvatar summary createdAt';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase();
    const destination = searchParams.get('destination')?.toLowerCase();
    const travelType = searchParams.get('travelType');
    const maxBudget = searchParams.get('maxBudget');
    const minRating = searchParams.get('minRating');
    const sort = searchParams.get('sort') || 'newest';
    const statusFilter = searchParams.get('status') || 'approved';
    const userIdFilter = searchParams.get('userId');
    const popularFilter = searchParams.get('popular');

    // Pagination
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = popularFilter === 'true' ? 6 : Math.min(30, Math.max(1, Number(searchParams.get('limit')) || 12));
    const skip = (page - 1) * limit;

    const conn = await connectToDatabase();

    if (conn) {
      const query: any = {};

      if (popularFilter === 'true') {
        query.status = 'approved';
        query.isPopular = true;
      } else {
        if (statusFilter !== 'all') {
          query.status = statusFilter;
        }

        if (userIdFilter) {
          query.$or = [{ userId: userIdFilter }, { userName: userIdFilter }];
        }

        if (q) {
          query.$or = [
            { title: { $regex: q, $options: 'i' } },
            { summary: { $regex: q, $options: 'i' } },
            { destinationName: { $regex: q, $options: 'i' } },
          ];
        }

        if (destination) {
          query.destinationName = { $regex: destination, $options: 'i' };
        }

        if (travelType && travelType !== 'All') {
          query.travelType = travelType;
        }

        if (maxBudget) {
          query['costBreakdown.perPersonCost'] = { $lte: Number(maxBudget) };
        }

        if (minRating) {
          query['ratings.overall'] = { $gte: Number(minRating) };
        }
      }

      let sortOptions: any = { createdAt: -1 };
      if (sort === 'popular') sortOptions = { likesCount: -1 };
      else if (sort === 'lowest_cost') sortOptions = { 'costBreakdown.perPersonCost': 1 };
      else if (sort === 'highest_rating') sortOptions = { 'ratings.overall': -1 };

      const [trips, total] = await Promise.all([
        TripModel.find(query)
          .select(TRIP_CARD_FIELDS)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        TripModel.countDocuments(query),
      ]);

      const response = NextResponse.json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        trips,
      });

      if (!userIdFilter && statusFilter === 'approved') {
        response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      } else {
        response.headers.set('Cache-Control', 'no-store');
      }

      return response;
    }

    // In-Memory Fallback
    const db = getMemoryDb();
    let trips = [...db.trips];

    if (popularFilter === 'true') {
      trips = trips.filter((t) => t.status === 'approved' && t.isPopular);
    } else {
      if (statusFilter === 'pending') {
        trips = db.pendingApprovals;
      } else if (statusFilter !== 'all') {
        trips = trips.filter((t) => t.status === 'approved');
      }

      if (userIdFilter) {
        trips = trips.filter((t) => t.userId === userIdFilter || t.userName.toLowerCase() === userIdFilter.toLowerCase());
      }

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
    }

    if (sort === 'popular') {
      trips.sort((a, b) => b.likesCount - a.likesCount);
    } else if (sort === 'lowest_cost') {
      trips.sort((a, b) => a.costBreakdown.perPersonCost - b.costBreakdown.perPersonCost);
    } else {
      trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const paginatedTrips = trips.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      total: trips.length,
      page,
      limit,
      totalPages: Math.ceil(trips.length / limit),
      trips: paginatedTrips,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Sign in required to post a trip story' }, { status: 401 });
    }

    const body = await request.json();
    const conn = await connectToDatabase();

    let authorId = sessionUser.id;
    let authorName = sessionUser.name;
    let authorAvatar = sessionUser.avatar || 'https://i.pravatar.cc/150';

    if (conn) {
      const dbUser = (await UserModel.findOne({ email: sessionUser.email.toLowerCase() }).select('id name avatar').lean()) as any;
      if (dbUser) {
        authorId = dbUser.id || String(dbUser._id);
        authorName = dbUser.name;
        authorAvatar = dbUser.avatar || authorAvatar;
      }
    }

    const tripId = `trip_${Date.now()}`;
    const slugBase = body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : `trip-${Date.now()}`;
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const newTripData = {
      id: tripId,
      title: body.title || 'Untitled Trip Story',
      slug,
      userId: authorId,
      userName: authorName,
      userAvatar: authorAvatar,
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
      isPopular: false,
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
    };

    if (conn) {
      const createdTrip = await TripModel.create(newTripData);

      // Auto-sync gallery images into MongoDB Atlas
      if (newTripData.images && newTripData.images.length > 0) {
        const galleryDocs = newTripData.images.map((img: any, idx: number) => ({
          id: `gal_${Date.now()}_${idx}`,
          url: img.url,
          caption: img.caption || `${newTripData.title} photo`,
          tripId: createdTrip.id,
          tripTitle: newTripData.title,
          tripSlug: newTripData.slug,
          destinationName: newTripData.destinationName,
          travelType: newTripData.travelType,
          photographerName: authorName,
          photographerAvatar: authorAvatar,
          photographerId: authorId,
          likesCount: 0,
        }));
        await GalleryModel.insertMany(galleryDocs);
      }

      // Update destination trip count
      await DestinationModel.updateOne(
        { name: newTripData.destinationName },
        { $inc: { totalTrips: 1 } }
      );

      return NextResponse.json({
        success: true,
        trip: createdTrip,
        message: body.isDraft ? 'Trip saved as draft' : 'Trip published successfully!',
      });
    }

    // In-memory fallback
    const db = getMemoryDb();
    db.trips.unshift(newTripData as any);
    return NextResponse.json({
      success: true,
      trip: newTripData,
      message: 'Trip published successfully!',
    });
  } catch (error: any) {
    console.error('Trip Creation Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save trip' }, { status: 500 });
  }
}
