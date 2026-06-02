const mongoose = require('mongoose');

/**
 * Establishes an asynchronous connection to MongoDB using Mongoose.
 * Logs success or exits the process on connection error.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/user_auth_system';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[ERROR] MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
