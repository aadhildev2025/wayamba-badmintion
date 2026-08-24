import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  images: string[];
  brand: { name: string };
  quantity: number;
  stockQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('wbh_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wbh_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (exists) {
        return prev.map((i) =>
          i._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + qty, i.stockQuantity) }
            : i
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i._id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i._id === id ? { ...i, quantity: qty } : i)));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, i) => acc + (i.salePrice || i.price) * i.quantity, 0);
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
