import { IDestination, ITrip, IUser, IReview, IGalleryItem } from '@/types';

export const SEED_USERS: IUser[] = [
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
    createdAt: '2025-01-15T10:00:00Z',
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
    createdAt: '2025-02-10T14:30:00Z',
  },
  {
    id: 'user_3',
    name: 'Rahman Family Expeditions',
    email: 'rahman@ghurabo.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200',
    role: 'traveller',
    bio: 'Travelling around South Asia with 2 kids. Budget-friendly family itineraries.',
    location: 'Sylhet, Bangladesh',
    preferredStyle: 'Family',
    visitedCount: 14,
    followersCount: 1820,
    followingCount: 95,
    totalHelpfulVotes: 310,
    badges: ['Family Specialist', 'Budget Master'],
    createdAt: '2025-03-01T09:15:00Z',
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
    createdAt: '2024-12-01T00:00:00Z',
  }
];

export const SEED_DESTINATIONS: IDestination[] = [
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
  },
  {
    id: 'dest_4',
    name: 'Sylhet Tea Gardens & Jaflong',
    slug: 'sylhet-tea-gardens',
    country: 'Bangladesh',
    division: 'Sylhet',
    category: 'Resort',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1800',
    description: 'Rolling green tea estates, pristine stone riverbed of Jaflong, clear blue water stream of Bichanakandi, and magical swamp forest at Ratargul.',
    bestVisitingTime: 'June - November',
    avgCostSolo: 110,
    avgCostCouple: 220,
    avgCostFamily: 380,
    avgCostGroup: 520,
    avgDurationDays: 3,
    transportInfo: 'Train or bus from Dhaka to Sylhet City. Microbus or private sedan to Jaflong and Ratargul boat ghat.',
    safetyTips: 'Monsoon season brings heavy water flow in rivers; wear life jackets on small wooden boats.',
    totalTrips: 34,
    avgRating: 4.6,
  },
  {
    id: 'dest_5',
    name: 'Bali Island Paradise',
    slug: 'bali-island-paradise',
    country: 'Indonesia',
    category: 'Island',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1800',
    description: 'Iconic tropical haven with Tegalalang rice terraces, sacred monkey forest, seaside Uluwatu temples, and vibrant surf breaks in Canggu.',
    bestVisitingTime: 'April - October',
    avgCostSolo: 450,
    avgCostCouple: 850,
    avgCostFamily: 1450,
    avgCostGroup: 1800,
    avgDurationDays: 6,
    transportInfo: 'Fly into Ngurah Rai Airport (DPS). Renting scooters or booking Grab/Gojek rides is best.',
    safetyTips: 'Be cautious of wild monkeys at Ubud temple. Check reef wave warnings before surfing.',
    totalTrips: 19,
    avgRating: 4.9,
  },
  {
    id: 'dest_6',
    name: 'Swiss Alps & Zermatt',
    slug: 'swiss-alps-zermatt',
    country: 'Switzerland',
    category: 'Mountain',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1000',
    heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1800',
    description: 'Breathtaking alpine valley overlooking the Matterhorn horn peak, car-free village of Zermatt, glacial hiking trails, and Swiss luxury resorts.',
    bestVisitingTime: 'December - March & June - September',
    avgCostSolo: 1200,
    avgCostCouple: 2400,
    avgCostFamily: 3900,
    avgCostGroup: 4800,
    avgDurationDays: 5,
    transportInfo: 'Swiss Travel Pass train network directly into Zermatt station. Electro-taxis inside village.',
    safetyTips: 'Always wear proper thermal gear for sub-zero mountain weather. Check avalanche forecasts before off-piste skiing.',
    totalTrips: 15,
    avgRating: 5.0,
  }
];

