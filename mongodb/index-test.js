/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  index-test.js
 *  Fr. Conceicao Rodrigues College of Engineering
 *  Department of Computer Engineering
 *
 *  PURPOSE: Test all MongoDB indexes using .explain("executionStats")
 *  USAGE  : node index-test.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Pretty-print execution stats from an explain() result.
 */
function printStats(label, stats) {
  const qs = stats.queryPlanner?.winningPlan?.inputStage || {};
  const es = stats.executionStats || {};

  console.log('\n' + '═'.repeat(60));
  console.log(`  TEST: ${label}`);
  console.log('═'.repeat(60));
  console.log(`  Index Used        : ${qs.indexName || stats.queryPlanner?.winningPlan?.inputStage?.inputStage?.indexName || 'N/A (COLLSCAN)'}`);
  console.log(`  Stage             : ${stats.queryPlanner?.winningPlan?.stage || 'N/A'}`);
  console.log(`  Keys Examined     : ${es.totalKeysExamined ?? 'N/A'}`);
  console.log(`  Documents Examined: ${es.totalDocsExamined ?? 'N/A'}`);
  console.log(`  Documents Returned: ${es.nReturned ?? 'N/A'}`);
  console.log(`  Execution Time    : ${es.executionTimeMillis ?? 'N/A'} ms`);
  console.log('─'.repeat(60));
}

/**
 * Show all indexes present on the users collection.
 */
async function listIndexes() {
  const indexes = await User.collection.indexes();
  console.log('\n📋 CURRENT INDEXES ON users COLLECTION:');
  console.log('─'.repeat(60));
  indexes.forEach((idx, i) => {
    console.log(`  [${i + 1}] Name: ${idx.name}`);
    console.log(`       Key : ${JSON.stringify(idx.key)}`);
    if (idx.expireAfterSeconds !== undefined) {
      console.log(`       TTL : expires after ${idx.expireAfterSeconds} seconds`);
    }
    if (idx.unique) console.log(`       Unique: true`);
    console.log();
  });
}

// ── Sample Data ───────────────────────────────────────────────────────────────

const sampleUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 22,
    hobbies: 'reading, cycling, photography',
    bio: 'Alice loves open source software and machine learning',
    userId: 'uid-001',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    age: 25,
    hobbies: 'gaming, cooking',
    bio: 'Bob is a full stack developer passionate about Node.js',
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
    bio: 'Eva is a UI/UX designer who loves MongoDB and data visualization',
    userId: 'uid-005',
  },
];

// ── Main Test Runner ──────────────────────────────────────────────────────────

async function runIndexTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Step 1: Clean & insert sample data ──────────────────────────────────
    console.log('\n🗑️  Clearing existing test data...');
    await User.deleteMany({});

    console.log('📥 Inserting sample users...');
    await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${sampleUsers.length} sample users`);

    // ── Step 2: List all indexes ─────────────────────────────────────────────
    await listIndexes();

    // ── Step 3: Test each index ──────────────────────────────────────────────

    // TEST 1: Single-field index on name
    const t1 = await User.find({ name: 'Alice Johnson' })
      .explain('executionStats');
    printStats('Single-field index on name (find by name)', t1);

    // TEST 2: Compound index on email + age
    const t2 = await User.find({ email: 'bob@example.com', age: 25 })
      .explain('executionStats');
    printStats('Compound index on email + age', t2);

    // TEST 3: Multikey index on hobbies (array field)
    const t3 = await User.find({ hobbies: 'reading' })
      .explain('executionStats');
    printStats('Multikey index on hobbies (find by hobby)', t3);

    // TEST 4: Text index on bio
    // Note: text searches use explain differently
    const t4 = await User.find({ $text: { $search: 'MongoDB' } })
      .explain('executionStats');
    printStats('Text index on bio ($text search for "MongoDB")', t4);

    // TEST 5: Hashed index on userId (equality query only — no range)
    const t5 = await User.find({ userId: 'uid-003' })
      .explain('executionStats');
    printStats('Hashed index on userId (find by userId)', t5);

    // TEST 6: TTL index on createdAt (query by createdAt range)
    const t6 = await User.find({
      createdAt: { $gte: new Date(Date.now() - 86400000) }, // last 24 h
    }).explain('executionStats');
    printStats('TTL index on createdAt (range query)', t6);

    // ── Step 4: Additional filtering tests ──────────────────────────────────
    console.log('\n\n📊 ADDITIONAL QUERY TESTS (without explain):');
    console.log('─'.repeat(60));

    // Filter by age range
    const byAge = await User.find({ age: { $gte: 20, $lte: 28 } });
    console.log(`\n  Age 20–28: ${byAge.map((u) => u.name).join(', ')}`);

    // Filter by multiple hobbies
    const byHobbies = await User.find({ hobbies: { $in: ['cycling', 'yoga'] } });
    console.log(`  Has cycling or yoga: ${byHobbies.map((u) => u.name).join(', ')}`);

    // Name partial search
    const byName = await User.find({ name: { $regex: 'son', $options: 'i' } });
    console.log(`  Name contains "son": ${byName.map((u) => u.name).join(', ')}`);

    console.log('\n✅ All index tests completed successfully!\n');
  } catch (err) {
    console.error('❌ Test Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

runIndexTests();
