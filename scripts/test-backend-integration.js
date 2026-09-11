/**
 * End-to-End Integration Verification Script
 * Validates connectivity, authentication, and core API operations against the deployed live backend:
 * https://ghurabo-final-backend.vercel.app
 */

const https = require('https');

const BASE_URL = 'https://ghurabo-final-backend.vercel.app';

function request(endpoint, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    const reqOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runIntegrationTests() {
  console.log('🚀 Starting Ghurabo Live Backend Integration Verification...\n');
  let passed = 0;
  let failed = 0;

  // 1. Destinations Endpoint
  try {
    process.stdout.write('1. Testing GET /api/v1/destinations ... ');
    const res = await request('/api/v1/destinations');
    if (res.status === 200 && res.data.success && Array.isArray(res.data.data)) {
      console.log(`✅ PASSED (${res.data.data.length} destinations found)`);
      passed++;
    } else {
      console.log(`❌ FAILED (Status: ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // 2. Trips Endpoint
  try {
    process.stdout.write('2. Testing GET /api/v1/trips ... ');
    const res = await request('/api/v1/trips');
    if (res.status === 200 && res.data.success && Array.isArray(res.data.data)) {
      console.log(`✅ PASSED (${res.data.data.length} trips found)`);
      passed++;
    } else {
      console.log(`❌ FAILED (Status: ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // 3. Gallery Endpoint
  try {
    process.stdout.write('3. Testing GET /api/v1/gallery ... ');
    const res = await request('/api/v1/gallery');
    if (res.status === 200 && res.data.success && Array.isArray(res.data.data)) {
      console.log(`✅ PASSED (${res.data.data.length} gallery items found)`);
      passed++;
    } else {
      console.log(`❌ FAILED (Status: ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // 4. Settings Endpoint
  try {
    process.stdout.write('4. Testing GET /api/v1/settings ... ');
    const res = await request('/api/v1/settings');
    if (res.status === 200 && res.data.success) {
      console.log(`✅ PASSED (Settings loaded)`);
      passed++;
    } else {
      console.log(`❌ FAILED (Status: ${res.status})`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // 5. Admin Login & Dual-Token Verification
  let adminAccessToken = null;
  let adminRefreshToken = null;
  try {
    process.stdout.write('5. Testing POST /api/v1/auth/login (Admin) ... ');
    const res = await request('/api/v1/auth/login', { method: 'POST' }, {
      email: 'admin@ghurabo.com',
      password: 'Admin@12345!',
    });

    const tokens = res.data.data?.tokens || res.data.data;
    if (res.status === 200 && res.data.success && tokens?.accessToken) {
      adminAccessToken = tokens.accessToken;
      adminRefreshToken = tokens.refreshToken;
      console.log(`✅ PASSED (Dual tokens received for role: ${res.data.data.user?.role})`);
      passed++;
    } else {
      console.log(`❌ FAILED (Status: ${res.status}, Message: ${JSON.stringify(res.data)})`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // 6. Authenticated Session (GET /api/v1/auth/me)
  if (adminAccessToken) {
    try {
      process.stdout.write('6. Testing GET /api/v1/auth/me (Bearer Token) ... ');
      const res = await request('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      if (res.status === 200 && res.data.success && res.data.data?.email === 'admin@ghurabo.com') {
        console.log(`✅ PASSED (Authenticated as ${res.data.data.fullName || res.data.data.email})`);
        passed++;
      } else {
        console.log(`❌ FAILED (Status: ${res.status})`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 7. Token Refresh Rotation (POST /api/v1/auth/refresh)
  if (adminRefreshToken) {
    try {
      process.stdout.write('7. Testing POST /api/v1/auth/refresh ... ');
      const res = await request('/api/v1/auth/refresh', { method: 'POST' }, {
        refreshToken: adminRefreshToken,
      });
      const refreshTokens = res.data.data?.tokens || res.data.data;
      if (res.status === 200 && res.data.success && refreshTokens?.accessToken) {
        console.log(`✅ PASSED (Token rotated successfully)`);
        passed++;
      } else {
        console.log(`❌ FAILED (Status: ${res.status}, Message: ${JSON.stringify(res.data)})`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 8. Admin Moderation Queue (GET /api/v1/admin/trips/pending)
  if (adminAccessToken) {
    try {
      process.stdout.write('8. Testing GET /api/v1/admin/trips/pending ... ');
      const res = await request('/api/v1/admin/trips/pending', {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      if (res.status === 200 && res.data.success) {
        console.log(`✅ PASSED (${res.data.data?.length ?? 0} pending trips in moderation queue)`);
        passed++;
      } else {
        console.log(`❌ FAILED (Status: ${res.status})`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log('\n==================================================');
  console.log(`Integration Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationTests();
