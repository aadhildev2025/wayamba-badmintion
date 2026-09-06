import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingCart, Check, ArrowRight, ShieldCheck, Truck, Zap, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductQuickViewProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    images?: (string | { url: string })[];
    brand?: { name: string };
    category?: { name: string };
    stockQuantity: number;
    description?: string;
    averageRating?: number;
    reviewCount?: number;
    specifications?: { key: string; value: string }[] | Record<string, any>;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickViewModal({ product, isOpen, onClose }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  if (!product || !isOpen) return null;

  const imagesList = Array.isArray(product.images)
    ? product.images.map((img: any) => (typeof img === 'string' ? img : img.url))
    : ['/imgs/hero_rackets.png'];

  const mainImg = imagesList[activeImgIdx] || imagesList[0] || '/imgs/hero_rackets.png';

  const regularPrice = Number(product.price) || Number(product.salePrice) || 0;
  const salePriceVal = Number(product.salePrice) || 0;
  const isOnSale = salePriceVal > 0 && salePriceVal < regularPrice;
  const displayPrice = isOnSale ? salePriceVal : regularPrice;
  const discount = isOnSale && regularPrice > 0 ? Math.round((1 - salePriceVal / regularPrice) * 100) : 0;
  const inStock = product.stockQuantity > 0;

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: displayPrice,
      image: mainImg,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleGoToFullPage = () => {
    onClose();
    navigate(`/product/${product.slug}`);
  };

  return createPortal(
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 840,
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#0D0D14',
            border: '1.5px solid rgba(255,255,255,0.14)',
            borderRadius: 24,
            padding: 28,
            boxShadow: '0 24px 70px rgba(0,0,0,0.9), 0 0 30px rgba(176,28,40,0.25)',
            zIndex: 1101,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer', zIndex: 10
            }}
          >
            <X size={18} />
          </button>

          {/* Quick View Content Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, alignItems: 'center' }}>
            
            {/* Left Column: Product Photo & Thumbnails */}
            <div>
              <div style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                background: '#14141E',
                border: '1px solid rgba(255,255,255,0.1)',
                aspectRatio: '1/1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
              }}>
                <img
                  src={mainImg}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).src = '/imgs/hero_rackets.png'; }}
                />
                {isOnSale && (
                  <span style={{
                    position: 'absolute', top: 14, left: 14,
                    background: 'var(--red-vivid)', color: '#fff',
                    fontWeight: 900, fontSize: 11, padding: '4px 12px',
                    borderRadius: 99, fontFamily: 'Outfit'
                  }}>
                    −{discount}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails list if multiple */}
              {imagesList.length > 1 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14, overflowX: 'auto' }}>
                  {imagesList.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIdx(i)}
                      style={{
                        width: 60, height: 60, borderRadius: 12, overflow: 'hidden',
                        border: activeImgIdx === i ? '2px solid var(--red-vivid)' : '1px solid rgba(255,255,255,0.1)',
                        background: '#14141E', cursor: 'pointer', flexShrink: 0
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Information & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                {product.brand?.name && (
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red-vivid)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Outfit', marginBottom: 4 }}>
                    {product.brand.name}
                  </div>
                )}
                <h2 style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25, letterSpacing: '-0.3px' }}>
                  {product.name}
                </h2>
              </div>

              {/* Rating & Stock Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {product.reviewCount && product.reviewCount > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} style={{ fill: s <= Math.round(product.averageRating || 5) ? '#F59E0B' : 'transparent', color: s <= Math.round(product.averageRating || 5) ? '#F59E0B' : 'rgba(255,255,255,0.2)' }} />
                    ))}
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', marginLeft: 4, fontFamily: 'Outfit' }}>
                      {product.averageRating} ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                    No reviews yet
                  </span>
                )}
                <span style={{
                  fontSize: 11.5, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                  background: inStock ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: inStock ? '#10B981' : '#EF4444', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Outfit'
                }}>
                  {inStock ? `In Stock (${product.stockQuantity} Left)` : 'Out of Stock'}
                </span>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 900, color: '#FFFFFF' }}>
                  Rs. {displayPrice.toLocaleString()}
                </span>
                {isOnSale && (
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontFamily: 'Outfit' }}>
                    Rs. {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
                {product.description || 'Professional grade equipment engineered for maximum court control, speed, and durability.'}
              </p>

              {/* Perks Row */}
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit', background: '#14141E', padding: '10px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ShieldCheck size={14} style={{ color: '#10B981' }} /> 100% Authentic</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Truck size={14} style={{ color: '#3B82F6' }} /> Express Delivery</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={14} style={{ color: '#F59E0B' }} /> Stringing Ready</span>
              </div>

              {/* Quantity & Cart Action */}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1A1A28', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '10px 14px', color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
                  <span style={{ padding: '0 10px', fontWeight: 800, fontSize: 14, color: '#fff', fontFamily: 'Outfit' }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ padding: '10px 14px', color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
                </div>

                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: 14, fontSize: 14, fontWeight: 900,
                    fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                    border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(176,28,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  {added ? <><Check size={16} /> Added to Cart!</> : <><ShoppingCart size={16} /> Add to Cart</>}
                </button>
              </div>

              {/* Go to full product page */}
              <button
                onClick={handleGoToFullPage}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                  fontSize: 12.5, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4
                }}
              >
                <span>View Full Specifications & Customer Reviews</span> <ArrowRight size={14} />
              </button>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
