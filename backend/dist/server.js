"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("./db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const couponRoutes_1 = __importDefault(require("./routes/couponRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Core Middleware
app.use((0, cors_1.default)({ origin: '*' })); // Enable CORS for Next.js / Vite client
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Connect to MongoDB on incoming request
app.use(async (req, res, next) => {
    // Allow health check without blocking on DB
    if (req.path === '/' || req.path === '/api') {
        return next();
    }
    try {
        await (0, db_1.connectDB)();
    }
    catch (error) {
        console.warn('MongoDB connection attempt failed, proceeding to route fallbacks:', error.message);
    }
    next();
});
// Serve uploaded static images
try {
    const publicDir = path_1.default.join(__dirname, '../public');
    if (!fs_1.default.existsSync(path_1.default.join(publicDir, 'uploads'))) {
        fs_1.default.mkdirSync(path_1.default.join(publicDir, 'uploads'), { recursive: true });
    }
    app.use('/uploads', express_1.default.static(path_1.default.join(publicDir, 'uploads')));
}
catch {
    // Read-only filesystem in serverless environments
}
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/categories', (req, res, next) => {
    req.url = '/categories' + req.url;
    (0, productRoutes_1.default)(req, res, next);
});
app.use('/api/brands', (req, res, next) => {
    req.url = '/brands' + req.url;
    (0, productRoutes_1.default)(req, res, next);
});
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/coupons', couponRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
// Health check endpoint
app.get('/api', (req, res) => {
    res.json({ message: 'Wayamba Badminton Home API is running...' });
});
app.get('/', (req, res) => {
    res.json({ message: 'Wayamba Badminton Home API is running...' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    });
});
// Start server only in non-Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}
exports.default = app;
