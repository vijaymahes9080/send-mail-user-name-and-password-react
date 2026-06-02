const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication check middleware. Extracts, decodes, and validates
 * a Bearer token in the request header, binding the authenticated user (ex-password) to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Read Bearer token from authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'production_ready_default_jwt_secret_key_antigravity');

      // Bind matching database user record while explicitly leaving out the password hash
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authorization failed. User profile no longer exists in database.',
        });
      }

      return next();
    } catch (error) {
      console.error(`[Auth Middleware Error] Verification failed: ${error.message}`);
      
      // Check for expired token error specifically to return appropriate guidance
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
          expired: true,
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid session token. Access denied.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied. Authorization token is missing.',
    });
  }
};

module.exports = {
  protect,
};
