import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Tag, X, Check, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  active: boolean;
  usageCount: number;
  usageLimit?: number;
  createdAt: string;
}

export default function AdminCoupons() {
  const { user } = useAuth();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [active, setActive] = useState(true);

  const fetchCoupons = () => {
    setLoading(true);
    api.get('/coupons')
      .then(res => {
        setCoupons(res.data || []);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load coupons.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openForm = (coupon: Coupon | null = null) => {
    setSelectedCoupon(coupon);
    setModalOpen(true);

    if (coupon) {
      setCode(coupon.code);
      setDiscountType(coupon.discountType);
      setDiscountValue(coupon.discountValue);
      setMinOrderAmount(coupon.minOrderAmount);
      setExpiryDate(coupon.expiryDate.slice(0, 10));
      setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : '');
      setActive(coupon.active);
    } else {
      setCode('');
      setDiscountType('PERCENT');
      setDiscountValue(10);
      setMinOrderAmount(0);
      setExpiryDate('');
      setUsageLimit('');
      setActive(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !expiryDate) {
      alert('Coupon code and expiry date are required');
      return;
    }

    setSaving(true);
    const payload = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      expiryDate,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      active,
    };

    try {
      if (selectedCoupon) {
        const { data } = await api.put(`/coupons/${selectedCoupon._id}`, payload);
        setCoupons(prev => prev.map(c => c._id === selectedCoupon._id ? data : c));
      } else {
        const { data } = await api.post('/coupons', payload);
        setCoupons(prev => [data, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const { data } = await api.put(`/coupons/${coupon._id}`, { active: !coupon.active });
      setCoupons(prev => prev.map(c => c._id === coupon._id ? data : c));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle coupon status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.5px' }}>Coupon Management</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Create, edit, and manage promotional discount codes for your customers.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={fetchCoupons}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 14, fontSize: 13.5, fontWeight: 700,
              fontFamily: 'Outfit', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF',
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => openForm(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 14, fontSize: 13.5, fontWeight: 800,
              fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
              border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(176,28,40,0.45)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 28px rgba(176,28,40,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(176,28,40,0.45)'; }}
          >
            <Plus size={16} /> Create Coupon
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(176,28,40,0.2)', borderTopColor: 'var(--red-vivid)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#111118', borderRadius: 16, border: '1px solid rgba(239,68,68,0.3)' }}>
          <p style={{ color: '#ef4444', fontSize: 14.5, fontWeight: 600 }}>{error}</p>
        </div>
      ) : coupons.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: '#111118', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Tag size={40} style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 14, marginInline: 'auto' }} />
          <h4 style={{ fontFamily: 'Outfit', color: '#fff', fontSize: 18, marginBottom: 6 }}>No coupons created yet</h4>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5 }}>Create your first promotional coupon to drive customer sales.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {coupons.map((coupon, i) => {
            const isExpired = new Date(coupon.expiryDate) < new Date();
            const usageExhausted = coupon.usageLimit ? coupon.usageCount >= coupon.usageLimit : false;

            return (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: '#111118',
                  border: `1.5px solid ${coupon.active && !isExpired ? 'rgba(176,28,40,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 18,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                {/* Top: Code + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Tag size={15} style={{ color: 'var(--red-vivid)' }} />
                      <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 17, color: '#FFFFFF', letterSpacing: 1.5 }}>
                        {coupon.code}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                      Created {new Date(coupon.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleActive(coupon)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: coupon.active ? '#22C55E' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center' }}>
                      {coupon.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button onClick={() => openForm(coupon)} style={{ padding: 6, borderRadius: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', cursor: 'pointer' }}>
                      <Edit2 size={14} />
                    </button>
                    {user?.role === 'SUPER_ADMIN' && (
                      <button onClick={() => handleDelete(coupon._id)} style={{ padding: 6, borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Discount Value */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    padding: '6px 14px', borderRadius: 99,
                    background: coupon.discountType === 'PERCENT' ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)',
                    border: `1px solid ${coupon.discountType === 'PERCENT' ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.25)'}`,
                    color: coupon.discountType === 'PERCENT' ? '#10b981' : '#3b82f6',
                    fontFamily: 'Outfit', fontWeight: 900, fontSize: 16,
                  }}>
                    {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% OFF` : `Rs. ${coupon.discountValue.toLocaleString()} OFF`}
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  <div>Min Order: <span style={{ color: '#f9eded', fontWeight: 600 }}>Rs. {coupon.minOrderAmount.toLocaleString()}</span></div>
                  <div>Used: <span style={{ color: '#f9eded', fontWeight: 600 }}>{coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''} times</span></div>
                  <div style={{ gridColumn: '1/-1' }}>
                    Expires: <span style={{ color: isExpired ? '#ef4444' : '#f9eded', fontWeight: 600 }}>
                      {new Date(coupon.expiryDate).toLocaleDateString()}{isExpired ? ' (Expired)' : ''}
                    </span>
                  </div>
                </div>

                {/* Status Chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {!coupon.active && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>DISABLED</span>
                  )}
                  {isExpired && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>EXPIRED</span>
                  )}
                  {usageExhausted && !isExpired && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>LIMIT REACHED</span>
                  )}
                  {coupon.active && !isExpired && !usageExhausted && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={10} /> ACTIVE
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                position: 'relative', width: '100%', maxWidth: 520,
                background: '#0d0404', border: '1.5px solid rgba(204,27,27,0.18)',
                borderRadius: 24, padding: '28px 24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 14 }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 900, color: '#f9eded' }}>
                  {selectedCoupon ? 'Edit Coupon' : 'Create Discount Coupon'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Code */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Coupon Code</label>
                  <input type="text" placeholder="e.g. SMASH20" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="input-field" required disabled={!!selectedCoupon} style={{ fontFamily: 'monospace', fontWeight: 700 }} />
                </div>

                {/* Discount Type & Value */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Discount Type</label>
                    <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} style={{ width: '100%', padding: 10, background: '#120606', border: '1.5px solid rgba(204,27,27,0.2)', borderRadius: 10, color: '#fff', fontSize: 13.5 }}>
                      <option value="PERCENT">Percentage (%)</option>
                      <option value="FLAT">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>{discountType === 'PERCENT' ? 'Percentage (%)' : 'Amount (Rs.)'}</label>
                    <input
                      type="number"
                      placeholder={discountType === 'PERCENT' ? '10' : '500'}
                      value={discountValue}
                      onChange={e => setDiscountValue(Number(e.target.value))}
                      onFocus={e => { if (discountValue === 0) setDiscountValue('' as any); else e.target.select(); }}
                      onClick={() => { if (discountValue === 0) setDiscountValue('' as any); }}
                      className="input-field"
                      required
                      min={1}
                    />
                  </div>
                </div>

                {/* Min Order & Expiry */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Min Order (Rs.)</label>
                    <input
                      type="number"
                      placeholder="2000"
                      value={minOrderAmount}
                      onChange={e => setMinOrderAmount(Number(e.target.value))}
                      onFocus={e => { if (minOrderAmount === 0) setMinOrderAmount('' as any); else e.target.select(); }}
                      onClick={() => { if (minOrderAmount === 0) setMinOrderAmount('' as any); }}
                      className="input-field"
                      min={0}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="input-field" required />
                  </div>
                </div>

                {/* Usage Limit & Active */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>Usage Limit (Optional)</label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={usageLimit}
                      onChange={e => setUsageLimit(e.target.value)}
                      onFocus={e => { if (usageLimit === '0') setUsageLimit(''); else e.target.select(); }}
                      onClick={() => { if (usageLimit === '0') setUsageLimit(''); }}
                      className="input-field"
                      min={1}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
                    <input type="checkbox" id="couponActive" checked={active} onChange={e => setActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#CC1B1B' }} />
                    <label htmlFor="couponActive" style={{ fontSize: 13.5, fontWeight: 600, color: '#f9eded', cursor: 'pointer' }}>Active</label>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost" style={{ padding: '10px 20px', fontSize: 13 }}>Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
                    {saving ? 'Saving...' : selectedCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
