const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

const PRODUCTION_DESTINATIONS = [
  {
    id: 'dest_coxs_bazar',
    name: "Cox's Bazar Beach",
    slug: 'coxs-bazar-beach',
    country: 'Bangladesh',
    division: 'Chittagong',
    category: 'Beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1800',
    description: "The world's longest unbroken natural sea beach spanning 120 km of golden sands, sunset point at Laboni, and scenic marine drive down to Teknaf.",
    bestVisitingTime: 'November - March',
    avgCostSolo: 12000,
    avgCostCouple: 22000,
    avgCostFamily: 42000,
    avgCostGroup: 55000,
    avgDurationDays: 4,
    transportInfo: 'Direct AC Bus from Dhaka (8 hrs) or 45-min flight to Cox’s Bazar Airport (CXB). Local TomTom auto-rickshaws available.',
    safetyTips: 'Always swim in designated safe red/green flag zones. Beware of strong undertow during high tide at Inani.',
    totalTrips: 0,
    avgRating: 4.8,
    isPopular: true,
  },
  {
    id: 'dest_sajek_valley',
    name: 'Sajek Valley & Clouds',
    slug: 'sajek-valley',
    country: 'Bangladesh',
    division: 'Rangamati',
    category: 'Mountain',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1800',
    description: 'Queen of hills in Rangamati surrounded by cloud ocean, lush green mountain ridges, tribal culture, Helipad sunset point, and Ruilui Para.',
    bestVisitingTime: 'September - February',
    avgCostSolo: 14000,
    avgCostCouple: 26000,
    avgCostFamily: 48000,
    avgCostGroup: 62000,
    avgDurationDays: 3,
    transportInfo: 'Bus to Khagrachari, then hire a Chander Gari (4x4 Jeep) under army escort to Sajek Valley (approx 3.5 hrs).',
    safetyTips: 'Cellular reception is limited. Carry cash as there are no ATMs in Sajek. Carry mosquito repellent for night treks.',
    totalTrips: 0,
    avgRating: 4.9,
    isPopular: true,
  },
  {
    id: 'dest_sreemangal',
    name: 'Sreemangal Tea Gardens',
    slug: 'sreemangal-tea-gardens',
    country: 'Bangladesh',
    division: 'Sylhet',
    category: 'Resort',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1800',
    description: 'Tea capital of Bangladesh famous for 7-layer tea at Nilkantha, Lawachara Rain Forest trekking, Baikka Beel bird sanctuary, and tribal tea pluckers.',
    bestVisitingTime: 'July - November',
    avgCostSolo: 9500,
    avgCostCouple: 18000,
    avgCostFamily: 34000,
    avgCostGroup: 45000,
    avgDurationDays: 3,
    transportInfo: 'Parabat or Jayantikha Express Train from Dhaka Kamlapur (5 hrs) or direct Sylhet Highway Bus.',
    safetyTips: 'Hire a licensed forest guard when entering Lawachara Rain Forest to prevent getting lost and avoid leech bites.',
    totalTrips: 0,
    avgRating: 4.7,
    isPopular: true,
  },
  {
    id: 'dest_saint_martin',
    name: 'Saint Martin Coral Island',
    slug: 'saint-martin-island',
    country: 'Bangladesh',
    division: 'Chittagong',
    category: 'Island',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1800',
    description: 'Only coral island of Bangladesh in the northeastern Bay of Bengal, famous for crystal turquoise waters, fresh coconut water, and Chera Dwip.',
    bestVisitingTime: 'November - February',
    avgCostSolo: 16000,
    avgCostCouple: 30000,
    avgCostFamily: 54000,
    avgCostGroup: 70000,
    avgDurationDays: 3,
    transportInfo: 'Bus to Teknaf Jetty, then 2.5-hour sea cruise via Keari Sindbad or Bay One to Saint Martin Island.',
    safetyTips: 'Ships operate strictly based on weather conditions. Buy return tickets in advance and avoid stepping on living coral reefs.',
    totalTrips: 0,
    avgRating: 4.9,
    isPopular: true,
  },
  {
    id: 'dest_sundarbans',
    name: 'Sundarbans Mangrove Forest',
    slug: 'sundarbans-mangrove',
    country: 'Bangladesh',
    division: 'Khulna',
    category: 'Historical',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1800',
    description: 'The UNESCO World Heritage largest mangrove forest on earth, home of the Royal Bengal Tiger, spotted deer, estuarine crocodiles, and Kotka beach.',
    bestVisitingTime: 'October - March',
    avgCostSolo: 22000,
    avgCostCouple: 42000,
    avgCostFamily: 75000,
    avgCostGroup: 95000,
    avgDurationDays: 4,
    transportInfo: 'Travel to Khulna or Mongla Port, then board 3-Day/2-Night luxury forest cabin ship (e.g. M.V. Crown or Bengal Sunset).',
    safetyTips: 'Do not disembark without armed forest guards. Keep quiet during narrow canal boat safaris.',
    totalTrips: 0,
    avgRating: 4.8,
    isPopular: true,
  },
];

async function seedProductionDestinations() {
  try {
    console.log('Connecting to MongoDB Atlas to populate production destinations...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;

    for (const dest of PRODUCTION_DESTINATIONS) {
      await db.collection('destinations').updateOne(
        { id: dest.id },
        { $set: dest },
        { upsert: true }
      );
    }

    console.log(`✅ Successfully populated ${PRODUCTION_DESTINATIONS.length} canonical production destinations in MongoDB Atlas.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error populating destinations:', err);
    process.exit(1);
  }
}

seedProductionDestinations();
