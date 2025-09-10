import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UseTabNavigationReturn {
  activeTabIndex: number;
  handleTabChange: (index: number) => void;
  getTabFromUrl: () => string;
}

const TAB_NAMES = ['statistics', 'products', 'orders', 'settings'] as const;

export const useTabNavigation = (): UseTabNavigationReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active tab index based on URL params - memoized for performance
  const activeTabIndex = useMemo(() => {
    const tab = searchParams.get('tab');
    const index = TAB_NAMES.indexOf(tab as any);
    return index >= 0 ? index : 0; // Default to Statistics tab
  }, [searchParams]);

  // Get current tab name from URL
  const getTabFromUrl = useCallback(() => {
    const tab = searchParams.get('tab');
    return TAB_NAMES.includes(tab as any) ? tab! : 'statistics';
  }, [searchParams]);

  // Handle tab change with shallow routing - memoized to prevent re-renders
  const handleTabChange = useCallback((index: number) => {
    const tabName = TAB_NAMES[index] || 'statistics';
    
    // Use replace: true for shallow routing (no page reload)
    setSearchParams({ tab: tabName }, { replace: true });
  }, [setSearchParams]);

  return {
    activeTabIndex,
    handleTabChange,
    getTabFromUrl,
  };
};