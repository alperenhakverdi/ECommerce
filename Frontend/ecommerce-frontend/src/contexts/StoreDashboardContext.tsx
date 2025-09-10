import React, { createContext, useContext, useReducer, useMemo, useCallback, useRef } from 'react';
import { Store, StoreStats, Product, Order } from '../types';
import { storesApi } from '../services/api';

// Types for our context
interface CacheData {
  stats: StoreStats | null;
  products: Product[] | null;
  orders: Order[] | null;
  lastFetch: {
    stats: number;
    products: number;
    orders: number;
  };
}

interface StoreDashboardState {
  selectedStore: Store | null;
  activeTabIndex: number;
  loading: {
    stats: boolean;
    products: boolean;
    orders: boolean;
  };
  error: {
    stats: string | null;
    products: string | null;
    orders: string | null;
  };
}

type StoreDashboardAction = 
  | { type: 'SET_SELECTED_STORE'; payload: Store | null }
  | { type: 'SET_ACTIVE_TAB'; payload: number }
  | { type: 'SET_LOADING'; payload: { key: keyof StoreDashboardState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof StoreDashboardState['error']; value: string | null } };

interface StoreDashboardContextType {
  // State
  state: StoreDashboardState;
  cache: React.MutableRefObject<CacheData>;
  
  // Actions
  setSelectedStore: (store: Store | null) => void;
  setActiveTabIndex: (index: number) => void;
  
  // Data fetchers
  fetchStoreStats: (forceRefresh?: boolean) => Promise<StoreStats | null>;
  fetchStoreProducts: (forceRefresh?: boolean) => Promise<Product[]>;
  fetchStoreOrders: (forceRefresh?: boolean) => Promise<Order[]>;
}

const StoreDashboardContext = createContext<StoreDashboardContextType | null>(null);

// Reducer
const storeDashboardReducer = (
  state: StoreDashboardState, 
  action: StoreDashboardAction
): StoreDashboardState => {
  switch (action.type) {
    case 'SET_SELECTED_STORE':
      return { ...state, selectedStore: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabIndex: action.payload };
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: { ...state.error, [action.payload.key]: action.payload.value }
      };
    default:
      return state;
  }
};

// Initial state
const initialState: StoreDashboardState = {
  selectedStore: null,
  activeTabIndex: 0,
  loading: {
    stats: false,
    products: false,
    orders: false,
  },
  error: {
    stats: null,
    products: null,
    orders: null,
  },
};

// Provider component
export const StoreDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [state, dispatch] = useReducer(storeDashboardReducer, initialState);
  
  // Cache ref for data
  const cache = useRef<CacheData>({
    stats: null,
    products: null,
    orders: null,
    lastFetch: {
      stats: 0,
      products: 0,
      orders: 0
    }
  });

  // Action creators - memoized to prevent re-renders
  const setSelectedStore = useCallback((store: Store | null) => {
    dispatch({ type: 'SET_SELECTED_STORE', payload: store });
  }, []);

  const setActiveTabIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: index });
  }, []);

  const setLoading = useCallback((key: keyof StoreDashboardState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  }, []);

  const setError = useCallback((key: keyof StoreDashboardState['error'], value: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value } });
  }, []);

  // Data fetchers with smart caching
  const fetchStoreStats = useCallback(async (forceRefresh = false): Promise<StoreStats | null> => {
    if (!state.selectedStore) return null;

    // Check cache first (5 minutes cache)
    const now = Date.now();
    const cacheAge = now - cache.current.lastFetch.stats;
    const isCacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes

    if (!forceRefresh && cache.current.stats && isCacheValid) {
      return cache.current.stats;
    }

    try {
      setLoading('stats', true);
      setError('stats', null);

      // Fetch store stats from API
      const response = await storesApi.getStats(state.selectedStore.id);
      const storeStats = response.data;

      // Cache the data
      cache.current.stats = storeStats;
      cache.current.lastFetch.stats = now;

      return storeStats;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch store statistics';
      setError('stats', errorMessage);
      console.error('Failed to load store stats:', error);
      return null;
    } finally {
      setLoading('stats', false);
    }
  }, [state.selectedStore, setLoading, setError]);

  const fetchStoreProducts = useCallback(async (forceRefresh = false): Promise<Product[]> => {
    if (!state.selectedStore) return [];

    // Check cache first (3 minutes cache for products)
    const now = Date.now();
    const cacheAge = now - cache.current.lastFetch.products;
    const isCacheValid = cacheAge < 3 * 60 * 1000; // 3 minutes

    if (!forceRefresh && cache.current.products && isCacheValid) {
      return cache.current.products;
    }

    try {
      setLoading('products', true);
      setError('products', null);

      // Fetch store products from API
      const response = await storesApi.getProducts(state.selectedStore.id, 1, 50);
      const storeProducts = response.data || [];
      
      // Cache the data
      cache.current.products = storeProducts;
      cache.current.lastFetch.products = now;

      return storeProducts;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch store products';
      setError('products', errorMessage);
      console.error('Failed to load store products:', error);
      return [];
    } finally {
      setLoading('products', false);
    }
  }, [state.selectedStore, setLoading, setError]);

  const fetchStoreOrders = useCallback(async (forceRefresh = false): Promise<Order[]> => {
    if (!state.selectedStore) return [];

    // Check cache first (3 minutes cache for orders)
    const now = Date.now();
    const cacheAge = now - cache.current.lastFetch.orders;
    const isCacheValid = cacheAge < 3 * 60 * 1000; // 3 minutes

    if (!forceRefresh && cache.current.orders && isCacheValid) {
      return cache.current.orders;
    }

    try {
      setLoading('orders', true);
      setError('orders', null);

      // Fetch store orders from API
      const response = await storesApi.getOrders(state.selectedStore.id, 1, 50);
      const storeOrders = response.data || [];
      
      // Cache the data
      cache.current.orders = storeOrders;
      cache.current.lastFetch.orders = now;

      return storeOrders;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch store orders';
      setError('orders', errorMessage);
      console.error('Failed to load store orders:', error);
      return [];
    } finally {
      setLoading('orders', false);
    }
  }, [state.selectedStore, setLoading, setError]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    cache,
    setSelectedStore,
    setActiveTabIndex,
    fetchStoreStats,
    fetchStoreProducts,
    fetchStoreOrders,
  }), [
    state,
    cache,
    setSelectedStore,
    setActiveTabIndex,
    fetchStoreStats,
    fetchStoreProducts,
    fetchStoreOrders,
  ]);

  return (
    <StoreDashboardContext.Provider value={contextValue}>
      {children}
    </StoreDashboardContext.Provider>
  );
};

// Custom hook to use the context
export const useStoreDashboard = (): StoreDashboardContextType => {
  const context = useContext(StoreDashboardContext);
  if (!context) {
    throw new Error('useStoreDashboard must be used within a StoreDashboardProvider');
  }
  return context;
};