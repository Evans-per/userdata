const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  hobbies: { type: String, default: '' },
  bio: { type: String, default: '' },
  userId: { type: String, required: true, unique: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const MONGO_URI = process.env.MONGO_URI;

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  const parsedUrl = parse(req.url, true);
  const { pathname } = parsedUrl;
  const method = req.method;

  try {
    if (MONGO_URI && mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
    }
  } catch (err) {
    console.error('DB connection error:', err.message);
  }

  if (pathname === '/api/users' && method === 'GET') {
    try {
      const { name, email, age, minAge, maxAge, hobby, search, sortBy, order, page, limit } = parsedUrl.query;
      const filter = {};

      if (name) filter.name = { $regex: name, $options: 'i' };
      if (email) filter.email = email.toLowerCase();
      if (age) {
        filter.age = Number(age);
      } else if (minAge || maxAge) {
        filter.age = {};
        if (minAge) filter.age.$gte = Number(minAge);
        if (maxAge) filter.age.$lte = Number(maxAge);
      }
      if (hobby) filter.hobbies = { $in: hobby.split(',').map(h => h.trim()) };
      if (search) filter.$text = { $search: search };

      const skip = (Number(page || 1) - 1) * Number(limit || 10);
      const sortOrder = (order || 'desc') === 'asc' ? 1 : -1;

      const users = await User.find(filter)
        .sort({ [sortBy || 'createdAt']: sortOrder })
        .skip(skip)
        .limit(Number(limit || 10));
      
      const total = await User.countDocuments(filter);

      return res.status(200).json({ success: true, total, page: Number(page || 1), count: users.length, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (pathname === '/api/users' && method === 'POST') {
    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const { name, email, age, hobbies, bio } = JSON.parse(body);
      const userId = uuidv4();
      const user = new User({ name, email, age, hobbies, bio, userId });
      const savedUser = await user.save();
      return res.status(201).json({ success: true, message: 'User created', data: savedUser });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (pathname === '/api/health') {
    return res.status(200).json({ success: true, message: 'API running', mongoDBConnected: mongoose.connection.readyState === 1 });
  }

  if (pathname === '/') {
    return res.status(200).send('User Management API is running');
  }

  return res.status(404).json({ success: false, message: 'Not found' });
}

module.exports = handler;
