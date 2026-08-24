"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Coupon_1 = __importDefault(require("../models/Coupon"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
router.post('/validate', authMiddleware_1.protect, async (req, res) => {
    try {
        const { code, cartAmount } = req.body;
        if (!code) {
            res.status(400).json({ message: 'Coupon code is required' });
            return;
        }
        const coupon = await Coupon_1.default.findOne({ code: code.toUpperCase(), active: true });
        if (!coupon) {
            res.status(404).json({ message: 'Invalid coupon code' });
            return;
        }
        const now = new Date();
        if (coupon.expiryDate && coupon.expiryDate < now) {
            res.status(400).json({ message: 'Coupon code has expired' });
            return;
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            res.status(400).json({ message: 'Coupon usage limit has been reached' });
            return;
        }
        if (cartAmount < coupon.minOrderAmount) {
            res.status(400).json({
                message: `Minimum order amount of Rs. ${coupon.minOrderAmount} is required for this coupon`,
            });
            return;
        }
        res.json({
            valid: true,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   GET /api/coupons
// @desc    Get all coupons (Admin/Staff only)
router.get('/', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const coupons = await Coupon_1.default.find().sort({ createdAt: -1 });
        res.json(coupons);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   POST /api/coupons
// @desc    Create a coupon (Admin/Staff only)
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, expiryDate, usageLimit } = req.body;
        const exists = await Coupon_1.default.findOne({ code: code.toUpperCase() });
        if (exists) {
            res.status(400).json({ message: 'Coupon code already exists' });
            return;
        }
        const coupon = await Coupon_1.default.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            expiryDate: new Date(expiryDate),
            usageLimit,
        });
        res.status(201).json(coupon);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   PUT /api/coupons/:id
// @desc    Update a coupon (Admin/Staff only)
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const coupon = await Coupon_1.default.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }
        const { active, expiryDate, usageLimit, minOrderAmount, discountValue } = req.body;
        coupon.active = active !== undefined ? active : coupon.active;
        if (expiryDate)
            coupon.expiryDate = new Date(expiryDate);
        if (usageLimit !== undefined)
            coupon.usageLimit = usageLimit;
        if (minOrderAmount !== undefined)
            coupon.minOrderAmount = minOrderAmount;
        if (discountValue !== undefined)
            coupon.discountValue = discountValue;
        const updated = await coupon.save();
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon (Super Admin only)
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN'), async (req, res) => {
    try {
        const coupon = await Coupon_1.default.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }
        await Coupon_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
