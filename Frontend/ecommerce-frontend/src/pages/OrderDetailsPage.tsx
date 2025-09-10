import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  GridItem,
  Spinner,
  Alert,
  AlertIcon,
  Avatar,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import { OrderStatusTimeline } from '../components/Order';
import { Order, OrderStatus, OrderWithStoreGroups } from '../types';
import { ordersApi } from '../services/api';
import { 
  groupOrderByStores, 
  getOrderStatusColorScheme, 
  getOrderStatusText 
} from '../utils/orderUtils';

// Mock order data for demonstration
const mockOrder: Order = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: 'user-123',
  orderNumber: 100000123,
  totalAmount: 299.97,
  status: OrderStatus.Shipped,
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  addressId: 'addr-123',
  shippingAddress: {
    id: 'addr-123',
    title: 'Home',
    firstName: 'John',
    lastName: 'Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'Istanbul',
    state: 'Istanbul',
    postalCode: '34000',
    country: 'Turkey',
    phoneNumber: '+90 555 123 4567',
    isDefault: true,
    isActive: true,
    userId: 'user-123',
    createdAt: '2024-01-15T10:00:00Z',
    fullName: 'John Doe',
    fullAddress: '123 Main Street, Apt 4B, Istanbul, Istanbul 34000, Turkey',
  },
  createdAt: '2024-01-15T10:00:00Z',
  shippedDate: '2024-01-17T14:30:00Z',
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      productName: 'Wireless Bluetooth Headphones',
      quantity: 1,
      price: 149.99,
      subTotal: 149.99,
      storeId: 'store-1',
      storeName: 'TechWorld Electronics',
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      productName: 'USB-C Charging Cable',
      quantity: 2,
      price: 24.99,
      subTotal: 49.98,
      storeId: 'store-1',
      storeName: 'TechWorld Electronics',
    },
    {
      id: 'item-3',
      productId: 'prod-3',
      productName: 'Phone Case',
      quantity: 1,
      price: 99.99,
      subTotal: 99.99,
      storeId: 'store-2',
      storeName: 'Mobile Accessories Plus',
    },
  ],
};

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderWithStores, setOrderWithStores] = useState<OrderWithStoreGroups | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const trackingRef = React.useRef<HTMLDivElement | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await ordersApi.getById(id);
        const orderData = response.data;
        setOrder(orderData);
        
        // Group order by stores
        const groupedOrder = groupOrderByStores(orderData);
        setOrderWithStores(groupedOrder);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Failed to load order details. Please try again.');
        // Fallback to mock data for demo purposes
        setOrder(mockOrder);
        const groupedOrder = groupOrderByStores(mockOrder);
        setOrderWithStores(groupedOrder);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // If tab=tracking is present, scroll into the timeline section
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'tracking' && trackingRef.current) {
      trackingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams]);

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading order details...</Text>
        </VStack>
      </Container>
    );
  }

  if (error && !order) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Order not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Order Header */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="lg">Order Details</Heading>
            <Badge colorScheme={getOrderStatusColorScheme(order.status)} fontSize="md" p={2}>
              {getOrderStatusText(order.status)}
            </Badge>
          </HStack>
          <Text color="gray.600" fontSize="sm">
            Order Number: #{order.orderNumber}
          </Text>
          <Text color="gray.600" fontSize="sm">
            Placed on: {new Date(order.createdAt).toLocaleDateString()}
          </Text>
          {orderWithStores?.hasMultipleStores && (
            <Badge colorScheme="blue" variant="outline" mt={2}>
              Multi-Store Order ({orderWithStores.storeGroups.length} stores)
            </Badge>
          )}
        </Box>

        {/* Order Status Timeline */}
        <Box ref={trackingRef} id="tracking-section">
          <OrderStatusTimeline
            currentStatus={order.status}
            createdAt={order.createdAt}
            shippedDate={order.shippedDate}
            deliveredDate={order.deliveredDate}
          />
        </Box>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Order Items by Store */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {orderWithStores?.hasMultipleStores ? (
                <Accordion allowMultiple defaultIndex={[0]}>
                  {orderWithStores.storeGroups.map((storeGroup, groupIndex) => (
                    <AccordionItem key={storeGroup.storeId || 'no-store'}>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack spacing={3}>
                            <Avatar 
                              name={storeGroup.storeName} 
                              size="sm"
                              src={storeGroup.storeLogoUrl}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{storeGroup.storeName}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {storeGroup.items.length} item(s) • ${storeGroup.totalAmount.toFixed(2)}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <VStack spacing={4} align="stretch">
                          {storeGroup.items.map((item, index) => (
                            <Box key={item.id}>
                              <HStack spacing={4}>
                                <Box
                                  width="60px"
                                  height="60px"
                                  bg="gray.100"
                                  borderRadius="md"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  <Text fontSize="xs" color="gray.500">
                                    IMG
                                  </Text>
                                </Box>
                                <VStack align="flex-start" spacing={1} flex={1}>
                                  <Text fontWeight="medium">{item.productName}</Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Quantity: {item.quantity}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Price: ${item.price.toFixed(2)}
                                  </Text>
                                </VStack>
                                <Text fontWeight="bold">${item.subTotal.toFixed(2)}</Text>
                              </HStack>
                              {index < storeGroup.items.length - 1 && <Divider mt={4} />}
                            </Box>
                          ))}
                          
                          <Divider />
                          <HStack justify="space-between">
                            <HStack spacing={2}>
                              <Text fontWeight="medium">Store Subtotal:</Text>
                              {storeGroup.storeId && (
                                <Button
                                  size="xs"
                                  variant="link"
                                  leftIcon={<FiExternalLink />}
                                  onClick={() => navigate(`/store/${storeGroup.storeId}`)}
                                >
                                  Visit Store
                                </Button>
                              )}
                            </HStack>
                            <Text fontWeight="bold">${storeGroup.totalAmount.toFixed(2)}</Text>
                          </HStack>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Order Items</Heading>
                      {orderWithStores?.storeGroups[0]?.storeId && (
                        <HStack spacing={2}>
                          <Avatar 
                            name={orderWithStores.storeGroups[0].storeName} 
                            size="sm"
                            src={orderWithStores.storeGroups[0].storeLogoUrl}
                          />
                          <Text fontSize="sm" fontWeight="medium">
                            {orderWithStores.storeGroups[0].storeName}
                          </Text>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<FiExternalLink />}
                            onClick={() => navigate(`/store/${orderWithStores.storeGroups[0].storeId}`)}
                          >
                            Visit Store
                          </Button>
                        </HStack>
                      )}
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {order.items.map((item, index) => (
                        <Box key={item.id}>
                          <HStack spacing={4}>
                            <Box
                              width="60px"
                              height="60px"
                              bg="gray.100"
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Text fontSize="xs" color="gray.500">
                                IMG
                              </Text>
                            </Box>
                            <VStack align="flex-start" spacing={1} flex={1}>
                              <Text fontWeight="medium">{item.productName}</Text>
                              <Text fontSize="sm" color="gray.600">
                                Quantity: {item.quantity}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                Price: ${item.price.toFixed(2)}
                              </Text>
                            </VStack>
                            <Text fontWeight="bold">${item.subTotal.toFixed(2)}</Text>
                          </HStack>
                          {index < order.items.length - 1 && <Divider mt={4} />}
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Order Total */}
              <Card bg={bgColor} borderColor={borderColor}>
                <CardBody>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">
                      Order Total
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      ${order.totalAmount.toFixed(2)}
                    </Text>
                  </HStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Shipping Information */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              <Card bg={bgColor} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Shipping Address</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="flex-start" spacing={1}>
                    <Text fontWeight="medium">{order.shippingAddress.fullName}</Text>
                    <Text fontSize="sm">{order.shippingAddress.addressLine1}</Text>
                    {order.shippingAddress.addressLine2 && (
                      <Text fontSize="sm">{order.shippingAddress.addressLine2}</Text>
                    )}
                    <Text fontSize="sm">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </Text>
                    <Text fontSize="sm">{order.shippingAddress.country}</Text>
                    {order.shippingAddress.phoneNumber && (
                      <Text fontSize="sm">{order.shippingAddress.phoneNumber}</Text>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={bgColor} borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Customer Information</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="flex-start" spacing={1}>
                    <Text fontWeight="medium">{order.customerName}</Text>
                    <Text fontSize="sm">{order.customerEmail}</Text>
                  </VStack>
                </CardBody>
              </Card>

              {/* Store Summary for Multi-Store Orders */}
              {orderWithStores?.hasMultipleStores && (
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Store Summary</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      {orderWithStores.storeGroups.map((storeGroup) => (
                        <HStack key={storeGroup.storeId || 'no-store'} justify="space-between">
                          <HStack spacing={2}>
                            <Avatar size="xs" name={storeGroup.storeName} />
                            <Text fontSize="sm" fontWeight="medium">
                              {storeGroup.storeName}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold">
                            ${storeGroup.totalAmount.toFixed(2)}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
};

export default OrderDetailsPage;
