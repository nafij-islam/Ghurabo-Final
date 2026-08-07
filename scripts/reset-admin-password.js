const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function resetAdminPassword() {
  const targetEmail = 'sahariannafis70@gmail.com';
  const newPassword = process.env.NEW_PASSWORD || 'GhuraboAdmin2026!';

  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    const db = mongoose.connection.db;

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const res = await db.collection('users').updateOne(
      { email: targetEmail },
      { $set: { passwordHash, role: 'admin' } }
    );

    console.log(`Updated password for ${targetEmail}. Modified count: ${res.modifiedCount}`);
    console.log(`New Password set to: "${newPassword}"`);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
}

resetAdminPassword();
