import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { FiRefreshCw, FiShoppingCart } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types';
import { productsApi } from '../../services/api';
import ProductCard from './ProductCard';

interface CrossSellProductsProps {
  title?: string;
  subtitle?: string;
  basedOnProducts?: string[]; // Product IDs that user has shown interest in
  maxItems?: number;
  showAddToCartButton?: boolean;
}

const CrossSellProducts: React.FC<CrossSellProductsProps> = ({
  title,
  subtitle,
  basedOnProducts = [],
  maxItems = 6,
  showAddToCartButton = false
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Get title based on context
  const getTitle = () => {
    if (title) return title;
    if (basedOnProducts.length > 0) {
      return t('recommendations.basedOnYourInterests');
    }
    return t('recommendations.youMightAlsoLike');
  };

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    if (basedOnProducts.length > 0) {
      return t('recommendations.personalizedForYou');
    }
    return t('recommendations.popularProducts');
  };

  useEffect(() => {
    fetchCrossSellProducts();
  }, [basedOnProducts.join(','), maxItems]); // Use join to avoid array reference issues

  const fetchCrossSellProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (basedOnProducts.length > 0) {
        // Get categories from the products user is interested in
        // Then find products from those categories
        // For now, just get highly rated products as a simplified approach
        response = await productsApi.searchAdvanced({
          sortBy: 'popularity',
          sortDirection: 'desc',
          pageSize: maxItems * 2, // Get more to filter out any that might be in basedOnProducts
          page: 1
        });
      } else {
        // Get trending/popular products
        response = await productsApi.searchAdvanced({
          sortBy: 'popularity',
          sortDirection: 'desc',
          pageSize: maxItems,
          page: 1,
          inStockOnly: true
        });
      }
      
      // Filter out products that are in the basedOnProducts list - handle axios response format
      const allProducts = response.data?.products || [];
      // Remove debug logs to reduce console noise
      // console.log('Cross-sell API Response:', response.data);
      // console.log('Extracted cross-sell products:', allProducts);
      
      const filteredProducts = allProducts
        .filter(p => !basedOnProducts.includes(p.id))
        .slice(0, maxItems);
      
      setProducts(filteredProducts);
      
    } catch (error: any) {
      console.error('Failed to fetch cross-sell products:', error);
      setError('Failed to load product recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCrossSellProducts();
  };

  if (loading) {
    return (
      <Box bg={bgColor} borderRadius="lg" p={6} borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Skeleton height="24px" width="250px" />
              <Skeleton height="16px" width="200px" />
            </VStack>
            <Skeleton height="32px" width="80px" />
          </HStack>
          <Grid 
            templateColumns={{ 
              base: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)', 
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)' 
            }} 
            gap={4}
          >
            {Array.from({ length: maxItems }).map((_, index) => (
              <Box key={index}>
                <Skeleton height="200px" borderRadius="md" />
                <VStack spacing={2} mt={3} align="stretch">
                  <Skeleton height="16px" />
                  <Skeleton height="20px" width="60%" />
                  <Skeleton height="32px" />
                </VStack>
              </Box>
            ))}
          </Grid>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bgColor} borderRadius="lg" p={6} borderWidth="1px" borderColor={borderColor}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
          <Button ml="auto" size="sm" onClick={handleRefresh} leftIcon={<FiRefreshCw />}>
            {t('common.retry')}
          </Button>
        </Alert>
      </Box>
    );
  }

  if (products.length === 0) {
    return null; // Don't show anything if no products
  }

  return (
    <Box bg={bgColor} borderRadius="lg" p={6} borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Text fontSize="xl" fontWeight="bold">
              {getTitle()}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {getSubtitle()}
            </Text>
          </VStack>
          
          <IconButton
            aria-label={t('recommendations.refresh')}
            icon={<FiRefreshCw />}
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            isLoading={loading}
          />
        </HStack>

        {/* Products Grid */}
        <Grid 
          templateColumns={{ 
            base: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)' 
          }} 
          gap={4}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>

        {/* Call to Action */}
        <Box textAlign="center" pt={4}>
          <Button 
            variant="outline" 
            size="md"
            leftIcon={<FiShoppingCart />}
            onClick={() => {
              // Navigate to products/search page
              window.location.href = '/search';
            }}
          >
            {t('recommendations.exploreMore')}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default CrossSellProducts;