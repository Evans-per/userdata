const mongoose = require('mongoose');

// ─────────────────────────────────────────────
//  User Schema Definition
//  Fields: name, email, age, hobbies, bio,
//          userId, createdAt
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120'],
    },

    // String for hobbies (comma-separated or plain text)
    hobbies: {
      type: String,
      default: '',
      trim: true,
    },

    // String for full-text search → Text Index
    bio: {
      type: String,
      default: '',
    },

    // Unique identifier → Hashed Index
    userId: {
      type: String,
      required: [true, 'UserId is required'],
      unique: true,
    },

    // Date with default → TTL Index
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Adds updatedAt automatically
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    versionKey: false,
  }
);

// ─────────────────────────────────────────────
//  INDEX DEFINITIONS
//  (as required by the college assignment)
// ─────────────────────────────────────────────

// 1. Single-field index on name
userSchema.index({ name: 1 }, { name: 'idx_name_single' });

// 2. Compound index on email + age
userSchema.index({ email: 1, age: 1 }, { name: 'idx_email_age_compound' });

// 3. Single-field index on hobbies (now string field)
userSchema.index({ hobbies: 1 }, { name: 'idx_hobbies_single' });

// 4. Text index on bio (for full-text search)
userSchema.index({ bio: 'text' }, { name: 'idx_bio_text' });

// 5. Hashed index on userId
userSchema.index({ userId: 'hashed' }, { name: 'idx_userId_hashed' });

// 6. TTL index on createdAt — documents expire after 1 year (31,536,000 seconds)
//    Change expireAfterSeconds to a smaller value (e.g. 60) for quick demo
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 31536000, name: 'idx_createdAt_ttl' }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
