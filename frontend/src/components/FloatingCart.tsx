import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import CartDrawer from '@/components/CartDrawer';

export default function FloatingCart() {
  const { cartCount, cartTotal } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Hide floating cart on checkout page
  if (cartCount === 0 || location.pathname === '/checkout') return null;


  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 990,
          }}
          className="floating-cart-wrapper"
        >
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 20px',
              borderRadius: 99,
              background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 12px 36px rgba(176, 28, 40, 0.65), 0 0 20px rgba(176, 28, 40, 0.4)',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.22s ease',
              fontFamily: 'Outfit, sans-serif',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 16px 44px rgba(176, 28, 40, 0.8), 0 0 28px rgba(176, 28, 40, 0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(176, 28, 40, 0.65), 0 0 20px rgba(176, 28, 40, 0.4)';
            }}
          >
            {/* Bag Icon with Pulse Badge */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <ShoppingBag size={19} style={{ color: '#FFFFFF' }} />
              </div>
              <span style={{
                position: 'absolute', top: -3, right: -3,
                background: '#FFFFFF', color: '#B01C28',
                fontWeight: 900, fontSize: 11,
                width: 19, height: 19, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                fontFamily: 'Outfit'
              }}>
                {cartCount}
              </span>
            </div>

            {/* Total Text */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255, 255, 255, 0.85)' }}>
                {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Cart
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
                Rs. {cartTotal.toLocaleString()}
              </div>
            </div>

            {/* Checkout Arrow */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 13, fontWeight: 800,
              paddingLeft: 8, borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span>Cart</span>
              <ArrowRight size={15} />
            </div>
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
