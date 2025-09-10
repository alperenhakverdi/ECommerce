import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStoreDashboard } from '../contexts/StoreDashboardContext';
import { useTabNavigation } from './useTabNavigation';
import { StoreStats, Product, Order } from '../types';

export interface UseStoreDataReturn {
  // Data
  stats: StoreStats | null;
  products: Product[];
  orders: Order[];
  
  // Loading states
  isLoading: boolean;
  loadingStates: {
    stats: boolean;
    products: boolean;
    orders: boolean;
  };
  
  // Error states
  errors: {
    stats: string | null;
    products: string | null;
    orders: string | null;
  };
  
  // Actions
  refreshData: (type?: 'stats' | 'products' | 'orders') => Promise<void>;
  refreshCurrentTabData: () => Promise<void>;
}

export const useStoreData = (): UseStoreDataReturn => {
  const { 
    state, 
    fetchStoreStats, 
    fetchStoreProducts, 
    fetchStoreOrders 
  } = useStoreDashboard();
  
  const { getTabFromUrl } = useTabNavigation();

  // Local state for data
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Memoized loading state
  const isLoading = useMemo(() => {
    return state.loading.stats || state.loading.products || state.loading.orders;
  }, [state.loading]);

  // Refresh specific data type
  const refreshData = useCallback(async (type?: 'stats' | 'products' | 'orders') => {
    if (!state.selectedStore) return;

    try {
      switch (type) {
        case 'stats':
          const statsData = await fetchStoreStats(true);
          if (statsData) setStats(statsData);
          break;
        case 'products':
          const productsData = await fetchStoreProducts(true);
          setProducts(productsData);
          break;
        case 'orders':
          const ordersData = await fetchStoreOrders(true);
          setOrders(ordersData);
          break;
        default:
          // Refresh all data
          const [statsRes, productsRes, ordersRes] = await Promise.allSettled([
            fetchStoreStats(true),
            fetchStoreProducts(true),
            fetchStoreOrders(true)
          ]);
          
          if (statsRes.status === 'fulfilled' && statsRes.value) {
            setStats(statsRes.value);
          }
          if (productsRes.status === 'fulfilled') {
            setProducts(productsRes.value);
          }
          if (ordersRes.status === 'fulfilled') {
            setOrders(ordersRes.value);
          }
          break;
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [state.selectedStore, fetchStoreStats, fetchStoreProducts, fetchStoreOrders]);

  // Refresh current tab data only
  const refreshCurrentTabData = useCallback(async () => {
    const currentTab = getTabFromUrl();
    
    switch (currentTab) {
      case 'statistics':
        await refreshData('stats');
        break;
      case 'products':
        await refreshData('products');
        break;
      case 'orders':
        await refreshData('orders');
        break;
      default:
        break;
    }
  }, [getTabFromUrl, refreshData]);

  // Load data when selectedStore changes
  useEffect(() => {
    if (state.selectedStore) {
      // Load all data when store is selected
      const loadAllData = async () => {
        const [statsRes, productsRes, ordersRes] = await Promise.allSettled([
          fetchStoreStats(),
          fetchStoreProducts(),
          fetchStoreOrders()
        ]);
        
        if (statsRes.status === 'fulfilled' && statsRes.value) {
          setStats(statsRes.value);
        }
        if (productsRes.status === 'fulfilled') {
          setProducts(productsRes.value);
        }
        if (ordersRes.status === 'fulfilled') {
          setOrders(ordersRes.value);
        }
      };

      loadAllData();
    } else {
      // Reset data when no store selected
      setStats(null);
      setProducts([]);
      setOrders([]);
    }
  }, [state.selectedStore, fetchStoreStats, fetchStoreProducts, fetchStoreOrders]);

  // Smart data prefetching based on tab switches
  useEffect(() => {
    if (!state.selectedStore) return;
    
    const currentTab = getTabFromUrl();
    const now = Date.now();
    
    // Only fetch if cache is expired for the current tab
    switch (currentTab) {
      case 'products':
        const productsCacheAge = now - (state.selectedStore ? 0 : 0); // Use cache from context
        fetchStoreProducts().then(setProducts);
        break;
      case 'orders':
        fetchStoreOrders().then(setOrders);
        break;
      case 'statistics':
        fetchStoreStats().then(data => data && setStats(data));
        break;
    }
  }, [getTabFromUrl, state.selectedStore, fetchStoreStats, fetchStoreProducts, fetchStoreOrders]);

  return {
    // Data
    stats,
    products,
    orders,
    
    // Loading states
    isLoading,
    loadingStates: state.loading,
    
    // Error states
    errors: state.error,
    
    // Actions
    refreshData,
    refreshCurrentTabData,
  };
};