const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Public User Registration
 * POST /api/auth/register
 */
router.post('/register', registerUser);

/**
 * Public User Login
 * POST /api/auth/login
 */
router.post('/login', loginUser);

/**
 * Private user details lookup (requires bearer JWT token validation)
 * GET /api/auth/me
 */
router.get('/me', protect, getCurrentUser);

module.exports = router;
