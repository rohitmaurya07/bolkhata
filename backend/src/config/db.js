import mongoose from 'mongoose';

export const connectDB = async (uriOverride = null) => {
  const uri = uriOverride || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bolkhata';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[BolKhata DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[BolKhata DB] Connection error: ${err.message}`);
    throw err;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.error('[BolKhata DB] Error disconnecting:', err);
  }
};
