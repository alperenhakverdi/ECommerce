import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Skeleton,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Store, OrderStatus } from '../types';
import { storesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { StoreDashboardProvider, useStoreDashboard } from '../contexts/StoreDashboardContext';
import { useTabNavigation } from '../hooks/useTabNavigation';
import { useStoreData } from '../hooks/useStoreData';

// Tab Components
import { StatsTab } from '../components/Dashboard/StatsTab';
import { ProductsTab } from '../components/Dashboard/ProductsTab';
import { OrdersTab } from '../components/Dashboard/OrdersTab';
// Removed SettingsTab from dashboard; available under Profile > Store Settings

// Store Application Form
import StoreApplicationForm from '../components/Store/StoreApplicationForm';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';

/**
 * Main Dashboard Content Component - Memoized for Performance
 */
const StoreDashboardContent: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { state, setSelectedStore } = useStoreDashboard();
  const { activeTabIndex, handleTabChange } = useTabNavigation();
  const { 
    stats, 
    products, 
    orders, 
    loadingStates, 
    errors, 
    refreshData 
  } = useStoreData();
  const toast = useToast();

  // Handle order status update
  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (!state.selectedStore) throw new Error('No store selected');
      await storesApi.updateOrderStatus(state.selectedStore.id, orderId, Number(newStatus));
      await refreshData('orders');
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error; // Re-throw to let the component handle the error
    }
  }, [refreshData, state.selectedStore]);

  // Handle store information update
  const handleUpdateStore = useCallback(async (storeId: string, data: Partial<Store>) => {
    try {
      // TODO: Implement actual API call
      // await storesApi.updateStore(storeId, data);
      
      console.log('Store updated:', { storeId, data });
      
      // For now, simulate the update
      if (state.selectedStore) {
        const updatedStore = { ...state.selectedStore, ...data };
        setSelectedStore(updatedStore);
      }
    } catch (error) {
      console.error('Failed to update store:', error);
      throw error; // Re-throw to let the component handle the error
    }
  }, [state.selectedStore, setSelectedStore]);

  // Memoized tab panels to prevent unnecessary re-renders
  const tabPanels = useMemo(() => {
    if (!state.selectedStore) return null;

    return (
      <TabPanels>
        {/* Statistics Tab */}
        <TabPanel p={0}>
          <StatsTab
            store={state.selectedStore}
            stats={stats}
            loading={loadingStates.stats}
            error={errors.stats}
          />
        </TabPanel>

        {/* Products Tab */}
        <TabPanel p={0}>
          <ProductsTab
            store={state.selectedStore}
            products={products}
            loading={loadingStates.products}
            error={errors.products}
            refreshProducts={() => refreshData('products')}
          />
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel p={0}>
          <OrdersTab
            orders={orders}
            loading={loadingStates.orders}
            error={errors.orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </TabPanel>

        
      </TabPanels>
    );
  }, [
    state.selectedStore,
    stats,
    products,
    orders,
    loadingStates,
    errors,
    handleUpdateOrderStatus,
    handleUpdateStore,
  ]);

  if (!state.selectedStore) {
    return null;
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header with Store Selector */}
      <Box>
        <Text fontSize="3xl" fontWeight="bold" mb={4}>
          {t('store.dashboard.title')}
        </Text>
        
        {/* TODO: Add multi-store selector if needed */}
        <Text fontSize="lg" color="gray.600">
          Managing: {state.selectedStore.name}
        </Text>
      </Box>

      {/* Optimized Tabs with Performance Features */}
      <Tabs 
        variant="enclosed" 
        index={activeTabIndex} 
        onChange={handleTabChange}
        isLazy={false}
        lazyBehavior="keepMounted"
      >
        <TabList>
          <Tab 
            _selected={{ 
              color: 'blue.600', 
              borderColor: 'blue.600',
              bg: 'blue.50' 
            }}
            transition="all 0.2s ease"
          >
            {t('store.dashboard.statistics')}
          </Tab>
          <Tab 
            _selected={{ 
              color: 'blue.600', 
              borderColor: 'blue.600',
              bg: 'blue.50' 
            }}
            transition="all 0.2s ease"
          >
            {t('store.dashboard.products')}
          </Tab>
          <Tab 
            _selected={{ 
              color: 'blue.600', 
              borderColor: 'blue.600',
              bg: 'blue.50' 
            }}
            transition="all 0.2s ease"
          >
            {t('store.dashboard.orders')}
          </Tab>
          
        </TabList>

        {tabPanels}
      </Tabs>
    </VStack>
  );
});

