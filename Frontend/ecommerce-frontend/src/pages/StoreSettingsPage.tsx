import React, { useCallback, useEffect, useState } from 'react';
import { Container, VStack, Skeleton, Alert, AlertIcon } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Store } from '../types';
import { storesApi } from '../services/api';
import { StoreDashboardProvider } from '../contexts/StoreDashboardContext';
import { SettingsTab } from '../components/Dashboard/SettingsTab';

const StoreSettingsContent: React.FC = () => {
  const { t } = useTranslation();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMyStore = useCallback(async () => {
    try {
      setLoading(true);
      const res = await storesApi.getMyStores();
      const first = (res.data || [])[0] || null;
      if (!first) {
        setError('No store found for this account.');
      }
      setStore(first);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMyStore(); }, [loadMyStore]);

  const handleUpdateStore = async (storeId: string, data: Partial<Store>) => {
    await storesApi.update(storeId, data as any);
    await loadMyStore();
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Skeleton height="160px" width="100%" />
          <Skeleton height="200px" width="100%" />
        </VStack>
      </Container>
    );
  }

  if (error || !store) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error || 'No store found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <SettingsTab store={store} loading={false} error={null} onUpdateStore={handleUpdateStore} />
    </Container>
  );
};

const StoreSettingsPage: React.FC = () => {
  return (
    <StoreDashboardProvider>
      <StoreSettingsContent />
    </StoreDashboardProvider>
  );
};

export default StoreSettingsPage;

