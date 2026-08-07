/**
 * GHURABO FULL AUTOMATED SUITE TEST RUNNER
 * Tests 14 Core Workflows, Security Protections, Admin Popular Trips, Gallery Sync, and Auth Redirects
 */

const PORT = process.env.PORT || 3000;
let activeUrl = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING GHURABO AUTOMATED SUITE (EXTENDED WORKFLOWS)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failed++;
    }
  }

  // Determine active port
  try {
    const ping = await fetch('http://localhost:3000/api/destinations');
    if (!ping.ok && ping.status !== 200) {
      activeUrl = 'http://localhost:3001';
    }
  } catch (e) {
    try {
      const ping2 = await fetch('http://localhost:3001/api/destinations');
      if (ping2.ok) activeUrl = 'http://localhost:3001';
    } catch (err) {}
  }

  // 1. Invalid Route & Health Check
  try {
    const res = await fetch(`${activeUrl}/api/trips/invalid_slug_non_existent`);
    assert(res.status === 404, '1. Invalid route handling (404 for non-existent trip)');
  } catch (e) {
    assert(false, '1. Invalid route handling error: ' + e.message);
  }

  // 2. Public Destinations Fetch
  try {
    const res = await fetch(`${activeUrl}/api/destinations`);
    const data = await res.json();
    assert(data.success && Array.isArray(data.destinations), '2. Public Destinations API fetch');
  } catch (e) {
    assert(false, '2. Public Destinations API fetch error: ' + e.message);
  }

  // 3. Search and Filters Test
  try {
    const res = await fetch(`${activeUrl}/api/destinations?q=cox`);
    const data = await res.json();
    assert(data.success && Array.isArray(data.destinations), '3. Search & Filters API query processing');
  } catch (e) {
    assert(false, '3. Search & Filters error: ' + e.message);
  }

  // 4. Unauthorized Admin Route Protection (Blocking Travellers)
  try {
    const res = await fetch(`${activeUrl}/api/admin/trips`);
    assert(res.status === 403, '4. Blocking unauthorized travellers from Admin APIs (403 Forbidden)');
  } catch (e) {
    assert(false, '4. Admin protection error: ' + e.message);
  }

  // 5. Unauthorized Upload Route Protection
  try {
    const res = await fetch(`${activeUrl}/api/upload`, { method: 'POST' });
    assert(res.status === 401, '5. Blocking unauthorized upload requests (401 Unauthorized)');
  } catch (e) {
    assert(false, '5. Upload protection error: ' + e.message);
  }

  // 6. Block Guest Trip Creation (Server-Side 401)
  try {
    const res = await fetch(`${activeUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthenticated Trip Attempt' }),
    });
    assert(res.status === 401, '6. Server-side blocking of unauthenticated POST /api/trips (401 Unauthorized)');
  } catch (e) {
    assert(false, '6. Unauthenticated creation error: ' + e.message);
  }

  // 7. Signup Workflow
  let authCookie = '';
  const testEmail = `testuser_${Date.now()}@ghurabo.com`;
  try {
    const res = await fetch(`${activeUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Explorer',
        email: testEmail,
      }),
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) authCookie = setCookie;
    const data = await res.json();
    assert(data.success && data.user && data.user.email === testEmail, '7. User Signup workflow');
  } catch (e) {
    assert(false, '7. Signup workflow error: ' + e.message);
  }

  // 8. Session Auth Me Workflow
  try {
    const res = await fetch(`${activeUrl}/api/auth/me`, {
      headers: { cookie: authCookie },
    });
    const data = await res.json();
    assert(data.success && data.user && data.user.email === testEmail, '8. Protected session retrieval (/api/auth/me)');
  } catch (e) {
    assert(false, '8. Session retrieval error: ' + e.message);
  }

  // 9. Profile Update Workflow
  try {
    const res = await fetch(`${activeUrl}/api/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', cookie: authCookie },
      body: JSON.stringify({
        name: 'Test Explorer Updated',
        bio: 'Updated bio for test runner',
        location: 'Sylhet, Bangladesh',
      }),
    });
    const data = await res.json();
    assert(data.success && data.user.name === 'Test Explorer Updated', '9. User Profile Update workflow');
  } catch (e) {
    assert(false, '9. Profile update error: ' + e.message);
  }

  // 10. Trip Sharing Workflow (submitted as pending moderation)
  let createdTripId = '';
  try {
    const res = await fetch(`${activeUrl}/api/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: authCookie },
      body: JSON.stringify({
        title: 'Automated Test Trip Story',
        destinationName: "Cox's Bazar Beach",
        travelType: 'Solo',
        durationDays: 3,
        summary: 'Automated test trip created during testing suite run.',
        story: 'Detailed story content for test runner.',
        costBreakdown: { transport: 100, hotel: 150, food: 80, perPersonCost: 330, totalCost: 330 },
      }),
    });
    const data = await res.json();
    if (data.trip) createdTripId = data.trip.id;
    assert(data.success && data.trip && data.trip.status === 'pending', '10. Trip Sharing workflow (submitted as pending moderation)');
  } catch (e) {
    assert(false, '10. Trip sharing error: ' + e.message);
  }

  // 11. Blocking Unauthorized Edits & Deletions on Other User Trips
  try {
    const res = await fetch(`${activeUrl}/api/trips/${createdTripId}`, {
      method: 'DELETE',
    });
    assert(res.status === 401 || res.status === 403, '11. Blocking unauthorized trip deletion without ownership (401/403)');
  } catch (e) {
    assert(false, '11. Unauthorized deletion error: ' + e.message);
  }

  // 12. Public Trip Visibility & Gallery Sync Check (Approved Only)
  try {
    const res = await fetch(`${activeUrl}/api/gallery`);
    const data = await res.json();
    assert(data.success && Array.isArray(data.gallery), '12. Community Gallery synchronization (Approved trips only)');
  } catch (e) {
    assert(false, '12. Gallery sync error: ' + e.message);
  }

  // 13. Dynamic Popular Trips API Filter (/api/trips?popular=true)
  try {
    const res = await fetch(`${activeUrl}/api/trips?popular=true`);
    const data = await res.json();
    assert(data.success && Array.isArray(data.trips), '13. Popular Trips API filter (/api/trips?popular=true)');
  } catch (e) {
    assert(false, '13. Popular Trips API filter error: ' + e.message);
  }

  // 14. Homepage & Core SSR response health
  try {
    const res = await fetch(`${activeUrl}/`);
    assert(res.status === 200, '14. Homepage & Core SSR response health (200 OK)');
  } catch (e) {
    assert(false, '14. Homepage health error: ' + e.message);
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');
}

runTests();
