const https = require('https');

async function fixTrips() {
  function req(ep, opt = {}, body = null) {
    return new Promise((res, rej) => {
      const url = new URL('https://ghurabo-final-backend.vercel.app' + ep);
      const r = https.request({
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
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

  console.log('Logging in as admin...');
  const login = await req('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, JSON.stringify({ email: 'admin@ghurabo.com', password: 'Admin@12345!' }));

  const token = login.body.data.tokens.accessToken;
  console.log('Logged in.');

  // Fetch all trips
  const tripsRes = await req('/api/v1/trips?limit=50');
  const trips = tripsRes.body.data || [];
  console.log(`Found ${trips.length} trips in backend.`);

  for (const t of trips) {
    let needsUpdate = false;
    let newCover = t.coverImage?.url;

    // Check if coverImage is a blob
    if (!newCover || newCover.startsWith('blob:') || newCover.startsWith('data:')) {
      needsUpdate = true;
      // Look for a real photo in t.photos
      const realPhoto = (t.photos || []).find(p => p.url && !p.url.startsWith('blob:') && !p.url.startsWith('data:'));
      if (realPhoto) {
        newCover = realPhoto.url;
      } else if (t.destination?.name?.toLowerCase().includes('sylhet')) {
        newCover = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80';
      } else {
        newCover = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
      }
    }

    // Clean photos array
    const cleanedPhotos = (t.photos || [])
      .filter(p => p.url && !p.url.startsWith('blob:') && !p.url.startsWith('data:'));
    if (cleanedPhotos.length === 0) {
      cleanedPhotos.push({
        url: newCover,
        caption: t.title,
      });
    }

    if (needsUpdate) {
      console.log(`Fixing trip "${t.title}" (${t._id})... new cover: ${newCover}`);
      const patchRes = await req(`/api/v1/trips/${t._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }, JSON.stringify({
        coverImage: {
          url: newCover,
          caption: t.title,
        },
        photos: cleanedPhotos,
      }));
      console.log('Patch result status:', patchRes.status, patchRes.body?.message || patchRes.body);
    }
  }

  console.log('Finished fixing trips.');
}

fixTrips().catch(console.error);
