import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import cartService from '../services/cart.service';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: any[];
  addToCart: (product: any, variant?: { [key: string]: string }) => void;
  updateCartQuantity: (productId: string, quantity: number, variant?: { [key: string]: string }) => void;
  clearCart: () => void;
  cartItemCount: number;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<any[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (!user) {
      setCartItemCount(0);
      return;
    }

    try {
      const response = await cartService.getCartCount();
      setCartItemCount(response.data.count || 0);
    } catch {
      setCartItemCount(0);
    }
  }, [user]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  const addToCart = (product: any, variant?: { [key: string]: string }) => {
    if (!user) return;

    const payload: {
      productId: string;
      quantity: number;
      variantId?: string;
      selectedVariant?: { [key: string]: string };
    } = {
      productId: product.id,
      quantity: 1,
    };

    if (variant && Object.keys(variant).length > 0) {
      payload.selectedVariant = variant;
    }

    if (product.variantId) {
      payload.variantId = product.variantId;
    }

    cartService
      .addToCart(payload)
      .then((response) => {
        setCart(response.data.items || []);
        setCartItemCount(response.data.totalItems || 0);
      })
      .catch((error) => {
        console.error('Add to cart failed:', error);
      });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const currentItem = cart.find((item) => item.product?.id === productId);
    if (!currentItem) return;

    if (quantity <= 0) {
      cartService.removeFromCart(currentItem.id).then((response) => {
        setCart(response.data.items || []);
        setCartItemCount(response.data.totalItems || 0);
      });
      return;
    }

    cartService.updateCartItem(currentItem.id, { quantity }).then((response) => {
      setCart(response.data.items || []);
      setCartItemCount(response.data.totalItems || 0);
    });
  };

  const clearCart = () => {
    cartService
      .clearCart()
      .then(() => {
        setCart([]);
        setCartItemCount(0);
      })
      .catch((error) => {
        console.error('Clear cart failed:', error);
      });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQuantity,
        clearCart,
        cartItemCount,
        refreshCartCount,
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
