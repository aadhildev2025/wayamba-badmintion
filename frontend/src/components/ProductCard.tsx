import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Check, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

interface Product {
  _id: string; name: string; slug: string;
  price: number; salePrice?: number;
  hasCasePricing?: boolean;
  casePrice?: number;
  caseSalePrice?: number;
  caseUnitsCount?: number;
  piecePrice?: number;
  pieceSalePrice?: number;
  hasColors?: boolean;
  colors?: string[];
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

  const regularPrice = Number(product.piecePrice || product.price) || Number(product.salePrice) || 0;
  const salePriceVal = Number(product.pieceSalePrice !== undefined ? product.pieceSalePrice : product.salePrice) || 0;
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
    if ((product.hasCasePricing && product.casePrice) || (product.hasColors && product.colors && product.colors.length > 1)) {
      setQuickViewOpen(true);
      return;
    }
    const defaultColor = product.hasColors && product.colors?.[0] ? product.colors[0] : undefined;
    addToCart({
      _id: defaultColor ? `${product._id}-${defaultColor.toLowerCase().replace(/\s+/g, '-')}` : product._id,
      name: defaultColor ? `${product.name} (${defaultColor})` : product.name,
      price: displayPrice,
      image: src,
      selectedColor: defaultColor
    });
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
          {product.hasColors && product.colors && product.colors.length > 0 && (
            <span className="pcard-badge" style={{ background: '#3B82F6', color: '#fff' }}>
              {product.colors.length} Colors
            </span>
          )}
          {product.hasCasePricing && product.casePrice && (
            <span className="pcard-badge" style={{ background: '#10B981', color: '#fff' }}>Piece & Case</span>
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

        {/* Color preview dots */}
        {product.hasColors && product.colors && product.colors.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            {product.colors.slice(0, 5).map((col, idx) => (
              <span
                key={idx}
                title={col}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: col,
                  border: col.toLowerCase() === '#ffffff' || col.toLowerCase() === 'white' ? '1px solid #777' : '1px solid rgba(255,255,255,0.3)',
                  display: 'inline-block',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                }}
              />
            ))}
            {product.colors.length > 5 && (
              <span style={{ fontSize: 10, color: 'var(--t4)', fontWeight: 700 }}>
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

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
        <div className="pcard-price-row" style={{ alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
          <span className="pcard-price">
            Rs. {displayPrice.toLocaleString()} {product.hasCasePricing ? <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>/ pc</span> : null}
          </span>
          {isOnSale && (
            <span className="pcard-oldprice">
              Rs. {regularPrice.toLocaleString()}
            </span>
          )}
          {product.hasCasePricing && product.casePrice && (
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700, width: '100%', marginTop: 2 }}>
              Case: Rs. {(product.caseSalePrice || product.casePrice).toLocaleString()} ({product.caseUnitsCount || 12} pcs)
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
