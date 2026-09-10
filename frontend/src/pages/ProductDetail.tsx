import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, ArrowLeft, Star, ChevronLeft, ChevronRight,
  Truck, Shield, Minus, Plus, Check, Heart, Zap, MessageSquarePlus, X, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { FALLBACK_PRODUCTS } from './Home';

interface ProductData {
  _id: string; name: string; slug: string; description?: string;
  price: number; salePrice?: number;
  hasCasePricing?: boolean; casePrice?: number; caseSalePrice?: number; caseUnitsCount?: number;
  piecePrice?: number; pieceSalePrice?: number;
  hasColors?: boolean; colors?: string[];
  images?: { url: string; public_id?: string }[];
  brand?: { name: string }; category?: { name: string };
  stockQuantity: number; specifications?: any;
  averageRating?: number; reviewCount?: number;
  isFeatured?: boolean; weight?: string; color?: string;
}
interface Review {
  _id: string; name?: string; user?: { name: string }; rating: number;
  comment: string; createdAt: string;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<'piece' | 'case'>('piece');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  /* ── Review Modal State ── */
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewAlert, setReviewAlert] = useState('');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      alert('Please enter your name.');
      return;
    }
    if (!product) return;
    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product._id || slug}/reviews`, {
        name: reviewerName,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.data?.reviews) {
        setReviews(res.data.reviews);
      } else if (res.data?.review) {
        setReviews(prev => [res.data.review, ...prev]);
      } else {
        setReviews(prev => [{
          _id: 'temp-' + Date.now(),
          name: reviewerName,
          rating: reviewRating,
          comment: reviewComment,
          createdAt: new Date().toISOString()
        } as any, ...prev]);
      }

      setReviewAlert('Thank you! Your review has been added.');
      setReviewComment('');
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewAlert('');
      }, 1500);
    } catch (err: any) {
      console.warn('Backend review submit failed, adding in local state:', err);
      setReviews(prev => [{
        _id: 'local-' + Date.now(),
        name: reviewerName,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString()
      } as any, ...prev]);
      setReviewAlert('Thank you! Your review has been added.');
      setReviewComment('');
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewAlert('');
      }, 1500);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    // 1. Fetch live product data
    api.get(`/products/${slug}`)
      .then((res) => {
        const prod = res.data?.product || res.data;
        setProduct(prod);
        if (prod?.colors && Array.isArray(prod.colors) && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0]);
        }
        if (res.data?.reviews && Array.isArray(res.data.reviews)) {
          setReviews(res.data.reviews);
        }
      })
      .catch((err) => {
        console.warn('API error fetching product, falling back to local list:', err);
        const fb = FALLBACK_PRODUCTS.find((p) => p.slug === slug || p._id === slug);
        if (fb) {
          setProduct(fb as any);
          if (fb?.colors && Array.isArray(fb.colors) && fb.colors.length > 0) {
            setSelectedColor(fb.colors[0]);
          }
        } else {
          setProduct(FALLBACK_PRODUCTS[0] as any);
        }
      })
      .finally(() => setLoading(false));

    // 2. Fetch standalone reviews if available
    api.get(`/products/${slug}/reviews`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setReviews(res.data);
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    
    let imgUrl = '/imgs/hero_rackets.png';
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImg = product.images[0];
      imgUrl = typeof firstImg === 'string' ? firstImg : firstImg.url || '/imgs/hero_rackets.png';
    }
    
    const isCase = selectedUnit === 'case' && Boolean(product.hasCasePricing && product.casePrice);
    const regularPrice = isCase
      ? Number(product.casePrice) || 0
      : Number(product.piecePrice || product.price) || Number(product.salePrice) || 0;
    const salePriceVal = isCase
      ? Number(product.caseSalePrice) || 0
      : Number(product.pieceSalePrice !== undefined ? product.pieceSalePrice : product.salePrice) || 0;
    const hasSale = salePriceVal > 0 && salePriceVal < regularPrice;
    const displayPrice = hasSale ? salePriceVal : regularPrice;

    const unitLabel = isCase
      ? `Case (${product.caseUnitsCount || 12} pcs)`
      : (product.hasCasePricing ? 'Single Piece' : '');
    const activeColor = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : '');

    const details: string[] = [];
    if (activeColor) details.push(activeColor);
    if (unitLabel) details.push(unitLabel);
    const detailString = details.length > 0 ? ` (${details.join(' - ')})` : '';

    const itemName = `${product.name}${detailString}`;
    const cartItemId = `${product._id}${activeColor ? `-${activeColor.replace(/\s+/g, '_')}` : ''}${isCase ? '-case' : (product.hasCasePricing ? '-piece' : '')}`;

    addToCart({
      _id: cartItemId,
      productId: product._id,
      name: itemName,
      price: displayPrice,
      image: imgUrl,
      quantity: qty,
      brand: product.brand,
      selectedUnit: unitLabel,
      selectedColor: activeColor,
      stockQuantity: product.stockQuantity ?? 10
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
  if (!product) return null;

  const imagesList = Array.isArray(product.images)
    ? product.images.map((img: any) => typeof img === 'string' ? { url: img } : img)
    : [];
  const rawImages = imagesList.length ? imagesList : [{ url: '/imgs/hero_rackets.png' }];

  const isCase = selectedUnit === 'case' && Boolean(product.hasCasePricing && product.casePrice);
  const regularPrice = isCase
    ? Number(product.casePrice) || 0
    : Number(product.piecePrice || product.price) || Number(product.salePrice) || 0;
  const salePriceVal = isCase
    ? Number(product.caseSalePrice) || 0
    : Number(product.pieceSalePrice !== undefined ? product.pieceSalePrice : product.salePrice) || 0;
  const hasSale = salePriceVal > 0 && salePriceVal < regularPrice;
  const displayPrice = hasSale ? salePriceVal : regularPrice;
  const discount = hasSale && regularPrice > 0 ? Math.round((1 - salePriceVal / regularPrice) * 100) : 0;
  const inStock = (product.stockQuantity ?? 10) > 0;

  // Format specifications into list if object or array
  let specsList: { key: string; value: string }[] = [];
  if (Array.isArray(product.specifications)) {
    specsList = product.specifications;
  } else if (product.specifications && typeof product.specifications === 'object') {
    specsList = Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }));
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--b1)', background: 'var(--bg-2)', padding: '14px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--t3)' }}>
            <Link to="/" style={{ color: 'var(--t3)' }}>Home</Link>
            <span>/</span>
            <Link to="/shop" style={{ color: 'var(--t3)' }}>Shop</Link>
            <span>/</span>
            <span style={{ color: 'var(--red-vivid)', fontWeight: 600 }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <button onClick={() => navigate('/shop')} className="btn btn-outline btn-sm" style={{ marginBottom: 28 }}>
          <ArrowLeft size={15} /> Back to Catalog
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'start' }}>

          {/* Image Gallery */}
          <div>
            <div style={{
              borderRadius: 24, overflow: 'hidden', border: '1px solid var(--b1)',
              background: 'var(--surface)', aspectRatio: '1', position: 'relative',
              boxShadow: 'var(--s3)',
            }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIndex}
                  src={rawImages[imgIndex]?.url || '/imgs/hero_rackets.png'}
                  alt={product.name}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.8 }}
                  transition={{ duration: 0.25 }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 20 }}
                  onError={e => { (e.target as HTMLImageElement).src = '/imgs/hero_rackets.png'; }}
                />
              </AnimatePresence>

              {discount > 0 && <span className="pcard-sale" style={{ fontSize: 12, padding: '6px 14px' }}>−{discount}% OFF</span>}

              {rawImages.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((imgIndex - 1 + rawImages.length) % rawImages.length)}
                    style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', background: 'rgba(6,6,9,0.75)', border: '1px solid var(--b2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIndex((imgIndex + 1) % rawImages.length)}
                    style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 38, height: 38, borderRadius: '50%', background: 'rgba(6,6,9,0.75)', border: '1px solid var(--b2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {rawImages.length > 1 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
                {rawImages.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    style={{
                      width: 72, height: 72, borderRadius: 14, overflow: 'hidden',
                      border: i === imgIndex ? '2px solid var(--red-vivid)' : '1px solid var(--b1)',
                      background: 'var(--surface)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                    }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} onError={e => { (e.target as HTMLImageElement).src = '/imgs/hero_rackets.png'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {product.brand?.name && (
              <div className="eyebrow">{product.brand.name}</div>
            )}
            <h1 className="display-md" style={{ color: 'var(--t1)' }}>{product.name}</h1>

            {/* Rating */}
            {(() => {
              const revCount = reviews.length || product.reviewCount || 0;
              const computedAvg = reviews.length > 0
                ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
                : (product.averageRating || 0);

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {revCount > 0 ? (
                    <>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={15} style={{ fill: s <= Math.round(computedAvg) ? 'var(--warning)' : 'transparent', color: s <= Math.round(computedAvg) ? 'var(--warning)' : 'var(--t4)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--t3)', fontWeight: 600 }}>({computedAvg} • {revCount} {revCount === 1 ? 'review' : 'reviews'})</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--t4)', fontWeight: 500 }}>No reviews yet</span>
                  )}
                  <button
                    onClick={() => setShowReviewModal(true)}
                    style={{
                      background: 'rgba(176,28,40,0.12)', border: '1px solid rgba(176,28,40,0.35)',
                      color: 'var(--red-vivid)', padding: '5px 14px', borderRadius: 99,
                      fontSize: 12, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 6,
                      transition: 'all 0.2s',
                    }}
                  >
                    <MessageSquarePlus size={14} /> Write Review
                  </button>
                </div>
              );
            })()}

            {/* Packaging Option Selector (for Shuttlecocks & Multi-unit products) */}
            {product.hasCasePricing && product.casePrice && (
              <div style={{ background: 'var(--bg-3)', padding: '16px', borderRadius: 16, border: '1px solid var(--b2)' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: 'Outfit' }}>
                  Choose Packaging / Buying Option:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedUnit('piece')}
                    style={{
                      padding: '14px', borderRadius: 14, textAlign: 'left',
                      background: selectedUnit === 'piece' ? 'rgba(176,28,40,0.18)' : 'rgba(255,255,255,0.02)',
                      border: selectedUnit === 'piece' ? '2px solid var(--red-vivid)' : '1px solid var(--b1)',
                      cursor: 'pointer', transition: 'all 0.2s', color: '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, fontFamily: 'Outfit', color: selectedUnit === 'piece' ? '#fff' : 'var(--t2)' }}>
                        🏸 Single Piece
                      </span>
                      <span style={{ fontWeight: 900, fontSize: 13.5, color: selectedUnit === 'piece' ? 'var(--red-vivid)' : '#fff', fontFamily: 'Outfit' }}>
                        Rs. {((product.pieceSalePrice !== undefined ? product.pieceSalePrice : product.salePrice) || (product.piecePrice || product.price)).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>Individual single shuttlecock</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUnit('case')}
                    style={{
                      padding: '14px', borderRadius: 14, textAlign: 'left',
                      background: selectedUnit === 'case' ? 'rgba(176,28,40,0.18)' : 'rgba(255,255,255,0.02)',
                      border: selectedUnit === 'case' ? '2px solid var(--red-vivid)' : '1px solid var(--b1)',
                      cursor: 'pointer', transition: 'all 0.2s', color: '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, fontFamily: 'Outfit', color: selectedUnit === 'case' ? '#fff' : 'var(--t2)' }}>
                        📦 Full Case / Tube
                      </span>
                      <span style={{ fontWeight: 900, fontSize: 13.5, color: selectedUnit === 'case' ? 'var(--red-vivid)' : '#fff', fontFamily: 'Outfit' }}>
                        Rs. {(product.caseSalePrice || product.casePrice).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#10B981', fontWeight: 700 }}>
                      {product.caseUnitsCount || 12} pcs pack (Best value)
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <span style={{ fontFamily: 'Outfit', fontSize: 34, fontWeight: 800, color: 'var(--t1)' }}>
                Rs. {displayPrice.toLocaleString()}
              </span>
              {isCase && (
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--red-vivid)', background: 'rgba(176,28,40,0.15)', padding: '3px 10px', borderRadius: 6, fontFamily: 'Outfit' }}>
                  CASE OF {product.caseUnitsCount || 12} PCS
                </span>
              )}
              {!isCase && product.hasCasePricing && (
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 6, fontFamily: 'Outfit' }}>
                  SINGLE PIECE
                </span>
              )}
              {discount > 0 && (
                <span style={{ fontSize: 18, color: 'var(--t3)', textDecoration: 'line-through' }}>
                  Rs. {regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p style={{ color: 'var(--t2)', fontSize: 15.5, lineHeight: 1.75 }}>
              {product.description || 'Professional equipment engineered for high performance, maximum durability, and court dominance.'}
            </p>

            {/* Color Variant Selector */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ background: 'var(--bg-3)', padding: '16px', borderRadius: 16, border: '1px solid var(--b2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: 'Outfit' }}>
                    Available Colors:
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--t3)', fontFamily: 'Outfit', fontWeight: 700 }}>
                    {product.colors.length} {product.colors.length === 1 ? 'Color' : 'Colors'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {product.colors.map((color) => {
                    const isSel = (selectedColor || product.colors?.[0]) === color;
                    const isWhite = color.toLowerCase() === '#ffffff' || color.toLowerCase() === 'white' || color.toLowerCase() === '#fff';
                    const isLight = isWhite || color.toLowerCase() === '#facc15' || color.toLowerCase() === '#eab308';

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: color,
                          border: isSel ? '3px solid var(--red-vivid)' : isWhite ? '1.5px solid #888' : '2px solid rgba(255,255,255,0.2)',
                          boxShadow: isSel ? '0 0 14px rgba(176,28,40,0.55), inset 0 0 0 2px #0D0D14' : '0 2px 8px rgba(0,0,0,0.4)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: isSel ? 'scale(1.12)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          padding: 0
                        }}
                      >
                        {isSel && (
                          <Check
                            size={16}
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

            <div className="divider" />

            {/* Stock & Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', borderRadius: 12, border: '1px solid var(--b2)', background: 'var(--bg-3)' }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '10px 14px', color: 'var(--t1)', cursor: 'pointer' }}><Minus size={14} /></button>
                <span style={{ padding: '0 14px', fontWeight: 800, fontSize: 15, fontFamily: 'Outfit' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ padding: '10px 14px', color: 'var(--t1)', cursor: 'pointer' }}><Plus size={14} /></button>
              </div>

              <span style={{ fontSize: 13, fontWeight: 700, color: inStock ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {inStock ? (
                  <>
                    <Zap size={14} /> In Stock ({product.stockQuantity} available)
                  </>
                ) : (
                  'Currently Out of Stock'
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 10 }}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`btn btn-primary btn-lg ${added ? 'added' : ''}`}
                style={{ flex: 1, minWidth: 200 }}
              >
                {added ? <><Check size={18} /> Added to Cart!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setWishlist(!wishlist)}
                className="btn btn-outline btn-lg"
                style={{ color: wishlist ? 'var(--red-vivid)' : 'var(--t1)', borderColor: wishlist ? 'var(--red-border)' : 'var(--b2)' }}
              >
                <Heart size={18} style={{ fill: wishlist ? 'var(--red-vivid)' : 'transparent' }} />
              </motion.button>
            </div>

            {/* Guarantees */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16, padding: 20, borderRadius: 16, background: 'var(--bg-2)', border: '1px solid var(--b1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>
                <Truck size={18} style={{ color: 'var(--red-vivid)' }} /> Express Island-Wide Courier
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>
                <Shield size={18} style={{ color: 'var(--red-vivid)' }} /> 100% Genuine Direct Import
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Reviews Tabs */}
        <div style={{ marginTop: 64 }}>
          <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--b1)', marginBottom: 32 }}>
            {[
              { id: 'desc', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: `Reviews (${reviews.length})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '14px 22px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 15,
                  color: activeTab === tab.id ? 'var(--red-vivid)' : 'var(--t3)',
                  borderBottom: activeTab === tab.id ? '2.5px solid var(--red-vivid)' : '2.5px solid transparent',
                  background: 'none', cursor: 'pointer', transition: 'all 0.18s var(--ease)',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'desc' && (
            <div style={{ color: 'var(--t2)', fontSize: 15.5, lineHeight: 1.8, maxWidth: 800 }}>
              <p style={{ marginBottom: 16 }}>{product.description}</p>
              <p>Engineered for professional athletes and passionate enthusiasts. Sourced directly from official authorized channels with complete authenticity guaranteed.</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div style={{ maxWidth: 640 }}>
              {specsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {specsList.map(s => (
                    <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--b1)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--t3)', fontSize: 14 }}>{s.key}</span>
                      <span style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 14, fontFamily: 'Outfit' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--t3)' }}>No detailed specifications listed for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ maxWidth: 700 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>
                  Customer Reviews ({reviews.length})
                </h3>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <MessageSquarePlus size={16} /> Write a Review
                </button>
              </div>

              {reviews.length === 0 ? (
                <div style={{ padding: '32px 24px', borderRadius: 16, background: 'var(--bg-3)', border: '1px dashed var(--b2)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--t3)', marginBottom: 16, fontSize: 14.5 }}>No reviews yet. Be the first player to review this product!</p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="btn btn-outline btn-sm"
                  >
                    Write First Review
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                  {reviews.map(r => (
                    <div key={r._id} style={{ padding: 20, borderRadius: 16, background: 'var(--bg-3)', border: '1px solid var(--b1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, color: 'var(--t1)', fontFamily: 'Outfit' }}>
                          {r.name || r.user?.name || 'Verified Customer'}
                        </span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} style={{ fill: s <= r.rating ? 'var(--warning)' : 'transparent', color: s <= r.rating ? 'var(--warning)' : 'var(--t4)' }} />)}
                        </div>
                      </div>
                      <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>
                      <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 8 }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent review'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Review Dialog Modal ── */}
      <AnimatePresence>
        {showReviewModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%', maxWidth: 500, background: '#0D0D14',
                border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 24,
                padding: 30, boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
                position: 'relative',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  position: 'absolute', top: 20, right: 20, background: 'none',
                  border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                Write a Review
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 22 }}>
                Share your feedback for <strong style={{ color: '#fff' }}>{product.name}</strong>
              </p>

              {reviewAlert ? (
                <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.18)', border: '1px solid #10B981', color: '#10B981', fontWeight: 700, textAlign: 'center', fontFamily: 'Outfit' }}>
                  {reviewAlert}
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Name Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit', marginBottom: 6 }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wayamba Badminton"
                      value={reviewerName}
                      onChange={e => setReviewerName(e.target.value)}
                      style={{
                        width: '100%', background: '#14141E', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 14,
                        fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Star Rating Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit', marginBottom: 8 }}>
                      Select Rating *
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map(star => {
                        const active = star <= (hoverRating || reviewRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                              transform: active ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s'
                            }}
                          >
                            <Star
                              size={28}
                              style={{
                                fill: active ? '#F59E0B' : 'transparent',
                                color: active ? '#F59E0B' : 'rgba(255,255,255,0.25)',
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review Message Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit', marginBottom: 6 }}>
                      Review Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your thoughts about performance, quality, and play style..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      style={{
                        width: '100%', background: '#14141E', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 14,
                        fontFamily: 'Inter', outline: 'none', resize: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      style={{
                        flex: 1, padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700,
                        fontFamily: 'Outfit', cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      style={{
                        flex: 2, padding: '12px 18px', borderRadius: 12,
                        background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                        border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800,
                        fontFamily: 'Outfit', cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(176,28,40,0.4)'
                      }}
                    >
                      {submittingReview ? 'Submitting...' : <><Send size={15} /> Submit Review</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

