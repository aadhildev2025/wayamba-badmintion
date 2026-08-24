import { Router, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { protect, restrictTo, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/reports/dashboard
// @desc    Get dashboard metrics & analytics (Admin/Staff only)
router.get('/dashboard', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    // 1. Core Counts & Metrics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalProducts = await Product.countDocuments();

    // 2. Revenue Calculation (exclude cancelled orders)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // 3. Low stock alerts (alert if stock is 5 or less)
    const lowStockAlerts = await Product.find({ stockQuantity: { $lte: 5 } })
      .populate('category', 'name')
      .populate('brand', 'name')
      .limit(10);

    // 4. Sales Trends (Daily Grouping for the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyTrend = await Order.aggregate([
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
    const bestSellers = await Order.aggregate([
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
