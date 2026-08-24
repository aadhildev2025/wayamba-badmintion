import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollToTop from '@/components/ScrollToTop';

import FloatingCart from '@/components/FloatingCart';

import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import ProductDetail from '@/pages/ProductDetail';
import Checkout from '@/pages/Checkout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* ── Admin routes – no Header/Footer ── */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard/*" element={<AdminDashboard />} />

              {/* ── Public routes – with Header/Footer ── */}
              <Route
                path="/*"
                element={
                  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                    <Header />
                    <main style={{ flex: 1 }}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <Footer />
                    {/* Floating WhatsApp FAB & Floating Cart Button */}
                    <WhatsAppButton />
                    <FloatingCart />
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
