import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, Zap,
  Package, CheckCircle2, ArrowUpRight, HelpCircle, Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';

/* ── Slider Data ── */
const SLIDES = [
  {
    img: '/imgs/hero_slide_badminton.jpg',
    eyebrow: 'Official Badminton Store — Puttalam',
    headline: ['Dominate', 'Every Court'],
    sub: 'Professional badminton equipment trusted by Sri Lanka\'s national athletes. Authentic gear, expert stringing advice, same-day dispatch.',
    cta: 'Explore Badminton',
    ctaLink: '/shop?category=Badminton%20Rackets',
  },
  {
    img: '/imgs/hero_slide_cricket.jpg',
    eyebrow: 'Kookaburra · SG · Gray-Nicolls',
    headline: ['Championship', 'Cricket Gear'],
    sub: 'Grade 1 English Willow bats, four-piece leather match balls, and protective gear engineered for maximum power and safety.',
    cta: 'Shop Cricket',
    ctaLink: '/shop?category=Cricket%20Equipment',
  },
  {
    img: '/imgs/hero_slide_tennis.jpg',
    eyebrow: 'Wilson · Babolat · Head',
    headline: ['Tour Performance', 'Tennis Racquets'],
    sub: 'Wilson Pro Staff 97 v14, Babolat Pure Drive, and official US Open match balls for players of all skill levels.',
    cta: 'Shop Tennis',
    ctaLink: '/shop?category=Tennis%20Rackets%20%26%20Gear',
  },
  {
    img: '/imgs/hero_slide_rackets.jpg',
    eyebrow: 'Yonex · Li-Ning · Victor',
    headline: ['Pro Badminton', 'Racquets'],
    sub: 'Yonex Astrox 100ZZ, Li-Ning Axforce 100, Victor Thruster Ryuga II and more — direct import, genuine warranty.',
    cta: 'Shop Rackets',
    ctaLink: '/shop?category=Badminton%20Rackets',
  },
  {
    img: '/imgs/hero_slide_shoes.jpg',
    eyebrow: 'BWF Certified Court Footwear',
    headline: ['Court Speed,', 'Unmatched Grip'],
    sub: 'Yonex Power Cushion 65Z3, Li-Ning Ranger Pro and Victor A970ACE non-marking indoor court shoes.',
    cta: 'Shop Footwear',
    ctaLink: '/shop?category=Indoor%20Court%20%26%20Sports%20Shoes',
  },
];



/* ── Fallback Data ── */
export const FALLBACK_PRODUCTS: any[] = [
  { _id:'p1', name:'Yonex Astrox 100ZZ Kurenai', slug:'yonex-astrox-100zz-kurenai', price:58500, salePrice:55000, stockQuantity:12, images:[{url:'/imgs/hero_rackets.png'}], brand:{name:'Yonex'}, category:{name:'Badminton Rackets'}, isFeatured:true, averageRating:5, reviewCount:14 },
  { _id:'p2', name:'Yonex Aerosensa 50 Shuttlecocks', slug:'yonex-aerosensa-50-feather-shuttlecocks', price:850, salePrice:800, hasCasePricing:true, piecePrice:850, pieceSalePrice:800, casePrice:9500, caseSalePrice:8900, caseUnitsCount:12, stockQuantity:45, images:[{url:'/imgs/hero_shuttlecock.png'}], brand:{name:'Yonex'}, category:{name:'Shuttlecocks'}, isFeatured:true, averageRating:5, reviewCount:9 },
];

export const FALLBACK_CATEGORIES: any[] = [
  { _id:'c-b1', name:'Badminton Rackets',          image:'/imgs/cat_badminton_rackets.png', productCount:45 },
  { _id:'c-b2', name:'Indoor Court & Sports Shoes', image:'/imgs/cat_badminton_shoes.png',   productCount:28 },
  { _id:'c-cr1', name:'Cricket Equipment',   image:'/imgs/cat_cricket_equipment.png', productCount:32 },
  { _id:'c-gr1', name:'Grips & Accessories', image:'/imgs/cat_grips_accessories.png', productCount:22 },
  { _id:'c-j1',  name:'Jerseys & Apparel',    image:'/imgs/jersey_apparel.png',        productCount:38 },
  { _id:'c-b3', name:'Shuttlecocks',        image:'/imgs/hero_shuttlecock.png',       productCount:18 },
  { _id:'c-bg1', name:'Sports Bags',         image:'/imgs/hero_bag.png',               productCount:15 },
  { _id:'c-st1', name:'Strings',             image:'/imgs/racket_closeup_dark.png',    productCount:19 },
  { _id:'c-tn1', name:'Tennis Rackets & Gear',image:'/imgs/hero_tennis.png',             productCount:24 },
];

