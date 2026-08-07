const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function bootstrapAdmin() {
  const adminAccounts = [
    {
      id: 'user_admin_prod',
      email: (process.env.ADMIN_EMAIL || 'admin@ghurabo.com').toLowerCase().trim(),
      name: process.env.ADMIN_NAME || 'Ghurabo Admin',
      password: process.env.ADMIN_PASSWORD || 'GhuraboAdmin2026!',
    },
    {
      id: 'user_admin_saharian',
      email: 'sahariannafis70@gmail.com',
      name: 'Nafij Islam (Admin)',
      password: 'GhuraboAdmin2026!',
    },
  ];

  try {
    console.log('Connecting to MongoDB Atlas to bootstrap production Admin accounts...');
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected to MongoDB Atlas.');

    const db = mongoose.connection.db;

    for (const acc of adminAccounts) {
      const passwordHash = await bcrypt.hash(acc.password, 10);

      const adminDoc = {
        id: acc.id,
        name: acc.name,
        email: acc.email,
        passwordHash,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
        bio: 'Official Ghurabo Community Lead and Quality Moderator.',
        location: 'Dhaka, Bangladesh',
        preferredStyle: 'Solo',
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
        { email: acc.email },
        { $set: adminDoc },
        { upsert: true }
      );
      console.log(`• Bootstrapped Admin: ${acc.email} (Password: ${acc.password})`);
    }

    console.log(`\n====================================================`);
    console.log(`👑 PRODUCTION ADMIN ACCOUNTS READY`);
    console.log(`====================================================\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error bootstrapping production Admin:', err);
    process.exit(1);
  }
}

bootstrapAdmin();
