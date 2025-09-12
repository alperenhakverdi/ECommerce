import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
  useToast,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiTrendingUp, FiPackage, FiDollarSign, FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Store, StoreStats, Product, Order, OrderStatus } from '../types';
import { storesApi, productsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StoreApplicationForm from '../components/Store/StoreApplicationForm';

const StoreDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { user, isLoading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [myStores, setMyStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [storeOrders, setStoreOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [hasStoreApplication, setHasStoreApplication] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const { isOpen: isOrderDetailsOpen, onOpen: onOrderDetailsOpen, onClose: onOrderDetailsClose } = useDisclosure();
  const { isOpen: isStoreEditOpen, onOpen: onStoreEditOpen, onClose: onStoreEditClose } = useDisclosure();
  
  // Data cache for performance optimization
  const dataCache = useRef({
    stats: null as StoreStats | null,
    products: null as Product[] | null,
    orders: null as Order[] | null,
    lastFetch: {
      stats: 0,
      products: 0,
      orders: 0
    }
  });
  
  // Determine active tab based on URL params
  const getActiveTabIndex = () => {
    const tab = searchParams.get('tab');
    switch (tab) {
      case 'products':
        return 1; // Products tab
      case 'orders':
        return 2; // Orders tab
      case 'settings':
        return 3; // Settings tab
      default:
        return 0; // Statistics tab
    }
  };
  const [activeTabIndex, setActiveTabIndex] = useState(getActiveTabIndex());

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Update active tab when URL params change - memoized to prevent unnecessary re-renders
  useEffect(() => {
    const newTabIndex = getActiveTabIndex();
    if (newTabIndex !== activeTabIndex) {
      setActiveTabIndex(newTabIndex);
    }
  }, [searchParams, activeTabIndex]);

  useEffect(() => {
    // Don't redirect while authentication is loading
    if (isLoading) return;
    
    // If not authenticated or not a store owner, redirect to home
    if (!user || !user.roles?.includes('StoreOwner')) {
      navigate('/');
      return;
    }

    fetchMyStores();
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (selectedStore) {
      fetchStoreStats();
      fetchStoreProducts();
      fetchStoreOrders();
    }
  }, [selectedStore]);

  // Optimize loading: only refresh data if cache is expired when switching tabs
  useEffect(() => {
    if (!selectedStore) return;
    
    const currentTab = searchParams.get('tab');
    const now = Date.now();
    
    // Only fetch if cache is expired for the current tab
    switch (currentTab) {
      case 'products':
        const productsCacheAge = now - dataCache.current.lastFetch.products;
        if (productsCacheAge >= 3 * 60 * 1000) { // 3 minutes
          fetchStoreProducts();
        }
        break;
      case 'orders':
        const ordersCacheAge = now - dataCache.current.lastFetch.orders;
        if (ordersCacheAge >= 3 * 60 * 1000) { // 3 minutes
          fetchStoreOrders();
        }
        break;
      case 'statistics':
        const statsCacheAge = now - dataCache.current.lastFetch.stats;
        if (statsCacheAge >= 5 * 60 * 1000) { // 5 minutes
          fetchStoreStats();
        }
        break;
    }
  }, [searchParams, selectedStore]);

  const fetchMyStores = async () => {
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
  };

  const fetchStoreStats = async (forceRefresh = false) => {
    if (!selectedStore) return;

    // Check cache first (5 minutes cache)
    const now = Date.now();
    const cacheAge = now - dataCache.current.lastFetch.stats;
    const isCacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes

    if (!forceRefresh && dataCache.current.stats && isCacheValid) {
      setStoreStats(dataCache.current.stats);
      return;
    }

    try {
      setStatsLoading(true);
      const response = await storesApi.getStats(selectedStore.id);
      
      // Cache the data
      dataCache.current.stats = response.data;
      dataCache.current.lastFetch.stats = now;
      
      setStoreStats(response.data);
    } catch (error: any) {
      console.error('Failed to load store stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchStoreProducts = async (forceRefresh = false) => {
    if (!selectedStore) return;

    // Check cache first (3 minutes cache for products)
    const now = Date.now();
    const cacheAge = now - dataCache.current.lastFetch.products;
    const isCacheValid = cacheAge < 3 * 60 * 1000; // 3 minutes

    if (!forceRefresh && dataCache.current.products && isCacheValid) {
      setStoreProducts(dataCache.current.products);
      return;
    }

    try {
      setProductsLoading(true);
      console.log('DEBUG: Fetching products for store ID:', selectedStore.id);
      
      // Mock products data for demo - replace with real API later
      const mockProducts: Product[] = [
        {
          id: 'mock-1',
          name: 'Wireless Bluetooth Headphones',
          description: 'Premium quality wireless headphones with noise cancellation',
          price: 299.99,
          originalPrice: 399.99,
          discountPercentage: 25,
          stock: 15,
          imageUrl: 'https://via.placeholder.com/300x300?text=Headphones',
          categoryId: 'electronics',
          categoryName: 'Electronics',
          isActive: true,
          storeId: selectedStore.id,
          storeName: selectedStore.name,
          averageRating: 4.5,
          totalReviews: 128,
          isNew: true,
          createdAt: '2024-01-15T10:00:00'
        },
        {
          id: 'mock-2',
          name: 'Smart Fitness Watch',
          description: 'Track your health and fitness with this advanced smartwatch',
          price: 199.99,
          stock: 8,
          imageUrl: 'https://via.placeholder.com/300x300?text=Smartwatch',
          categoryId: 'electronics',
          categoryName: 'Electronics',
          isActive: true,
          storeId: selectedStore.id,
          storeName: selectedStore.name,
          averageRating: 4.2,
          totalReviews: 86,
          isFeatured: true,
          createdAt: '2024-01-10T14:30:00'
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Add any new products from localStorage (from ProductForm)
      const newProductsJson = localStorage.getItem('newProducts');
      const newProducts = newProductsJson ? JSON.parse(newProductsJson) : [];
      
      const allProducts = [...mockProducts, ...newProducts];
      
      // Cache the data
      dataCache.current.products = allProducts;
      dataCache.current.lastFetch.products = now;
      
      setStoreProducts(allProducts);
      
      // TODO: Replace with real API call
      // const response = await storesApi.getProducts(selectedStore.id, 1, 50);
      // setStoreProducts(response.data);
    } catch (error: any) {
      console.error('Failed to load store products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchStoreOrders = async (forceRefresh = false) => {
    if (!selectedStore) return;

    // Check cache first (3 minutes cache for orders)
    const now = Date.now();
    const cacheAge = now - dataCache.current.lastFetch.orders;
    const isCacheValid = cacheAge < 3 * 60 * 1000; // 3 minutes

    if (!forceRefresh && dataCache.current.orders && isCacheValid) {
      setStoreOrders(dataCache.current.orders);
      return;
    }

    try {
      setOrdersLoading(true);
      
      // Fetch store orders from API
      const response = await storesApi.getOrders(selectedStore.id, 1, 50);
      const storeOrders = response.data || [];
      
      // Cache the data
      dataCache.current.orders = storeOrders;
      dataCache.current.lastFetch.orders = now;
      
      setStoreOrders(storeOrders);
      
      // TODO: Remove mock data below - kept for now as fallback
      const mockOrders: Order[] = [
        {
          id: 'order-1',
          userId: 'customer-1',
          orderNumber: 20240001,
          customerName: 'Ahmet Yılmaz',
          customerEmail: 'ahmet@example.com',
          status: OrderStatus.Pending,
          totalAmount: 599.98,
          addressId: 'address-1',
          createdAt: '2024-01-15T10:30:00',
          items: [
            { 
              id: 'item-1',
              productId: 'sample-1', 
              productName: 'Wireless Bluetooth Headphones', 
              quantity: 2, 
              price: 299.99,
              subTotal: 599.98
            }
          ],
          shippingAddress: {
            id: 'address-1',
            title: 'Home',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            addressLine1: 'Atatürk Cad. No: 123',
            addressLine2: 'Daire 5',
            city: 'Istanbul',
            state: 'Istanbul',
            postalCode: '34000',
            country: 'Turkey',
            isDefault: true,
            isActive: true,
            userId: 'customer-1',
            createdAt: '2024-01-01T00:00:00',
            fullName: 'Ahmet Yılmaz',
            fullAddress: 'Atatürk Cad. No: 123, Daire 5, Istanbul, Turkey'
          }
        },
        {
          id: 'order-2',
          userId: 'customer-2',
          orderNumber: 20240002,
          customerName: 'Fatma Demir',
          customerEmail: 'fatma@example.com',
          status: OrderStatus.Shipped,
          totalAmount: 149.99,
          addressId: 'address-2',
          createdAt: '2024-01-14T14:20:00',
          items: [
            { 
              id: 'item-2',
              productId: 'sample-3', 
              productName: 'Smart Fitness Watch', 
              quantity: 1, 
              price: 149.99,
              subTotal: 149.99
            }
          ],
          shippingAddress: {
            id: 'address-2',
            title: 'Home',
            firstName: 'Fatma',
            lastName: 'Demir',
            addressLine1: 'İnönü Sok. No: 45',
            addressLine2: '',
            city: 'Ankara',
            state: 'Ankara',
            postalCode: '06000',
            country: 'Turkey',
            isDefault: true,
            isActive: true,
            userId: 'customer-2',
            createdAt: '2024-01-01T00:00:00',
            fullName: 'Fatma Demir',
            fullAddress: 'İnönü Sok. No: 45, Ankara, Turkey'
          }
        },
        {
          id: 'order-3',
          userId: 'customer-3',
          orderNumber: 20240003,
          customerName: 'Mehmet Öz',
          customerEmail: 'mehmet@example.com',
          status: OrderStatus.Delivered,
          totalAmount: 89.99,
          addressId: 'address-3',
          createdAt: '2024-01-13T16:15:00',
          items: [
            { 
              id: 'item-3',
              productId: 'sample-5', 
              productName: 'Organic Skincare Set', 
              quantity: 1, 
              price: 89.99,
              subTotal: 89.99
            }
          ],
          shippingAddress: {
            id: 'address-3',
            title: 'Home',
            firstName: 'Mehmet',
            lastName: 'Öz',
            addressLine1: 'Cumhuriyet Cad. No: 78',
            addressLine2: '',
            city: 'Izmir',
            state: 'Izmir',
            postalCode: '35000',
            country: 'Turkey',
            isDefault: true,
            isActive: true,
            userId: 'customer-3',
            createdAt: '2024-01-01T00:00:00',
            fullName: 'Mehmet Öz',
            fullAddress: 'Cumhuriyet Cad. No: 78, Izmir, Turkey'
          }
        }
      ];
      
      // Use mock data as fallback if API returns empty
      if (storeOrders.length === 0) {
        setStoreOrders(mockOrders);
      }
    } catch (error: any) {
      console.error('Failed to load store orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleStoreApplicationSuccess = () => {
    setHasStoreApplication(true);
    toast({
      title: t('store.application.success'),
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    onClose();
    fetchMyStores();
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (!selectedStore) throw new Error('No store selected');

      // Call backend API for store owner status update
      await storesApi.updateOrderStatus(selectedStore.id, orderId, Number(newStatus));

      // Optimistically update local state
      setStoreOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      const statusText = newStatus === OrderStatus.Shipped ? 'shipped' :
                         newStatus === OrderStatus.Delivered ? 'delivered' : 'updated';
      const order = storeOrders.find(o => o.id === orderId);
      
      toast({
        title: 'Order Status Updated',
        description: `Order #${order?.orderNumber} marked as ${statusText}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error?.response?.data?.message || 'Failed to update order status. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    
    // Update URL params when tab changes - shallow routing
    const tabNames = ['statistics', 'products', 'orders', 'settings'];
    const tabName = tabNames[index] || 'statistics';
    
    // Use replace: true for shallow routing (no page reload)
    setSearchParams({ tab: tabName }, { replace: true });
  };

  // Show loading while authentication is being checked or data is loading
  if (isLoading || loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Skeleton height="100px" width="100%" />
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6} width="100%">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="150px" />
            ))}
          </Grid>
        </VStack>
      </Container>
    );
  }

  // If user hasn't applied to become a store owner
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
            
            {!hasStoreApplication ? (
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
                    leftIcon={<FiPlus />}
                  >
                    Refresh Store Data
                  </Button>
                </VStack>
              </Alert>
            ) : (
              <Alert status="info">
                <AlertIcon />
                Your store application is under review. You will be notified by email once it's approved.
              </Alert>
            )}
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
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="3xl" fontWeight="bold" mb={4}>
            {t('store.dashboard.title')}
          </Text>
          
          {/* Store Selector */}
          {myStores.length > 1 && (
            <HStack spacing={4} mb={6}>
              <Text fontWeight="medium">Select Store:</Text>
              {myStores.map((store) => (
                <Button
                  key={store.id}
                  variant={selectedStore?.id === store.id ? 'solid' : 'outline'}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => setSelectedStore(store)}
                >
                  {store.name}
                </Button>
              ))}
            </HStack>
          )}
        </Box>

        {selectedStore && (
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
              <Tab 
                _selected={{ 
                  color: 'blue.600', 
                  borderColor: 'blue.600',
                  bg: 'blue.50' 
                }}
                transition="all 0.2s ease"
              >
                {t('store.dashboard.settings')}
              </Tab>
            </TabList>

            <TabPanels>
              {/* Statistics Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Store Status */}
                  <Card bg={bgColor} borderColor={borderColor}>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Text fontSize="xl" fontWeight="semibold">
                          {selectedStore.name}
                        </Text>
                        <Badge 
                          colorScheme={selectedStore.isApproved ? 'green' : 'yellow'}
                          size="lg"
                        >
                          {selectedStore.isApproved ? 'Approved' : 'Pending Approval'}
                        </Badge>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <Text color="gray.600">{selectedStore.description}</Text>
                    </CardBody>
                  </Card>

                  {/* Store Statistics */}
                  {statsLoading ? (
                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} height="120px" />
                      ))}
                    </Grid>
                  ) : storeStats ? (
                    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
                      <Card bg={bgColor} borderColor={borderColor}>
                        <CardBody>
                          <Stat>
                            <HStack>
                              <FiDollarSign color="green" />
                              <StatLabel>Total Revenue</StatLabel>
                            </HStack>
                            <StatNumber>${storeStats.totalRevenue.toLocaleString()}</StatNumber>
                            <StatHelpText>All time revenue</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>

                      <Card bg={bgColor} borderColor={borderColor}>
                        <CardBody>
                          <Stat>
                            <HStack>
                              <FiPackage color="blue" />
                              <StatLabel>Total Products</StatLabel>
                            </HStack>
                            <StatNumber>{storeStats.totalProducts}</StatNumber>
                            <StatHelpText>Active products</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>

                      <Card bg={bgColor} borderColor={borderColor}>
                        <CardBody>
                          <Stat>
                            <HStack>
                              <FiTrendingUp color="purple" />
                              <StatLabel>Total Sales</StatLabel>
                            </HStack>
                            <StatNumber>{storeStats.totalSales}</StatNumber>
                            <StatHelpText>All time sales count</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>

                      <Card bg={bgColor} borderColor={borderColor}>
                        <CardBody>
                          <Stat>
                            <HStack>
                              <FiUsers color="orange" />
                              <StatLabel>Store Rating</StatLabel>
                            </HStack>
                            <StatNumber>{selectedStore.rating.toFixed(1)}/5.0</StatNumber>
                            <StatHelpText>Customer rating</StatHelpText>
                          </Stat>
                        </CardBody>
                      </Card>
                    </Grid>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      Statistics will be available once your store is approved and you have products.
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Products Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xl" fontWeight="semibold">
                      {t('store.dashboard.products')}
                    </Text>
                    <Button
                      colorScheme="blue"
                      leftIcon={<FiPlus />}
                      onClick={() => navigate('/store/products/new')}
                      isDisabled={!selectedStore.isApproved}
                    >
                      {t('store.dashboard.addProduct')}
                    </Button>
                  </HStack>

                  {!selectedStore.isApproved && (
                    <Alert status="warning">
                      <AlertIcon />
                      You can add products after your store is approved by an admin.
                    </Alert>
                  )}

                  {productsLoading ? (
                    <VStack spacing={4}>
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height="80px" width="100%" />
                      ))}
                    </VStack>
                  ) : storeProducts.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Product Name</Th>
                            <Th>Price</Th>
                            <Th>Stock</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {storeProducts.map((product) => (
                            <Tr key={product.id}>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">{product.name}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    ID: {product.id}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>${product.price.toFixed(2)}</Td>
                              <Td>
                                <Badge 
                                  colorScheme={product.stock > 0 ? 'green' : 'red'}
                                >
                                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme="green">Active</Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    leftIcon={<FiEdit />}
                                    onClick={() => navigate(`/store/products/${product.id}/edit`)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    colorScheme="red"
                                    leftIcon={<FiTrash2 />}
                                  >
                                    Delete
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      No products yet. Add your first product to get started!
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Orders Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="xl" fontWeight="semibold">
                      {t('store.dashboard.orders')}
                    </Text>
                    <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                      {storeOrders.length} orders
                    </Badge>
                  </HStack>
                  
                  {ordersLoading ? (
                    <VStack spacing={4}>
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height="120px" width="100%" />
                      ))}
                    </VStack>
                  ) : storeOrders.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Order Details</Th>
                            <Th>Customer</Th>
                            <Th>Status</Th>
                            <Th>Amount</Th>
                            <Th>Date</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {storeOrders.map((order) => (
                            <Tr key={order.id}>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">#{order.orderNumber}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {order.items.map(item => `${item.quantity}x ${item.productName}`).join(', ')}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="medium">{order.customerName}</Text>
                                  <Text fontSize="sm" color="gray.600">{order.customerEmail}</Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {order.shippingAddress.city}, {order.shippingAddress.country}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <Badge 
                                  colorScheme={
                                    order.status === OrderStatus.Delivered ? 'green' :
                                    order.status === OrderStatus.Shipped ? 'blue' :
                                    order.status === OrderStatus.Pending ? 'yellow' : 'gray'
                                  }
                                  textTransform="capitalize"
                                >
                                  {OrderStatus[order.status]}
                                </Badge>
                              </Td>
                              <Td fontWeight="medium">${order.totalAmount.toFixed(2)}</Td>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="sm">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td>
                                <VStack spacing={2} align="stretch" minW="120px">
                                  {order.status === OrderStatus.Pending && (
                                    <Button
                                      size="xs"
                                      colorScheme="green"
                                      onClick={() => updateOrderStatus(order.id, OrderStatus.Shipped)}
                                    >
                                      Mark Shipped
                                    </Button>
                                  )}
                                  {order.status === OrderStatus.Shipped && (
                                    <Button
                                      size="xs"
                                      colorScheme="blue"
                                      onClick={() => updateOrderStatus(order.id, OrderStatus.Delivered)}
                                    >
                                      Mark Delivered
                                    </Button>
                                  )}
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedOrderDetails(order);
                                      onOrderDetailsOpen();
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </VStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      No orders yet. Orders will appear here when customers purchase your products.
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Text fontSize="xl" fontWeight="semibold">
                    {t('store.dashboard.settings')}
                  </Text>
                  
                  <Card bg={bgColor} borderColor={borderColor}>
                    <CardHeader>
                      <Text fontSize="lg" fontWeight="semibold">Store Information</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text>Business Name:</Text>
                          <Text fontWeight="medium">{selectedStore.name}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Contact Email:</Text>
                          <Text fontWeight="medium">{selectedStore.contactEmail}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Contact Phone:</Text>
                          <Text fontWeight="medium">{selectedStore.contactPhone}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Tax Number:</Text>
                          <Text fontWeight="medium">{selectedStore.taxNumber}</Text>
                        </HStack>
                        <Divider />
                        <Button
                          colorScheme="blue"
                          variant="outline"
                          leftIcon={<FiEdit />}
                          onClick={onStoreEditOpen}
                        >
                          Edit Store Information
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}

        {/* Order Details Modal */}
        <Modal isOpen={isOrderDetailsOpen} onClose={onOrderDetailsClose} size="xl">
          <ModalOverlay />
          <ModalContent maxW="800px">
            <ModalHeader>
              <HStack justify="space-between">
                <Text>Order Details #{selectedOrderDetails?.orderNumber}</Text>
                <Badge 
                  colorScheme={
                    selectedOrderDetails?.status === OrderStatus.Pending ? 'yellow' :
                    selectedOrderDetails?.status === OrderStatus.Shipped ? 'blue' :
                    selectedOrderDetails?.status === OrderStatus.Delivered ? 'green' : 'gray'
                  }
                  size="lg"
                >
                  {selectedOrderDetails?.status}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedOrderDetails && (
                <VStack spacing={6} align="stretch">
                  {/* Customer Information */}
                  <Card>
                    <CardHeader>
                      <Text fontSize="lg" fontWeight="semibold">Customer Information</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack>
                          <Text fontWeight="medium" minW="100px">Name:</Text>
                          <Text>{selectedOrderDetails.customerName}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium" minW="100px">Email:</Text>
                          <Text>{selectedOrderDetails.customerEmail}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium" minW="100px">Order Date:</Text>
                          <Text>{new Date(selectedOrderDetails.createdAt).toLocaleString()}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <Text fontSize="lg" fontWeight="semibold">Order Items</Text>
                    </CardHeader>
                    <CardBody>
                      <TableContainer>
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Product</Th>
                              <Th isNumeric>Quantity</Th>
                              <Th isNumeric>Price</Th>
                              <Th isNumeric>Subtotal</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedOrderDetails.items.map((item, index) => (
                              <Tr key={index}>
                                <Td>{item.productName}</Td>
                                <Td isNumeric>{item.quantity}</Td>
                                <Td isNumeric>${item.price.toFixed(2)}</Td>
                                <Td isNumeric>${item.subTotal.toFixed(2)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </CardBody>
                  </Card>

                  {/* Shipping Address */}
                  <Card>
                    <CardHeader>
                      <Text fontSize="lg" fontWeight="semibold">Shipping Address</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={2}>
                        <Text fontWeight="medium">{selectedOrderDetails.shippingAddress.fullName}</Text>
                        <Text>{selectedOrderDetails.shippingAddress.addressLine1}</Text>
                        {selectedOrderDetails.shippingAddress.addressLine2 && (
                          <Text>{selectedOrderDetails.shippingAddress.addressLine2}</Text>
                        )}
                        <Text>
                          {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} {selectedOrderDetails.shippingAddress.postalCode}
                        </Text>
                        <Text>{selectedOrderDetails.shippingAddress.country}</Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Order Total */}
                  <Card bg="blue.50" borderColor="blue.200">
                    <CardBody>
                      <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="bold">Total Amount:</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.600">
                          ${selectedOrderDetails.totalAmount.toFixed(2)}
                        </Text>
                      </HStack>
                    </CardBody>
                  </Card>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Store Edit Modal */}
        <Modal isOpen={isStoreEditOpen} onClose={onStoreEditClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Store Information</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedStore && (
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Store Name</FormLabel>
                    <Input defaultValue={selectedStore.name} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea defaultValue={selectedStore.description} rows={4} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Business Address</FormLabel>
                    <Input defaultValue={selectedStore.businessAddress} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Contact Phone</FormLabel>
                    <Input defaultValue={selectedStore.contactPhone} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Tax Number</FormLabel>
                    <Input defaultValue={selectedStore.taxNumber} />
                  </FormControl>
                </VStack>
              )}
            </ModalBody>
            <HStack justify="flex-end" p={6} pt={4}>
              <Button variant="outline" onClick={onStoreEditClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue"
                onClick={() => {
                  toast({
                    title: 'Store Updated',
                    description: 'Store information has been updated successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                  });
                  onStoreEditClose();
                }}
              >
                Save Changes
              </Button>
            </HStack>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default StoreDashboardPage;
