const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function wipeDatabaseCompletely() {
  try {
    console.log('Connecting to MongoDB Atlas to COMPLETELY WIPE database to 0...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in database.`);

    for (const col of collections) {
      console.log(`Clearing collection: ${col.name}...`);
      await db.collection(col.name).deleteMany({});
      console.log(`Collection ${col.name} wiped to 0 documents.`);
    }

    console.log('\n✨ COMPLETE DATABASE WIPE SUCCESSFUL! MongoDB Atlas is now 100% CLEAN (0 documents).');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error wiping database:', err);
    process.exit(1);
  }
}

wipeDatabaseCompletely();
