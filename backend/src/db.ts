import mongoose from 'mongoose';

// Cache connection in NodeJS global scope across serverless function invocations (Vercel)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastFailedTime?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null, lastFailedTime: 0 };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection failed within the last 10 seconds, fail immediately to prevent 5s latency on every request
  if (cached.lastFailedTime && Date.now() - cached.lastFailedTime < 10000) {
    throw new Error('Database temporarily unavailable (cooldown active)');
  }

  if (!cached.promise) {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wayamba_badminton';
    console.log('Connecting to MongoDB...');

    cached.promise = mongoose
      .connect(connUri, {
        serverSelectionTimeoutMS: 4000,
        bufferCommands: false,
      })
      .then((m) => {
        console.log('MongoDB Connected successfully!');
        cached.lastFailedTime = 0;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.lastFailedTime = Date.now();
        console.error('Error connecting to MongoDB:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.lastFailedTime = Date.now();
    throw error;
  }
};



