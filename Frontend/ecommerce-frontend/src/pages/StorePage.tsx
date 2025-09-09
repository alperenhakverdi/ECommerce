import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  Button,
  Grid,
  Card,
  CardBody,
  Skeleton,
  Alert,
  AlertIcon,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiMapPin, FiPhone, FiMail, FiExternalLink, FiStar, FiShoppingBag } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Store, Product } from '../types';
import { storesApi } from '../services/api';
import ProductCard from '../components/Product/ProductCard';

const StorePage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    
    fetchStore();
    fetchStoreProducts();
  }, [id]);

  const fetchStore = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storesApi.getById(id!);
      setStore(response.data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to load store';
      setError(errorMessage);
      toast({
        title: t('common.error'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await storesApi.getProducts(id!, 1, 20);
      setProducts(response.data);
    } catch (error: any) {
      console.error('Failed to load store products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Skeleton height="200px" width="100%" />
          <Skeleton height="100px" width="100%" />
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6} width="100%">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height="400px" />
            ))}
          </Grid>
        </VStack>
      </Container>
    );
  }

  if (error || !store) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error || t('store.notFound')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Store Header */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            {/* Banner */}
            {store.bannerUrl && (
              <Box
                height="200px"
                width="100%"
                borderRadius="lg"
                overflow="hidden"
                mb={6}
                bg="gray.100"
              >
                <Image
                  src={store.bannerUrl}
                  alt={`${store.name} banner`}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  fallback={<Box height="100%" bg="gray.200" />}
                />
              </Box>
            )}

            <VStack spacing={6} align="stretch">
              {/* Store Info Header */}
              <HStack spacing={4} align="start">
                <Avatar
                  src={store.logoUrl}
                  name={store.name}
                  size="xl"
                  bg="blue.500"
                />
                
                <VStack align="start" flex={1} spacing={2}>
                  <HStack spacing={3}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {store.name}
                    </Text>
                    {store.isApproved && (
                      <Badge colorScheme="green" size="sm">
                        {t('store.verified')}
                      </Badge>
                    )}
                  </HStack>

                  <Text color="gray.600" fontSize="md">
                    {store.description}
                  </Text>

                  {/* Store Stats */}
                  <HStack spacing={6} mt={2}>
                    <HStack spacing={1}>
                      <FiStar />
                      <Text fontWeight="medium">
                        {store.rating.toFixed(1)} {t('store.rating')}
                      </Text>
                    </HStack>
                    
                    <HStack spacing={1}>
                      <FiShoppingBag />
                      <Text>
                        {store.totalProducts} {t('store.products')}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>

              <Divider />

              {/* Store Statistics */}
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
                <Stat>
                  <StatLabel>{t('store.totalSales')}</StatLabel>
                  <StatNumber>{store.totalSales.toLocaleString()}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>{t('store.totalProducts')}</StatLabel>
                  <StatNumber>{store.totalProducts}</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>{t('store.rating')}</StatLabel>
                  <StatNumber>{store.rating.toFixed(1)}/5.0</StatNumber>
                </Stat>
                
                <Stat>
                  <StatLabel>{t('store.memberSince')}</StatLabel>
                  <StatNumber fontSize="md">
                    {new Date(store.createdAt).getFullYear()}
                  </StatNumber>
                </Stat>
              </Grid>

              <Divider />

              {/* Contact Information */}
              <VStack align="start" spacing={3}>
                <Text fontSize="lg" fontWeight="semibold">
                  {t('store.contactInfo')}
                </Text>
                
                <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4} width="100%">
                  <HStack spacing={3}>
                    <FiMapPin />
                    <Text>{store.businessAddress}</Text>
                  </HStack>
                  
                  <HStack spacing={3}>
                    <FiMail />
                    <Text>{store.contactEmail}</Text>
                  </HStack>
                  
                  <HStack spacing={3}>
                    <FiPhone />
                    <Text>{store.contactPhone}</Text>
                  </HStack>
                  
                  {store.website && (
                    <HStack spacing={3}>
                      <FiExternalLink />
                      <Button
                        as="a"
                        href={store.website}
                        target="_blank"
                        variant="link"
                        colorScheme="blue"
                        size="sm"
                      >
                        {t('store.visitWebsite')}
                      </Button>
                    </HStack>
                  )}
                </Grid>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Products Section */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={6}>
            {t('store.ourProducts')}
          </Text>

          {productsLoading ? (
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} height="400px" />
              ))}
            </Grid>
          ) : products.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              {t('store.noProducts')}
            </Alert>
          ) : (
            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Grid>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default StorePage;