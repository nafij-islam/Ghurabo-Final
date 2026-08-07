const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function bootstrapAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ghurabo.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'GhuraboAdmin2026!';
  const adminName = process.env.ADMIN_NAME || 'Ghurabo Admin';

  try {
    console.log('Connecting to MongoDB Atlas to bootstrap production Admin account...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const adminDoc = {
      id: 'user_admin_prod',
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      bio: 'Official Ghurabo Community Lead and Quality Moderator.',
      location: 'Dhaka, Bangladesh',
      preferredStyle: 'Group',
      preferredCurrency: 'BDT',
      preferredLanguage: 'en',
      visitedCount: 0,
      followersCount: 0,
      followingCount: 0,
      totalHelpfulVotes: 0,
      badges: ['Platform Admin'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').updateOne(
      { email: adminEmail },
      { $set: adminDoc },
      { upsert: true }
    );

    console.log(`\n====================================================`);
    console.log(`👑 PRODUCTION ADMIN BOOTSTRAPPED SUCCESSFULLY`);
    console.log(`====================================================`);
    console.log(`• Email:    ${adminEmail}`);
    console.log(`• Role:     admin`);
    console.log(`• Password: [SECURELY HASHED WITH BCRYPT]`);
    console.log(`====================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error bootstrapping production Admin:', err);
    process.exit(1);
  }
}

bootstrapAdmin();
