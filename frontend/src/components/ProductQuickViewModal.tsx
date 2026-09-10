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
    hasCasePricing?: boolean;
    casePrice?: number;
    caseSalePrice?: number;
    caseUnitsCount?: number;
    piecePrice?: number;
    pieceSalePrice?: number;
    hasColors?: boolean;
    colors?: string[];
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
  const [selectedUnit, setSelectedUnit] = useState<'piece' | 'case'>('piece');
  const [selectedColor, setSelectedColor] = useState<string>(() => (product?.colors?.[0] || ''));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  if (!product || !isOpen) return null;

  const imagesList = Array.isArray(product.images)
    ? product.images.map((img: any) => (typeof img === 'string' ? img : img.url))
    : ['/imgs/hero_rackets.png'];

  const mainImg = imagesList[activeImgIdx] || imagesList[0] || '/imgs/hero_rackets.png';

  const isCase = selectedUnit === 'case' && Boolean(product.hasCasePricing && product.casePrice);
  const regularPrice = isCase
    ? Number(product.casePrice) || 0
    : Number(product.piecePrice || product.price) || Number(product.salePrice) || 0;
  const salePriceVal = isCase
    ? Number(product.caseSalePrice) || 0
    : Number(product.pieceSalePrice !== undefined ? product.pieceSalePrice : product.salePrice) || 0;
  const isOnSale = salePriceVal > 0 && salePriceVal < regularPrice;
  const displayPrice = isOnSale ? salePriceVal : regularPrice;
  const discount = isOnSale && regularPrice > 0 ? Math.round((1 - salePriceVal / regularPrice) * 100) : 0;
  const inStock = product.stockQuantity > 0;

  const handleAddToCart = () => {
    const unitLabel = isCase
      ? `Case (${product.caseUnitsCount || 12} pcs)`
      : (product.hasCasePricing ? 'Single Piece' : '');
    
    const colorLabel = product.hasColors && selectedColor ? selectedColor : '';
    const detailsSuffix = [colorLabel, unitLabel].filter(Boolean).join(' - ');
    const itemName = detailsSuffix ? `${product.name} (${detailsSuffix})` : product.name;

    const colorKey = colorLabel ? `-${colorLabel.toLowerCase().replace(/\s+/g, '-')}` : '';
    const unitKey = isCase ? '-case' : (product.hasCasePricing ? '-piece' : '');
    const cartItemId = `${product._id}${colorKey}${unitKey}`;

    addToCart({
      _id: cartItemId,
      name: itemName,
      price: displayPrice,
      image: mainImg,
      quantity: qty,
      brand: product.brand,
      selectedColor: colorLabel || undefined,
      selectedUnit: unitLabel || undefined,
      stockQuantity: product.stockQuantity ?? 10
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
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }}
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
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
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

              {/* Packaging Option Selector (for Shuttlecocks & Multi-unit products) */}
              {product.hasCasePricing && product.casePrice && (
                <div style={{ background: '#12121C', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, fontFamily: 'Outfit' }}>
                    Select Option:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedUnit('piece')}
                      style={{
                        padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                        background: selectedUnit === 'piece' ? 'rgba(176,28,40,0.22)' : 'rgba(255,255,255,0.03)',
                        border: selectedUnit === 'piece' ? '2px solid var(--red-vivid)' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer', color: '#fff'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 13, fontFamily: 'Outfit', color: selectedUnit === 'piece' ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                        🏸 Single Piece
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--red-vivid)', fontWeight: 800, marginTop: 2 }}>
                        Rs. {((product.pieceSalePrice !== undefined ? product.pieceSalePrice : product.salePrice) || (product.piecePrice || product.price)).toLocaleString()}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedUnit('case')}
                      style={{
                        padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                        background: selectedUnit === 'case' ? 'rgba(176,28,40,0.22)' : 'rgba(255,255,255,0.03)',
                        border: selectedUnit === 'case' ? '2px solid var(--red-vivid)' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer', color: '#fff'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 13, fontFamily: 'Outfit', color: selectedUnit === 'case' ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                        📦 Case ({product.caseUnitsCount || 12} pcs)
                      </div>
                      <div style={{ fontSize: 11, color: '#10B981', fontWeight: 800, marginTop: 2 }}>
                        Rs. {(product.caseSalePrice || product.casePrice).toLocaleString()}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Color Variants (if configured) */}
              {product.hasColors && product.colors && product.colors.length > 0 && (
                <div style={{ background: '#12121C', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'Outfit' }}>
                      Available Colors:
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                      {product.colors.length} {product.colors.length === 1 ? 'Color' : 'Colors'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {product.colors.map(col => {
                      const isSelected = (selectedColor || product.colors?.[0]) === col;
                      const isWhite = col.toLowerCase() === '#ffffff' || col.toLowerCase() === 'white' || col.toLowerCase() === '#fff';
                      const isLight = isWhite || col.toLowerCase() === '#facc15' || col.toLowerCase() === '#eab308';

                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSelectedColor(col)}
                          title={col}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            background: col,
                            border: isSelected ? '2.5px solid var(--red-vivid)' : isWhite ? '1.5px solid #777' : '2px solid rgba(255,255,255,0.2)',
                            boxShadow: isSelected ? '0 0 10px rgba(176,28,40,0.5), inset 0 0 0 2px #0D0D14' : '0 2px 6px rgba(0,0,0,0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                            transition: 'all 0.18s ease',
                            padding: 0
                          }}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              strokeWidth={3.5}
                              style={{ color: isLight ? '#000000' : '#FFFFFF' }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 900, color: '#FFFFFF' }}>
                  Rs. {displayPrice.toLocaleString()}
                </span>
                {isCase && (
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--red-vivid)', background: 'rgba(176,28,40,0.15)', padding: '2px 8px', borderRadius: 4, fontFamily: 'Outfit' }}>
                    CASE / TUBE
                  </span>
                )}
                {!isCase && product.hasCasePricing && (
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, fontFamily: 'Outfit' }}>
                    SINGLE PIECE
                  </span>
                )}
                {isOnSale && (
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontFamily: 'Outfit' }}>
                    Rs. {regularPrice.toLocaleString()}
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
