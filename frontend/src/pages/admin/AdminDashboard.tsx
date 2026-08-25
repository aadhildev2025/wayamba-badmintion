import { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  BarChart2, LogOut, Menu, X, Plus, Bell, CheckCheck,
  TrendingUp, AlertCircle, ChevronRight,
  CheckCircle2, ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminCustomers from './AdminCustomers';
import AdminReports from './AdminReports';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',  path: '' },
  { icon: ShoppingBag,    label: 'Orders',    path: 'orders' },
  { icon: Package,        label: 'Products',  path: 'products' },
  { icon: Users,          label: 'Staff',     path: 'staff' },
  { icon: BarChart2,      label: 'Reports',   path: 'reports' },
];

/* ── Overview Panel ──────────────────────────────── */
function Overview({ user }: { user: { name: string; role: string } }) {
  const [summary, setSummary] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const getDashboard = api.get('/reports/dashboard');
    const getOrders = api.get('/orders');

    Promise.all([getDashboard, getOrders])
      .then(([dashRes, orderRes]) => {
        setSummary(dashRes.data.summary);
        setLowStock(dashRes.data.lowStockAlerts || []);
        const rawOrders = Array.isArray(orderRes.data) ? orderRes.data : orderRes.data?.orders || [];
        setRecentOrders(rawOrders.slice(0, 5));
      })
      .catch((err) => {
        console.warn('Dashboard API call failed, loading demo dashboard metrics:', err);
        setSummary({
          totalRevenue: 245000,
          totalOrders: 18,
          pendingOrders: 3,
          deliveredOrders: 14,
          totalProducts: 24,
          totalCustomers: 12
        });
      });
  }, []);

  const KPI = [
    {
      label: 'Gross Revenue',
      value: summary ? `Rs. ${summary.totalRevenue.toLocaleString()}` : 'Rs. 0',
      subtitle: '+12.4% vs last period',
      icon: TrendingUp, color: '#10B981', bg: 'rgba(16,185,129,0.14)'
    },
    {
      label: 'Total Orders',
      value: summary?.totalOrders ?? 0,
      subtitle: `${summary?.pendingOrders ?? 0} Pending • ${summary?.deliveredOrders ?? 0} Delivered`,
      icon: ShoppingBag, color: '#3B82F6', bg: 'rgba(59,130,246,0.14)'
    },
    {
      label: 'Catalog Items',
      value: summary?.totalProducts ?? 0,
      subtitle: `${lowStock.length} Low stock alerts`,
      icon: Package, color: 'var(--red-vivid)', bg: 'rgba(176,28,40,0.18)'
    },
    {
      label: 'Registered Customers',
      value: summary?.totalCustomers ?? 0,
      subtitle: 'Active Store Directory',
      icon: Users, color: '#8B5CF6', bg: 'rgba(139,92,246,0.14)'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(176,28,40,0.28) 0%, #111118 65%)',
          border: '1.5px solid rgba(255,255,255,0.14)',
          borderRadius: 24, padding: '30px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 99, background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#10B981', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Store Operational Command Center
              </span>
            </div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: 32, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.8px', marginBottom: 6 }}>
              Welcome back, {user.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, maxWidth: 540, lineHeight: 1.5 }}>
              Here is your multi-sport inventory, real-time order queue, and revenue status for Wayamba Badminton Home.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to="products"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 14, fontSize: 13.5, fontWeight: 800,
                fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(176,28,40,0.45)'
              }}
            >
              <Plus size={16} /> Add Product
            </Link>
            <Link
              to="orders"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 14, fontSize: 13.5, fontWeight: 700,
                fontFamily: 'Outfit', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', textDecoration: 'none'
              }}
            >
              <ShoppingBag size={16} /> Manage Orders
            </Link>
            <Link
              to="reports"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 22px', borderRadius: 14, fontSize: 13.5, fontWeight: 700,
                fontFamily: 'Outfit', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', textDecoration: 'none'
              }}
            >
              <BarChart2 size={16} /> Analytics
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {KPI.map(({ label, value, subtitle, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: '#111118',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '22px 20px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Outfit' }}>{label}</span>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}40` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: 30, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter' }}>{subtitle}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main 2-Column Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        
        {/* Left Column: Recent Orders Feed */}
        <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: '24px 22px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={18} style={{ color: 'var(--red-vivid)' }} /> Recent Orders Feed
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12.5, marginTop: 2 }}>Latest customer checkouts across store</p>
            </div>
            <Link to="orders" style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--red-vivid)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'Outfit' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', background: '#161622', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No recent orders recorded yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Total</th>
                    <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord: any) => (
                    <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Outfit' }}>{ord.shippingAddress?.recipientName || ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>#{ord._id.slice(-6).toUpperCase()}</div>
                      </td>
                      <td style={{ padding: '12px', fontSize: 13.5, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Outfit' }}>
                        Rs. {(ord.totalAmount || ord.total || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 800,
                          background: ord.status === 'Delivered' ? 'rgba(16,185,129,0.18)' : ord.status === 'Pending' ? 'rgba(245,158,11,0.18)' : 'rgba(59,130,246,0.18)',
                          color: ord.status === 'Delivered' ? '#22C55E' : ord.status === 'Pending' ? '#F59E0B' : '#60A5FA',
                          border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Outfit'
                        }}>
                          {ord.status || 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Inventory Alerts & Best Sellers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Low Stock Alerts */}
          <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: '24px 22px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={17} style={{ color: '#F59E0B' }} /> Inventory Reorder Alerts
              </h3>
              <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(245,158,11,0.18)', color: '#F59E0B', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(245,158,11,0.3)', fontFamily: 'Outfit' }}>
                {lowStock.length} Low Items
              </span>
            </div>

            {lowStock.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600, fontFamily: 'Outfit' }}>All catalog equipment is fully stocked!</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lowStock.slice(0, 4).map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: '#161622', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                      <div style={{ fontSize: 13.5, color: '#FFFFFF', fontWeight: 700, fontFamily: 'Outfit' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>SKU: {item.sku || 'N/A'}</div>
                    </div>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 13, color: '#F59E0B', background: 'rgba(245,158,11,0.15)', padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)' }}>
                      {item.stockQuantity} Left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Categories Distribution */}
          <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: '24px 22px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={17} style={{ color: 'var(--red-vivid)' }} /> Multi-Sport Catalog Focus
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'Badminton Rackets & Equipment', percent: '40%', count: 'Badminton Gear' },
                { name: 'Tennis Rackets & Balls', percent: '20%', count: 'Tennis Gear' },
                { name: 'Indoor Cricket Bats & Gear', percent: '20%', count: 'Cricket Gear' },
                { name: 'Match Jerseys & Apparel', percent: '10%', count: 'Jerseys' },
                { name: 'Shuttlecocks & Accessories', percent: '10%', count: 'Shuttles' },
              ].map(cat => (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', marginBottom: 4 }}>
                    <span>{cat.name}</span>
                    <span style={{ color: 'var(--red-vivid)' }}>{cat.percent}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: cat.percent, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #B01C28, #E52E3D)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

/* ── Main Dashboard Shell ──────────────────────────── */
export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/orders/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {}
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'STAFF')) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'STAFF'))) {
      navigate('/admin', { replace: true });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => { setSidebarOpen(false); setNotifOpen(false); }, [location.pathname]);

  const markAllRead = async () => {
    try {
      await api.put('/orders/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/orders/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (e) {}
  };

  if (isLoading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  );

  const handleLogout = () => { logout(); navigate('/admin'); };
  const basePath = '/admin/dashboard';
  const sub = location.pathname.replace(basePath, '').replace(/^\//, '');

  return (
    <div className="admin-root" style={{ minHeight: '100vh', display: 'flex', background: '#060609', color: '#F1F5F9', fontFamily: 'Inter, sans-serif' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 49 }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: 240, flexShrink: 0,
          background: '#09090E',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, height: '100vh',
          overflowY: 'auto', zIndex: 50,
          transition: 'transform 0.28s ease',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="WBH"
              style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: '50%', flexShrink: 0, border: '1.5px solid var(--red-vivid)' }}
            />
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 14, color: '#fff', lineHeight: 1.1 }}>Wayamba</div>
              <div style={{ fontSize: 9, color: 'var(--red-vivid)', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'none' }} className="show-mobile">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = sub === path || (path === '' && sub === '');
            return (
              <Link key={path} to={path} style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '11px 14px', borderRadius: 12, textDecoration: 'none',
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                background: active ? 'rgba(176,28,40,0.22)' : 'transparent',
                fontSize: 14, fontWeight: active ? 700 : 500,
                border: active ? '1px solid rgba(176,28,40,0.45)' : '1px solid transparent',
                transition: 'all 0.18s var(--ease)',
                fontFamily: 'Outfit',
              }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; } }}
              >
                <Icon size={16} style={{ color: active ? 'var(--red-vivid)' : 'inherit' }} />
                {label}
                {active && <ChevronRight size={13} style={{ marginLeft: 'auto', color: 'var(--red-vivid)' }} />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: 'Outfit' }}>{user.name}</div>
              <div style={{ fontSize: 9.5, color: 'var(--red-vivid)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Staff Member'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 9,
            padding: '10px 14px', borderRadius: 10, background: 'none', border: 'none',
            cursor: 'pointer', color: 'rgba(239,68,68,0.7)', fontSize: 13.5, fontWeight: 600,
            transition: 'all 0.18s', fontFamily: 'Outfit',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.color = '#EF4444'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.7)'; }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main" style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0, background: '#060609' }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(9,9,14,0.92)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '14px 28px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <button onClick={() => setSidebarOpen(true)} className="show-mobile" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}>
            <Menu size={20} />
          </button>
          <div style={{ flex: 1 }} />

          {/* Notification Bell & Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, padding: '9px 12px', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, position: 'relative',
              }}
            >
              <Bell size={18} style={{ color: unreadCount > 0 ? 'var(--red-vivid)' : 'rgba(255,255,255,0.7)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Outfit' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  background: 'var(--red-vivid)', color: '#fff', fontSize: 11, fontWeight: 900,
                  borderRadius: 99, padding: '2px 7px', fontFamily: 'Outfit', lineHeight: 1,
                  boxShadow: '0 0 10px rgba(176,28,40,0.6)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {notifOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 340,
                background: '#111118', border: '1.5px solid rgba(255,255,255,0.14)',
                borderRadius: 18, boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
                zIndex: 100, overflow: 'hidden',
              }}>
                <div style={{
                  padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 14, color: '#fff' }}>
                    Notifications ({notifications.length})
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'none', border: 'none', color: '#10B981', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => {
                          markRead(n._id);
                          navigate('orders');
                          setNotifOpen(false);
                        }}
                        style={{
                          padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: n.read ? 'transparent' : 'rgba(176,28,40,0.08)',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(176,28,40,0.08)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>{n.title}</span>
                          {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red-vivid)', flexShrink: 0, marginTop: 4 }} />}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, fontFamily: 'Inter' }}>{n.message}</div>
                        <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', marginTop: 6, fontFamily: 'Outfit' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Link to="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.15s', fontFamily: 'Outfit', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#fff'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
          >
            ← Back to store front
          </Link>
        </div>

        {/* Content */}
        <main style={{ flex: 1, padding: '32px 28px', background: '#060609' }}>
          <Routes>
            <Route index element={<Overview user={user} />} />
            <Route path="orders"    element={<AdminOrders />} />
            <Route path="products"  element={<AdminProducts />} />
            <Route path="staff"     element={<AdminCustomers />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="reports"   element={<AdminReports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
