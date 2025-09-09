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
  Divider,
  Button,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types';
import { productsApi } from '../../services/api';
import ProductCard from './ProductCard';

interface ProductRecommendationsProps {
  productId: string;
  categoryId?: string;
  storeId?: string;
  type: 'similar' | 'crossSell' | 'related';
  title?: string;
  maxItems?: number;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  productId,
  categoryId,
  storeId,
  type,
  title,
  maxItems = 8
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Responsive grid columns
  const itemsPerPage = useBreakpointValue({ base: 2, md: 3, lg: 4, xl: 4 }) || 4;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Get title based on type
  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'similar':
        return t('recommendations.similarProducts');
      case 'crossSell':
        return t('recommendations.youMightAlsoLike');
      case 'related':
        return t('recommendations.relatedProducts');
      default:
        return t('recommendations.recommendedProducts');
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [productId, categoryId, storeId, type]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching recommendations:', { type, productId, categoryId, storeId });
      
      let response;
      
      switch (type) {
        case 'similar':
          // Get products from the same category, excluding current product
          response = await productsApi.searchAdvanced({
            categoryId: categoryId,
            pageSize: maxItems,
            page: 1,
            sortBy: 'name',
            sortDirection: 'asc'
          });
          break;
          
        case 'crossSell':
          // Get popular products (highest priced first to show premium items)
          response = await productsApi.searchAdvanced({
            pageSize: maxItems,
            page: 1,
            sortBy: 'price',
            sortDirection: 'desc'
          });
          break;
          
        case 'related':
          // Get products from same category, sorted by price
          response = await productsApi.searchAdvanced({
            categoryId: categoryId,
            pageSize: maxItems,
            page: 1,
            sortBy: 'price',
            sortDirection: 'asc'
          });
          break;
          
        default:
          response = await productsApi.searchAdvanced({
            pageSize: maxItems,
            page: 1,
            sortBy: 'name',
            sortDirection: 'asc'
          });
      }
      
      // Filter out the current product - handle axios response format
      const allProducts = response.data?.products || [];
      // Remove debug logs to reduce console noise
      // console.log('API Response structure:', response.data);
      // console.log('Extracted products:', allProducts);
      
      const filteredProducts = allProducts.filter(p => p.id !== productId);
      setProducts(filteredProducts);
      
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to load recommendations';
      
      if (error?.response?.status === 404) {
        errorMessage = 'No recommendations found';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error?.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const getCurrentPageProducts = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  if (loading) {
    return (
      <Box bg={bgColor} borderRadius="lg" p={6} borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Skeleton height="24px" width="200px" />
            <Skeleton height="32px" width="80px" />
          </HStack>
          <Grid 
            templateColumns={{ 
              base: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)', 
              lg: 'repeat(4, 1fr)' 
            }} 
            gap={4}
          >
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Box key={index}>
                <Skeleton height="200px" borderRadius="md" />
                <VStack spacing={2} mt={3} align="stretch">
                  <Skeleton height="16px" />
                  <Skeleton height="20px" width="60%" />
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
    return null; // Don't show anything if no recommendations
  }

  return (
    <Box bg={bgColor} borderRadius="lg" p={6} borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="xl" fontWeight="bold">
            {getTitle()}
          </Text>
          
          <HStack spacing={2}>
            {/* Refresh button */}
            <IconButton
              aria-label={t('recommendations.refresh')}
              icon={<FiRefreshCw />}
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              isLoading={loading}
            />
            
            {/* Navigation arrows */}
            {totalPages > 1 && (
              <>
                <IconButton
                  aria-label={t('common.previous')}
                  icon={<FiChevronLeft />}
                  size="sm"
                  variant="outline"
                  onClick={handlePrevious}
                  isDisabled={currentPage === 0}
                />
                <Text fontSize="sm" color="gray.500" minW="60px" textAlign="center">
                  {currentPage + 1} / {totalPages}
                </Text>
                <IconButton
                  aria-label={t('common.next')}
                  icon={<FiChevronRight />}
                  size="sm"
                  variant="outline"
                  onClick={handleNext}
                  isDisabled={currentPage === totalPages - 1}
                />
              </>
            )}
          </HStack>
        </HStack>

        <Divider />

        {/* Products Grid */}
        <Grid 
          templateColumns={{ 
            base: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          }} 
          gap={4}
        >
          {getCurrentPageProducts().map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>

        {/* View More Button */}
        {products.length > itemsPerPage && (
          <Box textAlign="center" pt={4}>
            <Button 
              variant="outline" 
              size="md"
              onClick={() => {
                // Navigate to search page with filters
                const searchParams = new URLSearchParams();
                if (categoryId && type === 'similar') {
                  searchParams.set('categoryId', categoryId);
                }
                if (storeId && type === 'crossSell') {
                  searchParams.set('storeId', storeId);
                }
                window.location.href = `/search?${searchParams.toString()}`;
              }}
            >
              {t('recommendations.viewMore')}
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ProductRecommendations;