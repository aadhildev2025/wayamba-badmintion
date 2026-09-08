import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2, Shield, RefreshCw, X, Key, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: 'STAFF' | 'SUPER_ADMIN';
  phone?: string;
  createdAt: string;
}

export default function AdminCustomers() {
  const { user } = useAuth();
  
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
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Change password modal state
  const [passwordModalStaff, setPasswordModalStaff] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/auth/staff')
      .then((staffRes) => {
        setStaff(staffRes.data || []);
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

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword) {
      alert('Name, email, and password are required');
      return;
    }

    setSubmittingStaff(true);
    try {
      const { data } = await api.post('/auth/staff', {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        phone: staffPhone || undefined,
        role: 'STAFF',
      });
      setStaff(prev => [data, ...prev]);
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffPhone('');
      setShowStaffForm(false);
      alert('Staff account created successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
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
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
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
          <h2 style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 900, color: '#FFFFFF', marginBottom: 4, letterSpacing: '-0.5px' }}>Staff Management</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Manage staff clearance credentials, create team accounts, and update passwords for all administrative users.</p>
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
            <Plus size={16} /> {showStaffForm ? 'Close Form' : 'Add Staff Account'}
          </button>
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
                padding: '26px 28px',
                background: '#14141E',
                borderRadius: 20,
                border: '1.5px solid rgba(255,255,255,0.14)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
                <h4 style={{ fontFamily: 'Outfit', fontSize: 16, fontWeight: 900, color: 'var(--red-vivid)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={18} /> Issue New Employee Access Credentials
                </h4>
                <button type="button" onClick={() => setShowStaffForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Wayamba Badminton"
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
                    <label style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Email (Login Username)</label>
                    <input
                      type="email"
                      placeholder="e.g. staff@wbh.com"
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
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
                    {submittingStaff ? 'Registering...' : 'Register Employee Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Search bar & count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>Store Staff & Admin Accounts ({filteredStaff.length})</h3>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 650 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Staff Name</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Email Address</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Clearance Role</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' }}>Change Password</th>
                  <th style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' }}>Remove Access</th>
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
                    return (
                      <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Outfit' }}>
                          {s.name} {isSelf && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', marginLeft: 6 }}>You</span>}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: '#93C5FD', fontFamily: 'monospace' }}>{s.email}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 11, fontWeight: 800, color: isSuper ? '#F59E0B' : '#60A5FA', fontFamily: 'Outfit'
                          }}>
                            <Shield size={12} /> {isSuper ? 'Super Admin' : 'Sales Staff'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleOpenPasswordModal(s)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', borderRadius: 10,
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
                            <Key size={13} /> Change Password
                          </button>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          {!isSelf && !isSuper ? (
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
                              title="Revoke staff authorization"
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

      {/* Change Password Modal */}
      {passwordModalStaff && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
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
