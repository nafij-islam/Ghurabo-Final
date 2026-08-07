const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function auditDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas for audit...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('\n====================================================');
    console.log('📊 MONGODB ATLAS PRODUCTION DATABASE AUDIT');
    console.log('====================================================\n');

    const summary = {};

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      summary[col.name] = count;
      console.log(`• Collection [${col.name}]: ${count} document(s)`);
    }

    console.log('\n====================================================');
    console.log('Summary Object:', JSON.stringify(summary, null, 2));
    console.log('====================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Database Audit Error:', err);
    process.exit(1);
  }
}

auditDatabase();
