import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  VStack,
  Text,
  Box,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Product, Category, Banner } from '../types';
import { productsApi, categoriesApi, bannerApi } from '../services/api';
import EnhancedProductCard from '../components/Product/EnhancedProductCard';
import BannerCarousel from '../components/Homepage/BannerCarousel';
import QuickAccessBar from '../components/Homepage/QuickAccessBar';
import FeaturedCategories from '../components/Homepage/FeaturedCategories';
import RecentlyViewed from '../components/Homepage/RecentlyViewed';
import TrustElements from '../components/Homepage/TrustElements';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery] = useState('');
  const [selectedCategory] = useState('');
  const [sortBy] = useState('featured');
  const [showAll, setShowAll] = useState(false);
  
  // Color mode values at component level
  const headingColor = useColorModeValue("gray.900", "white");
  const textColor = useColorModeValue("gray.600", "gray.300");
  
  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    loadAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllData = async () => {
    await Promise.all([
      loadBanners(),
      loadCategories(),
      loadProducts(),
    ]);
  };

  const loadBanners = async () => {
    try {
      setBannersLoading(true);
      const response = await bannerApi.getActive();
      setBanners(response.data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setBannersLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      console.log('📦 Products loaded from API:', response.data?.length || 0, 'products');
      
      let productsData = response.data || [];
      
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (err) {
      console.error('❌ Failed to load products:', err);
      setError(t('products.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'featured':
      default:
        // Keep original order for featured
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleLoadMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
  };

  // Calculate pagination
  const displayedProducts = filteredProducts.slice(0, showAll ? filteredProducts.length : PRODUCTS_PER_PAGE);
  const hasMoreProducts = filteredProducts.length > PRODUCTS_PER_PAGE;

  if (loading) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>{t('products.loading')}</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={{ base: 6, md: 12 }}>
      <VStack spacing={{ base: 8, md: 12, lg: 16 }} align="stretch">
        {/* Hero Section - Banner + Quick Access Bar */}
        <Box>
          <VStack spacing={{ base: 6, md: 8 }} align="stretch">
            <BannerCarousel banners={banners} isLoading={bannersLoading} />
            <QuickAccessBar />
          </VStack>
        </Box>

        {/* Categories Section */}
        <Box py={{ base: 0, md: 0 }}>
          <FeaturedCategories 
            categories={categories} 
            isLoading={categoriesLoading}
            title={t('categories.shopByCategory')}
            subtitle={t('categories.discoverProducts')}
          />
        </Box>

        {/* Recently Viewed Section */}
        <Box py={{ base: 0, md: 0 }}>
          <RecentlyViewed />
        </Box>

        {/* Featured Products Section */}
        <Box py={{ base: 0, md: 0 }}>
          <VStack spacing={{ base: 8, md: 10 }} align="stretch">
            <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
              <Heading 
                as="h2"
                size={{ base: "xl", md: "2xl" }} 
                fontWeight="800"
                color={headingColor}
                letterSpacing="tight"
                lineHeight="shorter"
              >
                {t('homepage.featuredProducts')}
              </Heading>
              <Text 
                fontSize={{ base: "lg", md: "xl" }}
                color={textColor}
                maxW="640px"
                lineHeight="relaxed"
                fontWeight="400"
              >
                {t('homepage.featuredDescription')}
              </Text>
            </VStack>

            {/* Product Grid - Simplified */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={{ base: 4, md: 6 }}>
              {displayedProducts.map((product, index) => {
                // Enhanced product data for consistent styling
                const enhancedProduct = {
                  ...product,
                  originalPrice: index % 3 === 0 ? product.price * 1.25 : undefined,
                  isNew: index % 4 === 0,
                  isFeatured: index % 5 === 0,
                  tags: index % 6 === 0 ? ['HOT'] : undefined,
                };
                
                return (
                  <EnhancedProductCard key={product.id} product={enhancedProduct} />
                );
              })}
            </SimpleGrid>

            {/* Load More Controls */}
            {hasMoreProducts && (
              <Center>
                <VStack spacing={3}>
                  {!showAll ? (
                    <Button
                      bg="transparent"
                      color="orange.400"
                      border="2px solid"
                      borderColor="orange.400"
                      onClick={handleLoadMore}
                      size="lg"
                      borderRadius="xl"
                      px={8}
                      fontWeight="600"
                      _hover={{
                        bg: "orange.400",
                        color: "white",
                        borderColor: "orange.400",
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(251, 146, 60, 0.25)',
                      }}
                      transition="all 0.3s ease"
                    >
                      {t('products.loadMore')} ({filteredProducts.length - PRODUCTS_PER_PAGE} {t('products.more')})
                    </Button>
                  ) : (
                    <VStack spacing={2}>
                      <Text fontSize="sm" color="gray.600">
                        {t('products.showingAll', { total: filteredProducts.length })}
                      </Text>
                      <Button
                        colorScheme="gray"
                        variant="ghost"
                        onClick={handleShowLess}
                        size="md"
                        borderRadius="xl"
                      >
                        {t('products.showLess')}
                      </Button>
                    </VStack>
                  )}
                  
                  <Text
                    fontSize="sm"
                    color="blue.500"
                    cursor="pointer"
                    onClick={() => navigate('/search')}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {t('products.viewAllFilters')}
                  </Text>
                </VStack>
              </Center>
            )}
          </VStack>
        </Box>

        {/* Trust Elements Section */}
        <Box py={{ base: 0, md: 0 }}>
          <TrustElements />
        </Box>

      </VStack>
    </Container>
  );
};

export default HomePage;