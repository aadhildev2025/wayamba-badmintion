import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingUp, Package, ShoppingBag, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface DashboardData {
  summary: {
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalRevenue: number;
  };
  lowStockAlerts: { _id: string; name: string; stockQuantity: number; brand: { name: string }; category: { name: string } }[];
  dailyTrend: { _id: string; revenue: number; orders: number }[];
  bestSellers: { _id: string; name: string; soldQuantity: number; revenue: number }[];
}

export default function AdminReports() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = () => {
    setLoading(true);
    api.get('/reports/dashboard')
      .then(res => {
        setData(res.data);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load analytics data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const chartData = (data?.dailyTrend || []).map(d => ({
    date: d._id.slice(5), // MM-DD
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.5px' }}>Sales & Analytics</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Revenue trends, best-selling gear, and inventory health across the last 30 days.</p>
        </div>
        <button
          onClick={fetchReports}
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
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(204,27,27,0.2)', borderTopColor: '#CC1B1B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', borderColor: '#ef444430' }}>
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      ) : data ? (
        <>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { label: 'Total Revenue', value: `Rs. ${data.summary.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: '#10b981' },
              { label: 'Total Orders', value: data.summary.totalOrders, icon: ShoppingBag, color: '#3b82f6' },
              { label: 'Pending Orders', value: data.summary.pendingOrders, icon: Package, color: '#f59e0b' },
              { label: 'Total Products', value: data.summary.totalProducts, icon: Package, color: 'var(--red-vivid)' },
              { label: 'Customers', value: data.summary.totalCustomers, icon: ShoppingBag, color: '#8b5cf6' },
              { label: 'Delivered', value: data.summary.deliveredOrders, icon: TrendingUp, color: '#06b6d4' },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 18, padding: '20px 22px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'Outfit' }}>{kpi.label}</span>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${kpi.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${kpi.color}40` }}>
                    <kpi.icon size={16} style={{ color: kpi.color }} />
                  </div>
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: 24, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  {kpi.value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Revenue Trend Chart */}
          {chartData.length > 0 && (
            <div style={{ padding: '24px 20px', background: '#111118', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 20 }}>
                Revenue Trend (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#09090E', border: '1px solid rgba(176,28,40,0.5)', borderRadius: 10, color: '#FFFFFF' }}
                    formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--red-vivid)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: 'var(--red-vivid)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Orders by Day */}
          {chartData.length > 0 && (
            <div style={{ padding: '24px 20px', background: '#111118', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 20 }}>
                Orders per Day (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#09090E', border: '1px solid rgba(176,28,40,0.5)', borderRadius: 10, color: '#FFFFFF' }}
                    formatter={(value: number) => [value, 'Orders']}
                  />
                  <Bar dataKey="orders" fill="var(--red-vivid)" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bottom Two-Column: Best Sellers + Low Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

            {/* Best Sellers */}
            <div style={{ padding: '22px 20px', background: '#111118', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} style={{ color: 'var(--red-vivid)' }} /> Top Selling Products
              </h3>
              {data.bestSellers.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5 }}>No sales recorded yet. Products are ready for orders.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.bestSellers.map((bs, i) => (
                    <div key={bs._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(176,28,40,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--red-vivid)' }}>{i + 1}</div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Outfit' }}>{bs.name}</div>
                          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>{bs.soldQuantity} units sold</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#22C55E', fontFamily: 'Outfit' }}>
                        Rs. {bs.revenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div style={{ padding: '22px 20px', background: '#111118', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} style={{ color: '#f59e0b' }} /> Low Stock Alerts
              </h3>
              {data.lowStockAlerts.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5 }}>All inventory items are well-stocked.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.lowStockAlerts.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.25)' }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Outfit' }}>{item.name}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>
                          {item.brand?.name} · {item.category?.name}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={13} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: 14, fontWeight: 900, color: '#f59e0b', fontFamily: 'Outfit' }}>{item.stockQuantity} left</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      ) : null}
    </div>
  );
}
