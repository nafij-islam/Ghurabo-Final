const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ghurabofinal:nJMXwm3IwoXa8TV8@cluster0.57pbeou.mongodb.net/ghurabo?appName=Cluster0';

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log(`Total users in MongoDB Atlas: ${users.length}`);
    for (const u of users) {
      console.log(`User: ${u.email} | Name: ${u.name} | Role: ${u.role} | HasPasswordHash: ${!!u.passwordHash}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking users:', err);
    process.exit(1);
  }
}

checkUser();
