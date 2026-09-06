import mongoose from 'mongoose';

// Cache connection in NodeJS global scope across serverless function invocations (Vercel)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wayamba_badminton';
    console.log('Connecting to MongoDB...');

    cached.promise = mongoose
      .connect(connUri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      })
      .then((m) => {
        console.log('MongoDB Connected successfully!');
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('Error connecting to MongoDB:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};


