const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function cleanProductionDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas for safe production cleanup...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;

    console.log('Cleaning test/demo users (identifiable markers: example.com, test_, demo_)...');
    const userRes = await db.collection('users').deleteMany({
      $or: [
        { isDemo: true },
        { isTest: true },
        { email: { $regex: /@example\.com$/i } },
        { email: { $regex: /^test_/i } },
        { id: { $regex: /^demo_/i } },
      ],
    });
    console.log(`Removed ${userRes.deletedCount} test/demo user document(s).`);

    console.log('Cleaning test/demo trips (identifiable markers: isTest, test_, demo_)...');
    const tripRes = await db.collection('trips').deleteMany({
      $or: [
        { isDemo: true },
        { isTest: true },
        { id: { $regex: /^test_/i } },
        { id: { $regex: /^demo_/i } },
        { title: { $regex: /automated test/i } },
      ],
    });
    console.log(`Removed ${tripRes.deletedCount} test/demo trip document(s).`);

    console.log('Cleaning orphaned gallery items...');
    const galRes = await db.collection('galleries').deleteMany({
      $or: [
        { id: { $regex: /^gal_demo/i } },
        { id: { $regex: /^gal_test/i } },
      ],
    });
    console.log(`Removed ${galRes.deletedCount} test/demo gallery document(s).`);

    console.log('\n✅ Safe production database cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Safe production cleanup failed:', err);
    process.exit(1);
  }
}

cleanProductionDatabase();
