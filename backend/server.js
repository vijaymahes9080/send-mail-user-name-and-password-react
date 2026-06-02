const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load environment variables from .env
dotenv.config();

// Establish Mongoose MongoDB Database Connection
connectDB();

const app = express();

// Standard express parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Cross-Origin Resource Sharing (CORS)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// HTTP Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} request received at ${req.originalUrl}`);
  next();
});

// Bind API Routing
app.use('/api/auth', authRoutes);

// Health check root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERN Authentication System API is running smoothly.',
  });
});

// Route fallback (404) for non-existing endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'The requested API endpoint does not exist.',
  });
});

// Centralized Production Error-Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Server Exception] Caught: ${err.message}`);
  
  // Custom parsing for Mongoose validation rules
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: errorDetails[0] || 'Database input validation failed.',
    });
  }

  // Custom formatting for MongoDB duplicate key (11000) constraint failures
  if (err.code === 11000) {
    const duplicateKey = Object.keys(err.keyValue)[0];
    const userFriendlyKey = duplicateKey === 'username' ? 'Username' : duplicateKey === 'email' ? 'Email address' : duplicateKey;
    return res.status(400).json({
      success: false,
      message: `${userFriendlyKey} is already registered on our platform. Please log in or use a different value.`,
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SUCCESS] Express server listening actively on port ${PORT}`);
  console.log(`[ENVIRONMENT] Client Origin Target: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
