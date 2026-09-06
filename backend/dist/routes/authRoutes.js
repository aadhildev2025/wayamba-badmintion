"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET || 'super_secret_badminton_key_123!', {
        expiresIn: '30d',
    });
};
// @route   POST /api/auth/register
// @desc    Register a new customer
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }
        const user = await User_1.default.create({
            name,
            email,
            password,
            phone,
            role: 'CUSTOMER',
        });
        res.status(201).json({
            token: generateToken(user._id.toString(), user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }
        res.json({
            token: generateToken(user._id.toString(), user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/auth/me
// @desc    Get user profile
router.get('/me', authMiddleware_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', authMiddleware_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/auth/wishlist
// @desc    Get current user's wishlist
router.get('/wishlist', authMiddleware_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id).populate('wishlist');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user.wishlist);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   POST /api/auth/wishlist/:productId
// @desc    Toggle product in wishlist
router.post('/wishlist/:productId', authMiddleware_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const productId = req.params.productId;
        const index = user.wishlist.indexOf(productId);
        if (index > -1) {
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
        }
        else {
            user.wishlist.push(productId);
            await user.save();
            res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/auth/customers
// @desc    Get all customers (Admin/Staff only)
router.get('/customers', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const customers = await User_1.default.find({ role: 'CUSTOMER' }).select('-password').sort({ createdAt: -1 });
        res.json(customers);
    }
    catch (error) {
        console.error('Error fetching customers from DB:', error.message);
        res.json([]);
    }
});
// @route   DELETE /api/auth/staff/:id
// @desc    Delete staff (Super Admin only)
router.delete('/staff/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN'), async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Staff member not found' });
            return;
        }
        if (user.role === 'SUPER_ADMIN') {
            res.status(400).json({ message: 'Cannot delete Super Admin accounts' });
            return;
        }
        await User_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff member deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/auth/staff
// @desc    Get all staff members (Super Admin only)
router.get('/staff', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN'), async (req, res) => {
    try {
        const staff = await User_1.default.find({ role: { $ne: 'CUSTOMER' } }).select('-password');
        res.json(staff.length > 0 ? staff : [
            { _id: '650000000000000000000001', name: 'Super Admin', email: 'admin@wbh.com', role: 'SUPER_ADMIN', phone: '+94 71 444 3317' },
            { _id: '650000000000000000000002', name: 'Sales Staff', email: 'staff@wbh.com', role: 'STAFF', phone: '+94 77 123 4567' }
        ]);
    }
    catch (error) {
        console.error('Error fetching staff from DB, returning fallback staff:', error.message);
        res.json([
            { _id: '650000000000000000000001', name: 'Super Admin', email: 'admin@wbh.com', role: 'SUPER_ADMIN', phone: '+94 71 444 3317' },
            { _id: '650000000000000000000002', name: 'Sales Staff', email: 'staff@wbh.com', role: 'STAFF', phone: '+94 77 123 4567' }
        ]);
    }
});
// @route   POST /api/auth/staff
// @desc    Create staff member (Super Admin only)
router.post('/staff', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN'), async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;
        if (role === 'SUPER_ADMIN') {
            res.status(400).json({ message: 'Cannot create additional Super Admin accounts' });
            return;
        }
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const staff = await User_1.default.create({
            name,
            email,
            password,
            role: role || 'STAFF',
            phone,
            verified: true
        });
        res.status(201).json({
            id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            phone: staff.phone,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/auth/staff/:id/password
// @desc    Update password for staff member or admin (Super Admin only)
router.put('/staff/:id/password', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN'), async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            res.status(400).json({ message: 'Password must be at least 6 characters long' });
            return;
        }
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Staff user not found' });
            return;
        }
        user.password = password;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