const FEATURES = [
  { icon: Truck,         title: 'Island-Wide Delivery',    sub: 'Free on orders above Rs. 5,000' },
  { icon: Shield,        title: '100% Authentic Gear',     sub: 'Direct authorized distributor' },
  { icon: Zap,           title: 'Same-Day Dispatch',       sub: 'Order before 2:00 PM' },
  { icon: Package,       title: '7-Day Returns',           sub: 'No questions hassle-free' },
];

function FadeIn({ children, delay = 0, y = 28 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="section-head">
      <div className="eyebrow" style={{ marginBottom: 14 }}>{eyebrow}</div>
      <h2 className="display-lg" style={{ color: 'var(--t1)', marginBottom: 16 }}>{title}</h2>
      {sub && <p style={{ color: 'var(--t3)', fontSize: 16, lineHeight: 1.7 }}>{sub}</p>}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [slide, setSlide] = useState(0);

  const nextSlide = () => setSlide(p => (p + 1) % SLIDES.length);
  const prevSlide = () => setSlide(p => (p - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => { const t = setInterval(nextSlide, 6000); return () => clearInterval(t); }, []);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=24&status=active'),
      api.get('/categories'),
    ]).then(([pRes, cRes]) => {
      const ps = Array.isArray(pRes.data) ? pRes.data : pRes.data?.products ?? [];
      if (ps.length) setProducts(ps);
      const cs = Array.isArray(cRes.data) ? cRes.data : [];
      if (cs.length) setCategories(cs);
    }).catch(() => {});
  }, []);

  const featured = (products.filter(p => p.isFeatured).length > 0
    ? products.filter(p => p.isFeatured)
    : products).slice(0, 8);

  const s = SLIDES[slide];

  return (
    <div style={{ background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <SEO
        title="Buy Badminton Rackets, Shuttlecocks & Sports Gear in Sri Lanka"
        description="Looking to buy badminton rackets, shuttlecocks, or sports equipment in Sri Lanka? Wayamba Badminton Home is Sri Lanka's trusted shop for 100% genuine Yonex, Li-Ning, Victor gear, cricket bats & tennis rackets with islandwide express delivery."
        keywords="Buy badminton rackets Sri Lanka, Badminton shop Sri Lanka, Yonex badminton racket price Sri Lanka, Li-Ning badminton Sri Lanka, Victor badminton Sri Lanka, buy shuttlecocks Sri Lanka, badminton shoes Sri Lanka, badminton stringing Sri Lanka, sports shop Sri Lanka, cricket bats Sri Lanka, tennis rackets Sri Lanka, Wayamba Badminton Home"
      />

      {/* Ambient background mesh glow */}
      <div className="mesh-glow" style={{ top: -100, left: -150 }} />
      <div className="mesh-glow" style={{ top: 800, right: -200 }} />

      {/* ══════════════════════════════════
          HERO — FULL VIEWPORT SLIDER
      ══════════════════════════════════ */}
      <section className="hero-wrap">
        {/* Background Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={slide}
            src={s.img} alt=""
            className="hero-img"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          />
        </AnimatePresence>

        {/* Overlay Gradients */}
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} />
        <div className="hero-overlay" />

        {/* Floating Authenticity Badge (Top Right of Hero) */}
        <div className="hidden-mobile" style={{
          position: 'absolute', top: 120, right: '6%', zIndex: 4,
          pointerEvents: 'none'
        }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              padding: '12px 20px', borderRadius: 16,
              background: 'rgba(12,12,16,0.75)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', gap: 12
            }}
          >
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#22C55E', boxShadow: '0 0 12px #22C55E'
            }} />
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>
                Official Authorized Dealer
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter' }}>
                100% Genuine Sri Lankan Distributor
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="hero-content">
          <div className="container">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ maxWidth: 820 }}
              >
                {/* Big headline */}
                <h1 className="display-hero" style={{ color: '#fff' }}>
                  {s.headline.map((line, i) => (
                    <span key={i} style={{ display: 'block' }}>
                      {i === 1
                        ? <span className="text-gradient">{line}</span>
                        : line
                      }
                    </span>
                  ))}
                </h1>

                <p style={{
                  fontSize: 17.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75,
                  maxWidth: 640, margin: '24px 0 36px', fontWeight: 400
                }}>
                  {s.sub}
                </p>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(s.ctaLink)}
                    className="btn btn-primary btn-xl"
                  >
                    {s.cta} <ArrowRight size={20} />
                  </motion.button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/about" className="btn btn-ghost btn-lg" style={{ backdropFilter: 'blur(12px)' }}>
                      Store Story & Location
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slider Controls — Bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
          background: 'linear-gradient(to top, rgba(6,6,9,0.85) 0%, transparent 100%)',
          padding: '40px 0 28px',
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            {/* Slide indicator */}
            <div style={{ fontFamily: 'Outfit', color: '#fff', display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--red-vivid)' }}>{String(slide + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>/ {String(SLIDES.length).padStart(2, '0')}</span>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', gap: 10 }}>
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{
                  width: i === slide ? 44 : 10, height: 10, borderRadius: 99,
                  background: i === slide ? 'var(--red-vivid)' : 'rgba(255,255,255,0.25)',
                  boxShadow: i === slide ? '0 0 14px rgba(176,28,40,0.8)' : 'none',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.35s var(--ease)',
                }} />
              ))}
            </div>

            {/* Arrow buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ fn: prevSlide, Icon: ChevronLeft }, { fn: nextSlide, Icon: ChevronRight }].map(({ fn, Icon }, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.15)' }}
                  whileTap={{ scale: 0.94 }}
                  onClick={fn}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)',
                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon size={20} />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          MULTI-SPORT FEATURE HIGHLIGHT (BADMINTON & CRICKET & TENNIS)
      ══════════════════════════════════ */}
      <section style={{ padding: '80px 0 30px', background: 'var(--bg-2)', borderBottom: '1px solid var(--b1)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { title: 'Badminton Pro Hub', img: '/imgs/card_badminton_hub.png', tag: 'Badminton', link: '/shop?category=Badminton%20Rackets', desc: 'Yonex, Li-Ning & Victor rackets, court shoes & stringing' },
              { title: 'Cricket Masterclass', img: '/imgs/card_cricket_hub.png', tag: 'Cricket', link: '/shop?category=Cricket%20Equipment', desc: 'Grade 1 English willow bats, leather balls & protective gear' },
              { title: 'Tennis Pro Circuit', img: '/imgs/card_tennis_hub.png', tag: 'Tennis', link: '/shop?category=Tennis%20Rackets%20%26%20Gear', desc: 'Wilson Pro Staff, Babolat Pure Drive & US Open match balls' },
            ].map((sport, idx) => (
              <FadeIn key={sport.title} delay={idx * 0.1}>
                <Link
                  to={sport.link}
                  style={{
                    display: 'block', borderRadius: 24, overflow: 'hidden', height: 270,
                    position: 'relative', border: '1px solid var(--b1)', textDecoration: 'none',
                    transition: 'all 0.35s var(--ease)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--red-border)';
                    el.style.transform = 'translateY(-7px)';
                    el.style.boxShadow = '0 20px 50px rgba(0,0,0,0.6), 0 0 25px rgba(176,28,40,0.2)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--b1)';
                    el.style.transform = 'none';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <img src={sport.img} alt={sport.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65, transition: 'transform 0.6s var(--ease)' }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(6,6,9,0.96) 0%, rgba(6,6,9,0.35) 60%, transparent 100%)',
                    padding: 26, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  }}>
                    <span className="badge badge-red" style={{ width: 'fit-content', marginBottom: 10 }}>{sport.tag}</span>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: 23, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{sport.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 14 }}>{sport.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: 'var(--red-vivid)', fontWeight: 700 }}>
                      Browse Collection <ArrowRight size={15} />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          TRUST FEATURES BAR
      ══════════════════════════════════ */}
      <div style={{ borderTop: '1px solid var(--b2)', background: 'var(--bg-2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0 }}>
            {FEATURES.map(({ icon: Icon, title, sub }, i) => (
              <div key={title} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '28px 24px',
                borderRight: i < 3 ? '1px solid var(--b1)' : 'none',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                  background: 'var(--red-soft)', border: '1px solid var(--red-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(176,28,40,0.15)',
                }}>
                  <Icon size={22} style={{ color: 'var(--red-vivid)' }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: 14.5, fontWeight: 700, color: 'var(--t1)', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          FEATURED PRODUCTS GRID
      ══════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <FadeIn>
            <SectionHead
              eyebrow="Handpicked for Champions"
              title={<>Featured <span className="text-gradient">Multi-Sport Gear</span></>}
              sub="Tournament-ready badminton racquets, cricket bats, and tennis gear trusted by provincial champions across Sri Lanka."
            />
          </FadeIn>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 22,
          }}>
            {featured.map((p, i) => (
              <FadeIn key={p._id} delay={Math.min(i * 0.04, 0.28)}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div style={{ textAlign: 'center', marginTop: 52 }}>
              <Link to="/shop" className="btn btn-outline btn-lg">
                View Full Catalog <ArrowRight size={18} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════
          EDITORIAL BANNER — STORE INTERIOR
      ══════════════════════════════════ */}
      <section style={{ padding: '0 0 100px' }}>
        <div className="container">
          <div style={{
            borderRadius: 30, overflow: 'hidden', position: 'relative', minHeight: 480,
            border: '1px solid var(--b2)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
          }}>
            <img
              src="/imgs/store_interior_v2.png?v=2" alt="Wayamba Badminton Home Store"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div style={{
              position: 'relative', zIndex: 2,
              background: 'linear-gradient(to right, rgba(6,6,9,0.96) 0%, rgba(6,6,9,0.85) 45%, rgba(6,6,9,0.2) 100%)',
              display: 'flex', alignItems: 'center', padding: '64px 48px', minHeight: 480
            }}>
              <div style={{ maxWidth: 520 }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>About Our Physical Store</div>
                <h2 className="display-lg" style={{ color: '#fff', marginBottom: 20 }}>
                  Puttalam's Premier <span className="text-gradient">Sports Hub</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 1.75, marginBottom: 28 }}>
                  Wayamba Badminton Home offers Sri Lanka's leading collection of genuine Badminton, Cricket, and Tennis equipment, complete with electronic stringing and expert gear selection advice.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {[
                    '100% Genuine Yonex, Kookaburra, Wilson & Li-Ning',
                    'Professional Electronic Stringing & Custom Bat Knocking',
                    'Island-Wide Express Doorstep Delivery'
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      <CheckCircle2 size={18} style={{ color: 'var(--red-vivid)', flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
                <Link to="/about" className="btn btn-primary btn-lg">
                  Learn Our Story <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CATEGORIES GRID
      ══════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div className="container">
          <FadeIn>
            <SectionHead
              eyebrow="Shop by Category"
              title="Find Equipment for Your Game"
              sub="Explore our curated equipment catalog across Badminton, Cricket, and Tennis."
            />
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 22 }}>
            {categories.map((cat, i) => (
              <FadeIn key={cat._id} delay={i * 0.06}>
                <Link
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  style={{
                    display: 'block', borderRadius: 22, overflow: 'hidden',
                    border: '1px solid var(--b1)',
                    position: 'relative', height: 235, textDecoration: 'none',
                    transition: 'all 0.3s var(--ease)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--red-border)';
                    el.style.transform = 'translateY(-5px)';
                    el.style.boxShadow = '0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(176,28,40,0.2)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--b1)';
                    el.style.transform = 'none';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={cat.image || '/imgs/hero_rackets.png'} alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, transition: 'opacity 0.3s' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(6,6,9,0.96) 0%, rgba(6,6,9,0.25) 60%, transparent 100%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 24,
                  }}>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: 21, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                      {cat.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--red-vivid)', fontWeight: 700 }}>
                      Shop Collection <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          SRI LANKA SPORTS & BADMINTON SEO AUTHORITY & FAQ SECTION
      ══════════════════════════════════ */}
      <section className="section" style={{ background: 'var(--bg)', borderTop: '1px solid var(--b1)' }}>
        <div className="container">
          <FadeIn>
            <div style={{ maxWidth: 880, margin: '0 auto' }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Sri Lanka's #1 Sports & Badminton Destination</div>
              <h2 className="display-md" style={{ color: 'var(--t1)', marginBottom: 20 }}>
                Buy 100% Genuine <span className="text-gradient">Badminton & Sports Gear</span> Across Sri Lanka
              </h2>
              <p style={{ color: 'var(--t3)', fontSize: 16, lineHeight: 1.8, marginBottom: 36 }}>
                Welcome to <strong>Wayamba Badminton Home</strong> — the authorized destination for authentic badminton equipment, cricket gear, and tennis racquets in Sri Lanka. Whether you are in <strong>Colombo, Kandy, Galle, Gampaha, Kurunegala, Jaffna, Puttalam</strong>, or anywhere across the island, we deliver championship-ready sports gear directly to your doorstep with cash on delivery and secure bank transfer options.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 48 }}>
                {[
                  {
                    title: 'Yonex, Li-Ning & Victor Rackets',
                    desc: 'Official authorized stockist with authentic holographic verification codes and warranty against manufacturing defects.'
                  },
                  {
                    title: 'BWF-Grade Shuttlecocks & Court Shoes',
                    desc: 'Aerosensa tournament feather shuttlecocks, Mavis nylon shuttles, and non-marking high-grip indoor court footwear.'
                  },
                  {
                    title: 'Island-Wide Express Delivery',
                    desc: 'Fast doorstep shipping to all 25 districts in Sri Lanka with careful packaging to guarantee safe delivery of strung racquets.'
                  }
                ].map(item => (
                  <div key={item.title} className="card" style={{ padding: 24, borderRadius: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Sparkles size={18} style={{ color: 'var(--red-vivid)' }} />
                      <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{item.title}</h3>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--t3)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* FAQ Accordion / Grid for Rich Search Results */}
              <div style={{ background: 'var(--bg-2)', borderRadius: 24, padding: '36px 32px', border: '1px solid var(--b1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <HelpCircle size={22} style={{ color: 'var(--red-vivid)' }} />
                  <h3 className="display-sm" style={{ color: 'var(--t1)' }}>Frequently Asked Questions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    {
                      q: 'How can I buy genuine badminton rackets online in Sri Lanka?',
                      a: 'You can order directly through our online store. Browse our badminton racket collection, select your preferred brand (Yonex, Li-Ning, Victor, Apacs), and proceed to checkout with islandwide delivery to any location in Sri Lanka.'
                    },
                    {
                      q: 'Do you deliver badminton and sports gear outside Puttalam to Colombo, Kandy, etc.?',
                      a: 'Yes! We offer islandwide courier delivery across all 25 districts in Sri Lanka within 1-3 business days. All rackets and equipment are packed in protective rigid cartons.'
                    },
                    {
                      q: 'Do you provide professional electronic racket stringing in Sri Lanka?',
                      a: 'Yes, our certified stringers use precision digital electronic constant-pull machines with genuine Yonex BG65, BG80, Aerobite, and Nanogy strings customized to your tension (24–30+ lbs).'
                    },
                    {
                      q: 'What other sports equipment do you offer?',
                      a: 'In addition to badminton rackets, shuttlecocks, and court shoes, we also stock English Willow cricket bats, leather balls, batting pads, tennis racquets, and sports accessories.'
                    }
                  ].map(({ q, a }) => (
                    <div key={q} style={{ borderBottom: '1px solid var(--b1)', paddingBottom: 16 }}>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{q}</h4>
                      <p style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.65 }}>{a}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}