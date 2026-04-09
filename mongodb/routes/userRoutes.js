const express = require('express');
const router = express.Router();

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  textSearch,
} = require('../controllers/userController');

// ─────────────────────────────────────────────
//  User Routes
// ─────────────────────────────────────────────

// GET  /api/users/search/text?q=keyword  — MUST come before /:id
router.get('/search/text', textSearch);

// POST   /api/users       — Create user
// GET    /api/users       — Get all users (with filtering/search/pagination)
router.route('/').post(createUser).get(getAllUsers);

// GET    /api/users/:id   — Get single user
// PUT    /api/users/:id   — Update user
// DELETE /api/users/:id   — Delete user
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
