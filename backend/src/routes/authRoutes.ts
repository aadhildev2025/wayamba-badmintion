import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { protect, restrictTo, AuthRequest, ALL_PERMISSIONS } from '../middleware/authMiddleware';

const router = Router();

const generateToken = (id: string, role: string, permissions: string[] = []): string => {
  return jwt.sign({ id, role, permissions }, process.env.JWT_SECRET || 'super_secret_badminton_key_123!', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new customer
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'CUSTOMER',
      permissions: [],
    });

    res.status(201).json({
      token: generateToken(user._id.toString(), user.role, []),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        permissions: [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const userPermissions = user.permissions && user.permissions.length > 0
      ? user.permissions
      : (user.role === 'SUPER_ADMIN' ? ALL_PERMISSIONS : ['dashboard', 'products', 'orders']);

    res.json({
      token: generateToken(user._id.toString(), user.role, userPermissions),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        permissions: userPermissions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const userObj = user.toObject();
    if (!userObj.permissions || userObj.permissions.length === 0) {
      userObj.permissions = user.role === 'SUPER_ADMIN' ? ALL_PERMISSIONS : ['dashboard', 'products', 'orders'];
    }
    res.json(userObj);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
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
      permissions: updatedUser.permissions || [],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/wishlist
// @desc    Get current user's wishlist
router.get('/wishlist', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate('wishlist');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user.wishlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/wishlist/:productId
// @desc    Toggle product in wishlist
router.post('/wishlist/:productId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const productId = req.params.productId as any;
    const index = user.wishlist.indexOf(productId);

    if (index > -1) {
      user.wishlist.splice(index, 1);
      await user.save();
      res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
    } else {
      user.wishlist.push(productId);
      await user.save();
      res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/customers
// @desc    Get all customers (Admin/Staff only)
router.get('/customers', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req: AuthRequest, res: Response) => {
  try {
    const customers = await User.find({ role: 'CUSTOMER' }).select('-password').sort({ createdAt: -1 });
    res.json(customers);
  } catch (error: any) {
    console.error('Error fetching customers from DB:', error.message);
    res.json([]);
  }
});

// @route   DELETE /api/auth/staff/:id
// @desc    Delete staff (Super Admin only)
router.delete('/staff/:id', protect, restrictTo('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }
    if (user.role === 'SUPER_ADMIN') {
      res.status(400).json({ message: 'Cannot delete Super Admin accounts' });
      return;
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/staff
// @desc    Get all staff members (Super Admin only)
router.get('/staff', protect, restrictTo('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const staff = await User.find({ role: { $ne: 'CUSTOMER' } }).select('-password').sort({ createdAt: -1 });
    res.json(staff.length > 0 ? staff : [
      { _id: '650000000000000000000001', name: 'Super Admin', email: 'admin@wbh.com', role: 'SUPER_ADMIN', phone: '+94 71 444 3317', permissions: ALL_PERMISSIONS },
      { _id: '650000000000000000000002', name: 'Sales Staff', email: 'staff@wbh.com', role: 'STAFF', phone: '+94 77 123 4567', permissions: ['dashboard', 'products', 'orders'] }
    ]);
  } catch (error: any) {
    console.error('Error fetching staff from DB, returning fallback staff:', error.message);
    res.json([
      { _id: '650000000000000000000001', name: 'Super Admin', email: 'admin@wbh.com', role: 'SUPER_ADMIN', phone: '+94 71 444 3317', permissions: ALL_PERMISSIONS },
      { _id: '650000000000000000000002', name: 'Sales Staff', email: 'staff@wbh.com', role: 'STAFF', phone: '+94 77 123 4567', permissions: ['dashboard', 'products', 'orders'] }
    ]);
  }
});

// @route   POST /api/auth/staff
// @desc    Create staff member (Super Admin only)
router.post('/staff', protect, restrictTo('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, phone, permissions } = req.body;
    if (role === 'SUPER_ADMIN') {
      res.status(400).json({ message: 'Cannot create additional Super Admin accounts' });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Default permissions if none provided
    const assignedPermissions = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : ['dashboard', 'products', 'orders'];

    const staff = await User.create({
      name,
      email,
      password,
      role: role || 'STAFF',
      phone,
      permissions: assignedPermissions,
      verified: true
    });

    res.status(201).json({
      _id: staff._id,
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      phone: staff.phone,
      permissions: staff.permissions,
      createdAt: staff.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/staff/:id/permissions
// @desc    Update access permissions for a specific staff member (Super Admin only)
router.put('/staff/:id/permissions', protect, restrictTo('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      res.status(400).json({ message: 'Permissions must be an array of module keys' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    if (user.role === 'SUPER_ADMIN') {
      res.status(400).json({ message: 'Super Admin clearance is immutable and includes all modules' });
      return;
    }

    user.permissions = permissions;
    await user.save();

    res.json({
      message: 'Staff permissions updated successfully',
      staff: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        permissions: user.permissions,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/staff/:id/password
// @desc    Update password for staff member or admin (Super Admin only)
router.put('/staff/:id/password', protect, restrictTo('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'Staff user not found' });
      return;
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
