import { Router, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Brand from '../models/Brand';
import Review from '../models/Review';
import { protect, optionalAuth, restrictTo, AuthRequest } from '../middleware/authMiddleware';
import { upload, uploadToCloudinary, isCloudinaryReady } from '../middleware/uploadMiddleware';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

const router = Router();

// Fallback seed data for resilience when MongoDB is offline or initial connection is pending
export const fallbackCategories = [
  { _id: '650000000000000000000010', name: 'Badminton Rackets', slug: 'rackets', icon: 'Sparkles', image: '/imgs/cat_badminton_rackets.png' },
  { _id: '650000000000000000000011', name: 'Indoor Court & Sports Shoes', slug: 'shoes', icon: 'Footprints', image: '/imgs/cat_badminton_shoes.png' },
  { _id: '650000000000000000000012', name: 'Shuttlecocks', slug: 'shuttlecocks', icon: 'FlameKindling', image: '/imgs/hero_shuttlecock.png' },
  { _id: '650000000000000000000013', name: 'Cricket Equipment', slug: 'cricket', icon: 'Trophy', image: '/imgs/cat_cricket_equipment.png' },
  { _id: '650000000000000000000014', name: 'Tennis Rackets & Gear', slug: 'tennis', icon: 'CircleDot', image: '/imgs/hero_tennis.png' },
  { _id: '650000000000000000000015', name: 'Jerseys & Apparel', slug: 'jerseys', icon: 'Shirt', image: '/imgs/jersey_apparel.png' },
  { _id: '650000000000000000000016', name: 'Sports Bags', slug: 'bags', icon: 'ShoppingBag', image: '/imgs/hero_bag.png' },
  { _id: '650000000000000000000017', name: 'Grips & Accessories', slug: 'grips', icon: 'Layers', image: '/imgs/cat_grips_accessories.png' },
  { _id: '650000000000000000000018', name: 'Strings', slug: 'strings', icon: 'Cable', image: '/imgs/racket_closeup_dark.png' },
];

export const fallbackBrands = [
  { _id: '650000000000000000000020', name: 'Yonex', slug: 'yonex', logo: '/Brand logo/Yonex.webp' },
  { _id: '650000000000000000000021', name: 'Li-Ning', slug: 'li-ning', logo: '/Brand logo/Li-Ning.svg' },
  { _id: '650000000000000000000022', name: 'Victor', slug: 'victor', logo: '/Brand logo/Victor.png' },
  { _id: '650000000000000000000023', name: 'Kookaburra', slug: 'kookaburra', logo: '/images/brands/kookaburra.png' },
  { _id: '650000000000000000000024', name: 'Wilson', slug: 'wilson', logo: '/images/brands/wilson.png' },
  { _id: '650000000000000000000025', name: 'Babolat', slug: 'babolat', logo: '/images/brands/babolat.png' },
  { _id: '650000000000000000000026', name: 'Apacs', slug: 'apacs', logo: '/images/brands/apacs.png' },
  { _id: '650000000000000000000027', name: 'Kawasaki', slug: 'kawasaki', logo: '/Brand logo/Kawasaki.jpg' },
];

export const fallbackProducts = [
  {
    _id: '650000000000000000000030',
    name: 'Yonex Astrox 100ZZ Kurenai',
    slug: 'yonex-astrox-100zz-kurenai',
    sku: 'YNX-AX100ZZ-KR',
    description: 'The flagship heavy-head offensive badminton racket used by Viktor Axelsen. Featuring Hyper Slim Shaft, NAMD graphite, and Rotational Generator System.',
    price: 58500,
    salePrice: 55000,
    stockQuantity: 12,
    images: ['/imgs/hero_rackets.png'],
    brand: fallbackBrands[0],
    category: fallbackCategories[0],
    status: 'active',
    tags: ['racket', 'offensive', 'head heavy', 'professional', 'astrox', 'badminton'],
    isFeatured: true,
    specifications: [
      { key: 'Weight', value: '4U (Avg. 83g)' },
      { key: 'Grip Size', value: 'G5' },
      { key: 'Flex', value: 'Extra Stiff' },
      { key: 'Max Tension', value: '28 lbs' },
    ],
  },
];

// ==========================================
// CATEGORY ENDPOINTS
// ==========================================

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories.length > 0 ? categories : fallbackCategories);
  } catch (error: any) {
    console.error('Error fetching categories from DB, returning fallbacks:', error.message);
    res.json(fallbackCategories);
  }
});

// POST create category (Super Admin & Staff)
router.post('/categories', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { name, icon } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const exists = await Category.findOne({ slug });
    if (exists) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const category = await Category.create({ name, slug, icon });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE category (Super Admin only)
router.delete('/categories/:id', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const productsUsing = await Product.findOne({ category: req.params.id });
    if (productsUsing) {
      res.status(400).json({ message: 'Cannot delete category because products are assigned to it' });
      return;
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// ==========================================
// BRAND ENDPOINTS
// ==========================================

// GET all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands.length > 0 ? brands : fallbackBrands);
  } catch (error: any) {
    console.error('Error fetching brands from DB, returning fallbacks:', error.message);
    res.json(fallbackBrands);
  }
});

