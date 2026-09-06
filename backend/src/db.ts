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

  // If connection failed recently, allow a short 3s cooldown before retry
  if (cached.lastFailedTime && Date.now() - cached.lastFailedTime < 3000) {
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }
  }

  if (!cached.promise) {
    const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wayamba_badminton';
    const fallbackLocalUri = 'mongodb://127.0.0.1:27017/wayamba_badminton';
    
    console.log(`Connecting to MongoDB (${primaryUri.includes('@') ? 'Atlas Cloud' : 'Local'})...`);

    cached.promise = mongoose
      .connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => {
        console.log('MongoDB Connected successfully!');
        cached.lastFailedTime = 0;
        return m;
      })
      .catch(async (err) => {
        // If primary URI was Atlas and it failed (e.g., IP whitelist issue), try local MongoDB
        if (primaryUri !== fallbackLocalUri) {
          console.warn(`Primary MongoDB connection failed (${err.message}). Attempting fallback to local MongoDB...`);
          try {
            const fallbackConn = await mongoose.connect(fallbackLocalUri, {
              serverSelectionTimeoutMS: 3000,
            });
            console.log('Connected successfully to Local MongoDB fallback!');
            cached.lastFailedTime = 0;
            return fallbackConn;
          } catch (localErr: any) {
            console.error('Local MongoDB connection also failed:', localErr.message);
          }
        }
        
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




