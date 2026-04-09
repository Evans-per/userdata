const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────
//  POST /api/users
//  Create / Insert a new user
// ─────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    let { name, email, age, hobbies, bio } = req.body;

    // Normalize data types
    age = parseInt(age);
    if (isNaN(age) || age < 0 || age > 120) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Age must be a number between 0 and 120']
      });
    }

    // Convert hobbies to string (just trim it)
    if (typeof hobbies !== 'string') {
      hobbies = '';
    }
    hobbies = hobbies.trim();

    // Auto-generate a unique userId if not provided
    const userId = req.body.userId || uuidv4();

    const user = new User({ name, email, age, hobbies, bio, userId });
    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: savedUser,
    });
  } catch (error) {
    // Duplicate key error (email or userId)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        error: error.message,
      });
    }
    // Validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
//  GET /api/users
//  Retrieve all users with optional filtering,
//  searching, sorting and pagination
// ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const {
      name,         // search by name (regex)
      email,        // filter by exact email
      age,          // filter by exact age
      minAge,       // filter age >= minAge
      maxAge,       // filter age <= maxAge
      hobby,        // filter by hobby (multikey)
      search,       // text search on bio ($text)
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // 1. Search by name (case-insensitive partial match)
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    // 2. Filter by email
    if (email) {
      filter.email = email.toLowerCase();
    }

    // 3. Filter by age (exact or range)
    if (age) {
      filter.age = Number(age);
    } else {
      if (minAge || maxAge) {
        filter.age = {};
        if (minAge) filter.age.$gte = Number(minAge);
        if (maxAge) filter.age.$lte = Number(maxAge);
      }
    }

    // 4. Filter by hobby (multikey index used)
    if (hobby) {
      filter.hobbies = { $in: hobby.split(',').map((h) => h.trim()) };
    }

    // 5. Full-text search on bio (text index used)
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
//  GET /api/users/:id
//  Retrieve a single user by MongoDB _id
// ─────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
//  PUT /api/users/:id
//  Update a user by MongoDB _id
// ─────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    let updates = req.body;

    // Prevent userId from being changed after creation
    delete updates.userId;

    // Normalize age
    if (updates.age !== undefined) {
      updates.age = parseInt(updates.age);
      if (isNaN(updates.age) || updates.age < 0 || updates.age > 120) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Age must be a number between 0 and 120']
        });
      }
    }

    // Convert hobbies to string if needed
    if (updates.hobbies !== undefined) {
      if (typeof updates.hobbies !== 'string') {
        updates.hobbies = '';
      }
      updates.hobbies = updates.hobbies.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
//  DELETE /api/users/:id
//  Delete a user by MongoDB _id
// ─────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
//  GET /api/users/search/text?q=keyword
//  Full-text search using MongoDB $text operator
// ─────────────────────────────────────────────
const textSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
    }

    const users = await User.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.status(200).json({
      success: true,
      query: q,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  textSearch,
};
