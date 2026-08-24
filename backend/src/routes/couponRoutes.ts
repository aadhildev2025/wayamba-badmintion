import { Router, Response } from 'express';
import Coupon from '../models/Coupon';
import { protect, restrictTo, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
router.post('/validate', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { code, cartAmount } = req.body;

    if (!code) {
      res.status(400).json({ message: 'Coupon code is required' });
      return;
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });

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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/coupons
// @desc    Get all coupons (Admin/Staff only)
router.get('/', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/coupons
// @desc    Create a coupon (Admin/Staff only)
router.post('/', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate, usageLimit } = req.body;

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      res.status(400).json({ message: 'Coupon code already exists' });
      return;
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      expiryDate: new Date(expiryDate),
      usageLimit,
    });

    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update a coupon (Admin/Staff only)
router.put('/:id', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }

    const { active, expiryDate, usageLimit, minOrderAmount, discountValue } = req.body;

    coupon.active = active !== undefined ? active : coupon.active;
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (discountValue !== undefined) coupon.discountValue = discountValue;

    const updated = await coupon.save();
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon (Super Admin only)
router.delete('/:id', protect, restrictTo('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
