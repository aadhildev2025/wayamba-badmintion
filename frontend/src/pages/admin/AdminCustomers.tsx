import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Trash2, Shield, RefreshCw, X, Key, Lock,
  CheckCircle2, LayoutDashboard, ShoppingBag, Package,
  Users, BarChart2, Tag, SlidersHorizontal, Check, ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export interface Staff {
  _id: string;
  name: string;
  email: string;
  role: 'STAFF' | 'SUPER_ADMIN';
  phone?: string;
  permissions?: string[];
  createdAt: string;
}

export interface PermissionModule {
  key: string;
  label: string;
  shortLabel: string;
  desc: string;
  icon: any;
  color: string;
  bg: string;
}

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    key: 'dashboard',
    label: 'Dashboard Overview',
    shortLabel: 'Overview',
    desc: 'Live store KPIs, revenue statistics, inventory reorder alerts & recent orders feed',
    icon: LayoutDashboard,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.14)',
  },
  {
    key: 'products',
    label: 'Products & Inventory',
    shortLabel: 'Products',
    desc: 'Catalog equipment, badminton rackets, brands, categories & stock quantities',
    icon: Package,
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.14)',
  },
  {
    key: 'orders',
    label: 'Orders & Fulfillment',
    shortLabel: 'Orders',
    desc: 'Customer purchases, customer shipping details & fulfillment status progression',
    icon: ShoppingBag,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.14)',
  },
  {
    key: 'coupons',
    label: 'Coupons & Discounts',
    shortLabel: 'Coupons',
    desc: 'Promotional discount codes, flat & percentage coupons & expiration rules',
    icon: Tag,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.14)',
  },
  {
    key: 'reports',
    label: 'Analytics & Reports',
    shortLabel: 'Reports',
    desc: 'Store financial analytics, monthly revenue charts & sales intelligence',
    icon: BarChart2,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.14)',
  },
  {
    key: 'staff',
    label: 'Staff Directory',
    shortLabel: 'Staff View',
    desc: 'View team administrative accounts and clearance levels roster',
    icon: Users,
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.14)',
  },
];

