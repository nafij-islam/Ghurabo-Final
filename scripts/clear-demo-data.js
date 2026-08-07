const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function clearDemoData() {
  try {
    console.log('Connecting to MongoDB Atlas to remove seed/demo data...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;

    // Remove demo users, demo trips, demo gallery items
    const demoUserIds = ['user_1', 'user_2', 'user_3', 'user_admin'];
    const demoTripIds = ['trip_1', 'trip_2', 'trip_3', 'trip_4', 'trip_5', 'trip_6'];

    console.log('Deleting demo users...');
    const userRes = await db.collection('users').deleteMany({
      $or: [
        { id: { $in: demoUserIds } },
        { email: { $in: ['aria@ghurabo.com', 'tanvir@ghurabo.com', 'rahman@ghurabo.com'] } }
      ]
    });
    console.log(`Deleted ${userRes.deletedCount} demo users.`);

    console.log('Deleting demo trips...');
    const tripRes = await db.collection('trips').deleteMany({
      id: { $in: demoTripIds }
    });
    console.log(`Deleted ${tripRes.deletedCount} demo trips.`);

    console.log('Deleting demo gallery items...');
    const galRes = await db.collection('galleries').deleteMany({
      id: { $regex: /^gal_[1-6]$/ }
    });
    console.log(`Deleted ${galRes.deletedCount} demo gallery items.`);

    console.log('Deleting demo saved trips, likes, and votes for demo users...');
    await db.collection('savedtrips').deleteMany({ userId: { $in: demoUserIds } });
    await db.collection('triplikes').deleteMany({ userId: { $in: demoUserIds } });
    await db.collection('helpfulvotes').deleteMany({ userId: { $in: demoUserIds } });

    console.log('✅ Demo seed data cleanup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing demo data:', err);
    process.exit(1);
  }
}

clearDemoData();
