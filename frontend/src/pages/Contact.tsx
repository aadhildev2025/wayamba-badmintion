import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageSquare, Instagram, Facebook } from 'lucide-react';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  );
}

interface FormData { name: string; email: string; phone: string; subject: string; message: string; }

export default function Contact() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError('Please fill in all required fields.'); return; }
    setLoading(true); setError('');
    // Simulate submission
    setTimeout(() => { setLoading(false); setSuccess(true); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }, 1500);
  };

  const CONTACT_INFO = [
    { icon: MapPin, title: 'Store Address', lines: ['Wayamba Badminton Home', 'D22, Bus Stand Complex', 'Puttalam, Sri Lanka'] },
    { icon: Phone, title: 'Call / WhatsApp', lines: ['+94 71 444 3317', '+94 37 222 1100'] },
    { icon: Mail, title: 'Direct Email', lines: ['info@wayambabadminton.com', 'support@wayambabadminton.com'] },
    { icon: Clock, title: 'Store Opening Hours', lines: ['Mon–Sat: 8:30 AM – 7:30 PM', 'Sunday: 9:00 AM – 5:00 PM'] },
  ];

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      {/* ── HEADER ── */}
      <div style={{ padding: '68px 0 56px', borderBottom: '1px solid var(--b1)', background: 'var(--bg-2)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 440, height: 220, background: 'radial-gradient(ellipse, rgba(176,28,40,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Get In Touch</div>
          <h1 className="display-lg" style={{ color: 'var(--t1)', marginBottom: 16 }}>
            We're Here to <span className="text-gradient">Assist Your Game</span>
          </h1>
          <p style={{ fontSize: 16.5, color: 'var(--t3)', maxWidth: 500, margin: '0 auto' }}>
            Questions about string tension, racquet models, or bat knocking? Our expert team is ready to help.
          </p>
        </motion.div>
      </div>

      <div className="container" style={{ padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 52 }}>

          {/* ── LEFT: Info ── */}
          <div>
            <FadeIn>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: 'var(--t1)', marginBottom: 8 }}>Contact Details</h2>
              <p style={{ fontSize: 14.5, color: 'var(--t3)', marginBottom: 32, lineHeight: 1.65 }}>
                Reach us through any of the channels below. We respond quickly to all player enquiries.
              </p>
            </FadeIn>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
              {CONTACT_INFO.map(({ icon: Icon, title, lines }, i) => (
                <FadeIn key={title} delay={i * 0.07}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 22px', borderRadius: 16, border: '1px solid var(--b1)', background: 'var(--surface)', transition: 'all 0.2s var(--ease)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red-border)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)'; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--red-soft)', border: '1px solid var(--red-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={19} style={{ color: 'var(--red-vivid)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--t3)', marginBottom: 4, fontFamily: 'Outfit' }}>{title}</div>
                      {lines.map(line => <div key={line} style={{ fontSize: 14.5, color: 'var(--t1)', fontWeight: 600 }}>{line}</div>)}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Social */}
            <FadeIn delay={0.3}>
              <div style={{ padding: '22px', borderRadius: 16, border: '1px solid var(--b1)', background: 'var(--surface)' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit' }}>
                  <MessageSquare size={15} style={{ color: 'var(--red-vivid)' }} /> Connect With Us
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
                    { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
                  ].map(({ icon: Icon, label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, background: 'var(--bg-4)', border: '1px solid var(--b2)', color: 'var(--t1)', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'all 0.22s var(--ease)', fontFamily: 'Outfit' }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = 'var(--red-vivid)';
                        el.style.borderColor = 'var(--red-vivid)';
                        el.style.color = '#FFFFFF';
                        el.style.transform = 'translateY(-2px)';
                        el.style.boxShadow = '0 6px 18px rgba(176,28,40,0.35)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = 'var(--bg-4)';
                        el.style.borderColor = 'var(--b2)';
                        el.style.color = 'var(--t1)';
                        el.style.transform = 'none';
                        el.style.boxShadow = 'none';
                      }}>
                      <Icon size={16} /> {label}
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── RIGHT: Form ── */}
          <FadeIn delay={0.1}>
            <div style={{ padding: '36px', borderRadius: 24, border: '1px solid var(--b1)', background: 'var(--surface)', boxShadow: 'var(--s2)' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle size={30} style={{ color: '#4ADE80' }} />
                  </div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800, color: 'var(--t1)', marginBottom: 10 }}>Message Received!</h3>
                  <p style={{ color: 'var(--t3)', fontSize: 14.5, marginBottom: 24 }}>Thank you for reaching out. Our sports advisor will contact you shortly.</p>
                  <button onClick={() => setSuccess(false)} className="btn btn-outline btn-sm">Send Another Enquiry</button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: 'var(--t1)', marginBottom: 6 }}>Send Us a Message</h3>
                  <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 28 }}>Fill out the form below and we will get back to you promptly.</p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Outfit' }}>Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input" required />
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Outfit' }}>Phone</label>
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="+94 77 ..." className="input" />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Outfit' }}>Email *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input" required />
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Outfit' }}>Subject</label>
                      <select name="subject" value={form.subject} onChange={handleChange}
                        style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-4)', border: '1.5px solid var(--bs)', borderRadius: 'var(--r)', color: form.subject ? 'var(--t1)' : 'var(--t3)', fontSize: 14, outline: 'none', fontFamily: 'Outfit', fontWeight: 600, cursor: 'pointer', transition: 'border-color 0.2s' }}>
                        <option value="">Select a topic…</option>
                        <option value="product">Equipment Enquiry & Stringing</option>
                        <option value="order">Order Status & Delivery</option>
                        <option value="return">Returns & Warranty</option>
                        <option value="bulk">Club / School Bulk Order</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Outfit' }}>Message *</label>
                      <textarea
                        name="message" value={form.message} onChange={handleChange}
                        placeholder="How can we help you choose your ideal gear?"
                        rows={4} required
                        style={{ width: '100%', padding: '14px 16px', background: 'var(--bg-4)', border: '1.5px solid var(--bs)', borderRadius: 'var(--r)', color: 'var(--t1)', fontSize: 14, outline: 'none', fontFamily: 'Inter', resize: 'vertical', transition: 'border-color 0.2s' }}
                        onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--red-vivid)'}
                        onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--bs)'}
                      />
                    </div>

                    {error && <p style={{ color: 'var(--danger)', fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ fontSize: 15, padding: '14px 24px', fontWeight: 800 }}>
                      {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending...</> : <><Send size={16} /> Send Message</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