export default function AdminCustomers() {
  const { user, updateUserPermissions } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Staff creation form state
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffPermissions, setStaffPermissions] = useState<string[]>(['dashboard', 'products', 'orders']);
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Change password modal state
  const [passwordModalStaff, setPasswordModalStaff] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Permissions modal state
  const [permissionModalStaff, setPermissionModalStaff] = useState<Staff | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [updatingPermissions, setUpdatingPermissions] = useState(false);
  const [permissionSuccess, setPermissionSuccess] = useState('');
  const [permissionError, setPermissionError] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/auth/staff')
      .then((staffRes) => {
        const rawStaff = Array.isArray(staffRes.data) ? staffRes.data : [];
        const normalized = rawStaff.map((s: any) => ({
          ...s,
          permissions: s.permissions && s.permissions.length > 0
            ? s.permissions
            : (s.role === 'SUPER_ADMIN' ? PERMISSION_MODULES.map(m => m.key) : ['dashboard', 'products', 'orders'])
        }));
        setStaff(normalized);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch staff accounts.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const toggleNewStaffPermission = (key: string) => {
    setStaffPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      alert('Name, email, and password are required');
      return;
    }

    if (staffPermissions.length === 0) {
      alert('Please grant at least one module permission to this staff member');
      return;
    }

    setSubmittingStaff(true);
    try {
      const { data } = await api.post('/auth/staff', {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        phone: staffPhone || undefined,
        permissions: staffPermissions,
        role: 'STAFF',
      });
      const newStaffObj: Staff = {
        ...data,
        permissions: data.permissions || staffPermissions
      };
      setStaff(prev => [newStaffObj, ...prev]);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffPhone('');
      setStaffPermissions(['dashboard', 'products', 'orders']);
      setShowStaffForm(false);
      alert('Staff account created successfully with assigned clearance!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke authorization and delete this staff member?')) return;
    try {
      await api.delete(`/auth/staff/${id}`);
      setStaff(prev => prev.filter(s => s._id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  const handleOpenPasswordModal = (s: Staff) => {
    setPasswordModalStaff(s);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalStaff) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await api.put(`/auth/staff/${passwordModalStaff._id}/password`, {
        password: newPassword,
      });
      setPasswordSuccess(`Password updated successfully for ${passwordModalStaff.name}!`);
      setTimeout(() => {
        setPasswordModalStaff(null);
        setPasswordSuccess('');
      }, 1600);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Permissions Modal Handlers
  const handleOpenPermissionsModal = (s: Staff) => {
    setPermissionModalStaff(s);
    setSelectedPermissions(s.permissions || ['dashboard', 'products', 'orders']);
    setPermissionSuccess('');
    setPermissionError('');
  };

  const toggleModalPermission = (key: string) => {
    setSelectedPermissions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionModalStaff) return;

    setUpdatingPermissions(true);
    setPermissionError('');
    setPermissionSuccess('');

    try {
      await api.put(`/auth/staff/${permissionModalStaff._id}/permissions`, {
        permissions: selectedPermissions,
      });

      setStaff(prev =>
        prev.map(s => s._id === permissionModalStaff._id ? { ...s, permissions: selectedPermissions } : s)
      );

      // If user is editing their own session, sync AuthContext state
      if (user && user.id === permissionModalStaff._id && user.role !== 'SUPER_ADMIN') {
        updateUserPermissions(selectedPermissions);
      }

      setPermissionSuccess(`Clearance permissions updated successfully for ${permissionModalStaff.name}!`);
      setTimeout(() => {
        setPermissionModalStaff(null);
        setPermissionSuccess('');
      }, 1400);
    } catch (err: any) {
      console.error(err);
      setPermissionError(err.response?.data?.message || 'Failed to update permissions');
    } finally {
      setUpdatingPermissions(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone || '').includes(searchQuery)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, background: 'rgba(176,28,40,0.15)', border: '1px solid rgba(176,28,40,0.3)', marginBottom: 8 }}>
            <ShieldCheck size={13} style={{ color: 'var(--red-vivid)' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--red-vivid)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Outfit' }}>
              Granular Role-Based Access Control
            </span>
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.5px' }}>
            Staff & Access Clearance Management
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 640 }}>
            Configure custom clearance for team members. Grant or revoke specific access to dashboard overview, products catalog, orders, coupons, and reports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={fetchUsers}
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
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Accounts
          </button>
          
          {isSuperAdmin && (
            <button
              onClick={() => setShowStaffForm(!showStaffForm)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 14, fontSize: 13.5, fontWeight: 800,
                fontFamily: 'Outfit',
                background: showStaffForm ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                border: showStaffForm ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.25)',
                color: '#FFFFFF', cursor: 'pointer',
                boxShadow: showStaffForm ? 'none' : '0 8px 24px rgba(176,28,40,0.45)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!showStaffForm) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              <Plus size={16} /> {showStaffForm ? 'Close Form' : 'Create Staff Member'}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(176,28,40,0.2)', borderTopColor: 'var(--red-vivid)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#111118', borderRadius: 16, border: '1px solid rgba(239,68,68,0.3)' }}>
          <p style={{ color: '#ef4444', fontSize: 14.5, fontWeight: 600 }}>{error}</p>
        </div>
      ) : (
        <>
          {/* Staff Registration Form */}
          {showStaffForm && (
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '28px 30px',
                background: '#14141E',
                borderRadius: 22,
                border: '1.5px solid rgba(255,255,255,0.14)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: 17, fontWeight: 900, color: 'var(--red-vivid)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={18} /> Register New Staff Member & Grant Clearance
                  </h4>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 }}>
                    Provide account details and choose which modules this staff member can access.
                  </p>
                </div>
                <button type="button" onClick={() => setShowStaffForm(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Kasun Perera"
                      value={staffName}
                      onChange={e => setStaffName(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#181826',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', outline: 'none'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Email (Login Account)</label>
                    <input
                      type="email"
                      placeholder="e.g. kasun@wbh.com"
                      value={staffEmail}
                      onChange={e => setStaffEmail(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#181826',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'monospace', outline: 'none'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Temporary Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={staffPassword}
                      onChange={e => setStaffPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#181826',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', outline: 'none'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Phone Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. +94 77 123 4567"
                      value={staffPhone}
                      onChange={e => setStaffPhone(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px', background: '#181826',
                        border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                        color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Module Clearance Checklist */}
                <div style={{ background: '#181826', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <div>
                      <h5 style={{ fontFamily: 'Outfit', fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <SlidersHorizontal size={15} style={{ color: 'var(--red-vivid)' }} /> Assign Module Access Permissions
                      </h5>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12.5, marginTop: 2 }}>
                        Select the exact administrative sections this staff member can view and operate.
                      </p>
                    </div>

                    {/* Presets */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setStaffPermissions(PERMISSION_MODULES.map(m => m.key))}
                        style={{ padding: '5px 12px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 11.5, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer' }}
                      >
                        All Access
                      </button>
                      <button
                        type="button"
                        onClick={() => setStaffPermissions(['dashboard', 'products', 'orders'])}
                        style={{ padding: '5px 12px', borderRadius: 99, background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', fontSize: 11.5, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer' }}
                      >
                        Standard (Overview, Products, Orders)
                      </button>
                      <button
                        type="button"
                        onClick={() => setStaffPermissions(['products'])}
                        style={{ padding: '5px 12px', borderRadius: 99, background: 'rgba(236,72,153,0.14)', border: '1px solid rgba(236,72,153,0.3)', color: '#F472B6', fontSize: 11.5, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer' }}
                      >
                        Inventory Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setStaffPermissions([])}
                        style={{ padding: '5px 12px', borderRadius: 99, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171', fontSize: 11.5, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {PERMISSION_MODULES.map(mod => {
                      const Icon = mod.icon;
                      const isSelected = staffPermissions.includes(mod.key);
                      return (
                        <div
                          key={mod.key}
                          onClick={() => toggleNewStaffPermission(mod.key)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: 14,
                            background: isSelected ? mod.bg : 'rgba(255,255,255,0.03)',
                            border: `1.5px solid ${isSelected ? mod.color : 'rgba(255,255,255,0.08)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12
                          }}
                        >
                          <div style={{
                            width: 22, height: 22, borderRadius: 6,
                            background: isSelected ? mod.color : 'rgba(255,255,255,0.08)',
                            border: `1.5px solid ${isSelected ? mod.color : 'rgba(255,255,255,0.2)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: 2, transition: 'all 0.15s'
                          }}>
                            {isSelected && <Check size={14} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <Icon size={15} style={{ color: isSelected ? mod.color : 'rgba(255,255,255,0.7)' }} />
                              <span style={{ fontSize: 13.5, fontWeight: 800, color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.85)', fontFamily: 'Outfit' }}>
                                {mod.label}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                              {mod.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                    * Selected: <strong style={{ color: '#fff' }}>{staffPermissions.length}</strong> of {PERMISSION_MODULES.length} modules granted.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setShowStaffForm(false)}
                    style={{
                      padding: '11px 22px', borderRadius: 14, fontSize: 13.5, fontWeight: 700,
                      fontFamily: 'Outfit', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStaff}
                    style={{
                      padding: '11px 28px', borderRadius: 14, fontSize: 13.5, fontWeight: 900,
                      fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                      border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(176,28,40,0.45)'
                    }}
                  >
                    {submittingStaff ? 'Creating Staff...' : 'Create Staff Member'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Search bar & count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>
                Store Staff & Administration Directory ({filteredStaff.length})
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12.5, marginTop: 2 }}>
                Click <span style={{ color: '#60A5FA', fontWeight: 700 }}>"Edit Access"</span> to grant or restrict specific modules per employee.
              </p>
            </div>
            
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 360,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#161622',
              border: '1.5px solid rgba(255,255,255,0.14)',
              borderRadius: 14,
              padding: '4px 12px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(176,28,40,0.18)', border: '1px solid rgba(176,28,40,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Search size={14} style={{ color: 'var(--red-vivid)' }} />
              </div>
              <input
                type="text"
                placeholder="Search staff name, email, role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontFamily: 'Outfit',
                  padding: '6px 0',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
                    width: 20, height: 20, cursor: 'pointer', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Staff table list */}
          <div style={{ overflowX: 'auto', background: '#111118', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 780 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Employee</th>
                  <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Clearance Role</th>
                  <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Authorized Modules</th>
                  <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' }}>Clearance & Security</th>
                  <th style={{ padding: '14px 18px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' }}>Remove Access</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13.5 }}>
                      No staff accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map(s => {
                    const isSelf = s.email === user?.email;
                    const isSuper = s.role === 'SUPER_ADMIN';
                    const activePermissions = isSuper
                      ? PERMISSION_MODULES.map(m => m.key)
                      : (s.permissions || ['dashboard', 'products', 'orders']);

                    return (
                      <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Outfit' }}>
                            {s.name} {isSelf && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', marginLeft: 6 }}>You</span>}
                          </div>
                          <div style={{ fontSize: 12, color: '#93C5FD', fontFamily: 'monospace', marginTop: 2 }}>{s.email}</div>
                          {s.phone && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.phone}</div>}
                        </td>
                        
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 99,
                            background: isSuper ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)',
                            border: `1px solid ${isSuper ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
                            fontSize: 11, fontWeight: 800, color: isSuper ? '#F59E0B' : '#60A5FA', fontFamily: 'Outfit'
                          }}>
                            {isSuper ? <ShieldCheck size={12} /> : <Shield size={12} />}
                            {isSuper ? 'Super Admin' : 'Staff Member'}
                          </span>
                        </td>

                        {/* Granted Module Chips */}
                        <td style={{ padding: '14px 18px', maxWidth: 320 }}>
                          {isSuper ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '5px 12px', borderRadius: 10,
                              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                              color: '#F59E0B', fontSize: 11.5, fontWeight: 800, fontFamily: 'Outfit'
                            }}>
                              ★ Full Unrestricted Clearance (All Modules)
                            </span>
                          ) : activePermissions.length === 0 ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '4px 10px', borderRadius: 8,
                              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                              color: '#F87171', fontSize: 11, fontWeight: 700, fontFamily: 'Outfit'
                            }}>
                              <AlertTriangle size={12} /> No Modules Authorized
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {PERMISSION_MODULES.map(mod => {
                                const hasMod = activePermissions.includes(mod.key);
                                if (!hasMod) return null;
                                const ModIcon = mod.icon;
                                return (
                                  <span
                                    key={mod.key}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 4,
                                      padding: '3px 8px', borderRadius: 8,
                                      background: mod.bg, border: `1px solid ${mod.color}35`,
                                      color: mod.color, fontSize: 11, fontWeight: 700, fontFamily: 'Outfit'
                                    }}
                                  >
                                    <ModIcon size={11} /> {mod.shortLabel}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Actions (Permissions & Password) */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            {isSuperAdmin && !isSuper && (
                              <button
                                onClick={() => handleOpenPermissionsModal(s)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6,
                                  padding: '7px 12px', borderRadius: 10,
                                  background: 'rgba(16,185,129,0.14)',
                                  border: '1px solid rgba(16,185,129,0.35)',
                                  color: '#34D399', fontSize: 12, fontWeight: 800,
                                  fontFamily: 'Outfit', cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.25)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.14)'}
                                title={`Edit module permissions for ${s.name}`}
                              >
                                <SlidersHorizontal size={13} /> Edit Access
                              </button>
                            )}
                            
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleOpenPasswordModal(s)}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6,
                                  padding: '7px 12px', borderRadius: 10,
                                  background: 'rgba(59,130,246,0.14)',
                                  border: '1px solid rgba(59,130,246,0.35)',
                                  color: '#60A5FA', fontSize: 12, fontWeight: 700,
                                  fontFamily: 'Outfit', cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.25)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.14)'}
                                title={`Change password for ${s.name}`}
                              >
                                <Key size={13} /> Password
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Remove Account */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          {isSuperAdmin && !isSelf && !isSuper ? (
                            <button
                              onClick={() => handleDeleteStaff(s._id)}
                              style={{
                                padding: 8, borderRadius: 10,
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#F87171', cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.25)'}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'}
                              title="Revoke staff clearance and delete account"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Protected</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Edit Permissions Modal ── */}
      {permissionModalStaff && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%', maxWidth: 560,
              background: '#14141E', borderRadius: 24,
              border: '1.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              padding: '28px 30px', overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SlidersHorizontal size={18} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: 17, fontWeight: 900, color: '#FFFFFF' }}>Edit Module Permissions</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    Configuring access for <strong style={{ color: '#fff' }}>{permissionModalStaff.name}</strong> ({permissionModalStaff.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPermissionModalStaff(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {permissionSuccess ? (
              <div style={{ padding: 24, textAlign: 'center', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16 }}>
                <CheckCircle2 size={36} style={{ color: '#10B981', margin: '0 auto 10px' }} />
                <p style={{ color: '#10B981', fontSize: 15, fontWeight: 800, fontFamily: 'Outfit' }}>{permissionSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSavePermissions} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {permissionError && (
                  <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', fontSize: 13, fontWeight: 600 }}>
                    {permissionError}
                  </div>
                )}

                {/* Presets Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Quick Presets:
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions(PERMISSION_MODULES.map(m => m.key))}
                      style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer' }}
                    >
                      All Modules
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions(['dashboard', 'products', 'orders'])}
                      style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.3)', color: '#60A5FA', fontSize: 11, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer' }}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      style={{ padding: '4px 10px', borderRadius: 99, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171', fontSize: 11, fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer' }}
                    >
                      Revoke All
                    </button>
                  </div>
                </div>

                {/* Modules Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
                  {PERMISSION_MODULES.map(mod => {
                    const Icon = mod.icon;
                    const isSelected = selectedPermissions.includes(mod.key);
                    return (
                      <div
                        key={mod.key}
                        onClick={() => toggleModalPermission(mod.key)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 14,
                          background: isSelected ? mod.bg : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${isSelected ? mod.color : 'rgba(255,255,255,0.08)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 14
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: isSelected ? `${mod.color}25` : 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${isSelected ? mod.color : 'rgba(255,255,255,0.1)'}`
                          }}>
                            <Icon size={16} style={{ color: isSelected ? mod.color : 'rgba(255,255,255,0.6)' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.85)', fontFamily: 'Outfit' }}>
                              {mod.label}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
                              {mod.desc}
                            </div>
                          </div>
                        </div>

                        {/* Switch / Checkbox indicator */}
                        <div style={{
                          width: 22, height: 22, borderRadius: 7,
                          background: isSelected ? mod.color : 'rgba(255,255,255,0.08)',
                          border: `1.5px solid ${isSelected ? mod.color : 'rgba(255,255,255,0.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 0.15s'
                        }}>
                          {isSelected && <Check size={14} style={{ color: '#FFFFFF', strokeWidth: 3 }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit' }}>
                    Active: <strong style={{ color: '#10B981' }}>{selectedPermissions.length}</strong> of {PERMISSION_MODULES.length} modules granted
                  </div>
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setPermissionModalStaff(null)}
                      style={{
                        padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                        fontFamily: 'Outfit', background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingPermissions}
                      style={{
                        padding: '10px 24px', borderRadius: 12, fontSize: 13, fontWeight: 900,
                        fontFamily: 'Outfit', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(16,185,129,0.35)'
                      }}
                    >
                      {updatingPermissions ? 'Saving...' : 'Save Permissions'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {passwordModalStaff && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%', maxWidth: 440,
              background: '#14141E', borderRadius: 24,
              border: '1.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              padding: '28px 30px', overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={18} style={{ color: '#60A5FA' }} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: 17, fontWeight: 900, color: '#FFFFFF' }}>Change Password</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Updating credentials for <strong style={{ color: '#fff' }}>{passwordModalStaff.name}</strong></p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalStaff(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {passwordSuccess ? (
              <div style={{ padding: 20, textAlign: 'center', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16 }}>
                <CheckCircle2 size={32} style={{ color: '#10B981', margin: '0 auto 8px' }} />
                <p style={{ color: '#10B981', fontSize: 14, fontWeight: 800, fontFamily: 'Outfit' }}>{passwordSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {passwordError && (
                  <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', fontSize: 13, fontWeight: 600 }}>
                    {passwordError}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', background: '#181826',
                      border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                      color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', outline: 'none'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', background: '#181826',
                      border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: 14,
                      color: '#FFFFFF', fontSize: 14, fontFamily: 'Outfit', outline: 'none'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setPasswordModalStaff(null)}
                    style={{
                      padding: '11px 20px', borderRadius: 14, fontSize: 13.5, fontWeight: 700,
                      fontFamily: 'Outfit', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    style={{
                      padding: '11px 26px', borderRadius: 14, fontSize: 13.5, fontWeight: 900,
                      fontFamily: 'Outfit', background: 'linear-gradient(135deg, #B01C28 0%, #8A121D 100%)',
                      border: '1px solid rgba(255,255,255,0.25)', color: '#FFFFFF', cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(176,28,40,0.45)'
                    }}
                  >
                    {updatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
