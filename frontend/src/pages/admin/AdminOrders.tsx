import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, X, Check, Truck, XCircle, Clock, MessageSquare, MapPin, RefreshCw } from 'lucide-react';
import api from '@/lib/api';

interface OrderItem {
  product: { name: string; slug: string; images: string[] };
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  user: { name: string; email: string; phone?: string } | null;
  items: OrderItem[];
  shippingAddress: {
    recipientName?: string;
    fullName?: string;
    addressLine1?: string;
    street?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
  };
  deliveryCharge: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editStatus, setEditStatus] = useState<'Pending' | 'Shipped' | 'Delivered' | 'Cancelled'>('Pending');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'Pending' | 'Paid' | 'Refunded'>('Pending');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders')
      .then((res) => {
        setOrders(res.data || []);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch orders from server.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getCustomerName = (order: Order) => {
    return order.shippingAddress?.recipientName || order.shippingAddress?.fullName || order.user?.name || 'Customer';
  };

  const getStreetAddress = (order: Order) => {
    return order.shippingAddress?.addressLine1 || order.shippingAddress?.street || 'Delivery Address';
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditPaymentStatus(order.paymentStatus);
    setUpdateSuccess(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setModalLoading(true);
    setUpdateSuccess(false);

    try {
      const { data } = await api.put(`/orders/${selectedOrder._id}/status`, {
        status: editStatus,
        paymentStatus: editPaymentStatus,
      });
      
      // Update order in list
      setOrders(prev => prev.map(o => o._id === data._id ? { ...o, ...data } : o));
      setSelectedOrder(prev => prev ? { ...prev, ...data } : null);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#f59e0b20', text: '#f59e0b', icon: Clock };
      case 'Shipped': return { bg: '#3b82f620', text: '#3b82f6', icon: Truck };
      case 'Delivered': return { bg: '#10b98120', text: '#10b981', icon: Check };
      case 'Cancelled': return { bg: '#ef444420', text: '#ef4444', icon: XCircle };
      default: return { bg: '#6b728020', text: '#6b7280', icon: Clock };
    }
  };

  const filteredOrders = orders.filter(order => {
    const cName = getCustomerName(order).toLowerCase();
    const cPhone = order.shippingAddress?.phone || '';
    const cEmail = order.shippingAddress?.email || order.user?.email || '';

    const matchesSearch = 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cName.includes(searchQuery.toLowerCase()) ||
      cEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.5px' }}>Manage Orders</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>View customer invoices, shipping addresses, and control fulfillment states.</p>
        </div>
        <button
          onClick={fetchOrders}
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
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh List
        </button>
      </div>

      {/* Command Bar Toolbar */}
      <div style={{
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '14px 18px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Modern Command Search Input */}
        <div style={{
          flex: 1,
          minWidth: 300,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#161622',
          border: '1.5px solid rgba(255,255,255,0.14)',
          borderRadius: 14,
          padding: '6px 14px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
          transition: 'all 0.2s ease',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(176,28,40,0.18)', border: '1px solid rgba(176,28,40,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Search size={15} style={{ color: 'var(--red-vivid)' }} />
          </div>
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FFFFFF',
              fontSize: 14,
              fontFamily: 'Outfit',
              padding: '6px 0',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                width: 22, height: 22, cursor: 'pointer', color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Segmented Status Tab Bar */}
        <div style={{
          display: 'inline-flex',
          gap: 4,
          background: 'rgba(0,0,0,0.5)',
          padding: 5,
          borderRadius: 99,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
        }}>
          {['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(status => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '8px 18px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  borderRadius: 99,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: active ? 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)' : 'transparent',
                  border: active ? '1px solid rgba(255,255,255,0.25)' : 'none',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  boxShadow: active ? '0 4px 16px rgba(176,28,40,0.5)' : 'none',
                }}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(176,28,40,0.2)', borderTopColor: 'var(--red-vivid)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#111118', borderRadius: 16, border: '1px solid rgba(239,68,68,0.3)' }}>
          <p style={{ color: '#ef4444', fontSize: 14.5, fontWeight: 600 }}>{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: '#111118', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
          <h4 style={{ fontFamily: 'Outfit', color: '#fff', fontSize: 18, marginBottom: 6 }}>No orders found</h4>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5 }}>Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: '#111118', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Order ID</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Customer</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Date</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Items</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Total</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const sColor = getStatusColor(order.status);
                const Icon = sColor.icon;
                return (
                  <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '14px 20px', fontSize: 13, fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF', fontFamily: 'Outfit' }}>{getCustomerName(order)}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter' }}>{order.shippingAddress?.phone || 'No phone'}</div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter' }}>
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Outfit' }}>
                      Rs. {order.total.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700,
                        background: sColor.bg, color: sColor.text,
                      }}>
                        <Icon size={12} /> {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <button onClick={() => openOrderDetails(order)} className="btn-ghost" style={{ padding: 6, borderRadius: 8 }} title="View details">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedOrder(null)} />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                position: 'relative', width: '100%', maxWidth: 720,
                maxHeight: '90vh', overflowY: 'auto',
                background: '#0d0404', border: '1.5px solid rgba(204,27,27,0.18)',
                borderRadius: 24, padding: '28px 24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 900, color: '#f9eded' }}>
                    Order Details
                  </h3>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                    ID: {selectedOrder._id}
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Grid content */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
                
                {/* Delivery & Customer Info */}
                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 800, color: '#CC1B1B', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 }}>
                    Shipping Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Outfit' }}>
                      {getCustomerName(selectedOrder)}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      <MapPin size={14} style={{ color: '#CC1B1B', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        {getStreetAddress(selectedOrder)},<br />
                        {selectedOrder.shippingAddress?.city || 'Puttalam'}, {selectedOrder.shippingAddress?.district || 'Puttalam District'}
                        {selectedOrder.shippingAddress?.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''}
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      Phone: <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{selectedOrder.shippingAddress?.phone || 'N/A'}</span>
                    </div>

                    {selectedOrder.shippingAddress?.email && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                        Email: <span style={{ color: '#93c5fd' }}>{selectedOrder.shippingAddress.email}</span>
                      </div>
                    )}

                    {/* WhatsApp contact link */}
                    {selectedOrder.shippingAddress?.phone && (
                      <a
                        href={`https://wa.me/${selectedOrder.shippingAddress.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '8px 14px', borderRadius: 8, background: 'rgba(37,211,102,0.08)',
                          border: '1.5px solid #25D366', color: '#25d366',
                          fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { (e.currentTarget).style.background = '#25D366'; (e.currentTarget).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(37,211,102,0.08)'; (e.currentTarget).style.color = '#25d366'; }}
                      >
                        <MessageSquare size={13} /> Chat on WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Items Invoice list */}
                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 800, color: '#CC1B1B', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 }}>
                    Items Ordered
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ flex: 1, paddingRight: 10 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#f9eded', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)' }}>Rs. {item.price.toLocaleString()} × {item.quantity}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#f9eded' }}>
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                      {selectedOrder.discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Discount (Coupon)</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>-Rs. {selectedOrder.discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Delivery Fee</span>
                        <span>Rs. {selectedOrder.deliveryCharge.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5, fontWeight: 900, color: '#f9eded', marginTop: 4 }}>
                        <span>Grand Total</span>
                        <span style={{ color: '#CC1B1B' }}>Rs. {selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Payment & Additional details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 24 }}>
                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 800, color: '#CC1B1B', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>
                    Order Status & Management
                  </h4>
                  <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                    
                    {/* Status selection */}
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontFamily: 'Outfit', display: 'block', marginBottom: 6 }}>Fulfillment Status</label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value as any)}
                        style={{
                          width: '100%', padding: '10px 14px', background: '#161622',
                          border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12,
                          color: '#FFFFFF', fontSize: 13.5, fontWeight: 700, fontFamily: 'Outfit',
                          outline: 'none', cursor: 'pointer'
                        }}
                      >
                        <option value="Pending" style={{ background: '#161622', color: '#FFFFFF', padding: '8px' }}>Pending</option>
                        <option value="Shipped" style={{ background: '#161622', color: '#FFFFFF', padding: '8px' }}>Shipped</option>
                        <option value="Delivered" style={{ background: '#161622', color: '#FFFFFF', padding: '8px' }}>Delivered</option>
                        <option value="Cancelled" style={{ background: '#161622', color: '#FFFFFF', padding: '8px' }}>Cancelled</option>
                      </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontFamily: 'Outfit', display: 'block', marginBottom: 6 }}>
                        Payment Status ({selectedOrder.paymentMethod || 'Cash on Delivery'})
                      </label>
                      <select
                        value={editPaymentStatus}
                        onChange={e => setEditPaymentStatus(e.target.value as any)}
                        style={{
                          width: '100%', padding: '10px 14px', background: '#161622',
                          border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12,
                          color: '#FFFFFF', fontSize: 13.5, fontWeight: 700, fontFamily: 'Outfit',
                          outline: 'none', cursor: 'pointer'
                        }}
                      >
                        <option value="Pending" style={{ background: '#161622', color: '#FFFFFF', padding: '8px' }}>Pending</option>
                        <option value="Paid" style={{ background: '#161622', color: '#FFFFFF', padding: '8px' }}>Paid</option>
                        <option value="Refunded" style={{ background: '#161622', color: '#FFFFFF', padding: '8px' }}>Refunded</option>
                      </select>
                    </div>

                    {updateSuccess && (
                      <div style={{ color: '#10b981', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <Check size={14} /> Order settings saved successfully!
                      </div>
                    )}

                    <button type="submit" disabled={modalLoading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, fontSize: 13.5, fontWeight: 800, marginTop: 4 }}>
                      {modalLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </form>
                </div>

                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 800, color: '#CC1B1B', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>
                    Additional Metadata
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                    <div>
                      Payment Method: <span style={{ fontWeight: 800, color: '#FFFFFF', fontFamily: 'Outfit' }}>{selectedOrder.paymentMethod || 'Cash on Delivery'}</span>
                    </div>
                    <div>
                      Placed On: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Customer Notes:</div>
                        <p style={{ fontStyle: 'italic', fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                          "{selectedOrder.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
