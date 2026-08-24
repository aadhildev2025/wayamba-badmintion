"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const Coupon_1 = __importDefault(require("../models/Coupon"));
const Notification_1 = __importDefault(require("../models/Notification"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// District delivery fees lookup
const getDeliveryFee = (district) => {
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
router.get('/notifications', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const notifications = await Notification_1.default.find().sort({ createdAt: -1 }).limit(30);
        const unreadCount = await Notification_1.default.countDocuments({ read: false });
        res.json({ notifications, unreadCount });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/orders/notifications/read-all
// @desc    Mark all notifications as read (Admin/Staff only)
router.put('/notifications/read-all', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        await Notification_1.default.updateMany({ read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/orders/notifications/:id/read
// @desc    Mark notification as read (Admin/Staff only)
router.put('/notifications/:id/read', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        await Notification_1.default.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   POST /api/orders
// @desc    Create a new order & update product stocks
router.post('/', authMiddleware_1.optionalAuth, async (req, res) => {
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
        let formattedPaymentMethod = 'Cash on Delivery';
        const pmUpper = String(paymentMethod || '').toUpperCase();
        if (pmUpper.includes('BANK')) {
            formattedPaymentMethod = 'Bank Transfer';
        }
        else if (pmUpper.includes('CARD')) {
            formattedPaymentMethod = 'Card Payments';
        }
        else if (pmUpper.includes('ONLINE')) {
            formattedPaymentMethod = 'Online Payment Gateway';
        }
        else {
            formattedPaymentMethod = 'Cash on Delivery';
        }
        let subtotal = 0;
        const orderItems = [];
        // Verify products and calculate subtotal
        for (const item of rawItems) {
            const productId = item.product || item._id;
            const product = await Product_1.default.findById(productId);
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
            const coupon = await Coupon_1.default.findOne({ code: String(couponCode).toUpperCase(), active: true });
            if (coupon) {
                const now = new Date();
                if (coupon.expiryDate > now && subtotal >= coupon.minOrderAmount) {
                    if (coupon.discountType === 'PERCENT') {
                        discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
                    }
                    else {
                        discountAmount = coupon.discountValue;
                    }
                    if (discountAmount > subtotal)
                        discountAmount = subtotal;
                    coupon.usageCount += 1;
                    await coupon.save();
                }
            }
        }
        // Calculate delivery charge
        const deliveryCharge = getDeliveryFee(shippingAddress.district);
        const total = Math.max(0, subtotal - discountAmount + deliveryCharge);
        // Create the order
        const order = new Order_1.default({
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
            await Product_1.default.findByIdAndUpdate(item.product, {
                $inc: { stockQuantity: -item.quantity },
            });
        }
        // CREATE ADMIN NOTIFICATION
        try {
            const displayId = createdOrder._id.toString().slice(-6).toUpperCase();
            await Notification_1.default.create({
                title: '🛍️ New Order Placed',
                message: `Order #${displayId} placed by ${shippingAddress.recipientName} for Rs. ${total.toLocaleString()}`,
                type: 'ORDER',
                orderId: createdOrder._id,
                read: false,
            });
        }
        catch (notifErr) {
            console.error('Failed to create admin notification:', notifErr);
        }
        res.status(201).json(createdOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
router.get('/myorders', authMiddleware_1.protect, async (req, res) => {
    try {
        const orders = await Order_1.default.find({ user: req.user?.id }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/orders/:id
// @desc    Get order details
router.get('/:id', authMiddleware_1.protect, async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('items.product', 'images brand slug');
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        // Verify ownership or staff/admin access
        const isOwner = order.user ? (order.user._id?.toString() === req.user?.id || order.user.toString() === req.user?.id) : false;
        const isAdminStaff = ['SUPER_ADMIN', 'STAFF'].includes(req.user?.role || '');
        if (!isOwner && !isAdminStaff) {
            res.status(403).json({ message: 'Access denied: not authorized to view this order' });
            return;
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/orders
// @desc    Get all orders (Admin/Staff only)
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const orders = await Order_1.default.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin/Staff only)
router.put('/:id/status', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const { status, trackingNumber, paymentStatus } = req.body;
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        // If order is transitioning to Cancelled, return stock items back to database
        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            for (const item of order.items) {
                await Product_1.default.findByIdAndUpdate(item.product, {
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (Customer can cancel if Pending)
router.put('/:id/cancel', authMiddleware_1.protect, async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
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
                await Product_1.default.findByIdAndUpdate(item.product, {
                    $inc: { stockQuantity: item.quantity },
                });
            }
            order.status = 'Cancelled';
            await order.save();
        }
        res.json({ message: 'Order cancelled successfully', order });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
