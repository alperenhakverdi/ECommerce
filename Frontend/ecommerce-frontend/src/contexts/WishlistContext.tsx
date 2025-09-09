import React, { createContext, useContext, useState, useEffect } from 'react';
import { Wishlist, WishlistItem, AddToWishlistRequest } from '../types';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Wishlist | null;
  loading: boolean;
  addToWishlist: (request: AddToWishlistRequest) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlist();
    } else {
      setWishlist(null);
    }
  }, [isAuthenticated, user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistApi.get();
      setWishlist(response.data);
    } catch (error: any) {
      // Silently handle 404 errors - wishlist might not exist yet
      // Initialize empty wishlist for 404 or other errors
      setWishlist({
        id: '',
        userId: user?.id || '',
        items: [],
        totalItems: 0,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (request: AddToWishlistRequest) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to add to wishlist');
    }

    try {
      setLoading(true);
      const response = await wishlistApi.addItem(request);
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to remove from wishlist');
    }

    try {
      setLoading(true);
      await wishlistApi.removeItem(productId);
      
      // Update local state by removing the item
      if (wishlist) {
        const updatedItems = wishlist.items.filter(item => item.productId !== productId);
        setWishlist({
          ...wishlist,
          items: updatedItems,
          totalItems: updatedItems.length,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    if (!wishlist) return false;
    return wishlist.items.some(item => item.productId === productId);
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to clear wishlist');
    }

    try {
      setLoading(true);
      await wishlistApi.clear();
      
      // Update local state to empty wishlist
      if (wishlist) {
        setWishlist({
          ...wishlist,
          items: [],
          totalItems: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshWishlist = async () => {
    if (isAuthenticated && user) {
      await fetchWishlist();
    }
  };

  const wishlistCount = wishlist?.totalItems || 0;

  const value: WishlistContextType = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    refreshWishlist,
    wishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};