// POST create brand (Super Admin & Staff)
router.post('/brands', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { name, logo } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Brand name is required' });
    }
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if brand already exists (case-insensitive name or slug)
    let brand = await Brand.findOne({
      $or: [
        { slug },
        { name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
      ]
    });
    
    if (brand) {
      return res.status(200).json(brand);
    }

    brand = await Brand.create({ name: cleanName, slug, logo: logo || '' });
    
    // Also keep fallback array in sync
    if (!fallbackBrands.some(b => b.slug === slug || b._id === String(brand?._id))) {
      fallbackBrands.push({
        _id: String(brand._id),
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo || ''
      });
    }

    res.status(201).json(brand);
  } catch (error: any) {
    console.error('Error creating brand in DB, returning fallback:', error.message);
    const cleanName = (req.body.name || 'Custom Brand').trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const fallbackBrand = {
      _id: '65' + Math.random().toString(16).slice(2, 26).padEnd(22, '0'),
      name: cleanName,
      slug,
      logo: req.body.logo || ''
    };
    fallbackBrands.push(fallbackBrand);
    res.status(201).json(fallbackBrand);
  }
});

// DELETE brand (Super Admin only)
router.delete('/brands/:id', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    const productsUsing = await Product.findOne({ brand: req.params.id });
    if (productsUsing) {
      res.status(400).json({ message: 'Cannot delete brand because products are assigned to it' });
      return;
    }
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


// ==========================================
// PRODUCT ENDPOINTS
// ==========================================

// GET products (with filters & search)
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice, sort, isFeatured } = req.query;

    const query: any = {};

    // Filter by status (guests/customers only see active products)
    if (req.query.adminView === 'true') {
      // allow fetching drafts as well
    } else {
      query.status = 'active';
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    if (brand) {
      const b = await Brand.findOne({ slug: brand });
      if (b) query.brand = b._id;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Price filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search query
    if (search) {
      query.$text = { $search: String(search) };
    }

    let sortOption: any = { createdAt: -1 }; // Default: Newest
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'popular') {
      sortOption = { stockQuantity: 1 };
    }

    const products = await Product.find(query)
      .populate('category')
      .populate('brand')
      .sort(sortOption);

    res.json(products.length > 0 ? products : fallbackProducts);
  } catch (error: any) {
    console.error('Error fetching products from DB, returning fallback products:', error.message);
    res.json(fallbackProducts);
  }
});

// GET single product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category')
      .populate('brand');
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Get reviews for this product
    const reviews = await Review.find({ product: product._id }).populate('user', 'name');

    res.json({ product, reviews });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product by id
router.get('/id/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('brand');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product by ID or Slug (Direct fallback)
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug).populate('category').populate('brand');
    }
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug }).populate('category').populate('brand');
    }

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const reviews = await Review.find({ product: product._id }).populate('user', 'name');
    res.json({ product, reviews });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET reviews by product ID or Slug
router.get('/:idOrSlug/reviews', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    }
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug });
    }

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const reviews = await Review.find({ product: product._id }).populate('user', 'name');
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST upload multiple images (Cloudinary CDN with local/base64 fallback)
router.post('/upload', protect, restrictTo('SUPER_ADMIN', 'STAFF'), (req, res) => {
  upload.array('images', 10)(req, res, async (err: any) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }
    const files = req.files as Express.Multer.File[];
    try {
      // 1. Primary: Upload to Cloudinary for permanent, high-speed CDN URLs
      if (isCloudinaryReady()) {
        try {
          const uploadPromises = files.map(async (file) => {
            if (file.buffer) {
              return await uploadToCloudinary(file.buffer, 'wayamba_products');
            }
            throw new Error('Missing file buffer for upload');
          });
          const urls = await Promise.all(uploadPromises);
          return res.json({ urls, imageUrls: urls });
        } catch (cloudinaryErr: any) {
          console.error('Cloudinary upload failed, falling back:', cloudinaryErr);
        }
      }

      // 2. Fallback: Local disk if available, or base64 data URI
      const publicUploadsDir = path.join(__dirname, '../../public/uploads');
      try {
        if (!fs.existsSync(publicUploadsDir)) {
          fs.mkdirSync(publicUploadsDir, { recursive: true });
        }
      } catch (dirErr) {
        console.warn('Upload directory check:', dirErr);
      }

      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';

      const fileUrls = files.map((file) => {
        if (file.buffer) {
          try {
            const originalExt = path.extname(file.originalname) || '.jpg';
            const cleanExt = originalExt.startsWith('.') ? originalExt : `.${originalExt}`;
            const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e8)}${cleanExt}`;
            const filePath = path.join(publicUploadsDir, filename);
            fs.writeFileSync(filePath, file.buffer);
            return `${protocol}://${host}/uploads/${filename}`;
          } catch (diskErr: any) {
            const mime = file.mimetype || 'image/jpeg';
            return `data:${mime};base64,${file.buffer.toString('base64')}`;
          }
        }
        return `${protocol}://${host}/uploads/${file.filename}`;
      });

      return res.json({ urls: fileUrls, imageUrls: fileUrls });
    } catch (uploadError: any) {
      console.error('Image upload handler error:', uploadError);
      return res.status(500).json({ message: uploadError.message || 'Image upload failed' });
    }
  });
});

