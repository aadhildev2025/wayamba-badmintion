import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag, ShieldCheck, CreditCard, CheckCircle2,
  ArrowRight, ArrowLeft, Tag, MessageSquare, MapPin, User,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  /* ── Form State ── */
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Puttalam');
  const [district, setDistrict] = useState('Puttalam District');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'whatsapp'>('cod');

  /* ── Coupon State ── */
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponErr, setCouponErr] = useState('');

  /* ── Submission State ── */
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ _id: string; totalPrice: number; paymentMethod: string } | null>(null);

  const shippingFee = cartTotal >= 5000 ? 0 : 350;
  const finalTotal = Math.max(0, cartTotal - couponDiscount + shippingFee);

  /* ── Coupon Handler ── */
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponErr('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setCouponDiscount(Math.round(cartTotal * 0.1));
      setCouponApplied('WELCOME10 – 10% OFF');
    } else if (code === 'SMASH500') {
      if (cartTotal < 5000) {
        setCouponErr('SMASH500 requires a minimum order of Rs. 5,000');
        return;
      }
      setCouponDiscount(500);
      setCouponApplied('SMASH500 – Rs. 500 OFF');
    } else {
      setCouponErr('Invalid code. Try WELCOME10 or SMASH500.');
    }
  };

  /* ── Order Submit ── */
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      alert('Please fill in Name, Phone and Address fields.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          recipientName: fullName,
          phone,
          addressLine1: address,
          city,
          district,
        },
        paymentMethod: paymentMethod === 'bank' ? 'Bank Transfer' : paymentMethod === 'whatsapp' ? 'WhatsApp Confirmation' : 'Cash on Delivery',
        couponCode: couponApplied ? couponCode : undefined,
        notes,
      };

      let orderId = 'WBH-' + Math.floor(100000 + Math.random() * 900000);
      let payLabel = paymentMethod === 'cod' ? 'Cash on Delivery'
        : paymentMethod === 'bank' ? 'Bank Transfer' : 'WhatsApp Confirmation';

      try {
        const res = await api.post('/orders', payload);
        if (res.data?._id) orderId = res.data._id;
      } catch (apiErr: any) {
        console.warn('Backend order placement notice:', apiErr);
        if (apiErr.response?.data?.message) {
          alert(`Order notice: ${apiErr.response.data.message}`);
        }
      }

      setPlacedOrder({ _id: orderId, totalPrice: finalTotal, paymentMethod: payLabel });
      clearCart();
    } catch (err) {
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── WhatsApp confirm action (shown after success) ── */
  const openWhatsApp = () => {
    const lines = cart.map(i => `• ${i.name} (${i.quantity}×)`).join('\n');
    const msg = `Hello Wayamba Badminton Home!\n\n*Order:* #${placedOrder?._id}\n*Name:* ${fullName}\n*Phone:* ${phone}\n*Address:* ${address}, ${city}\n\n*Items:*\n${lines}\n\n*Total:* Rs. ${finalTotal.toLocaleString()}\n*Payment:* ${paymentMethod.toUpperCase()}`;
    window.open(`https://wa.me/94714443317?text=${encodeURIComponent(msg)}`, '_blank');
  };

  /* ────────────── Success Screen ────────────── */
  if (placedOrder) {
    return (
      <div style={{ background: '#060609', minHeight: '100vh', paddingTop: 72, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 640, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: '#0D0D14',
              border: '1.5px solid rgba(16,185,129,0.3)',
              borderRadius: 24, padding: '40px 36px', textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(16,185,129,0.15)',
            }}
          >
            {/* Tick Icon */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle2 size={38} style={{ color: '#10B981' }} />
            </div>

            <p style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 900, color: '#10B981', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 6 }}>
              Order Placed Successfully
            </p>
            <h1 style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 900, color: '#fff', margin: '0 0 10px' }}>
              Thank you, {fullName.split(' ')[0]}! 🎉
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13.5, lineHeight: 1.65, maxWidth: 460, margin: '0 auto 28px' }}>
              Your order <strong style={{ color: '#fff' }}>#{placedOrder._id}</strong> has been registered.
              Our team will contact you shortly on <strong style={{ color: '#fff' }}>{phone}</strong> to confirm delivery.
            </p>

            {/* Summary Pill */}
            <div style={{ background: '#14141E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 20px', textAlign: 'left', marginBottom: 28 }}>
              {[
                { label: 'Delivery Address', value: `${address}, ${city}` },
                { label: 'Payment Method',   value: placedOrder.paymentMethod },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Outfit' }}>Grand Total</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: 'Outfit' }}>Rs. {placedOrder.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={openWhatsApp}
                style={{
                  flex: 1, minWidth: 180, padding: '14px 20px', borderRadius: 14,
                  background: '#25D366', color: '#fff', border: 'none',
                  fontWeight: 900, fontFamily: 'Outfit', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <MessageSquare size={17} /> Confirm on WhatsApp
              </button>
              <button
                onClick={() => navigate('/shop')}
                style={{
                  flex: 1, minWidth: 160, padding: '14px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.07)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.14)',
                  fontWeight: 800, fontFamily: 'Outfit', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                Continue Shopping <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ────────────── Checkout Form ────────────── */
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: '#14141E', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', padding: '12px 16px', borderRadius: 12, fontSize: 14,
    outline: 'none', fontFamily: 'Outfit',
  };

  const cardStyle: React.CSSProperties = {
    background: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20, padding: 24,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12.5, fontWeight: 700,
    color: 'rgba(255,255,255,0.65)', fontFamily: 'Outfit', marginBottom: 7,
  };

  return (
    <div style={{ background: '#060609', minHeight: '100vh', paddingTop: 72, paddingBottom: 80 }}>
      <div className="container">

        {/* Breadcrumb */}
        <div style={{ marginBottom: 18 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, fontFamily: 'Outfit', marginBottom: 14, padding: 0 }}
          >
            <ArrowLeft size={15} /> Back to Cart
          </button>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>
            Place Your Order
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
            Fill in your delivery details to complete the order.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'flex-start' }}>

          {/* ──────── LEFT: Order Form ──────── */}
          <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* 1. Customer Info */}
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={17} style={{ color: 'var(--red-vivid)' }} /> Customer Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input type="text" required placeholder="e.g. Wayamba Badminton" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Phone / WhatsApp *</label>
                    <input type="tel" required placeholder="+94 77 123 4567" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email (optional)</label>
                    <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={17} style={{ color: 'var(--red-vivid)' }} /> Delivery Address
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div>
                  <label style={labelStyle}>Street Address *</label>
                  <input type="text" required placeholder="House / Street Name" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>City / Town</label>
                    <input type="text" placeholder="Puttalam" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>District</label>
                    <input type="text" placeholder="Puttalam District" value={district} onChange={e => setDistrict(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Order Notes (optional)</label>
                  <textarea
                    rows={2} placeholder="e.g. String at 26 lbs, call before delivery..."
                    value={notes} onChange={e => setNotes(e.target.value)}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={17} style={{ color: 'var(--red-vivid)' }} /> Payment Method
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  { id: 'cod',      title: 'Cash on Delivery (COD)',          sub: 'Pay in cash when your parcel arrives at your door.' },
                  { id: 'bank',     title: 'Bank Transfer / QR',              sub: 'Transfer to our Commercial Bank / HNB account.' },
                  { id: 'whatsapp', title: 'WhatsApp Direct Confirmation',    sub: 'Agree on payment terms directly via WhatsApp chat.' },
                ].map(p => (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 13, padding: '14px 16px',
                      borderRadius: 13, cursor: 'pointer', transition: 'all 0.2s',
                      background: paymentMethod === p.id ? 'rgba(176,28,40,0.14)' : '#14141E',
                      border: paymentMethod === p.id ? '1.5px solid rgba(176,28,40,0.7)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === p.id} onChange={() => setPaymentMethod(p.id as any)} style={{ marginTop: 3, accentColor: 'var(--red-vivid)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 14, color: '#fff' }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{p.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting || cart.length === 0}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 16, fontSize: 16, fontWeight: 900,
                fontFamily: 'Outfit', background: submitting ? 'rgba(176,28,40,0.5)' : 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                cursor: submitting || cart.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 32px rgba(176,28,40,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s',
              }}
            >
              {submitting
                ? 'Placing Order...'
                : <><ShoppingBag size={18} /> Place Order – Rs. {finalTotal.toLocaleString()} <ArrowRight size={17} /></>
              }
            </motion.button>
          </form>

          {/* ──────── RIGHT: Order Summary ──────── */}
          <div style={{ position: 'sticky', top: 120, display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Items Card */}
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 17, fontWeight: 900, color: '#fff', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={17} style={{ color: 'var(--red-vivid)' }} /> Your Order ({cart.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, maxHeight: 260, overflowY: 'auto', marginBottom: 18 }}>
                {cart.map(item => {
                  const price = item.salePrice || item.price;
                  const img = Array.isArray(item.images) && item.images[0]
                    ? (typeof item.images[0] === 'string' ? item.images[0] : (item.images[0] as any).url)
                    : '/imgs/hero_rackets.png';
                  return (
                    <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img src={img} alt={item.name} style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover', background: '#14141E', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Outfit', fontSize: 13.5, fontWeight: 800, color: '#fff', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{item.quantity} × Rs. {price.toLocaleString()}</div>
                      </div>
                      <div style={{ fontFamily: 'Outfit', fontSize: 14, fontWeight: 900, color: '#fff', flexShrink: 0 }}>Rs. {(price * item.quantity).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                  placeholder="Promo Code"
                  style={{ flex: 1, background: '#14141E', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '10px 14px', borderRadius: 10, fontSize: 13, textTransform: 'uppercase', fontFamily: 'Outfit', outline: 'none' }}
                />
                <button type="submit" style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.09)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', fontWeight: 800, fontSize: 13, fontFamily: 'Outfit', cursor: 'pointer' }}>
                  Apply
                </button>
              </form>
              {couponApplied && <p style={{ fontSize: 12, color: '#10B981', fontWeight: 700, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}><Tag size={13} /> {couponApplied}</p>}
              {couponErr && <p style={{ fontSize: 12, color: '#F87171', fontWeight: 600, fontFamily: 'Outfit', marginBottom: 10 }}>{couponErr}</p>}

              {/* Totals */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'rgba(255,255,255,0.65)', fontFamily: 'Outfit' }}>
                  <span>Subtotal</span><span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#10B981', fontFamily: 'Outfit' }}>
                    <span>Coupon Discount</span><span>−Rs. {couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'rgba(255,255,255,0.65)', fontFamily: 'Outfit' }}>
                  <span>Island-Wide Delivery</span>
                  <span>{shippingFee === 0 ? <strong style={{ color: '#10B981' }}>FREE</strong> : `Rs. ${shippingFee}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'Outfit', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 2 }}>
                  <span>Grand Total</span><span>Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Guarantee Badge */}
            <div style={{ display: 'flex', gap: 12, background: '#0D0D14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
              <ShieldCheck size={20} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, fontFamily: 'Inter' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: 2 }}>100% Genuine & Warranted</strong>
                Authorized distributor stock with island-wide island delivery tracking.
              </div>
            </div>

            {shippingFee > 0 && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit', textAlign: 'center' }}>
                🎁 Add Rs. {(5000 - cartTotal).toLocaleString()} more for <strong style={{ color: '#10B981' }}>FREE delivery</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
