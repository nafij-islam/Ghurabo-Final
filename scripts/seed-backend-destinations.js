const https = require('https');

const DESTINATIONS = [
  {
    name: "Cox's Bazar",
    slug: "coxs-bazar",
    country: "Bangladesh",
    city: "Chittagong",
    category: "BEACH",
    summary: "Longest unbroken natural sea beach in the world with stunning golden sands.",
    description: "Cox's Bazar is a city, fishing port, tourism centre, and district headquarters in southeastern Bangladesh. It is famous for its long natural sandy beach, stretching over 120 km unbroken.",
    coverImage: {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      caption: "Cox's Bazar Beach Sunset"
    },
    coordinates: {
      latitude: 21.4272,
      longitude: 92.0058
    },
    averageDailyCostBDT: 3500,
    bestTimeToVisit: "November to March",
    isFeatured: true
  },
  {
    name: "Sajek Valley",
    slug: "sajek-valley",
    country: "Bangladesh",
    city: "Rangamati",
    category: "MOUNTAIN",
    summary: "Kingdom of clouds situated amidst the lush hills of Kasalong range.",
    description: "Sajek Valley is an all-weather tourist spot nestled in the hills of Chittagong Hill Tracts. Known as the Queen of Hills, it offers spectacular views of sea-like clouds flowing over mountain peaks.",
    coverImage: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      caption: "Sajek Valley Hilltop Clouds"
    },
    coordinates: {
      latitude: 23.3820,
      longitude: 92.2938
    },
    averageDailyCostBDT: 4000,
    bestTimeToVisit: "September to February",
    isFeatured: true
  },
  {
    name: "Sreemangal",
    slug: "sreemangal",
    country: "Bangladesh",
    city: "Sylhet",
    category: "RESORT",
    summary: "The tea capital of Bangladesh surrounded by lush green tea estates and rain forests.",
    description: "Sreemangal is known as the Tea Capital of Bangladesh. Miles after miles of green tea gardens along with Lawachara National Park and seven-layer tea make it an unforgettable getaway.",
    coverImage: {
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      caption: "Sreemangal Tea Estates"
    },
    coordinates: {
      latitude: 24.3065,
      longitude: 91.7296
    },
    averageDailyCostBDT: 3000,
    bestTimeToVisit: "October to April",
    isFeatured: true
  },
  {
    name: "Saint Martin Island",
    slug: "saint-martin-island",
    country: "Bangladesh",
    city: "Cox's Bazar",
    category: "ISLAND",
    summary: "The only coral island in Bangladesh with crystal blue waters and coconut groves.",
    description: "Saint Martin's Island is a small island in the northeastern part of the Bay of Bengal, about 9 km south of the tip of the Cox's Bazar-Teknaf peninsula. Famous for coral reefs and serene beaches.",
    coverImage: {
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      caption: "Saint Martin Coral Shores"
    },
    coordinates: {
      latitude: 20.6268,
      longitude: 92.3225
    },
    averageDailyCostBDT: 4500,
    bestTimeToVisit: "November to February",
    isFeatured: true
  },
  {
    name: "Bandarban",
    slug: "bandarban",
    country: "Bangladesh",
    city: "Chittagong",
    category: "MOUNTAIN",
    summary: "Breathtaking hill ranges, Nilgiri clouds, waterfalls, and vibrant tribal culture.",
    description: "Bandarban is one of the three hill districts of Bangladesh and a part of the Chittagong Hill Tracts. It is home to the highest peaks of Bangladesh like Tahjindong and Keokradong.",
    coverImage: {
      url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
      caption: "Bandarban Nilgiri View"
    },
    coordinates: {
      latitude: 21.9213,
      longitude: 92.3551
    },
    averageDailyCostBDT: 3800,
    bestTimeToVisit: "October to March",
    isFeatured: true
  }
];

function req(ep, opt = {}, body = null) {
  return new Promise((res, rej) => {
    const url = new URL('https://ghurabo-final-backend.vercel.app' + ep);
    const r = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: opt.method || 'GET',
      headers: opt.headers || {},
    }, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => {
        try {
          res({ status: resp.statusCode, body: JSON.parse(d) });
        } catch {
          res({ status: resp.statusCode, body: d });
        }
      });
    });
    r.on('error', rej);
    if (body) r.write(body);
    r.end();
  });
}

async function seedDestinations() {
  console.log('1. Logging in as Admin to seed backend destinations...');
  const login = await req('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, JSON.stringify({ email: 'admin@ghurabo.com', password: 'Admin@12345!' }));

  if (!login.body?.data?.tokens?.accessToken) {
    console.error('Failed to log in:', login.body);
    return;
  }

  const token = login.body.data.tokens.accessToken;
  console.log('2. Admin authenticated. Creating destinations...');

  for (const dest of DESTINATIONS) {
    console.log(`Creating ${dest.name}...`);
    const createRes = await req('/api/v1/admin/destinations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }, JSON.stringify(dest));

    if (createRes.status === 201 || createRes.status === 200) {
      console.log(`✅ ${dest.name} created! ID: ${createRes.body.data?._id || createRes.body.data?.id}`);
    } else {
      console.log(`❌ ${dest.name} failed:`, createRes.status, createRes.body);
    }
  }

  console.log('3. Verifying destinations list:');
  const list = await req('/api/v1/destinations');
  console.log('Total destinations now:', list.body?.data?.length);
  console.log(list.body?.data?.map(d => ({ id: d._id, name: d.name })));
}

seedDestinations().catch(console.error);
