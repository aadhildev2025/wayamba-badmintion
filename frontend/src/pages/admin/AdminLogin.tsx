import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'STAFF')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data: any = await login(email, password);
      if (data?.role === 'SUPER_ADMIN' || data?.role === 'STAFF') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError('Access denied. Admin credentials required.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden', padding: 24,
    }}>
      {/* Background effects */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.018, backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '56px 56px', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Logo/Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <img
              src="/logo.png"
              alt="Wayamba Badminton Home"
              style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: '50%', margin: '0 auto 16px', display: 'block' }}
            />
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700, color: 'var(--text-1)', letterSpacing: -0.5, marginBottom: 6 }}>
              Admin Access
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
              Wayamba Badminton Home · Control Panel
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20 }}
            >
              <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, color: 'var(--danger)' }}>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.6 }}>Email Address</label>
              <input
                id="admin-email"
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@wbh.com"
                className="input" required autoFocus
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'block', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input" required style={{ paddingRight: 48 }}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="admin-submit"
              type="submit" disabled={loading} className="btn btn-primary"
              style={{ marginTop: 8, padding: '13px 24px', fontSize: 15, opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
                : <><LogIn size={17} /> Sign In</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
