/**
 * ─────────────────────────────────────────────
 *  scripts/seed.js
 *  Seed the database with sample users
 *  USAGE: node scripts/seed.js
 * ─────────────────────────────────────────────
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const users = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 22,
    hobbies: 'reading, cycling, photography',
    bio: 'Alice loves open source software and machine learning research',
    userId: 'uid-001',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    age: 25,
    hobbies: 'gaming, cooking',
    bio: 'Bob is a full stack developer passionate about Node.js and Express',
    userId: 'uid-002',
  },
  {
    name: 'Carol White',
    email: 'carol@example.com',
    age: 30,
    hobbies: 'yoga, reading, travel',
    bio: 'Carol enjoys exploring new places and writing travel blogs',
    userId: 'uid-003',
  },
  {
    name: 'David Brown',
    email: 'david@example.com',
    age: 19,
    hobbies: 'football, gaming, music',
    bio: 'David is a college student interested in databases and cloud computing',
    userId: 'uid-004',
  },
  {
    name: 'Eva Green',
    email: 'eva@example.com',
    age: 28,
    hobbies: 'painting, cycling',
    bio: 'Eva is a UI/UX designer who loves MongoDB and data visualization tools',
    userId: 'uid-005',
  },
  {
    name: 'Frank Miller',
    email: 'frank@example.com',
    age: 35,
    hobbies: 'hiking, chess, reading',
    bio: 'Frank is a backend engineer specializing in MongoDB performance tuning',
    userId: 'uid-006',
  },
  {
    name: 'Grace Lee',
    email: 'grace@example.com',
    age: 21,
    hobbies: 'dancing, photography',
    bio: 'Grace is studying computer engineering and loves machine learning',
    userId: 'uid-007',
  },
  {
    name: 'Henry Adams',
    email: 'henry@example.com',
    age: 45,
    hobbies: 'gardening, cooking, yoga',
    bio: 'Henry is a senior developer with expertise in database design and Node.js',
    userId: 'uid-008',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const inserted = await User.insertMany(users);
    console.log(`✅ Seeded ${inserted.length} users successfully!`);

    console.log('\n📋 Inserted Users:');
    inserted.forEach((u) => {
      console.log(`   - ${u.name} <${u.email}> (age: ${u.age})`);
    });
  } catch (err) {
    console.error('❌ Seed Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seed();