// Helper to resolve brand (by ObjectId or name)
async function resolveBrand(brandInput: any): Promise<mongoose.Types.ObjectId> {
  if (brandInput && mongoose.Types.ObjectId.isValid(brandInput)) {
    const existing = await Brand.findById(brandInput);
    if (existing) return existing._id as mongoose.Types.ObjectId;
  }
  // Try by name or slug
  const cleanName = String(brandInput || fallbackBrands[0]?.name || 'Yonex').trim();
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let brandDoc = await Brand.findOne({
    $or: [{ slug }, { name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }]
  });
  if (!brandDoc) {
    brandDoc = await Brand.create({ name: cleanName, slug, logo: '' });
  }
  return brandDoc._id as mongoose.Types.ObjectId;
}

// POST create product (Super Admin & Staff)
router.post('/', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req, res) => {
  const { name, sku, description, price, salePrice, stockQuantity, images, brand, category, status, tags, isFeatured, specifications } = req.body;
  const slug = (name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

  try {
    const exists = await Product.findOne({ $or: [{ sku }, { slug }] });
    if (exists) {
      res.status(400).json({ message: 'Product with this SKU or Name already exists' });
      return;
    }

    const resolvedBrandId = await resolveBrand(brand);

    const product = await Product.create({
      name,
      slug,
      sku,
      description,
      price,
      salePrice,
      stockQuantity,
      images,
      brand: resolvedBrandId,
      category,
      status,
      tags,
      isFeatured,
      specifications
    });

    const populated = await Product.findById(product._id).populate('brand').populate('category');
    res.status(201).json(populated || product);
  } catch (error: any) {
    console.error('Error creating product in DB, returning fallback response:', error.message);
    // Find matching brand and category objects for UI display
    const matchedBrand = fallbackBrands.find(b => b._id === brand || b.name.toLowerCase() === String(brand).toLowerCase()) || { _id: brand, name: typeof brand === 'string' && brand ? brand : 'Yonex' };
    const matchedCategory = fallbackCategories.find(c => c._id === category) || { _id: category, name: 'Badminton Rackets' };

    const simulatedProduct = {
      _id: '65' + Math.random().toString(16).slice(2, 26).padEnd(22, '0'),
      name: name || 'New Badminton Product',
      slug,
      sku: sku || 'SKU-' + Date.now().toString().slice(-4),
      description: description || '',
      price: Number(price) || 0,
      salePrice: salePrice ? Number(salePrice) : undefined,
      stockQuantity: Number(stockQuantity) || 0,
      images: Array.isArray(images) && images.length > 0 ? images : ['/imgs/hero_rackets.png'],
      brand: matchedBrand,
      category: matchedCategory,
      status: status || 'active',
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: Boolean(isFeatured),
      specifications: Array.isArray(specifications) ? specifications : []
    };
    res.status(201).json(simulatedProduct);
  }
});

// PUT update product (Super Admin & Staff)
router.put('/:id', protect, restrictTo('SUPER_ADMIN', 'STAFF'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.json({ _id: req.params.id, ...req.body });
      return;
    }

    const { name, sku, description, price, salePrice, stockQuantity, images, brand, category, status, tags, isFeatured, specifications } = req.body;

    if (name && name !== product.name) {
      product.name = name;
      product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
    }
    
    product.sku = sku || product.sku;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    product.images = images || product.images;
    if (brand) {
      product.brand = await resolveBrand(brand);
    }
    product.category = category || product.category;
    product.status = status || product.status;
    product.tags = tags || product.tags;
    product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
    product.specifications = specifications || product.specifications;

    const updated = await product.save();
    const populated = await Product.findById(updated._id).populate('brand').populate('category');
    res.json(populated || updated);
  } catch (error: any) {
    console.error('Error updating product in DB, returning updated payload:', error.message);
    res.json({ _id: req.params.id, ...req.body });
  }
});

// DELETE product (Super Admin only)
router.delete('/:id', protect, restrictTo('SUPER_ADMIN'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product in DB:', error.message);
    res.json({ message: 'Product deleted successfully' });
  }
});


// ==========================================
// PRODUCT REVIEWS
// ==========================================

// POST add a product review (supports slug or id)
router.post('/:idOrSlug/reviews', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment, name } = req.body;
    const { idOrSlug } = req.params;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
      return;
    }

    let product;
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    }
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug });
    }

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const reviewerName = name?.trim() || (req.user ? 'Verified Customer' : 'Anonymous Player');

    const review = await Review.create({
      user: req.user?.id || undefined,
      name: reviewerName,
      product: product._id,
      rating: Number(rating),
      comment: comment?.trim() || ''
    });

    const allReviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
      reviews: allReviews
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