export const SEED_TRIPS: ITrip[] = [
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
    story: `I packed my camera gear and took an overnight non-stop sleeper coach from Dhaka directly to Cox’s Bazar. My goal was simple: experience the coastal stretch away from the crowded hotel zones.

Day 1 started with watching the sunrise at Sugandha beach. The gentle sea breeze and fishing trawlers returning to shore was surreal. I checked into a cozy oceanfront eco-resort near Himchari. 

The highlight was renting a scooter on Day 2 to ride down the 80 km Marine Drive. With lush green hills on my left and turquoise waves roaring on my right, it was purely cinematic! Inani beach offered peaceful coral tide pools where I spent hours capturing long-exposure photographs.`,
    highlights: [
      'Sunset photography at Inani coral beach',
      'Scooter ride along the world-famous Marine Drive',
      'Fresh grilled pomfret at Kolatoli seafood beach market',
      'Peaceful morning walk at Himchari waterfall trail'
    ],
    challenges: 'Finding reliable mobile network past Teknaf section; carry offline maps.',
    tips: 'Rent scooters early morning at Kolatoli main junction for better negotiable daily rates.',
    safetyNotes: 'Avoid solo night rides along unlit segments of Marine Drive after 9 PM.',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
        caption: 'Golden sunset glow over Laboni point ocean waves'
      },
      {
        url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1200',
        caption: 'Marine drive coastal highway road with coconut trees'
      },
      {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200',
        caption: 'Local traditional wooden Sampan boat moored on sandy beach'
      }
    ],
    costBreakdown: {
      transport: 35,
      hotel: 45,
      food: 25,
      localTransport: 15,
      tickets: 5,
      guide: 0,
      shopping: 10,
      misc: 5,
      totalCost: 140,
      perPersonCost: 140,
    },
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrival & Sugandha Beach Walk',
        activities: ['Arrive via AC Bus', 'Check-in to Eco Resort', 'Sunset photo session at Sugandha beach'],
        locations: ['Coxs Bazar Town', 'Sugandha Beach'],
        estimatedCost: 30
      },
      {
        dayNumber: 2,
        title: 'Marine Drive & Inani Beach Exploration',
        activities: ['Rent 125cc scooter', 'Drive to Himchari National Park', 'Coral walk at Inani Beach'],
        locations: ['Marine Drive', 'Himchari', 'Inani'],
        estimatedCost: 45
      },
      {
        dayNumber: 3,
        title: 'Teknaf Point & Seafood Tasting',
        activities: ['Visit Teknaf jetty area', 'Sample fresh red snapper at Kolatoli night market'],
        locations: ['Teknaf', 'Kolatoli Market'],
        estimatedCost: 40
      },
      {
        dayNumber: 4,
        title: 'Souvenir Shopping & Return Journey',
        activities: ['Burmese Market shopping for local crafts', 'Board return bus to Dhaka'],
        locations: ['Burmese Market'],
        estimatedCost: 25
      }
    ],
    status: 'approved',
    isVerified: true,
    likesCount: 142,
    savesCount: 68,
    helpfulVotesCount: 54,
    commentsCount: 12,
    ratings: {
      overall: 4.9,
      safety: 4.8,
      cleanliness: 4.7,
      transport: 5.0,
      accommodation: 4.8,
      food: 5.0,
      value: 5.0
    },
    createdAt: '2026-01-20T11:20:00Z',
  },
  {
    id: 'trip_2',
    title: 'Floating Above Clouds: A Romantic 3-Day Couple Escape to Sajek',
    slug: '3-days-couple-escape-sajek-valley',
    userId: 'user_2',
    userName: 'Tanvir & Sarah',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    destinationId: 'dest_2',
    destinationName: 'Sajek Valley & Clouds',
    travelDate: '2025-11-05',
    travelType: 'Couple',
    travellersCount: 2,
    durationDays: 3,
    summary: 'Waking up inside a sea of white morning clouds, sipping fresh bamboo tea, and catching starry night skies from our cottage balcony in Ruilui Para.',
    story: `Sajek Valley was on our bucket list for over two years. We booked a wooden cottage perched directly on the edge of Ruilui cliff. 

When we opened our balcony doors at 6:00 AM, it felt as though we were standing inside a magical ocean of cotton clouds. The valley below was completely submerged in mist while the mountain peaks floated like tiny green islands.

We spent our afternoon walking through the indigenous Tripura village, enjoying traditional bamboo-cooked chicken dinner, and gazing at the unpolluted Milky Way galaxy from the Helipad hilltop.`,
    highlights: [
      'Overnight stay at cliffside wooden balcony cottage',
      'Tasting authentic Bamboo Chicken & Wild Mushroom curry',
      'Unobstructed 360-degree stargazing at Sajek Helipad #2',
      'Morning cloud-sea sunrise view from cottage bed'
    ],
    challenges: 'Chander Gari military convoy schedule is strict; missing morning escort delays your arrival by hours.',
    tips: 'Book resort rooms facing East (Mizo hills side) for the best cloud ocean view right from your balcony.',
    safetyNotes: 'Keep warm jackets ready as temperatures drop significantly after sunset.',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
        caption: 'Breathtaking cloud sea covering mountain valleys at sunrise'
      },
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200',
        caption: 'Scenic open Jeep Chander Gari winding through lush green hill roads'
      }
    ],
    costBreakdown: {
      transport: 80,
      hotel: 110,
      food: 50,
      localTransport: 40,
      tickets: 0,
      guide: 10,
      shopping: 20,
      misc: 10,
      totalCost: 320,
      perPersonCost: 160,
    },
    itinerary: [
      {
        dayNumber: 1,
        title: 'Khagrachari to Sajek Chander Gari Ride',
        activities: ['Arrive in Khagrachari town', 'Join Army convoy at Dighinala', 'Check-in to Ruilui Cottage'],
        locations: ['Khagrachari', 'Dighinala', 'Sajek Valley'],
        estimatedCost: 120
      },
      {
        dayNumber: 2,
        title: 'Konglak Pahar Trek & Sunset at Helipad',
        activities: ['Morning cloud watching from balcony', 'Short trek to highest point Konglak Pahar', 'Sunset hot tea at Helipad'],
        locations: ['Konglak Pahar', 'Sajek Helipad'],
        estimatedCost: 110
      },
      {
        dayNumber: 3,
        title: 'Hajachora Waterfall & Return',
        activities: ['Return convoy ride', 'Stop at Hajachora cold waterfall stream', 'Night coach back to Dhaka'],
        locations: ['Hajachora Waterfall', 'Khagrachari'],
        estimatedCost: 90
      }
    ],
    status: 'approved',
    isVerified: true,
    likesCount: 210,
    savesCount: 115,
    helpfulVotesCount: 92,
    commentsCount: 18,
    ratings: {
      overall: 5.0,
      safety: 4.9,
      cleanliness: 4.8,
      transport: 4.7,
      accommodation: 5.0,
      food: 4.9,
      value: 4.9
    },
    createdAt: '2026-01-25T16:45:00Z',
  },
  {
    id: 'trip_3',
    title: 'Family Vacation in Crystal Clear Waters of Saint Martin Island',
    slug: 'family-vacation-saint-martin-coral-island',
    userId: 'user_3',
    userName: 'Rahman Family Expeditions',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    destinationId: 'dest_3',
    destinationName: 'Saint Martin Coral Island',
    travelDate: '2025-12-18',
    travelType: 'Family',
    travellersCount: 4,
    durationDays: 3,
    summary: 'A memorable 3-day island trip with kids, bicycling along coconut palm trails, tasting fresh green coconut water, and exploring Chera Dwip.',
    story: `Taking our two children (aged 7 and 10) to Saint Martin Coral Island was an unforgettable family adventure. We boarded the luxury ocean cruise ship from Teknaf jetty. The kids loved feeding seagulls flying beside the ship deck!

The island feels so calm and safe. We rented tandem bicycles for the family and rode through sandy coconut tracks. The water at West Beach was warm, clear, and perfectly shallow for kids to splash safely.

At night, the beach market grilled fresh coral fish right in front of us. Seeing the kids smile while discovering hermit crabs under moonlight was priceless.`,
    highlights: [
      'Seagull feeding cruise ride over Bay of Bengal',
      'Family bicycle ride along coconut groves',
      'Day trip to Chera Dwip via traditional speed boat',
      'Fresh live BBQ dinner at West Beach market'
    ],
    challenges: 'High tide can cut off walking paths to Chera Dwip; always check tide clock before heading out.',
    tips: 'Book cruise ship seats on the upper open-deck for unobstructed ocean views.',
    safetyNotes: 'Equip children with light life vests while taking speed boats to Chera Dwip.',
    coverImage: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=1200',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=1200',
        caption: 'Pristine turquoise shore water and coconut trees at St. Martin'
      },
      {
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
        caption: 'Family enjoying clear ocean tide pools on Chera Dwip'
      }
    ],
    costBreakdown: {
      transport: 180,
      hotel: 180,
      food: 110,
      localTransport: 30,
      tickets: 20,
      guide: 15,
      shopping: 35,
      misc: 10,
      totalCost: 580,
      perPersonCost: 145,
    },
    itinerary: [
      {
        dayNumber: 1,
        title: 'Ship Voyage & West Beach Check-in',
        activities: ['Board ocean cruise from Teknaf', 'Arrive at St. Martin pier', 'Check-in to resort & evening beach stroll'],
        locations: ['Teknaf Jetty', 'St. Martin West Beach'],
        estimatedCost: 220
      },
      {
        dayNumber: 2,
        title: 'Chera Dwip Expedition & Cycling',
        activities: ['Morning speed boat to Chera Dwip coral reef', 'Family cycle rental', 'Barbecue seafood market'],
        locations: ['Chera Dwip', 'West Beach Market'],
        estimatedCost: 210
      },
      {
        dayNumber: 3,
        title: 'Sunrise Walk & Departure',
        activities: ['Early sunrise photography at East Beach', 'Souvenir coconut shell shopping', 'Board return cruise'],
        locations: ['East Beach', 'Main Jetty'],
        estimatedCost: 150
      }
    ],
    status: 'approved',
    isVerified: true,
    likesCount: 178,
    savesCount: 94,
    helpfulVotesCount: 76,
    commentsCount: 15,
    ratings: {
      overall: 4.8,
      safety: 4.9,
      cleanliness: 4.6,
      transport: 4.8,
      accommodation: 4.7,
      food: 4.9,
      value: 4.7
    },
    createdAt: '2026-02-02T10:15:00Z',
  }
];

