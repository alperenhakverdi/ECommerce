import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useColorModeValue,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { ProductSearchResponse, ProductSortField, ProductSortDirection, ProductSearchFilters, Category, Store } from '../../types';
import ProductCard from '../Product/ProductCard';

interface SearchResultsProps {
  searchResponse: ProductSearchResponse | null;
  filters: ProductSearchFilters;
  sortBy: ProductSortField;
  sortDirection: ProductSortDirection;
  onSortChange: (sortBy: ProductSortField, sortDirection?: ProductSortDirection) => void;
  onLoadMore?: () => void;
  isLoading: boolean;
  isLoadingMore?: boolean;
  availableCategories: Category[];
  availableStores: Store[];
  priceRange: { min: number; max: number };
  pageSize?: number;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResponse,
  filters,
  sortBy,
  sortDirection,
  onSortChange,
  onLoadMore,
  isLoading,
  isLoadingMore = false,
  availableCategories,
  availableStores,
  priceRange,
  pageSize,
}) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [ProductSortField, ProductSortDirection];
    onSortChange(field, direction);
  };

  const getSortValue = () => {
    return `${sortBy}-${sortDirection}`;
  };

  const getResultsText = () => {
    if (!searchResponse) return '';
    
    const { totalCount, currentPage, products } = searchResponse;
    const page = Number(currentPage) || 1;
    const perPage = pageSize || products.length || 0;
    const startItem = totalCount > 0 ? (page - 1) * perPage + 1 : 0;
    const endItem = Math.min((page - 1) * perPage + (products.length || 0), totalCount);
    
    if (totalCount === 0) {
      return 'No products found';
    }
    
    return `Showing ${startItem}-${endItem} of ${totalCount} products`;
  };

  const getActiveFiltersText = () => {
    const activeFilters = [];
    
    if (filters.searchTerm) {
      activeFilters.push(`"${filters.searchTerm}"`);
    }
    
    if (filters.categoryId && availableCategories?.length) {
      const category = availableCategories.find(c => c.id === filters.categoryId);
      if (category) {
        activeFilters.push(`Category: ${category.name}`);
      }
    }
    
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        activeFilters.push(`Price: $${filters.minPrice} - $${filters.maxPrice}`);
      } else if (filters.minPrice !== undefined) {
        activeFilters.push(`Price ≥ $${filters.minPrice}`);
      } else if (filters.maxPrice !== undefined) {
        activeFilters.push(`Price ≤ $${filters.maxPrice}`);
      }
    }
    
    
    if (filters.storeId && availableStores?.length) {
      const store = availableStores.find(s => s.id === filters.storeId);
      if (store) {
        activeFilters.push(`Store: ${store.name}`);
      }
    }
    
    if (filters.inStockOnly) {
      activeFilters.push('In Stock');
    }

    if (filters.gender) {
      const label = filters.gender === 'women' ? 'Women' : filters.gender === 'men' ? 'Men' : 'Unisex';
      activeFilters.push(`Gender: ${label}`);
    }
    
    return activeFilters;
  };

  if (isLoading && !searchResponse) {
    return (
      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={8}
        textAlign="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Searching products...</Text>
        </VStack>
      </Box>
    );
  }

  const activeFilters = getActiveFiltersText();

  return (
    <VStack spacing={6} align="stretch">
      {/* Results Header */}
      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
      >
        <VStack spacing={4} align="stretch">
          {/* Results Count and Sort */}
          <HStack justify="space-between" align="center" wrap="wrap">
            <Text fontSize="lg" fontWeight="semibold">
              {getResultsText()}
            </Text>
            
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.600">
                Sort by:
              </Text>
              <Select
                size="sm"
                width="200px"
                value={getSortValue()}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="rating-desc">Rating (High to Low)</option>
                <option value="rating-asc">Rating (Low to High)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </Select>
            </HStack>
          </HStack>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <>
              <Divider />
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  Active filters:
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  {activeFilters.map((filter, index) => (
                    <Badge key={index} colorScheme="blue" variant="subtle">
                      {filter}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </>
          )}
        </VStack>
      </Box>

      {/* Results Grid */}
      {searchResponse && searchResponse.products.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
          {searchResponse.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      ) : searchResponse && searchResponse.products.length === 0 ? (
        <Box
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={8}
          textAlign="center"
        >
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <VStack spacing={2} align="start">
              <Text fontWeight="semibold">No products found</Text>
              <Text fontSize="sm">
                Try adjusting your search criteria or removing some filters.
              </Text>
            </VStack>
          </Alert>
        </Box>
      ) : null}

      {/* Load More Button */}
      {searchResponse && searchResponse.hasNextPage && onLoadMore && (
        <Box textAlign="center">
          <Button
            onClick={onLoadMore}
            isLoading={isLoadingMore}
            loadingText="Loading more..."
            variant="outline"
            size="lg"
          >
            Load More Products
          </Button>
        </Box>
      )}

      {/* Loading Overlay for Load More */}
      {isLoadingMore && (
        <Box textAlign="center" py={4}>
          <HStack justify="center" spacing={2}>
            <Spinner size="sm" />
            <Text fontSize="sm" color="gray.600">
              Loading more products...
            </Text>
          </HStack>
        </Box>
      )}
    </VStack>
  );
};

export default SearchResults;
