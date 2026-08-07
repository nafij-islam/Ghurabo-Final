const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI;

async function wipeDatabaseCompletely() {
  // Safety Guard: Block accidental wipe in production unless explicitly authorized
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DATABASE_WIPE) {
    console.error('⛔ DANGEROUS ACTION BLOCKED: Database wipe is forbidden in production unless ALLOW_DATABASE_WIPE=true is set.');
    process.exit(1);
  }

  if (!MONGODB_URI) {
    console.error('⛔ MONGODB_URI environment variable is required.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      console.log(`Clearing collection: ${col.name}...`);
      await db.collection(col.name).deleteMany({});
    }

    console.log('\n✨ Database wiped successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error wiping database:', err);
    process.exit(1);
  }
}

wipeDatabaseCompletely();
