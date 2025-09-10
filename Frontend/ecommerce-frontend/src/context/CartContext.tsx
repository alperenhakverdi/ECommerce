import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Cart, AddToCartRequest } from '../types';
import { cartApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'LOADING' }
  | { type: 'CART_LOADED'; payload: Cart }
  | { type: 'ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'CART_LOADED':
      return { ...state, cart: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface CartContextType extends CartState {
  loadCart: () => Promise<void>;
  addToCart: (item: AddToCartRequest) => Promise<void>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getUserId: () => string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    loading: false,
    error: null,
  });

  // Guest cart helpers (localStorage)
  const GUEST_CART_KEY = 'guest_cart';

  type GuestCart = { items: Array<{ productId: string; quantity: number }> };

  const getGuestCart = (): GuestCart => {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) return { items: [] };
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.items)) return parsed as GuestCart;
      return { items: [] };
    } catch {
      return { items: [] };
    }
  };

  const saveGuestCart = (cart: GuestCart) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  };

  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
  };

  const getGuestTotalItems = (): number => {
    const gc = getGuestCart();
    return gc.items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  };

  // Get authenticated user ID or return null for guest users
  const getUserId = () => {
    return isAuthenticated && user ? user.id : null;
  };

  const loadCart = async () => {
    const userId = getUserId();
    if (!userId) {
      // Guest user - reflect guest cart total only
      dispatch({
        type: 'CART_LOADED',
        payload: {
          id: '',
          userId: '',
          items: [],
          totalAmount: 0,
          totalItems: getGuestTotalItems(),
        },
      });
      return;
    }

    try {
      dispatch({ type: 'LOADING' });
      const response = await cartApi.get(userId);
      dispatch({ type: 'CART_LOADED', payload: response.data });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (item: AddToCartRequest) => {
    const userId = getUserId();
    if (!userId) {
      // Guest mode: store items locally and update count
      const gc = getGuestCart();
      const idx = gc.items.findIndex(i => i.productId === item.productId);
      if (idx >= 0) {
        gc.items[idx].quantity += item.quantity;
      } else {
        gc.items.push({ productId: item.productId, quantity: item.quantity });
      }
      saveGuestCart(gc);
      dispatch({
        type: 'CART_LOADED',
        payload: {
          id: '',
          userId: '',
          items: [],
          totalAmount: 0,
          totalItems: getGuestTotalItems(),
        },
      });
      return;
    }

    try {
      dispatch({ type: 'LOADING' });
      const response = await cartApi.addItem(userId, item);
      dispatch({ type: 'CART_LOADED', payload: response.data });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: 'Failed to add item to cart' });
    }
  };

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    const userId = getUserId();
    if (!userId) {
      // Treat cartItemId as productId in guest cart
      const gc = getGuestCart();
      const idx = gc.items.findIndex(i => i.productId === cartItemId);
      if (idx >= 0) {
        if (quantity <= 0) gc.items.splice(idx, 1);
        else gc.items[idx].quantity = quantity;
        saveGuestCart(gc);
      }
      dispatch({
        type: 'CART_LOADED',
        payload: {
          id: '',
          userId: '',
          items: [],
          totalAmount: 0,
          totalItems: getGuestTotalItems(),
        },
      });
      return;
    }

    try {
      dispatch({ type: 'LOADING' });
      if (quantity <= 0) {
        await cartApi.removeItem(userId, cartItemId);
      } else {
        await cartApi.updateItem(userId, cartItemId, quantity);
      }
      await loadCart();
    } catch (error) {
      dispatch({ type: 'ERROR', payload: 'Failed to update cart item' });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    const userId = getUserId();
    if (!userId) {
      const gc = getGuestCart();
      const next = { items: gc.items.filter(i => i.productId === cartItemId ? false : true) } as GuestCart;
      saveGuestCart(next);
      dispatch({
        type: 'CART_LOADED',
        payload: {
          id: '',
          userId: '',
          items: [],
          totalAmount: 0,
          totalItems: getGuestTotalItems(),
        },
      });
      return;
    }

    try {
      dispatch({ type: 'LOADING' });
      await cartApi.removeItem(userId, cartItemId);
      await loadCart();
    } catch (error) {
      dispatch({ type: 'ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const clearCart = async () => {
    const userId = getUserId();
    if (!userId) {
      clearGuestCart();
      dispatch({
        type: 'CART_LOADED',
        payload: {
          id: '',
          userId: '',
          items: [],
          totalAmount: 0,
          totalItems: 0,
        },
      });
      return;
    }

    try {
      dispatch({ type: 'LOADING' });
      await cartApi.clear(userId);
      await loadCart();
    } catch (error) {
      dispatch({ type: 'ERROR', payload: 'Failed to clear cart' });
    }
  };

  useEffect(() => {
    const mergeGuestCartIfNeeded = async () => {
      if (!authLoading && isAuthenticated && user) {
        const gc = getGuestCart();
        if (gc.items.length > 0) {
          try {
            dispatch({ type: 'LOADING' });
            for (const it of gc.items) {
              await cartApi.addItem(user.id, { productId: it.productId, quantity: it.quantity });
            }
            clearGuestCart();
          } catch (e) {
            // Ignore merge failures silently to not block UI
          }
        }
        await loadCart();
      }
      if (!authLoading && !isAuthenticated) {
        // Reflect guest totals when logged out
        await loadCart();
      }
    };

    mergeGuestCartIfNeeded();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        loadCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        getUserId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
