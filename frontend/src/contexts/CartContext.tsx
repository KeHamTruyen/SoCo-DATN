import { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem } from '../App';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: { [key: string]: string }) => void;
  updateCartQuantity: (productId: string, quantity: number, variant?: { [key: string]: string }) => void;
  clearCart: () => void;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, variant?: { [key: string]: string }) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
      );
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number, variant?: { [key: string]: string }) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => 
        !(item.product.id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(variant))
      ));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQuantity,
        clearCart,
        cartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
