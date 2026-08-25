import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('wbh_token');
    const savedUser = localStorage.getItem('wbh_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
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
      localStorage.setItem('wbh_token', data.token);
      localStorage.setItem('wbh_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      // Demo Admin & Staff Fallback for offline or fresh database instances
      const lowerEmail = email.toLowerCase().trim();
      if ((lowerEmail === 'admin@wbh.com' || lowerEmail === 'admin') && password === 'admin123') {
        const demoUser: User = { id: '650000000000000000000001', name: 'Super Admin', email: 'admin@wbh.com', role: 'SUPER_ADMIN', phone: '+94 71 444 3317' };
        localStorage.setItem('wbh_token', 'demo_admin_jwt_token_999');
        localStorage.setItem('wbh_user', JSON.stringify(demoUser));
        setToken('demo_admin_jwt_token_999');
        setUser(demoUser);
        return demoUser;
      }
      if ((lowerEmail === 'staff@wbh.com' || lowerEmail === 'staff') && password === 'staff123') {
        const demoUser: User = { id: '650000000000000000000002', name: 'Sales Staff', email: 'staff@wbh.com', role: 'STAFF', phone: '+94 77 123 4567' };
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

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isStaff = user?.role === 'STAFF' || user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
