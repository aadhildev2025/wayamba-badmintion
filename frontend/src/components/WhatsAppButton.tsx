import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Phone, ShoppingBag } from 'lucide-react';

const PHONE = '94714443317';

interface WhatsAppButtonProps {
  productName?: string;
  message?: string;
  inline?: boolean;
}

/* Inline version — used inside product detail */
export function WhatsAppInline({ productName, message }: WhatsAppButtonProps) {
  const text = message || (productName
    ? `Hi! I'm interested in: ${productName}. Is it available?`
    : 'Hi! I have a question about your products.');
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="btn btn-outline"
      style={{ justifyContent: 'center', borderColor: 'rgba(37,211,102,0.35)', color: '#25d366' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.07)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      <MessageCircle size={16} />
      {productName ? 'Enquire on WhatsApp' : 'Chat on WhatsApp'}
    </a>
  );
}

/* Floating FAB — used site-wide */
export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const options = [
    {
      icon: ShoppingBag,
      label: 'Product Enquiry',
      text: "Hi! I'd like to enquire about a product.",
    },
    {
      icon: Phone,
      label: 'General Question',
      text: 'Hi! I have a question for the Wayamba Badminton Home team.',
    },
    {
      icon: MessageCircle,
      label: 'Order Support',
      text: "Hi! I need help with my order.",
    },
  ];

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>

      {/* Quick-reply cards */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}
          >
            {/* Header card */}
            <div style={{
              background: '#075e54',
              borderRadius: '16px 16px 4px 16px',
              padding: '12px 16px',
              maxWidth: 240,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <img src="/logo.png" alt="WBH" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', background: '#fff' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Wayamba Badminton Home</div>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.65)' }}>Typically replies instantly</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                👋 Hi there! How can we help you today?
              </p>
            </div>

            {/* Quick reply options */}
            {options.map(({ icon: Icon, label, text }) => (
              <a
                key={label}
                href={`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: '12px 12px 4px 12px',
                  background: 'rgba(15,15,15,0.96)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(37,211,102,0.2)',
                  color: '#f8fafc', textDecoration: 'none', fontSize: 13.5, fontWeight: 500,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  transition: 'all 0.18s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.12)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,211,102,0.5)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(-3px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(15,15,15,0.96)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,211,102,0.2)';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(37,211,102,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} style={{ color: '#25d366' }} />
                </div>
                {label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: open ? '#111' : '#25d366',
          border: open ? '2px solid rgba(37,211,102,0.3)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          transition: 'background 0.22s',
        }}
        aria-label={open ? 'Close chat' : 'Open WhatsApp chat'}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="wa" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.18 }}>
              {/* WhatsApp SVG icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring */}
      {!open && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0, width: 56, height: 56,
          borderRadius: '50%', border: '2px solid rgba(37,211,102,0.35)',
          animation: 'wa-pulse 2.5s ease-out infinite', pointerEvents: 'none',
        }} />
      )}

      <style>{`
        @keyframes wa-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}