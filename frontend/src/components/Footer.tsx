import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, ChevronRight, ShieldCheck, Truck, Zap } from 'lucide-react';

const CATALOG = [
  { label: 'Badminton Rackets & Strings', to: '/shop?category=Badminton%20Rackets' },
  { label: 'Tennis Rackets & Balls',     to: '/shop?category=Tennis%20Rackets%20%26%20Gear' },
  { label: 'Cricket Bats & Equipment',    to: '/shop?category=Cricket%20Equipment' },
  { label: 'Tournament Shuttlecocks',     to: '/shop?category=Shuttlecocks' },
  { label: 'Jerseys & Sportswear',        to: '/shop?category=Jerseys%20%26%20Apparel' },
  { label: 'Indoor Court & Sports Shoes', to: '/shop?category=Indoor%20Court%20%26%20Sports%20Shoes' },
];
const QUICK = [
  { label: 'Home Page',           to: '/' },
  { label: 'Shop All Products',   to: '/shop' },
  { label: 'About Our Store',     to: '/about' },
  { label: 'Contact Us',          to: '/contact' },
];
const SOCIALS = [
  { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { Icon: Facebook,  href: 'https://facebook.com',  label: 'Facebook'  },
  { Icon: Youtube,   href: 'https://youtube.com',   label: 'YouTube'   },
];

function FooterLink({ label, to }: { label: string; to: string }) {
  return (
    <li>
      <Link
        to={to}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 14, color: 'var(--t3)',
          transition: 'all 0.2s var(--ease)',
          fontFamily: 'Inter',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = '#fff';
          (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = 'var(--t3)';
          (e.currentTarget as HTMLElement).style.transform = 'none';
        }}
      >
        <ChevronRight size={13} style={{ color: 'var(--red-vivid)', flexShrink: 0 }} />
        {label}
      </Link>
    </li>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: '#060609', borderTop: '1px solid var(--b1)' }}>

      {/* Main footer content */}
      <div className="container" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>

          {/* Brand Column */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                border: '2px solid var(--red)', boxShadow: '0 0 20px rgba(176,28,40,0.4)',
                overflow: 'hidden',
              }}>
                <img src="/logo.png" alt="WBH"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: -0.5 }}>WAYAMBA</div>
                <div style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 800, color: 'var(--red-vivid)', letterSpacing: 2.5, textTransform: 'uppercase' }}>BADMINTON HOME</div>
              </div>
            </Link>
            <p style={{ fontSize: 13.5, color: 'var(--t3)', lineHeight: 1.75, maxWidth: 320, marginBottom: 24 }}>
              Sri Lanka's official destination for professional Badminton, Cricket, and Tennis equipment. 100% genuine gear from Yonex, Kookaburra, Wilson & Li-Ning.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {SOCIALS.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'var(--bg-4)', border: '1px solid var(--b2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--t3)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'var(--red)'; el.style.color = '#fff';
                    el.style.borderColor = 'var(--red)';
                    el.style.transform = 'translateY(-3px)';
                    el.style.boxShadow = '0 6px 16px rgba(176,28,40,0.5)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'var(--bg-4)'; el.style.color = 'var(--t3)';
                    el.style.borderColor = 'var(--b2)';
                    el.style.transform = 'none';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 20, letterSpacing: 0.3 }}>Equipment Catalog</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CATALOG.map(l => <FooterLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 20, letterSpacing: 0.3 }}>Wayamba Home</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {QUICK.map(l => <FooterLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 20, letterSpacing: 0.3 }}>Store Location</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { Icon: MapPin, content: 'D22, Bus Stand Complex, Puttalam, Sri Lanka', href: 'https://maps.google.com/?q=D22+Bus+Stand+Complex+Puttalam' },
                { Icon: Phone,  content: '+94 71 444 3317', href: 'tel:+94714443317' },
                { Icon: Mail,   content: 'info@wayambabadminton.com', href: 'mailto:info@wayambabadminton.com' },
              ].map(({ Icon, content, href }) => (
                <div key={content} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <Icon size={16} style={{ color: 'var(--red-vivid)', marginTop: 3, flexShrink: 0 }} />
                  {href
                    ? <a href={href} style={{ fontSize: 13.5, color: 'var(--t2)', fontWeight: 600, transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--t2)'}
                      >{content}</a>
                    : <span style={{ fontSize: 13.5, color: 'var(--t3)', lineHeight: 1.6 }}>{content}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--b1)', background: '#040407' }}>
        <div className="container" style={{ padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--t4)', fontFamily: 'Inter' }}>
            © {new Date().getFullYear()} Wayamba Badminton Home. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: 'var(--t3)', fontFamily: 'Inter', fontWeight: 600 }}>
            {[
              { Icon: ShieldCheck, label: '100% Genuine Gear' },
              { Icon: Truck, label: 'Island-Wide Delivery' },
              { Icon: Zap, label: 'Same-Day Dispatch' },
            ].map(({ Icon, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon size={14} style={{ color: 'var(--red-vivid)' }} /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

