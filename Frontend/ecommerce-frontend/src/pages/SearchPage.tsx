import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  useToast,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import {
  ProductSearchFilters,
  ProductSortField,
  ProductSortDirection,
  ProductSearchResponse,
  Category,
  Store,
} from '../types';
import { productsApi } from '../services/api';
import SearchBar from '../components/Search/SearchBar';
import SearchFilters from '../components/Search/SearchFilters';
import SearchResults from '../components/Search/SearchResults';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<ProductSearchFilters>({
    searchTerm: searchParams.get('q') || undefined,
    categoryId: searchParams.get('category') || undefined,
  });
  const [sortBy, setSortBy] = useState<ProductSortField>('name');
  const [sortDirection, setSortDirection] = useState<ProductSortDirection>('asc');
  const [searchResponse, setSearchResponse] = useState<ProductSearchResponse | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableStores, setAvailableStores] = useState<Store[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const pageSize = 20;

  // Load filter metadata on mount
  useEffect(() => {
    loadFilterMetadata();
  }, []);

  // Perform search when filters change
  useEffect(() => {
    if (filters.searchTerm !== undefined || Object.keys(filters).length > 1) {
      performSearch(true);
    }
  }, [filters, sortBy, sortDirection]);

  // Update URL when search parameters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.set('q', filters.searchTerm);
    if (filters.categoryId) params.set('category', filters.categoryId);
    setSearchParams(params, { replace: true });
  }, [filters.searchTerm, filters.categoryId, setSearchParams]);

  const loadFilterMetadata = async () => {
    try {
      const response = await productsApi.getSearchFilters();
      setAvailableCategories(response.data.categories);
      setAvailableStores(response.data.availableStores);
      setPriceRange(response.data.priceRange);
    } catch (error) {
      console.error('Failed to load filter metadata:', error);
      toast({
        title: 'Error',
        description: 'Failed to load search filters.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const performSearch = useCallback(async (resetPage = false) => {
    try {
      const page = resetPage ? 1 : currentPage;
      setIsLoading(resetPage);
      setIsLoadingMore(!resetPage);

      const searchRequest = {
        ...filters,
        page,
        pageSize,
        sortBy,
        sortDirection,
      };

      const response = await productsApi.searchAdvanced(searchRequest);

      if (resetPage) {
        setSearchResponse(response.data);
        setCurrentPage(1);
      } else {
        // Append results for load more
        setSearchResponse(prev => prev ? {
          ...response.data,
          products: [...prev.products, ...response.data.products],
        } : response.data);
      }
    } catch (error) {
      toast({
        title: 'Search Error',
        description: 'Failed to search products. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, sortBy, sortDirection, currentPage, pageSize, toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      searchTerm: query || undefined,
    }));
  };

  const handleFiltersChange = (newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: ProductSortField, newSortDirection?: ProductSortDirection) => {
    setSortBy(newSortBy);
    if (newSortDirection) {
      setSortDirection(newSortDirection);
    }
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (searchResponse?.hasNextPage) {
      setCurrentPage(prev => prev + 1);
      performSearch(false);
    }
  };

  const FiltersComponent = (
    <SearchFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      availableCategories={availableCategories}
      availableStores={availableStores}
      priceRange={priceRange}
      isLoading={isLoading}
    />
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Page Header */}
        <VStack spacing={4} align="stretch">
          <Text fontSize="2xl" fontWeight="bold">
            Search Products
          </Text>
          
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            size="lg"
            isLoading={isLoading}
          />
        </VStack>

        {/* Main Content */}
        <Grid
          templateColumns={{ base: '1fr', lg: '300px 1fr' }}
          gap={8}
          alignItems="start"
        >
          {/* Filters - Desktop */}
          {isDesktop && (
            <GridItem>
              {FiltersComponent}
            </GridItem>
          )}

          {/* Results */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Mobile Filter Button */}
              {!isDesktop && (
                <HStack justify="space-between">
                  <Button
                    leftIcon={<FiFilter />}
                    variant="outline"
                    onClick={onOpen}
                  >
                    Filters
                  </Button>
                </HStack>
              )}

              <SearchResults
                searchResponse={searchResponse}
                filters={filters}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                onLoadMore={handleLoadMore}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
              />
            </VStack>
          </GridItem>
        </Grid>

        {/* Mobile Filters Drawer */}
        <Drawer isOpen={isOpen} onClose={onClose} placement="left" size="sm">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Filters</DrawerHeader>
            <DrawerBody px={0}>
              {FiltersComponent}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </VStack>
    </Container>
  );
};

export default SearchPage;