StoreDashboardContent.displayName = 'StoreDashboardContent';

/**
 * Store Dashboard Container Component - Handles Auth and Store Loading
 */
const StoreDashboardContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setSelectedStore } = useStoreDashboard();

  // Local state for store management
  const [myStores, setMyStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasStoreApplication, setHasStoreApplication] = useState(false);

  // Fetch user's stores
  const fetchMyStores = useCallback(async () => {
    try {
      setLoading(true);
      console.log('DASHBOARD DEBUG: Fetching user stores...');
      const response = await storesApi.getMyStores();
      console.log('DASHBOARD DEBUG: Store response:', response);
      setMyStores(response.data);
      
      if (response.data.length > 0) {
        console.log('DASHBOARD DEBUG: Found stores:', response.data.length);
        setSelectedStore(response.data[0]);
        setHasStoreApplication(true);
      } else {
        console.log('DASHBOARD DEBUG: No stores found');
        setHasStoreApplication(false);
      }
    } catch (error: any) {
      console.error('DASHBOARD DEBUG: Failed to load stores:', error);
      if (error.response?.status === 404) {
        console.log('DASHBOARD DEBUG: 404 error - user has no stores');
        setHasStoreApplication(false);
      } else {
        console.log('DASHBOARD DEBUG: Other error - assuming no stores');
        setHasStoreApplication(false);
      }
    } finally {
      setLoading(false);
    }
  }, [setSelectedStore]);

  // Handle successful store application
  const handleStoreApplicationSuccess = useCallback(() => {
    setHasStoreApplication(true);
    toast({
      title: t('store.application.success'),
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    onClose();
    fetchMyStores();
  }, [t, toast, onClose, fetchMyStores]);

  // Load stores on mount and auth change
  useEffect(() => {
    // Ensure a default tab is always present in URL for clarity
    const tab = searchParams.get('tab');
    if (!tab) {
      setSearchParams({ tab: 'statistics' }, { replace: true });
    }

    // Don't redirect while authentication is loading
    if (authLoading) return;
    
    // If not authenticated or not a store owner, redirect to home
    if (!user || !user.roles?.includes('StoreOwner')) {
      navigate('/');
      return;
    }

    fetchMyStores();
  }, [user, authLoading, navigate, fetchMyStores, searchParams, setSearchParams]);

  // Show loading while authentication is being checked or data is loading
  if (authLoading || loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Skeleton height="100px" width="100%" />
          <VStack spacing={4} width="100%">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="150px" width="100%" />
            ))}
          </VStack>
        </VStack>
      </Container>
    );
  }

  // If user hasn't applied to become a store owner or has no approved stores
  if (!hasStoreApplication || myStores.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" mb={4}>
              {t('store.dashboard.title')}
            </Text>
            <Text fontSize="lg" color="gray.600" mb={8}>
              {t('store.application.title')}
            </Text>
            
            <Alert status="info">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium">No store found</Text>
                <Text fontSize="sm">
                  If you registered as a store owner, your store should appear here automatically. 
                  Please try refreshing the page or contact support if the issue persists.
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchMyStores}
                  mt={2}
                >
                  Refresh Store Data
                </Button>
              </VStack>
            </Alert>
          </Box>
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('store.application.title')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <StoreApplicationForm onSuccess={handleStoreApplicationSuccess} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <StoreDashboardContent />
    </Container>
  );
};

/**
 * Main Store Dashboard Page - Provides Context
 */
const StoreDashboardPageNew: React.FC = () => {
  return (
    <StoreDashboardProvider>
      <StoreDashboardContainer />
    </StoreDashboardProvider>
  );
};

export default StoreDashboardPageNew;
