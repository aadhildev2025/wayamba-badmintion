import { Router, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import Notification from '../models/Notification';
import { protect, optionalAuth, restrictTo, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// District delivery fees lookup
const getDeliveryFee = (district: string): number => {
  const normalized = district.trim().toLowerCase();
  if (normalized === 'puttalam' || normalized.includes('puttalam')) {
    return 250; // Local district
  }
  const lowCostDistricts = ['colombo', 'gampaha', 'kalutara', 'kurunegala'];
  if (lowCostDistricts.some(d => normalized.includes(d))) {
    return 350;
  }
  return 450; // Rest of Sri Lanka
};

// @route   GET /api/orders/notifications
// @desc    Get admin notifications (Admin/Staff only)
router.get('/notifications', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
    const unreadCount = await Notification.countDocuments({ read: false });
    res.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.json({ notifications: [], unreadCount: 0 });
  }
});

// @route   PUT /api/orders/notifications/read-all
// @desc    Mark all notifications as read (Admin/Staff only)
router.put('/notifications/read-all', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/notifications/:id/read
// @desc    Mark notification as read (Admin/Staff only)
router.put('/notifications/:id/read', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create a new order & update product stocks
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const rawItems = req.body.items || req.body.orderItems || [];
    const rawAddress = req.body.shippingAddress || {};
    const { paymentMethod, couponCode, notes } = req.body;

    if (!rawItems || rawItems.length === 0) {
      res.status(400).json({ message: 'No items in order' });
      return;
    }

    // Format shipping address cleanly
    const shippingAddress = {
      recipientName: rawAddress.recipientName || rawAddress.customerName || rawAddress.fullName || 'Customer',
      phone: rawAddress.phone || '',
      addressLine1: rawAddress.addressLine1 || rawAddress.address || 'Standard Delivery Address',
      addressLine2: rawAddress.addressLine2 || '',
      city: rawAddress.city || 'Puttalam',
      district: rawAddress.district || 'Puttalam District',
    };

    // Normalize payment method to enum
    let formattedPaymentMethod: 'Cash on Delivery' | 'Bank Transfer' | 'Online Payment Gateway' | 'Card Payments' = 'Cash on Delivery';
    const pmUpper = String(paymentMethod || '').toUpperCase();
    if (pmUpper.includes('BANK')) {
      formattedPaymentMethod = 'Bank Transfer';
    } else if (pmUpper.includes('CARD')) {
      formattedPaymentMethod = 'Card Payments';
    } else if (pmUpper.includes('ONLINE')) {
      formattedPaymentMethod = 'Online Payment Gateway';
    } else {
      formattedPaymentMethod = 'Cash on Delivery';
    }

    let subtotal = 0;
    const orderItems = [];

    // Verify products and calculate subtotal
    for (const item of rawItems) {
      const productId = item.product || item._id;
      const product = await Product.findById(productId);
      if (!product) {
        res.status(404).json({ message: `Product with ID ${productId} not found` });
        return;
      }

      if (product.stockQuantity < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}` });
        return;
      }

      const activePrice = item.price !== undefined ? Number(item.price) : (product.salePrice || product.price);
      subtotal += activePrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: activePrice,
        quantity: item.quantity,
      });
    }

    // Handle coupon code
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), active: true });
      if (coupon) {
        const now = new Date();
        if (coupon.expiryDate > now && subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'PERCENT') {
            discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
          } else {
            discountAmount = coupon.discountValue;
          }
          if (discountAmount > subtotal) discountAmount = subtotal;

          coupon.usageCount += 1;
          await coupon.save();
        }
      }
    }

    // Calculate delivery charge
    const deliveryCharge = getDeliveryFee(shippingAddress.district);
    const total = Math.max(0, subtotal - discountAmount + deliveryCharge);

    // Create the order
    const order = new Order({
      user: req.user?.id || undefined,
      items: orderItems,
      shippingAddress,
      deliveryCharge,
      discountAmount,
      total,
      couponCode: couponCode ? String(couponCode).toUpperCase() : undefined,
      paymentMethod: formattedPaymentMethod,
      notes: notes || rawAddress.notes || '',
    });

    const createdOrder = await order.save();

    // DEDUCT STOCK QUANTITIES FROM PRODUCTS
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    // CREATE ADMIN NOTIFICATION
    try {
      const displayId = createdOrder._id.toString().slice(-6).toUpperCase();
      await Notification.create({
        title: '🛍️ New Order Placed',
        message: `Order #${displayId} placed by ${shippingAddress.recipientName} for Rs. ${total.toLocaleString()}`,
        type: 'ORDER',
        orderId: createdOrder._id,
        read: false,
      });
    } catch (notifErr) {
      console.error('Failed to create admin notification:', notifErr);
    }

    res.status(201).json(createdOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
router.get('/myorders', protect, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user?.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'images brand slug');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Verify ownership or staff/admin access
    const isOwner = order.user ? ((order.user as any)._id?.toString() === req.user?.id || order.user.toString() === req.user?.id) : false;
    const isAdminStaff = ['SUPER_ADMIN', 'STAFF'].includes(req.user?.role || '');

    if (!isOwner && !isAdminStaff) {
      res.status(403).json({ message: 'Access denied: not authorized to view this order' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin/Staff only)
router.get('/', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.json([]);
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin/Staff only)
router.put('/:id/status', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, trackingNumber, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // If order is transitioning to Cancelled, return stock items back to database
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity },
        });
      }
    }

    order.status = status || order.status;
    order.paymentStatus = paymentStatus || order.paymentStatus;
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (Customer can cancel if Pending)
router.put('/:id/cancel', protect, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.user && order.user.toString() !== req.user?.id && req.user?.role === 'CUSTOMER') {
      res.status(403).json({ message: 'Not authorized to cancel this order' });
      return;
    }

    if (order.status !== 'Pending' && req.user?.role === 'CUSTOMER') {
      res.status(400).json({ message: 'Cannot cancel order once it is confirmed' });
      return;
    }

    if (order.status !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantity },
        });
      }
      order.status = 'Cancelled';
      await order.save();
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
