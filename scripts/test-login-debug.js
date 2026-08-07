const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function testLoginDebug() {
  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ email: 'sahariannafis70@gmail.com' });
    console.log('User doc:', user);

    if (user) {
      console.log('Password hash present:', !!user.passwordHash);
      if (user.passwordHash) {
        const testPass = 'GhuraboAdmin2026!';
        const match = await bcrypt.compare(testPass, user.passwordHash);
        console.log(`Password match for "${testPass}":`, match);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('Error debugging login:', err);
    process.exit(1);
  }
}

testLoginDebug();
