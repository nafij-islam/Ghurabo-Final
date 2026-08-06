const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

const SEED_USERS = [
  {
    id: 'user_1',
    name: 'Aria Montgomery',
    email: 'aria@ghurabo.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    role: 'traveller',
    bio: 'Full-time solo backpacker & landscape photographer. 34 countries and counting!',
    location: 'Dhaka, Bangladesh',
    preferredStyle: 'Solo',
    visitedCount: 18,
    followersCount: 3420,
    followingCount: 215,
    totalHelpfulVotes: 489,
    badges: ['Top Backpacker', 'Verified Explorer', 'Community Guide'],
  },
  {
    id: 'user_2',
    name: 'Tanvir & Sarah',
    email: 'tanvir@ghurabo.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=1200',
    role: 'traveller',
    bio: 'Couple travel vloggers seeking hidden gems, luxury resorts, and food trails.',
    location: 'Chittagong, Bangladesh',
    preferredStyle: 'Couple',
    visitedCount: 26,
    followersCount: 8900,
    followingCount: 410,
    totalHelpfulVotes: 1250,
    badges: ['Couple Explorers', 'Hotel Reviewer', 'Pro Storyteller'],
  },
  {
    id: 'user_admin',
    name: 'Ghurabo Admin',
    email: 'admin@ghurabo.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    role: 'admin',
    bio: 'Official Ghurabo Community Lead and Quality Moderator.',
    location: 'Dhaka, Bangladesh',
    preferredStyle: 'Group',
    visitedCount: 45,
    followersCount: 15400,
    followingCount: 12,
    totalHelpfulVotes: 5400,
    badges: ['Platform Founder', 'Master Explorer'],
  }
];

const SEED_DESTINATIONS = [
  {
    id: 'dest_1',
    name: "Cox's Bazar Beach",
    slug: 'coxs-bazar-beach',
    country: 'Bangladesh',
    division: 'Chittagong',
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1800',
    description: "The world's longest unbroken natural sea beach spanning 120 km of golden sands, sunset point at Laboni, and scenic marine drive down to Teknaf.",
    bestVisitingTime: 'November - March',
    avgCostSolo: 120,
    avgCostCouple: 250,
    avgCostFamily: 450,
    avgCostGroup: 600,
    avgDurationDays: 4,
    transportInfo: 'Direct AC Bus from Dhaka (8 hrs) or 45-min flight to Cox’s Bazar Airport (CXB). Local TomTom auto-rickshaws available.',
    safetyTips: 'Always swim in designated safe red/green flag zones. Beware of strong undertow during high tide at Inani.',
    totalTrips: 42,
    avgRating: 4.8,
  },
  {
    id: 'dest_2',
    name: 'Sajek Valley & Clouds',
    slug: 'sajek-valley',
    country: 'Bangladesh',
    division: 'Rangamati',
    category: 'Mountain',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1800',
    description: 'Queen of hills in Rangamati surrounded by cloud ocean, lush green mountain ridges, tribal culture, Helipad sunset point, and Ruilui Para.',
    bestVisitingTime: 'September - February',
    avgCostSolo: 140,
    avgCostCouple: 280,
    avgCostFamily: 490,
    avgCostGroup: 650,
    avgDurationDays: 3,
    transportInfo: 'Bus to Khagrachari, then hire a Chander Gari (4x4 Jeep) under army escort to Sajek Valley (approx 3.5 hrs).',
    safetyTips: 'Cellular reception is limited. Carry cash as there are no ATMs in Sajek. Carry mosquito repellent for night treks.',
    totalTrips: 38,
    avgRating: 4.9,
  },
  {
    id: 'dest_3',
    name: 'Saint Martin Coral Island',
    slug: 'saint-martin-island',
    country: 'Bangladesh',
    division: 'Chittagong',
    category: 'Island',
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=1800',
    description: 'Tiny tropical coral island in the northeastern part of the Bay of Bengal featuring crystal blue waters, fresh green coconut groves, and Chera Dwip.',
    bestVisitingTime: 'November - February',
    avgCostSolo: 160,
    avgCostCouple: 320,
    avgCostFamily: 550,
    avgCostGroup: 750,
    avgDurationDays: 3,
    transportInfo: 'Take luxury ship from Teknaf jetty or Cox’s Bazar to St. Martin. Bicycles and rickshaws operate on the island.',
    safetyTips: 'Do not collect or break natural corals. Return to main island before high tide when visiting Chera Dwip.',
    totalTrips: 29,
    avgRating: 4.7,
  }
];

