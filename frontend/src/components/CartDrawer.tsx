import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQty, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 440,
              height: '100vh',
              background: '#0D0D14',
              borderLeft: '1.5px solid rgba(255,255,255,0.12)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001,
            }}
          >
            {/* Header */}
            <div style={{ padding: '24px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingBag size={20} style={{ color: 'var(--red-vivid)' }} /> Your Shopping Cart
                </h3>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter' }}>
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cart.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏸</div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>Your cart is empty</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 20 }}>Explore our multi-sport rackets, shuttles, bats, and jerseys.</p>
                  <Link to="/shop" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 12, background: 'var(--red-vivid)', color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 13, fontFamily: 'Outfit' }}>
                    Browse Shop Catalog
                  </Link>
                </div>
              ) : (
                cart.map(item => {
                  const itemPrice = item.salePrice || item.price;
                  const itemImg = item.images && item.images[0] ? item.images[0] : '/imgs/hero_rackets.png';

                  return (
                    <div key={item._id} style={{ display: 'flex', gap: 14, padding: 14, borderRadius: 16, background: '#14141E', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <img src={itemImg} alt={item.name} style={{ width: 68, height: 68, borderRadius: 12, objectFit: 'cover', background: '#08080C', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h5 style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, paddingRight: 8 }}>{item.name}</h5>
                            <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 0 }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--red-vivid)', fontWeight: 800, fontFamily: 'Outfit' }}>{typeof item.brand === 'object' ? item.brand.name : 'WBH'}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1A1A28', borderRadius: 8, padding: '3px 8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <button onClick={() => updateQty(item._id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><Minus size={12} /></button>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>{item.quantity}</span>
                            <button onClick={() => updateQty(item._id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><Plus size={12} /></button>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', fontFamily: 'Outfit' }}>
                            Rs. {(itemPrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.08)', background: '#111118' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit' }}>Subtotal Amount</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', fontFamily: 'Outfit' }}>Rs. {cartTotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  style={{
                    width: '100%', padding: '14px 20px', borderRadius: 14, fontSize: 15, fontWeight: 900,
                    fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                    border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(176,28,40,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                  }}
                >
                  <span>Proceed to Checkout</span> <ArrowRight size={17} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
