import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import reportRoutes from './routes/reportRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*' })); // Enable CORS for Next.js client
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static images
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(path.join(publicDir, 'uploads'))) {
  fs.mkdirSync(path.join(publicDir, 'uploads'), { recursive: true });
}
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', (req, res, next) => {
  req.url = '/categories' + req.url;
  productRoutes(req, res, next);
});
app.use('/api/brands', (req, res, next) => {
  req.url = '/brands' + req.url;
  productRoutes(req, res, next);
});
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Wayamba Badminton Home API is running...' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