export const SEED_GALLERY: IGalleryItem[] = [
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
    likesCount: 98,
    createdAt: '2026-01-20T11:20:00Z'
  },
  {
    id: 'gal_2',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    caption: 'Majestic cloud sea sweeping over Sajek green mountain valley',
    tripId: 'trip_2',
    tripTitle: 'Floating Above Clouds: A Romantic 3-Day Couple Escape to Sajek',
    tripSlug: '3-days-couple-escape-sajek-valley',
    destinationName: 'Sajek Valley & Clouds',
    travelType: 'Couple',
    photographerName: 'Tanvir & Sarah',
    photographerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    photographerId: 'user_2',
    likesCount: 145,
    createdAt: '2026-01-25T16:45:00Z'
  },
  {
    id: 'gal_3',
    url: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=1200',
    caption: 'Crystal ocean waters surrounding coconut palm trees in St. Martin',
    tripId: 'trip_3',
    tripTitle: 'Family Vacation in Crystal Clear Waters of Saint Martin Island',
    tripSlug: 'family-vacation-saint-martin-coral-island',
    destinationName: 'Saint Martin Coral Island',
    travelType: 'Family',
    photographerName: 'Rahman Family Expeditions',
    photographerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    photographerId: 'user_3',
    likesCount: 112,
    createdAt: '2026-02-02T10:15:00Z'
  },
  {
    id: 'gal_4',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200',
    caption: 'Serene green tea plantation estate path in Sylhet',
    tripId: 'trip_1',
    tripTitle: 'Sylhet Tea Estate Wanderlust',
    tripSlug: '4-days-solo-coxs-bazar-marine-drive',
    destinationName: 'Sylhet Tea Gardens & Jaflong',
    travelType: 'Solo',
    photographerName: 'Aria Montgomery',
    photographerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    photographerId: 'user_1',
    likesCount: 86,
    createdAt: '2026-01-22T08:30:00Z'
  },
  {
    id: 'gal_5',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200',
    caption: 'Sunlight filtering through Tegalalang rice terrace palm trees in Bali',
    tripId: 'trip_2',
    tripTitle: 'Tropical Bali Island Escape',
    tripSlug: '3-days-couple-escape-sajek-valley',
    destinationName: 'Bali Island Paradise',
    travelType: 'Couple',
    photographerName: 'Tanvir & Sarah',
    photographerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    photographerId: 'user_2',
    likesCount: 230,
    createdAt: '2026-01-28T14:10:00Z'
  },
  {
    id: 'gal_6',
    url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1200',
    caption: 'Snowcapped Matterhorn mountain reflection in alpine lake',
    tripId: 'trip_1',
    tripTitle: 'Alpine Wonders of Zermatt',
    tripSlug: '4-days-solo-coxs-bazar-marine-drive',
    destinationName: 'Swiss Alps & Zermatt',
    travelType: 'Solo',
    photographerName: 'Aria Montgomery',
    photographerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    photographerId: 'user_1',
    likesCount: 310,
    createdAt: '2026-02-01T19:00:00Z'
  }
];

export const SEED_REVIEWS: IReview[] = [
  {
    id: 'rev_1',
    tripId: 'trip_1',
    destinationId: 'dest_1',
    userId: 'user_2',
    userName: 'Tanvir & Sarah',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    overallRating: 5.0,
    ratings: {
      safety: 5.0,
      cleanliness: 4.5,
      transport: 5.0,
      accommodation: 4.8,
      food: 5.0,
      value: 5.0
    },
    comment: 'Extremely detailed solo guide! The tip about renting scooters early morning at Kolatoli saved us money on our trip. Thanks Aria!',
    createdAt: '2026-01-22T14:00:00Z'
  },
  {
    id: 'rev_2',
    tripId: 'trip_2',
    destinationId: 'dest_2',
    userId: 'user_3',
    userName: 'Rahman Family Expeditions',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    overallRating: 4.9,
    ratings: {
      safety: 4.8,
      cleanliness: 4.9,
      transport: 4.5,
      accommodation: 5.0,
      food: 5.0,
      value: 4.9
    },
    comment: 'The Sajek convoy advice was spot on! We booked the recommended balcony cottage and saw the cloud ocean just like in your photos.',
    createdAt: '2026-01-27T09:30:00Z'
  }
];
