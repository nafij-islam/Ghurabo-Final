const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

function getMongoUri() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.+)/);
    if (match && match[1]) {
      return match[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  return process.env.MONGODB_URI;
}

async function cleanup() {
  const uri = getMongoUri();
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');

    const db = mongoose.connection.db;

    // Delete test trips created by test runner
    const tripResult = await db.collection('trips').deleteMany({
      $or: [
        { title: /Automated Test Trip Story/i },
        { summary: /Automated test trip created/i },
        { userName: /Test Explorer/i },
      ],
    });
    console.log(`Deleted ${tripResult.deletedCount} test trips from database.`);

    // Delete test users created by test runner
    const userResult = await db.collection('users').deleteMany({
      $or: [
        { email: /testrunner_/i },
        { name: /Test Explorer/i },
      ],
    });
    console.log(`Deleted ${userResult.deletedCount} test users from database.`);

    await mongoose.disconnect();
    console.log('Cleanup completed successfully.');
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

cleanup();
