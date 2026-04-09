require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// ─────────────────────────────────────────────
//  Connect to MongoDB
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
//  Middleware
// ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Basic request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 User Management API is running',
    college: 'Fr. Conceicao Rodrigues College of Engineering',
    department: 'Computer Engineering',
    version: '1.0.0',
    endpoints: {
      'POST   /api/users':              'Create a new user',
      'GET    /api/users':              'Get all users (supports filtering & search)',
      'GET    /api/users/:id':          'Get user by ID',
      'PUT    /api/users/:id':          'Update user by ID',
      'DELETE /api/users/:id':          'Delete user by ID',
      'GET    /api/users/search/text':  'Full-text search on bio (?q=keyword)',
    },
    queryParams: {
      name:    'Search by name (partial, case-insensitive)',
      email:   'Filter by email',
      age:     'Filter by exact age',
      minAge:  'Filter age >= minAge',
      maxAge:  'Filter age <= maxAge',
      hobby:   'Filter by hobby (comma-separated)',
      search:  'Full text search on bio',
      sortBy:  'Sort field (default: createdAt)',
      order:   'asc | desc (default: desc)',
      page:    'Page number (default: 1)',
      limit:   'Results per page (default: 10)',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ─────────────────────────────────────────────
//  Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
