"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
const Category_1 = __importDefault(require("./models/Category"));
const Brand_1 = __importDefault(require("./models/Brand"));
const Product_1 = __importDefault(require("./models/Product"));
const Coupon_1 = __importDefault(require("./models/Coupon"));
dotenv_1.default.config();
const seed = async () => {
    try {
        const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wayamba_badminton';
        console.log(`Connecting to database for seeding: ${connUri}`);
        await mongoose_1.default.connect(connUri);
        console.log('Connected to database.');
        // 1. Clear Existing Collections
        await User_1.default.deleteMany({});
        await Category_1.default.deleteMany({});
        await Brand_1.default.deleteMany({});
        await Product_1.default.deleteMany({});
        await Coupon_1.default.deleteMany({});
        console.log('Cleared existing data.');
        // 2. Create Users
        await User_1.default.create({
            name: 'Super Admin',
            email: 'admin@wbh.com',
            password: 'admin123',
            role: 'SUPER_ADMIN',
            phone: '+94 71 444 3317',
            verified: true,
        });
        await User_1.default.create({
            name: 'Sales Staff',
            email: 'staff@wbh.com',
            password: 'staff123',
            role: 'STAFF',
            phone: '+94 77 123 4567',
            verified: true,
        });
        await User_1.default.create({
            name: 'Aadhil Customer',
            email: 'customer@wbh.com',
            password: 'customer123',
            role: 'CUSTOMER',
            phone: '+94 76 987 6543',
            verified: true,
        });
        console.log('Seed users created.');
        // 3. Create Categories
        const categoriesData = [
            { name: 'Badminton Rackets', slug: 'rackets', icon: 'Sparkles', image: '/imgs/hero_rackets.png' },
            { name: 'Badminton Shoes', slug: 'shoes', icon: 'Footprints', image: '/imgs/hero_shoes.png' },
            { name: 'Shuttlecocks', slug: 'shuttlecocks', icon: 'FlameKindling', image: '/imgs/hero_shuttlecock.png' },
            { name: 'Jerseys & Apparel', slug: 'jerseys', icon: 'Shirt', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80' },
            { name: 'Sports Bags', slug: 'bags', icon: 'ShoppingBag', image: '/imgs/hero_bag.png' },
            { name: 'Grips', slug: 'grips', icon: 'Layers', image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=600&q=80' },
            { name: 'Strings', slug: 'strings', icon: 'Cable', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80' },
            { name: 'Accessories', slug: 'accessories', icon: 'PlusCircle', image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=600&q=80' },
            { name: 'Training Equipment', slug: 'training', icon: 'Activity', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80' },
        ];
        const categories = await Category_1.default.insertMany(categoriesData);
        console.log(`Seeded ${categories.length} categories.`);
        const getCategoryId = (slug) => categories.find(c => c.slug === slug)?._id;
        // 4. Create Brands
        const brandsData = [
            { name: 'Yonex', slug: 'yonex', logo: '/Brand logo/Yonex.webp' },
            { name: 'Li-Ning', slug: 'li-ning', logo: '/Brand logo/Li-Ning.svg' },
            { name: 'Victor', slug: 'victor', logo: '/Brand logo/Victor.png' },
            { name: 'Apacs', slug: 'apacs', logo: '/images/brands/apacs.png' },
            { name: 'Kawasaki', slug: 'kawasaki', logo: '/Brand logo/Kawasaki.jpg' },
            { name: 'Ashaway', slug: 'ashaway', logo: '/images/brands/ashaway.png' },
            { name: 'Fleet', slug: 'fleet', logo: '/images/brands/fleet.png' },
        ];
        const brands = await Brand_1.default.insertMany(brandsData);
        console.log(`Seeded ${brands.length} brands.`);
        const getBrandId = (slug) => brands.find(b => b.slug === slug)?._id;
        // 5. Create Coupons
        await Coupon_1.default.insertMany([
            { code: 'WELCOME10', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 2000, expiryDate: new Date('2027-12-31'), active: true },
            { code: 'SMASH500', discountType: 'FLAT', discountValue: 500, minOrderAmount: 5000, expiryDate: new Date('2027-12-31'), active: true },
            { code: 'NEWYEAR15', discountType: 'PERCENT', discountValue: 15, minOrderAmount: 10000, expiryDate: new Date('2027-01-31'), active: true },
        ]);
        // 6. Create Detailed Products
        const productsData = [
            // --- RACKETS ---
            {
                name: 'Yonex Astrox 100ZZ Kurenai',
                slug: 'yonex-astrox-100zz-kurenai',
                sku: 'YNX-AX100ZZ-KR',
                description: 'The flagship heavy-head offensive racket used by Viktor Axelsen. Featuring Hyper Slim Shaft and Rotational Generator System for lightning fast smashes and effortless control.',
                price: 58500,
                salePrice: 55000,
                stockQuantity: 12,
                images: [
                    { url: '/imgs/hero_rackets.png', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80' },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('rackets'),
                status: 'active',
                tags: ['racket', 'offensive', 'head heavy', 'professional', 'astrox'],
                isFeatured: true,
                averageRating: 4.9,
                reviewCount: 48,
                specifications: [
                    { key: 'Weight', value: '4U (Avg. 83g)' },
                    { key: 'Grip Size', value: 'G5' },
                    { key: 'Flex', value: 'Extra Stiff' },
                    { key: 'Max Tension', value: '28 lbs' },
                    { key: 'Balance Point', value: 'Head Heavy (305mm)' },
                    { key: 'Frame Composition', value: 'HM Graphite + Namd + Tungsten' },
                ],
            },
            {
                name: 'Li-Ning Axforce 100 Golden Dragon',
                slug: 'lining-axforce-100-golden-dragon',
                sku: 'LN-AX100-GD',
                description: 'The supreme power racket engineered with 6.2mm Flexible Slim Shaft and Box Wing Frame for destructive offensive play. Preferred racket of world champions.',
                price: 62000,
                salePrice: 58900,
                stockQuantity: 7,
                images: [
                    { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                    { url: '/imgs/hero_rackets.png' },
                ],
                brand: getBrandId('li-ning'),
                category: getCategoryId('rackets'),
                status: 'active',
                tags: ['racket', 'axforce', 'power', 'premium', 'li-ning'],
                isFeatured: true,
                averageRating: 5.0,
                reviewCount: 32,
                specifications: [
                    { key: 'Weight', value: '3U (Avg. 88g)' },
                    { key: 'Grip Size', value: 'G5' },
                    { key: 'Flex', value: 'Stiff' },
                    { key: 'Max Tension', value: '31 lbs' },
                    { key: 'Technology', value: 'TB Nano + M50 Super Carbon' },
                ],
            },
            {
                name: 'Victor Thruster Ryuga II Pro',
                slug: 'victor-thruster-ryuga-ii-pro',
                sku: 'VIC-TK-RYUGA-II-PRO',
                description: 'Weapon of singles star Lee Zii Jia. Enhanced with WES 2.0 and FREE CORE technology for fierce smashing power and snappy drive response.',
                price: 54000,
                salePrice: 49900,
                stockQuantity: 15,
                images: [
                    { url: '/imgs/hero_rackets.png', isPrimary: true },
                ],
                brand: getBrandId('victor'),
                category: getCategoryId('rackets'),
                status: 'active',
                tags: ['racket', 'thruster', 'smash', 'heavy head', 'victor'],
                isFeatured: true,
                averageRating: 4.8,
                reviewCount: 29,
                specifications: [
                    { key: 'Weight', value: '4U (Avg. 83g)' },
                    { key: 'Grip Size', value: 'G5' },
                    { key: 'Flex', value: 'Stiff' },
                    { key: 'Max Tension', value: '31 lbs' },
                ],
            },
            {
                name: 'Yonex Nanoflare 1000 Z',
                slug: 'yonex-nanoflare-1000-z',
                sku: 'YNX-NF1000Z',
                description: 'Designed for lightning fast swing speeds and instant repulsion. World record racket for fastest hit shot with Sonic Flare System technology.',
                price: 59000,
                salePrice: 56500,
                stockQuantity: 9,
                images: [
                    { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('rackets'),
                status: 'active',
                tags: ['racket', 'speed', 'head light', 'nanoflare', 'yonex'],
                isFeatured: true,
                averageRating: 4.9,
                reviewCount: 41,
                specifications: [
                    { key: 'Weight', value: '4U (Avg. 83g)' },
                    { key: 'Grip Size', value: 'G5' },
                    { key: 'Balance', value: 'Head Light' },
                    { key: 'Max Tension', value: '28 lbs' },
                ],
            },
            {
                name: 'Apacs Z-Ziggler Power Grey',
                slug: 'apacs-z-ziggler-grey',
                sku: 'APC-ZZIGGLER-GY',
                description: 'Budget-friendly head-heavy racket inspired by classic Voltric frames. Incredible durable frame supporting tensions up to 38 lbs.',
                price: 13500,
                salePrice: 12000,
                stockQuantity: 24,
                images: [
                    { url: '/imgs/hero_rackets.png', isPrimary: true },
                ],
                brand: getBrandId('apacs'),
                category: getCategoryId('rackets'),
                status: 'active',
                tags: ['racket', 'budget', 'apacs', 'heavy head'],
                isFeatured: false,
                averageRating: 4.6,
                reviewCount: 56,
                specifications: [
                    { key: 'Weight', value: '4U (Avg. 84g)' },
                    { key: 'Flex', value: 'Medium' },
                    { key: 'Max Tension', value: '38 lbs' },
                ],
            },
            {
                name: 'Fleet Woven 1000 VI Speed',
                slug: 'fleet-woven-1000-vi',
                sku: 'FLT-W1000-VI',
                description: 'High-modulus carbon graphite frame featuring woven carbon technology for maximum structural durability and high repulsion response.',
                price: 24000,
                salePrice: 21500,
                stockQuantity: 4,
                images: [
                    { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                ],
                brand: getBrandId('fleet'),
                category: getCategoryId('rackets'),
                status: 'active',
                tags: ['racket', 'fleet', 'woven', 'speed'],
                isFeatured: false,
                averageRating: 4.7,
                reviewCount: 18,
                specifications: [
                    { key: 'Weight', value: '4U' },
                    { key: 'Balance', value: 'Even Balance' },
                ],
            },
            // --- SHOES ---
            {
                name: 'Yonex Power Cushion 65 Z3 Men White',
                slug: 'yonex-power-cushion-65-z3-men',
                sku: 'YNX-SH-65Z3-W',
                description: 'The iconic footwear choice of international badminton champions. Power Cushion+ technology converts impact energy into smooth stride bounce.',
                price: 36500,
                salePrice: 34500,
                stockQuantity: 8,
                images: [
                    { url: '/imgs/hero_shoes.png', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('shoes'),
                status: 'active',
                tags: ['shoes', 'professional', 'cushioning', 'yonex', 'non-marking'],
                isFeatured: true,
                averageRating: 4.9,
                reviewCount: 62,
                specifications: [
                    { key: 'Outsole', value: 'Hexagrip Non-Marking Rubber' },
                    { key: 'Midsole', value: 'Power Cushion+, Power Graphite Sheet' },
                    { key: 'Upper', value: 'Double Raschel Mesh & Synthetic Leather' },
                    { key: 'Available Sizes', value: 'EU 40, 41, 42, 43, 44, 45' },
                ],
            },
            {
                name: 'Li-Ning Ranger 6 Pro Neon Edition',
                slug: 'lining-ranger-6-pro',
                sku: 'LN-SH-RANGER6',
                description: 'Heavy duty professional court shoe featuring high-elasticity midsole padding, TPU support plates, and anti-slip grid outsoles.',
                price: 29500,
                salePrice: 26800,
                stockQuantity: 11,
                images: [
                    { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                    { url: '/imgs/hero_shoes.png' },
                ],
                brand: getBrandId('li-ning'),
                category: getCategoryId('shoes'),
                status: 'active',
                tags: ['shoes', 'ranger', 'lining', 'court grip', 'neon'],
                isFeatured: true,
                averageRating: 4.8,
                reviewCount: 37,
                specifications: [
                    { key: 'Midsole', value: 'Light Foam & TPU Shank' },
                    { key: 'Color', value: 'Electric Neon & Obsidian Black' },
                ],
            },
            {
                name: 'Victor A970ACE Black Metallic',
                slug: 'victor-a970ace-black',
                sku: 'VIC-SH-A970',
                description: 'Engineered with HYPEREVA and E-TPU energetic shock absorption for supreme court mobility, stability, and ankle protect protection.',
                price: 34000,
                stockQuantity: 6,
                images: [
                    { url: '/imgs/hero_shoes.png', isPrimary: true },
                ],
                brand: getBrandId('victor'),
                category: getCategoryId('shoes'),
                status: 'active',
                tags: ['shoes', 'victor', 'hypereva', 'stability'],
                isFeatured: false,
                averageRating: 4.7,
                reviewCount: 21,
                specifications: [
                    { key: 'Technology', value: 'HYPEREVA, V-Durable+, Carbon Power' },
                ],
            },
            // --- SHUTTLECOCKS ---
            {
                name: 'Victor Gold No. 1 Tournament Feather',
                slug: 'victor-gold-no-1',
                sku: 'VIC-SHUT-GOLD1',
                description: 'BWF approved tournament-grade goose feather shuttlecocks. Exceptional flight stability, correct speed, and unmatched durability.',
                price: 7800,
                salePrice: 7400,
                stockQuantity: 42,
                images: [
                    { url: '/imgs/hero_shuttlecock.png', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80' },
                ],
                brand: getBrandId('victor'),
                category: getCategoryId('shuttlecocks'),
                status: 'active',
                tags: ['shuttlecock', 'feather', 'tournament', 'goose feather', 'victor'],
                isFeatured: true,
                averageRating: 5.0,
                reviewCount: 88,
                specifications: [
                    { key: 'Material', value: 'Class A Goose Feather / Solid Cork' },
                    { key: 'Quantity', value: '12 Shuttlecocks / Tube' },
                    { key: 'Speed Rating', value: 'Speed 77 (Medium)' },
                ],
            },
            {
                name: 'Yonex Mavis 350 Yellow Nylon (Medium)',
                slug: 'yonex-mavis-350-yellow',
                sku: 'YNX-SHUT-M350',
                description: 'The world standard nylon shuttlecock for training and club practice. Delivers accurate flight curve and legendary durability.',
                price: 4800,
                stockQuantity: 80,
                images: [
                    { url: '/imgs/hero_shuttlecock.png', isPrimary: true },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('shuttlecocks'),
                status: 'active',
                tags: ['shuttlecock', 'nylon', 'mavis', 'training', 'yonex'],
                isFeatured: false,
                averageRating: 4.8,
                reviewCount: 114,
                specifications: [
                    { key: 'Material', value: 'High Grade Nylon Skirt / Synthetic Cork' },
                    { key: 'Quantity', value: '6 Shuttlecocks / Tube' },
                ],
            },
            {
                name: 'Yonex AS-50 Official Match Feather Tube',
                slug: 'yonex-as-50-feather',
                sku: 'YNX-SHUT-AS50',
                description: 'The pinnacle of badminton shuttlecocks used in Olympic games and Super Series BWF tournaments worldwide.',
                price: 9800,
                salePrice: 9200,
                stockQuantity: 25,
                images: [
                    { url: '/imgs/hero_shuttlecock.png', isPrimary: true },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('shuttlecocks'),
                status: 'active',
                tags: ['shuttlecock', 'feather', 'olympic', 'yonex', 'as50'],
                isFeatured: true,
                averageRating: 5.0,
                reviewCount: 45,
                specifications: [
                    { key: 'Material', value: '100% Premium Selected Goose Feather' },
                    { key: 'Quantity', value: '12 Shuttlecocks / Tube' },
                ],
            },
            // --- STRINGS ---
            {
                name: 'Yonex BG66 Ultimax String Reel',
                slug: 'yonex-bg66-ultimax',
                sku: 'YNX-STR-BG66UM',
                description: 'The most popular string choice of worldwide badminton pros. Super thin 0.65mm gauge offering unmatched repulsion power and crisp sound.',
                price: 2400,
                stockQuantity: 120,
                images: [
                    { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('strings'),
                status: 'active',
                tags: ['strings', 'repulsion', 'bg66', 'sound', 'yonex'],
                isFeatured: true,
                averageRating: 4.9,
                reviewCount: 152,
                specifications: [
                    { key: 'Gauge', value: '0.65 mm' },
                    { key: 'Length', value: '10 Meters (33 ft)' },
                    { key: 'Core', value: 'High-Intensity Nylon Multifilament' },
                ],
            },
            {
                name: 'Yonex BG80 Power High Tension String',
                slug: 'yonex-bg80-power',
                sku: 'YNX-STR-BG80P',
                description: 'Hard feel string engineered with Vectran fibers for smashing players looking for maximum hold tension and heavy hitting feel.',
                price: 2600,
                stockQuantity: 85,
                images: [
                    { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('strings'),
                status: 'active',
                tags: ['strings', 'power', 'bg80', 'vectran'],
                isFeatured: false,
                averageRating: 4.8,
                reviewCount: 78,
                specifications: [
                    { key: 'Gauge', value: '0.68 mm' },
                    { key: 'Feeling', value: 'Hard Feel' },
                ],
            },
            // --- GRIPS ---
            {
                name: 'Yonex Super Grap AC102EX Overgrip (3-Pack)',
                slug: 'yonex-super-grap-ac102ex',
                sku: 'YNX-GRP-AC102',
                description: 'High-performance tacky polyurethane overgrip. Absorbs sweat quickly while maintaining tacky grip stability.',
                price: 1400,
                stockQuantity: 150,
                images: [
                    { url: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('grips'),
                status: 'active',
                tags: ['grip', 'overgrip', 'tacky', 'super grap', 'yonex'],
                isFeatured: false,
                averageRating: 4.9,
                reviewCount: 190,
                specifications: [
                    { key: 'Thickness', value: '0.6 mm' },
                    { key: 'Pack', value: '3 Grips per Roll' },
                ],
            },
            // --- SPORTS BAGS ---
            {
                name: 'Li-Ning 3D Tour 9-Racket Thermal Bag',
                slug: 'lining-3d-tour-bag',
                sku: 'LN-BAG-3DTOUR',
                description: 'Dual compartment tour thermo bag featuring climate guard protection for string tension stability and ventilated shoe pocket.',
                price: 18500,
                salePrice: 16900,
                stockQuantity: 8,
                images: [
                    { url: '/imgs/hero_bag.png', isPrimary: true },
                    { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
                ],
                brand: getBrandId('li-ning'),
                category: getCategoryId('bags'),
                status: 'active',
                tags: ['bag', 'thermal', 'professional', 'backpack', 'li-ning'],
                isFeatured: true,
                averageRating: 4.9,
                reviewCount: 31,
                specifications: [
                    { key: 'Capacity', value: '9 Rackets + Accessories' },
                    { key: 'Dimensions', value: '78cm x 32cm x 30cm' },
                    { key: 'Features', value: 'Thermal Guard, Shoe Pocket, Padded Straps' },
                ],
            },
            {
                name: 'Yonex Pro Stand Bag Black & Gold Edition',
                slug: 'yonex-pro-stand-bag',
                sku: 'YNX-BAG-STAND-BG',
                description: 'Modern upright standing racket bag with organized dividers, premium water-resistant fabric, and ergonomic shoulder harness.',
                price: 22500,
                salePrice: 20500,
                stockQuantity: 6,
                images: [
                    { url: '/imgs/hero_bag.png', isPrimary: true },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('bags'),
                status: 'active',
                tags: ['bag', 'yonex', 'stand bag', 'tour'],
                isFeatured: true,
                averageRating: 5.0,
                reviewCount: 22,
                specifications: [
                    { key: 'Style', value: 'Stand Backpack' },
                    { key: 'Color', value: 'Obsidian Black / Gold' },
                ],
            },
            // --- APPAREL ---
            {
                name: 'Yonex Tournament Dry-Fit Pro Jersey',
                slug: 'yonex-tournament-dry-fit-jersey',
                sku: 'YNX-APP-DFJ',
                description: 'Official tour match jersey with VERY COOL climate regulation technology reducing body heat by 3 degrees Celsius.',
                price: 6500,
                salePrice: 5800,
                stockQuantity: 30,
                images: [
                    { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                ],
                brand: getBrandId('yonex'),
                category: getCategoryId('jerseys'),
                status: 'active',
                tags: ['jersey', 'apparel', 'dry-fit', 'yonex'],
                isFeatured: false,
                averageRating: 4.8,
                reviewCount: 42,
                specifications: [
                    { key: 'Material', value: '100% Breathable Polyester' },
                    { key: 'Technology', value: 'Very Cool, UV Reduction' },
                ],
            },
            // --- ACCESSORIES & TRAINING ---
            {
                name: 'Wayamba Pro Badminton Training Net Set',
                slug: 'wayamba-pro-badminton-net',
                sku: 'WBH-TRN-NET01',
                description: 'Official tournament height portable net set with heavy duty steel frames, ideal for indoor courts and outdoor training sessions.',
                price: 14500,
                stockQuantity: 12,
                images: [
                    { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', isPrimary: true },
                ],
                brand: getBrandId('kawasaki'),
                category: getCategoryId('training'),
                status: 'active',
                tags: ['training', 'net', 'court', 'equipment'],
                isFeatured: false,
                averageRating: 4.7,
                reviewCount: 19,
                specifications: [
                    { key: 'Height', value: '1.55 Meters (Official BWF Standard)' },
                ],
            },
        ];
        await Product_1.default.insertMany(productsData);
        console.log(`Seeded ${productsData.length} products successfully.`);
        console.log('Seeding finished successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
seed();
