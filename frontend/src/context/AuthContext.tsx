import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
  phone?: string;
  permissions?: string[];
}

export const ALL_ADMIN_PERMISSIONS = ['dashboard', 'products', 'orders', 'reports', 'coupons', 'staff'];

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User | undefined>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUserPermissions: (permissions: string[]) => void;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('wbh_token');
    const savedUserStr = localStorage.getItem('wbh_user');
    if (savedToken && savedUserStr) {
      try {
        const parsedUser: User = JSON.parse(savedUserStr);
        if (!parsedUser.permissions || parsedUser.permissions.length === 0) {
          parsedUser.permissions = parsedUser.role === 'SUPER_ADMIN'
            ? ALL_ADMIN_PERMISSIONS
            : ['dashboard', 'products', 'orders'];
        }
        setToken(savedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    setIsLoading(false);

    // Listen for global logout events (triggered by 401s)
    const handleGlobalLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => window.removeEventListener('auth-logout', handleGlobalLogout);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const loggedUser = data.user;
      if (!loggedUser.permissions || loggedUser.permissions.length === 0) {
        loggedUser.permissions = loggedUser.role === 'SUPER_ADMIN'
          ? ALL_ADMIN_PERMISSIONS
          : ['dashboard', 'products', 'orders'];
      }
      localStorage.setItem('wbh_token', data.token);
      localStorage.setItem('wbh_user', JSON.stringify(loggedUser));
      setToken(data.token);
      setUser(loggedUser);
      return loggedUser;
    } catch (err: any) {
      // Demo Admin & Staff Fallback for offline or fresh database instances
      const lowerEmail = email.toLowerCase().trim();
      if ((lowerEmail === 'admin@wbh.com' || lowerEmail === 'admin') && password === 'admin123') {
        const demoUser: User = {
          id: '650000000000000000000001',
          name: 'Super Admin',
          email: 'admin@wbh.com',
          role: 'SUPER_ADMIN',
          phone: '+94 71 444 3317',
          permissions: ALL_ADMIN_PERMISSIONS,
        };
        localStorage.setItem('wbh_token', 'demo_admin_jwt_token_999');
        localStorage.setItem('wbh_user', JSON.stringify(demoUser));
        setToken('demo_admin_jwt_token_999');
        setUser(demoUser);
        return demoUser;
      }
      if ((lowerEmail === 'staff@wbh.com' || lowerEmail === 'staff') && password === 'staff123') {
        const demoUser: User = {
          id: '650000000000000000000002',
          name: 'Sales Staff',
          email: 'staff@wbh.com',
          role: 'STAFF',
          phone: '+94 77 123 4567',
          permissions: ['dashboard', 'products', 'orders'],
        };
        localStorage.setItem('wbh_token', 'demo_staff_jwt_token_888');
        localStorage.setItem('wbh_user', JSON.stringify(demoUser));
        setToken('demo_staff_jwt_token_888');
        setUser(demoUser);
        return demoUser;
      }
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('wbh_token', data.token);
    localStorage.setItem('wbh_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('wbh_token');
    localStorage.removeItem('wbh_user');
    setToken(null);
    setUser(null);
  };

  const updateUserPermissions = (permissions: string[]) => {
    if (user) {
      const updated = { ...user, permissions };
      setUser(updated);
      localStorage.setItem('wbh_user', JSON.stringify(updated));
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (user.role === 'STAFF') {
      return Array.isArray(user.permissions) && user.permissions.includes(permission);
    }
    return false;
  };

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isStaff = user?.role === 'STAFF' || user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUserPermissions,
        isLoading,
        isAdmin,
        isStaff,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

