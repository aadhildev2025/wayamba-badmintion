import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Sun, Moon, ShoppingCart, Phone, Sparkles, Command } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

import CartDrawer from '@/components/CartDrawer';

const NAV_ITEMS = [
  { label: 'Home',    to: '/' },
  { label: 'Shop',    to: '/shop' },
  { label: 'About',   to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [scrolled,        setScrolled]        = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [cartDrawerOpen,  setCartDrawerOpen]  = useState(false);
  const [query,           setQuery]           = useState('');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery('');
    }
  };

  return (
    <>
      {/* ════════════════════════════════════
          TOP UTILITY ANNOUNCEMENT BAR
      ════════════════════════════════════ */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 36,
        background: '#060609',
        borderBottom: '1px solid rgba(176,28,40,0.3)',
        display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Hotline */}
          <a
            href="tel:+94714443317"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none', fontFamily: 'Inter',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
          >
            <Phone size={11.5} style={{ color: 'var(--red-vivid)' }} />
            +94 71 444 3317
          </a>

          {/* Tagline */}
          <span className="hidden-mobile" style={{
            fontFamily: 'Outfit', fontSize: 11, fontWeight: 800,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '2px', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Sparkles size={11} style={{ color: 'var(--red-vivid)' }} />
            Official Yonex · Li-Ning · Kookaburra · Wilson Dealer
          </span>

          {/* Shipping */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter' }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--red-vivid)', flexShrink: 0,
              boxShadow: '0 0 8px var(--red-vivid)',
            }} />
            Island-Wide Express Delivery
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          MAIN FULL-WIDTH TOP HEADER
      ════════════════════════════════════ */}
      <header style={{
        position: 'fixed',
        top: scrolled ? 48 : 36,
        left: scrolled ? '50%' : 0,
        right: scrolled ? 'auto' : 0,
        transform: scrolled ? 'translateX(-50%)' : 'none',
        width: scrolled ? 'min(1240px, calc(100% - 32px))' : '100%',
        height: scrolled ? 64 : 72,
        borderRadius: scrolled ? 999 : 0,
        background: scrolled ? 'rgba(10, 10, 16, 0.88)' : '#060609',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
        border: scrolled ? '1.5px solid rgba(176, 28, 40, 0.45)' : 'none',
        borderBottom: scrolled ? '1.5px solid rgba(176, 28, 40, 0.45)' : 'none',
        boxShadow: scrolled ? '0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(176,28,40,0.3)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 100,
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, paddingLeft: scrolled ? 24 : undefined, paddingRight: scrolled ? 24 : undefined }}>

          {/* ── LEFT: Logo + Brand Name ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div className="mobile-logo-icon" style={{
              width: 42, height: 42, borderRadius: '50%',
              border: '2px solid var(--red-vivid)',
              boxShadow: '0 0 16px rgba(176,28,40,0.4)',
              overflow: 'hidden', flexShrink: 0,
              transition: 'transform 0.25s var(--ease)',
            }}>
              <img src="/logo.png" alt="Wayamba Badminton Home" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div className="mobile-logo-text" style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 17, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                WAYAMBA
              </div>
              <div className="mobile-logo-sub" style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 800, color: 'var(--red-vivid)', letterSpacing: '2.2px', textTransform: 'uppercase' }}>
                BADMINTON HOME
              </div>
            </div>
          </Link>

          {/* ── CENTER: Clean Navigation Links ── */}
          <nav className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {NAV_ITEMS.map(n => {
              const active = isActive(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  style={{
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    textDecoration: 'none',
                    position: 'relative',
                    padding: '6px 0',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
                >
                  {n.label}
                  {active && (
                    <motion.div
                      layoutId="activeNavLine"
                      style={{
                        position: 'absolute', bottom: -2, left: 0, right: 0,
                        height: 2.5, borderRadius: 99,
                        background: 'var(--red-vivid)',
                        boxShadow: '0 0 10px rgba(176,28,40,0.8)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── RIGHT: Search + Controls ── */}
          <div className="mobile-controls-gap" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search Pill Trigger */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setSearchOpen(true)}
              className="hidden-mobile"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', borderRadius: 99,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: 'Outfit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(176,28,40,0.5)';
                (e.currentTarget as HTMLElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)';
              }}
            >
              <Search size={14} style={{ color: 'var(--red-vivid)' }} />
              <span>Search equipment...</span>
            </motion.button>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="show-mobile mobile-icon-btn"
              style={{ ...iconBtnStyle, display: 'none' }}
              aria-label="Search"
            >
              <Search size={17} />
            </button>

            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="mobile-icon-btn"
              style={iconBtnStyle}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </motion.button>

            {/* Cart Icon */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="mobile-icon-btn"
              style={{ ...iconBtnStyle, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties}
              aria-label="Cart"
            >
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 17, height: 17, borderRadius: '50%',
                    background: 'var(--red-vivid)', color: '#fff',
                    fontSize: 9, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid #060609',
                    boxShadow: '0 0 10px rgba(176,28,40,0.8)',
                  }}
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="show-mobile mobile-icon-btn"
              style={{ ...iconBtnStyle, display: 'none' }}
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Slide-Down Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#060609' }}
            >
              <div style={{ padding: '20px 24px 28px' }}>
                {NAV_ITEMS.map(n => (
                  <Link
                    key={n.to} to={n.to}
                    style={{
                      display: 'block', padding: '14px 18px', borderRadius: 12, marginBottom: 6,
                      background: isActive(n.to) ? 'rgba(176,28,40,0.22)' : 'transparent',
                      borderLeft: isActive(n.to) ? '3.5px solid var(--red-vivid)' : '3.5px solid transparent',
                      color: isActive(n.to) ? '#fff' : 'rgba(255,255,255,0.7)',
                      fontFamily: 'Outfit', fontWeight: 700, fontSize: 16,
                      textDecoration: 'none',
                    }}
                  >
                    {n.label}
                  </Link>
                ))}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <a
                    href="tel:+94714443317"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontFamily: 'Inter' }}
                  >
                    <Phone size={14} style={{ color: 'var(--red-vivid)' }} />
                    +94 71 444 3317
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ════════════════════════════════════
          SEARCH OVERLAY MODAL
      ════════════════════════════════════ */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 600,
              background: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(24px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 620, padding: '0 24px' }}
            >
              {/* Header inside search */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{
                  display: 'inline-block',
                  width: 52, height: 52, borderRadius: '50%',
                  border: '2px solid var(--red-vivid)',
                  boxShadow: '0 0 24px rgba(176,28,40,0.5)',
                  overflow: 'hidden', marginBottom: 16,
                }}>
                  <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                  Search Equipment Catalog
                </div>
              </div>

              <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                <Search
                  size={19}
                  style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }}
                />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Yonex Astrox, Kookaburra, Wilson, Court Shoes..."
                  style={{
                    width: '100%', padding: '18px 130px 18px 52px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(176,28,40,0.5)',
                    borderRadius: 16, color: '#fff', fontSize: 16.5,
                    outline: 'none', fontFamily: 'Inter',
                    boxShadow: '0 0 30px rgba(176,28,40,0.2)',
                  }}
                  onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--red-vivid)'}
                  onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(176,28,40,0.5)'}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                  Search
                </button>
              </form>

              {/* Quick Tags */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                {['Yonex Astrox 100ZZ', 'Kookaburra Bats', 'Wilson Pro Staff', 'Indoor Court Shoes'].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(q)}`);
                      setSearchOpen(false);
                    }}
                    style={{
                      padding: '5px 14px', borderRadius: 99,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.7)', fontSize: 12.5, cursor: 'pointer',
                      fontFamily: 'Outfit', fontWeight: 600, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--red-border)';
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 22, fontFamily: 'Inter' }}>
                Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 5, fontSize: 11, border: '1px solid rgba(255,255,255,0.15)' }}>Esc</kbd>
                {' '} to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
}

/* shared icon button style */
const iconBtnStyle: React.CSSProperties = {
  width: 38, height: 38, borderRadius: 99,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'rgba(255,255,255,0.7)',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
  transition: 'all 0.18s var(--ease)',
};


