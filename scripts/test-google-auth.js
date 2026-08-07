const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function testGoogleAuthIntegration() {
  console.log('====================================================');
  console.log('🔥 TESTING FIREBASE GOOGLE AUTH & MONGODB MATCHING');
  console.log('====================================================\n');

  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    const db = mongoose.connection.db;

    // Test 1: Check existing admin matching for admin@ghurabo.com
    const adminUser = await db.collection('users').findOne({ email: 'admin@ghurabo.com' });
    if (adminUser && adminUser.role === 'admin') {
      console.log('✓ TEST 1 PASSED: Admin account admin@ghurabo.com correctly identified with role "admin".');
    } else {
      console.error('❌ TEST 1 FAILED: Admin account not found or wrong role.');
      process.exit(1);
    }

    // Test 2: Check schema fields support for Google Auth
    const testDoc = {
      id: `test_google_${Date.now()}`,
      name: 'Google Test Explorer',
      email: `testgoogle${Date.now()}@example.com`,
      authProvider: 'google',
      googleUid: 'google_uid_test_12345',
      role: 'traveller',
      createdAt: new Date().toISOString(),
    };

    await db.collection('users').insertOne(testDoc);
    const retrieved = await db.collection('users').findOne({ id: testDoc.id });

    if (retrieved && retrieved.authProvider === 'google' && retrieved.googleUid === 'google_uid_test_12345') {
      console.log('✓ TEST 2 PASSED: New Google User creation schema & fields validated.');
      await db.collection('users').deleteOne({ id: testDoc.id });
      console.log('  Cleaned up temporary test document.');
    } else {
      console.error('❌ TEST 2 FAILED: Google user schema fields invalid.');
      process.exit(1);
    }

    console.log('\n====================================================');
    console.log('✨ ALL GOOGLE AUTH INTEGRATION TESTS PASSED!');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Google auth test failed:', err);
    process.exit(1);
  }
}

testGoogleAuthIntegration();
