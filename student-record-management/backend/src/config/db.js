const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const config = require('./config');

let mongoServer;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    const shouldUseInMemoryFallback = config.env !== 'production' && !process.env.MONGO_URI;

    if (shouldUseInMemoryFallback) {
      console.warn('MongoDB not reachable, starting an in-memory server for local development.');
      mongoServer = await MongoMemoryServer.create();
      const conn = await mongoose.connect(await mongoServer.getUri(), { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB connected via in-memory server: ${conn.connection.host}`);
      return conn.connection;
    }

    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
