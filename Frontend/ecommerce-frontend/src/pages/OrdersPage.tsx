import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Avatar,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi } from '../services/api';
import { Order, OrderStatus } from '../types';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { getUniqueStoresFromOrder, getOrderStatusColorScheme, getOrderStatusText } from '../utils/orderUtils';

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await ordersApi.getUserOrders(user.id);
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setError(t('orders.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelOrderClick = (orderId: string) => {
    setCancellingOrderId(orderId);
    onOpen();
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;

    try {
      await ordersApi.cancel(cancellingOrderId);
      
      // Update the local orders state
      setOrders(prev => prev.map(order => 
        order.id === cancellingOrderId 
          ? { ...order, status: OrderStatus.Cancelled }
          : order
      ));

      toast({
        title: t('orders.cancelled'),
        description: t('orders.cancelSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setCancellingOrderId(null);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast({
        title: t('orders.cancelFailed'),
        description: t('orders.cancelFailedDescription'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCloseModal = () => {
    onClose();
    setCancellingOrderId(null);
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>{t('orders.loading')}</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg" textAlign="center">
            {t('orders.title')}
          </Heading>

          {orders.length === 0 ? (
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} py={8}>
                  <Text fontSize="lg" color="gray.500">
                    {t('orders.empty')}
                  </Text>
                  <Button colorScheme="blue" onClick={() => navigate('/')}>
                    {t('orders.startShopping')}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <VStack spacing={4} align="stretch">
              {orders.map((order) => (
                <Card key={order.id} bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between" wrap="wrap">
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Text fontWeight="bold" fontSize="lg">
                              {t('orders.orderNumber')} #{order.orderNumber}
                            </Text>
                            <Badge colorScheme={getOrderStatusColorScheme(order.status)}>
                              {getOrderStatusText(order.status)}
                            </Badge>
                          </HStack>
                          <Text color="gray.600" fontSize="sm">
                            {t('orders.placedOn')} {formatDate(order.createdAt)}
                          </Text>
                        </VStack>

                        <VStack align="end" spacing={1}>
                          <Text fontWeight="bold" fontSize="lg">
                            ${order.totalAmount.toFixed(2)}
                          </Text>
                          <Text color="gray.600" fontSize="sm">
                            {order.items?.length || 0} {t('orders.items')}
                          </Text>
                        </VStack>
                      </HStack>

                      <Divider />

                      <VStack align="start" spacing={2}>
                        <Text fontWeight="semibold">{t('orders.customerInfo')}:</Text>
                        <Text fontSize="sm" color="gray.600">
                          {order.customerName} - {order.customerEmail}
                        </Text>
                      </VStack>

                      {order.items && order.items.length > 0 && (
                        <>
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" width="100%">
                              <Text fontWeight="semibold">{t('orders.items')}:</Text>
                              {/* Store indicators */}
                              <Wrap spacing={1}>
                                {getUniqueStoresFromOrder(order).map((store, index) => (
                                  <WrapItem key={store.storeId || index}>
                                    <HStack spacing={1}>
                                      <Avatar 
                                        size="xs" 
                                        name={store.storeName}
                                        bg={store.storeId ? 'blue.500' : 'gray.500'}
                                      />
                                      <Text fontSize="xs" color="gray.600">
                                        {store.storeName}
                                      </Text>
                                    </HStack>
                                  </WrapItem>
                                ))}
                              </Wrap>
                            </HStack>
                            <VStack align="stretch" spacing={1}>
                              {order.items.slice(0, 3).map((item, index) => (
                                <HStack key={index} justify="space-between" fontSize="sm">
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text>
                                      {item.productName} × {item.quantity}
                                    </Text>
                                    {item.storeName && (
                                      <Text fontSize="xs" color="gray.500">
                                        from {item.storeName}
                                      </Text>
                                    )}
                                  </VStack>
                                  <Text fontWeight="semibold">
                                    ${item.subTotal.toFixed(2)}
                                  </Text>
                                </HStack>
                              ))}
                              {order.items.length > 3 && (
                                <Text fontSize="sm" color="gray.500">
                                  ... {t('orders.andMore', { count: order.items.length - 3 })}
                                </Text>
                              )}
                            </VStack>
                          </VStack>
                        </>
                      )}

                      <Divider />

                      <HStack spacing={3} wrap="wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          {t('orders.viewDetails')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/orders/${order.id}/track`)}
                        >
                          {t('orders.trackOrder')}
                        </Button>
                        {(order.status === OrderStatus.Pending ||
                          order.status === OrderStatus.Paid) && (
                          <Button 
                            size="sm" 
                            colorScheme="red" 
                            variant="outline"
                            onClick={() => handleCancelOrderClick(order.id)}
                          >
                            {t('orders.cancelOrder')}
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>

        {/* Cancel Order Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={handleCloseModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('orders.cancelOrder')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                {t('orders.cancelConfirm')}
              </Text>
              <Text mt={2} fontSize="sm" color="gray.600">
                {t('orders.cancelRefundNote')}
              </Text>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                {t('orders.keepOrder')}
              </Button>
              <Button colorScheme="red" onClick={handleCancelOrder}>
                {t('orders.yesCancelOrder')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
};

export default OrdersPage;