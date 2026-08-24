import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wayamba_badminton';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(connUri);
    console.log('MongoDB Connected successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

