"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// @route   GET /api/reports/dashboard
// @desc    Get dashboard metrics & analytics (Admin/Staff only)
router.get('/dashboard', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        // 1. Core Counts & Metrics
        const totalOrders = await Order_1.default.countDocuments();
        const pendingOrders = await Order_1.default.countDocuments({ status: 'Pending' });
        const deliveredOrders = await Order_1.default.countDocuments({ status: 'Delivered' });
        const cancelledOrders = await Order_1.default.countDocuments({ status: 'Cancelled' });
        const totalCustomers = await User_1.default.countDocuments({ role: 'CUSTOMER' });
        const totalProducts = await Product_1.default.countDocuments();
        // 2. Revenue Calculation (exclude cancelled orders)
        const revenueResult = await Order_1.default.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;
        // 3. Low stock alerts (alert if stock is 5 or less)
        const lowStockAlerts = await Product_1.default.find({ stockQuantity: { $lte: 5 } })
            .populate('category', 'name')
            .populate('brand', 'name')
            .limit(10);
        // 4. Sales Trends (Daily Grouping for the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyTrend = await Order_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $ne: 'Cancelled' },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // 5. Best-selling Products (Aggregate item quantities)
        const bestSellers = await Order_1.default.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    soldQuantity: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                },
            },
            { $sort: { soldQuantity: -1 } },
            { $limit: 5 },
        ]);
        res.json({
            summary: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders,
                totalCustomers,
                totalProducts,
                totalRevenue,
            },
            lowStockAlerts,
            dailyTrend,
            bestSellers,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
