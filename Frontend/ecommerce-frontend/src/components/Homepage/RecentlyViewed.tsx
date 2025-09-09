import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Skeleton,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  IconButton,
} from '@chakra-ui/react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { RecentlyViewedItem } from '../../types';
import { recentlyViewedApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../Product/ProductCard';

const RecentlyViewed: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentlyViewed();
    }
  }, [isAuthenticated]);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recentlyViewedApi.get();
      setRecentlyViewed(response.data);
    } catch (error: any) {
      // Only log non-404 errors - recently viewed might not exist yet
      if (error.response?.status !== 404) {
        console.error('Failed to fetch recently viewed:', error);
        setError('Failed to load recently viewed products');
      }
      // For 404 errors, just set empty array silently
      setRecentlyViewed([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await recentlyViewedApi.remove(productId);
      setRecentlyViewed(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await recentlyViewedApi.clear();
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Failed to clear recently viewed:', error);
    }
  };

  // Don't render if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if no recently viewed items and not loading
  if (!loading && recentlyViewed.length === 0) {
    return null;
  }

  if (error) {
    return (
      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
      >
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">
              Recently Viewed
            </Text>
            <Text fontSize="sm" color="gray.600">
              Products you've recently looked at
            </Text>
          </VStack>

          {recentlyViewed.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiTrash2 />}
              onClick={handleClearAll}
              colorScheme="red"
            >
              Clear All
            </Button>
          )}
        </HStack>

        {/* Content */}
        {loading ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height="300px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : recentlyViewed.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {recentlyViewed.map((item) => (
              <Box key={item.productId} position="relative">
                {/* Remove Button */}
                <IconButton
                  aria-label="Remove from recently viewed"
                  icon={<FiX />}
                  size="xs"
                  position="absolute"
                  top={2}
                  right={2}
                  zIndex={2}
                  variant="solid"
                  colorScheme="red"
                  borderRadius="full"
                  onClick={() => handleRemoveItem(item.productId)}
                />
                
                <ProductCard product={item.product} />

                {/* Viewed timestamp */}
                <Text
                  fontSize="xs"
                  color="gray.500"
                  mt={2}
                  textAlign="center"
                >
                  Viewed {new Date(item.viewedAt).toLocaleDateString()}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">
              No recently viewed products yet. Start browsing to see your recently viewed items here.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default RecentlyViewed;