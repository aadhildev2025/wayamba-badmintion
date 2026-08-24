import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Award, Users, Target, Heart, CheckCircle, ArrowRight } from 'lucide-react';
import ImageSlider from '@/components/ImageSlider';

function FadeIn({ children, delay = 0, x = 0, y = 24 }: { children: React.ReactNode; delay?: number; x?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y, x }} animate={inView ? { opacity: 1, y: 0, x: 0 } : {}} transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}

export default function About() {
  const VALUES = [
    { icon: Award,   title: 'Authenticity',  desc: 'Every product we stock is 100% genuine, sourced directly from official brand distributors.' },
    { icon: Heart,   title: 'Passion',        desc: 'We are players first. Our team competes at provincial level and lives badminton every day.' },
    { icon: Target,  title: 'Excellence',     desc: 'We only carry equipment that meets our rigorous quality standards — no compromises.' },
    { icon: Users,   title: 'Community',      desc: 'Supporting local clubs, schools, and tournaments to grow the sport across Sri Lanka.' },
  ];

  const STORY_SLIDES = [
    { url: '/imgs/hero_rackets.png', title: 'Pro Racket Series', tag: 'Yonex Astrox & Nanoflare' },
    { url: '/imgs/hero_shoes.png', title: 'High-Performance Footwear', tag: 'Non-Marking Court Shoes' },
    { url: '/imgs/hero_shuttlecock.png', title: 'Tournament Shuttlecocks', tag: '100% Genuine Feather' },
    { url: '/imgs/hero_bag.png', title: 'Professional Grips & Bags', tag: 'Official Tour Equipment' },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>

      {/* ── HERO ── */}
      <section style={{ padding: '80px 0 64px', borderBottom: '1px solid var(--b1)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(176,28,40,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Our Story</div>
            <h1 className="display-lg" style={{ color: 'var(--t1)', marginBottom: 20 }}>
              Born from the Passion of <span className="text-gradient">Sri Lankan Sports</span>
            </h1>
            <p style={{ fontSize: 17.5, color: 'var(--t3)', lineHeight: 1.75 }}>
              Wayamba Badminton Home was founded by athletes, for athletes. We understand what it means to step on court with equipment that performs — because we live and breathe sports every single day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--b1)', padding: '44px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
            {[
              { value: '8+', label: 'Years of Service' },
              { value: '5,000+', label: 'Players Served' },
              { value: '500+', label: 'Products Stocked' },
              { value: '4', label: 'Global Brand Partners' },
            ].map(({ value, label }, i) => (
              <FadeIn key={label} delay={i * 0.08}>
                <div style={{ textAlign: 'center', padding: '24px 16px', borderRight: i < 3 ? '1px solid var(--b1)' : 'none' }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: 40, fontWeight: 900, color: 'var(--red-vivid)', letterSpacing: -1, marginBottom: 6 }}>{value}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--t3)', fontWeight: 600 }}>{label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
            <FadeIn x={-24}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Our Mission</div>
              <h2 className="display-md" style={{ color: 'var(--t1)', marginBottom: 20 }}>
                Bringing World-Class Gear to Every <span className="text-gradient">Sri Lankan Court</span>
              </h2>
              <p style={{ color: 'var(--t3)', fontSize: 15.5, lineHeight: 1.75, marginBottom: 24 }}>
                We believe Sri Lankan players deserve access to authentic, top-tier equipment without compromise. From beginner racquets to Olympic-level shuttlecocks, every item in our store is hand-selected and verified.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Direct partnerships with Yonex, Li-Ning, Victor, Kookaburra & Wilson',
                  'Professional Electronic Racket Stringing Service & Bat Knocking',
                  'Island-wide express doorstep delivery within 1-3 business days',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--t2)', fontWeight: 600 }}>
                    <CheckCircle size={18} style={{ color: 'var(--red-vivid)', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn x={24}>
              <ImageSlider slides={STORY_SLIDES} height={380} borderRadius={24} />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="section" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div className="container">
          <FadeIn>
            <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto 48px' }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>What Drives Us</div>
              <h2 className="display-md" style={{ color: 'var(--t1)' }}>Our Core Values</h2>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 0.08}>
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--red-soft)', border: '1px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon size={22} style={{ color: 'var(--red-vivid)' }} />
                  </div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section">
        <div className="container">
          <FadeIn>
            <div style={{
              borderRadius: 28, background: 'var(--grad-brand)', padding: '64px 40px',
              textAlign: 'center', boxShadow: 'var(--sr-lg)', border: '1px solid rgba(255,255,255,0.15)'
            }}>
              <h2 className="display-md" style={{ color: '#fff', marginBottom: 16 }}>Ready to Upgrade Your Game?</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16.5, maxWidth: 520, margin: '0 auto 28px' }}>
                Explore our complete range of racquets, English willow bats, court shoes, and shuttlecocks today.
              </p>
              <Link to="/shop" className="btn btn-lg" style={{ background: '#fff', color: '#060609', fontWeight: 800 }}>
                Explore Catalog Now <ArrowRight size={18} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}

