import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Check, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

interface Product {
  _id: string; name: string; slug: string;
  price: number; salePrice?: number;
  images?: { url: string }[];
  brand?: { name: string }; category?: { name: string };
  stockQuantity: number;
  averageRating?: number; reviewCount?: number;
  isFeatured?: boolean;
}

import ProductQuickViewModal from '@/components/ProductQuickViewModal';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const imgs = Array.isArray(product.images) ? product.images : [];
  const activeImg = imgs[imgIdx] || imgs[0];
  let src = '/imgs/hero_rackets.png';
  if (typeof activeImg === 'string') {
    src = activeImg;
  } else if (activeImg && typeof activeImg === 'object' && (activeImg as any).url) {
    src = (activeImg as any).url;
  }

  const regularPrice = Number(product.price) || Number(product.salePrice) || 0;
  const salePriceVal = Number(product.salePrice) || 0;
  const isOnSale = salePriceVal > 0 && salePriceVal < regularPrice;
  const displayPrice = isOnSale ? salePriceVal : regularPrice;
  const discount = isOnSale && regularPrice > 0 ? Math.round((1 - salePriceVal / regularPrice) * 100) : 0;
  const inStock = product.stockQuantity > 0;
  const stockPct = Math.min(100, Math.max(0, (product.stockQuantity / 20) * 100));
  const rating = product.averageRating;
  const reviews = product.reviewCount || 0;
  const hasReviews = typeof reviews === 'number' && reviews > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    addToCart({ _id: product._id, name: product.name, price: displayPrice, image: src });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const go = () => navigate(`/product/${product.slug}`);

  return (
    <motion.div
      className="pcard"
      onClick={go}
      role="button" tabIndex={0}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => imgs.length > 1 && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
      onKeyDown={e => e.key === 'Enter' && go()}
    >
      {/* Image Container */}
      <div className="pcard-img-wrap">
        <AnimatePresence mode="wait">
          <motion.img
            key={src}
            src={src}
            alt={product.name}
            className="pcard-img"
            loading="lazy"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.25 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/imgs/hero_rackets.png';
            }}
          />
        </AnimatePresence>

        {/* Badges */}
        <div className="pcard-badges">
          {product.isFeatured && (
            <span className="pcard-badge pcard-badge-feat">Featured</span>
          )}
          {isOnSale && (
            <span className="pcard-badge pcard-badge-sale">-{discount}% OFF</span>
          )}
        </div>

        {/* Quick Actions overlay */}
        <div className="pcard-overlay">
          <div className="pcard-actions">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="pcard-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              aria-label="Quick view product"
            >
              <Eye size={15} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className={`pcard-action-btn ${added ? 'done' : ''}`}
              onClick={handleAdd}
              aria-label="Add to cart"
            >
              {added ? <Check size={15} /> : <ShoppingCart size={15} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Body Details */}
      <div className="pcard-body">
        {product.brand?.name && (
          <div className="pcard-brand">{product.brand.name}</div>
        )}

        <div className="pcard-name">{product.name}</div>

        {/* Stars Pill (Only shown if real reviews exist) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, minHeight: 18 }}>
          {hasReviews ? (
            <>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={11}
                    style={{
                      fill: s <= Math.round(rating || 5) ? 'var(--warning)' : 'transparent',
                      color: s <= Math.round(rating || 5) ? 'var(--warning)' : 'var(--t4)',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>({reviews})</span>
            </>
          ) : (
            <span style={{ fontSize: 10.5, color: 'var(--t4)', fontWeight: 500 }}>No reviews yet</span>
          )}
        </div>

        {/* Price Tag */}
        <div className="pcard-price-row">
          <span className="pcard-price">
            Rs. {displayPrice.toLocaleString()}
          </span>
          {isOnSale && (
            <span className="pcard-oldprice">
              Rs. {product.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Level Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 4 }}>
          <span className="pcard-stock-label" style={{
            color: !inStock ? '#EF4444' : product.stockQuantity < 5 ? '#F59E0B' : '#10B981',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            {!inStock ? (
              '✗ Out of Stock'
            ) : product.stockQuantity < 5 ? (
              <>
                <Zap size={11} /> Only {product.stockQuantity} left!
              </>
            ) : (
              '✓ Genuine In Stock'
            )}
          </span>
        </div>
        <div className="pcard-stock-bar">
          <div
            className={`pcard-stock-fill ${stockPct < 25 ? 'low' : ''} ${!inStock ? 'out' : ''}`}
            style={{ width: `${stockPct}%` }}
          />
        </div>
      </div>

      {/* Quick View Popup Modal */}
      <ProductQuickViewModal
        product={product as any}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </motion.div>
  );
}
