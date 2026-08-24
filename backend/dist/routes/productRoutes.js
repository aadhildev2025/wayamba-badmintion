"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const Brand_1 = __importDefault(require("../models/Brand"));
const Review_1 = __importDefault(require("../models/Review"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
// ==========================================
// CATEGORY ENDPOINTS
// ==========================================
// GET all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category_1.default.find().sort({ name: 1 });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// POST create category (Super Admin & Staff)
router.post('/categories', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const { name, icon } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const exists = await Category_1.default.findOne({ slug });
        if (exists) {
            res.status(400).json({ message: 'Category already exists' });
            return;
        }
        const category = await Category_1.default.create({ name, slug, icon });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// DELETE category (Super Admin only)
router.delete('/categories/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN'), async (req, res) => {
    try {
        const productsUsing = await Product_1.default.findOne({ category: req.params.id });
        if (productsUsing) {
            res.status(400).json({ message: 'Cannot delete category because products are assigned to it' });
            return;
        }
        await Category_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ==========================================
// BRAND ENDPOINTS
// ==========================================
// GET all brands
router.get('/brands', async (req, res) => {
    try {
        const brands = await Brand_1.default.find().sort({ name: 1 });
        res.json(brands);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// POST create brand (Super Admin & Staff)
router.post('/brands', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const { name, logo } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const exists = await Brand_1.default.findOne({ slug });
        if (exists) {
            res.status(400).json({ message: 'Brand already exists' });
            return;
        }
        const brand = await Brand_1.default.create({ name, slug, logo });
        res.status(201).json(brand);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// DELETE brand (Super Admin only)
router.delete('/brands/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN'), async (req, res) => {
    try {
        const productsUsing = await Product_1.default.findOne({ brand: req.params.id });
        if (productsUsing) {
            res.status(400).json({ message: 'Cannot delete brand because products are assigned to it' });
            return;
        }
        await Brand_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Brand deleted successfully' });
    }
    catch (error) {
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
        const query = {};
        // Filter by status (guests/customers only see active products)
        // For simplicity, we can default to showing active, but let admin see drafts if they pass a parameter
        if (req.query.adminView === 'true') {
            // allow fetching drafts as well
        }
        else {
            query.status = 'active';
        }
        if (category) {
            const cat = await Category_1.default.findOne({ slug: category });
            if (cat)
                query.category = cat._id;
        }
        if (brand) {
            const b = await Brand_1.default.findOne({ slug: brand });
            if (b)
                query.brand = b._id;
        }
        if (isFeatured === 'true') {
            query.isFeatured = true;
        }
        // Price filtering
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = Number(minPrice);
            if (maxPrice)
                query.price.$lte = Number(maxPrice);
        }
        // Search query
        if (search) {
            query.$text = { $search: String(search) };
        }
        let sortOption = { createdAt: -1 }; // Default: Newest
        if (sort === 'price-asc') {
            sortOption = { price: 1 };
        }
        else if (sort === 'price-desc') {
            sortOption = { price: -1 };
        }
        else if (sort === 'popular') {
            sortOption = { stockQuantity: 1 }; // Placeholder logic for popularity
        }
        const products = await Product_1.default.find(query)
            .populate('category')
            .populate('brand')
            .sort(sortOption);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const mongoose_1 = __importDefault(require("mongoose"));
// GET single product by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const product = await Product_1.default.findOne({ slug: req.params.slug })
            .populate('category')
            .populate('brand');
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Get reviews for this product
        const reviews = await Review_1.default.find({ product: product._id }).populate('user', 'name');
        res.json({ product, reviews });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// GET single product by id
router.get('/id/:id', async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id)
            .populate('category')
            .populate('brand');
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// GET single product by ID or Slug (Direct fallback)
router.get('/:idOrSlug', async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        let product;
        if (mongoose_1.default.Types.ObjectId.isValid(idOrSlug)) {
            product = await Product_1.default.findById(idOrSlug).populate('category').populate('brand');
        }
        if (!product) {
            product = await Product_1.default.findOne({ slug: idOrSlug }).populate('category').populate('brand');
        }
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const reviews = await Review_1.default.find({ product: product._id }).populate('user', 'name');
        res.json({ product, reviews });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// GET reviews by product ID or Slug
router.get('/:idOrSlug/reviews', async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        let product;
        if (mongoose_1.default.Types.ObjectId.isValid(idOrSlug)) {
            product = await Product_1.default.findById(idOrSlug);
        }
        if (!product) {
            product = await Product_1.default.findOne({ slug: idOrSlug });
        }
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const reviews = await Review_1.default.find({ product: product._id }).populate('user', 'name');
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// POST upload multiple images
router.post('/upload', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), (req, res) => {
    uploadMiddleware_1.upload.array('images', 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'Image upload failed' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No image files provided' });
        }
        const filePaths = req.files.map(file => `/uploads/${file.filename}`);
        return res.json({ urls: filePaths, imageUrls: filePaths });
    });
});
// POST create product (Super Admin & Staff)
router.post('/', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const { name, sku, description, price, salePrice, stockQuantity, images, brand, category, status, tags, isFeatured, specifications } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
        const exists = await Product_1.default.findOne({ $or: [{ sku }, { slug }] });
        if (exists) {
            res.status(400).json({ message: 'Product with this SKU or Name already exists' });
            return;
        }
        const product = await Product_1.default.create({
            name,
            slug,
            sku,
            description,
            price,
            salePrice,
            stockQuantity,
            images,
            brand,
            category,
            status,
            tags,
            isFeatured,
            specifications
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// PUT update product (Super Admin & Staff)
router.put('/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN', 'STAFF'), async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
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
        product.brand = brand || product.brand;
        product.category = category || product.category;
        product.status = status || product.status;
        product.tags = tags || product.tags;
        product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
        product.specifications = specifications || product.specifications;
        const updated = await product.save();
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// DELETE product (Super Admin only)
router.delete('/:id', authMiddleware_1.protect, (0, authMiddleware_1.restrictTo)('SUPER_ADMIN'), async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        await Product_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// ==========================================
// PRODUCT REVIEWS
// ==========================================
// POST add a product review (supports slug or id)
router.post('/:idOrSlug/reviews', authMiddleware_1.optionalAuth, async (req, res) => {
    try {
        const { rating, comment, name } = req.body;
        const { idOrSlug } = req.params;
        if (!rating || Number(rating) < 1 || Number(rating) > 5) {
            res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
            return;
        }
        let product;
        if (mongoose_1.default.Types.ObjectId.isValid(idOrSlug)) {
            product = await Product_1.default.findById(idOrSlug);
        }
        if (!product) {
            product = await Product_1.default.findOne({ slug: idOrSlug });
        }
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const reviewerName = name?.trim() || (req.user ? 'Verified Customer' : 'Anonymous Player');
        const review = await Review_1.default.create({
            user: req.user?.id || undefined,
            name: reviewerName,
            product: product._id,
            rating: Number(rating),
            comment: comment?.trim() || ''
        });
        const allReviews = await Review_1.default.find({ product: product._id }).sort({ createdAt: -1 });
        res.status(201).json({
            message: 'Review submitted successfully',
            review,
            reviews: allReviews
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
