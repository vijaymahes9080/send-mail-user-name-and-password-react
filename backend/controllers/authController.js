const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/emailService');

/**
 * Generates a signed JSON Web Token containing the user's ID.
 * Binds expiration settings from env.
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'production_ready_default_jwt_secret_key_antigravity',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const {
      fullName,
      username,
      email,
      mobile,
      gender,
      dob,
      password,
      confirmPassword,
    } = req.body;

    // Check that all required inputs are present
    if (!fullName || !username || !email || !mobile || !gender || !dob || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all registration fields.',
      });
    }

    // Verify password matching
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Convert username and email to lowercase for consistent checking
    const parsedUsername = username.trim().toLowerCase();
    const parsedEmail = email.trim().toLowerCase();

    // Check for duplicate username
    const usernameExists = await User.findOne({ username: parsedUsername });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken.',
      });
    }

    // Check for duplicate email address
    const emailExists = await User.findOne({ email: parsedEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already registered.',
      });
    }

    // Create the User record in database (password is automatically hashed inside pre-save mongoose hook)
    const user = await User.create({
      fullName: fullName.trim(),
      username: parsedUsername,
      email: parsedEmail,
      mobile: mobile.trim(),
      gender,
      dob,
      password,
    });

    if (user) {
      // Send welcome email asynchronously to prevent SMTP latency from blocking HTTP response
      sendWelcomeEmail(user);

      // Respond with the token and profile details
      return res.status(201).json({
        success: true,
        message: 'Registration successful! A welcome email has been sent.',
        token: generateToken(user._id),
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          gender: user.gender,
          dob: user.dob,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user registration data provided.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & issue login token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Check inputs
    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.',
      });
    }

    const searchKey = usernameOrEmail.trim().toLowerCase();

    // Look up user by username OR email
    const user = await User.findOne({
      $or: [{ username: searchKey }, { email: searchKey }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Verify password matching using the helper schema method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Respond with profile details and issued JWT
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        gender: user.gender,
        dob: user.dob,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch profile details of the current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // req.user has already been loaded from DB (ex-password) by protect middleware
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
