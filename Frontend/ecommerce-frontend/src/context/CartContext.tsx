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

  // Get authenticated user ID or return null for guest users
  const getUserId = () => {
    return isAuthenticated && user ? user.id : null;
  };

  const loadCart = async () => {
    const userId = getUserId();
    if (!userId) {
      // Guest user - set empty cart
      dispatch({ 
        type: 'CART_LOADED', 
        payload: { 
          id: '', 
          userId: '', 
          items: [], 
          totalAmount: 0, 
          totalItems: 0 
        } 
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
      dispatch({ type: 'ERROR', payload: 'Please login to add items to cart' });
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
      dispatch({ type: 'ERROR', payload: 'Please login to update cart items' });
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
      dispatch({ type: 'ERROR', payload: 'Please login to remove cart items' });
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
      dispatch({ type: 'ERROR', payload: 'Please login to clear cart' });
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
    if (!authLoading) {
      loadCart();
    }
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