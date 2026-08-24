import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Category from './models/Category';
import Brand from './models/Brand';
import Product from './models/Product';
import Coupon from './models/Coupon';

dotenv.config();

const seed = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wayamba_badminton';
    console.log(`Connecting to database for seeding: ${connUri}`);
    await mongoose.connect(connUri);
    console.log('Connected to database.');

    // 1. Clear Existing Collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('Cleared existing data.');

    // 2. Create Users
    await User.create({
      name: 'Super Admin',
      email: 'admin@wbh.com',
      password: 'admin123',
      role: 'SUPER_ADMIN',
      phone: '+94 71 444 3317',
      verified: true,
    });

    await User.create({
      name: 'Sales Staff',
      email: 'staff@wbh.com',
      password: 'staff123',
      role: 'STAFF',
      phone: '+94 77 123 4567',
      verified: true,
    });

    await User.create({
      name: 'Aadhil Customer',
      email: 'customer@wbh.com',
      password: 'customer123',
      role: 'CUSTOMER',
      phone: '+94 76 987 6543',
      verified: true,
    });

    console.log('Seed users created.');

    // 3. Create Categories (Badminton, Cricket & Tennis!)
    const categoriesData = [
      { name: 'Badminton Rackets', slug: 'rackets', icon: 'Sparkles', image: '/imgs/cat_badminton_rackets.png' },
      { name: 'Indoor Court & Sports Shoes', slug: 'shoes', icon: 'Footprints', image: '/imgs/cat_badminton_shoes.png' },
      { name: 'Shuttlecocks', slug: 'shuttlecocks', icon: 'FlameKindling', image: '/imgs/hero_shuttlecock.png' },
      { name: 'Cricket Equipment', slug: 'cricket', icon: 'Trophy', image: '/imgs/cat_cricket_equipment.png' },
      { name: 'Tennis Rackets & Gear', slug: 'tennis', icon: 'CircleDot', image: '/imgs/hero_tennis.png' },
      { name: 'Jerseys & Apparel', slug: 'jerseys', icon: 'Shirt', image: '/imgs/jersey_apparel.png' },
      { name: 'Sports Bags', slug: 'bags', icon: 'ShoppingBag', image: '/imgs/hero_bag.png' },
      { name: 'Grips & Accessories', slug: 'grips', icon: 'Layers', image: '/imgs/cat_grips_accessories.png' },
      { name: 'Strings', slug: 'strings', icon: 'Cable', image: '/imgs/racket_closeup_dark.png' },
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${categories.length} categories.`);

    const getCategoryId = (slug: string) => categories.find(c => c.slug === slug)?._id;

    // 4. Create Brands
    const brandsData = [
      { name: 'Yonex', slug: 'yonex', logo: '/Brand logo/Yonex.webp' },
      { name: 'Li-Ning', slug: 'li-ning', logo: '/Brand logo/Li-Ning.svg' },
      { name: 'Victor', slug: 'victor', logo: '/Brand logo/Victor.png' },
      { name: 'Kookaburra', slug: 'kookaburra', logo: '/images/brands/kookaburra.png' },
      { name: 'Wilson', slug: 'wilson', logo: '/images/brands/wilson.png' },
      { name: 'Babolat', slug: 'babolat', logo: '/images/brands/babolat.png' },
      { name: 'Apacs', slug: 'apacs', logo: '/images/brands/apacs.png' },
      { name: 'Kawasaki', slug: 'kawasaki', logo: '/Brand logo/Kawasaki.jpg' },
    ];
    const brands = await Brand.insertMany(brandsData);
    console.log(`Seeded ${brands.length} brands.`);

    const getBrandId = (slug: string) => brands.find(b => b.slug === slug)?._id;

    // 5. Create Coupons
    await Coupon.insertMany([
      { code: 'WELCOME10', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 2000, expiryDate: new Date('2027-12-31'), active: true },
      { code: 'SMASH500', discountType: 'FLAT', discountValue: 500, minOrderAmount: 5000, expiryDate: new Date('2027-12-31'), active: true },
    ]);

    // 6. Create Detailed Products (1 Badminton Racket)
    const productsData = [
      {
        name: 'Yonex Astrox 100ZZ Kurenai',
        slug: 'yonex-astrox-100zz-kurenai',
        sku: 'YNX-AX100ZZ-KR',
        description: 'The flagship heavy-head offensive badminton racket used by Viktor Axelsen. Featuring Hyper Slim Shaft, NAMD graphite, and Rotational Generator System.',
        price: 58500,
        salePrice: 55000,
        stockQuantity: 12,
        images: ['/imgs/hero_rackets.png'],
        brand: getBrandId('yonex'),
        category: getCategoryId('rackets'),
        status: 'active' as const,
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

    await Product.insertMany(productsData);
    console.log(`Seeded ${productsData.length} products successfully.`);

    console.log('Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