const SEED_TRIPS = [
  {
    id: 'trip_1',
    title: '4 Days Untamed Solo Expedition Along Cox’s Bazar Marine Drive',
    slug: '4-days-solo-coxs-bazar-marine-drive',
    userId: 'user_1',
    userName: 'Aria Montgomery',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    destinationId: 'dest_1',
    destinationName: "Cox's Bazar Beach",
    travelDate: '2025-12-10',
    travelType: 'Solo',
    travellersCount: 1,
    durationDays: 4,
    summary: 'A soul-soothing solo journey exploring quiet hidden spots at Himchari, Inani coral beach, and riding a scooter along the scenic Marine Drive highway.',
    story: `I packed my camera gear and took an overnight non-stop sleeper coach from Dhaka directly to Cox’s Bazar. Day 1 started with watching the sunrise at Sugandha beach. The highlight was renting a scooter on Day 2 to ride down the 80 km Marine Drive. Inani beach offered peaceful coral tide pools where I spent hours capturing long-exposure photographs.`,
    highlights: ['Sunset photography at Inani coral beach', 'Scooter ride along Marine Drive', 'Fresh grilled pomfret at Kolatoli market'],
    tips: 'Rent scooters early morning at Kolatoli main junction for better rates.',
    safetyNotes: 'Avoid solo night rides along unlit segments after 9 PM.',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200', caption: 'Golden sunset glow' }],
    costBreakdown: { transport: 35, hotel: 45, food: 25, localTransport: 15, tickets: 5, guide: 0, shopping: 10, misc: 5, totalCost: 140, perPersonCost: 140 },
    itinerary: [{ dayNumber: 1, title: 'Arrival & Beach Walk', activities: ['Arrive via AC Bus', 'Sugandha beachwalk'], locations: ['Coxs Bazar'], estimatedCost: 30 }],
    status: 'approved',
    isVerified: true,
    likesCount: 142,
    savesCount: 68,
    helpfulVotesCount: 54,
    commentsCount: 12,
    ratings: { overall: 4.9, safety: 4.8, cleanliness: 4.7, transport: 5.0, accommodation: 4.8, food: 5.0, value: 5.0 }
  }
];

const SEED_GALLERY = [
  {
    id: 'gal_1',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    caption: 'Golden hour sunset over Cox’s Bazar Laboni beach coastline',
    tripId: 'trip_1',
    tripTitle: '4 Days Untamed Solo Expedition Along Cox’s Bazar Marine Drive',
    tripSlug: '4-days-solo-coxs-bazar-marine-drive',
    destinationName: "Cox's Bazar Beach",
    travelType: 'Solo',
    photographerName: 'Aria Montgomery',
    photographerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    photographerId: 'user_1',
    likesCount: 98
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to Atlas DB successfully.');

    const db = mongoose.connection.db;

    await db.collection('users').deleteMany({});
    await db.collection('users').insertMany(SEED_USERS);

    await db.collection('destinations').deleteMany({});
    await db.collection('destinations').insertMany(SEED_DESTINATIONS);

    await db.collection('trips').deleteMany({});
    await db.collection('trips').insertMany(SEED_TRIPS);

    await db.collection('galleries').deleteMany({});
    await db.collection('galleries').insertMany(SEED_GALLERY);

    console.log('✓ MongoDB Atlas seeded with initial Ghurabo community data successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
