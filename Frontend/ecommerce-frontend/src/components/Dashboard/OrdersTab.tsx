import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Alert,
  AlertIcon,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Order, OrderStatus } from '../../types';
import { VirtualTable } from '../VirtualTable';

interface OrdersTabProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => Promise<void>;
}

interface OrderTableColumn {
  key: keyof Order;
  header: string;
  render?: (value: any, item: Order, index: number) => React.ReactNode;
  width?: string;
}

const OrdersTabComponent: React.FC<OrdersTabProps> = ({
  orders,
  loading,
  error,
  onUpdateOrderStatus,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const toast = useToast();

  // Handle order status update
  const handleStatusUpdate = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (onUpdateOrderStatus) {
        await onUpdateOrderStatus(orderId, newStatus);
      }
      
      const statusText = newStatus === OrderStatus.Shipped ? 'shipped' : 'delivered';
      const order = orders.find(o => o.id === orderId);
      
      toast({
        title: 'Order Status Updated',
        description: `Order #${order?.orderNumber} marked as ${statusText}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update order status. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [onUpdateOrderStatus, orders, toast]);

  // Handle row click to show order details
  const handleRowClick = useCallback((order: Order) => {
    setSelectedOrder(order);
    onOpen();
  }, [onOpen]);

  // Get status badge color scheme
  const getStatusColorScheme = useCallback((status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Delivered:
        return 'green';
      case OrderStatus.Shipped:
        return 'blue';
      case OrderStatus.Pending:
        return 'yellow';
      default:
        return 'gray';
    }
  }, []);

  // Memoized table columns
  const columns = useMemo<OrderTableColumn[]>(() => [
    {
      key: 'orderNumber',
      header: 'Order Details',
      width: '25%',
      render: (_, item) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">#{item.orderNumber}</Text>
          <Text fontSize="sm" color="gray.600">
            {item.items.length} item{item.items.length > 1 ? 's' : ''}
          </Text>
          <Text fontSize="xs" color="gray.500" noOfLines={2}>
            {item.items.map(item => `${item.quantity}x ${item.productName}`).join(', ')}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      width: '25%',
      render: (_, item) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">{item.customerName}</Text>
          <Text fontSize="sm" color="gray.600">{item.customerEmail}</Text>
          <Text fontSize="xs" color="gray.500">
            {item.shippingAddress.city}, {item.shippingAddress.country}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '15%',
      render: (status) => (
        <Badge 
          colorScheme={getStatusColorScheme(status)}
          textTransform="capitalize"
        >
          {OrderStatus[status]}
        </Badge>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Amount',
      width: '15%',
      render: (amount) => (
        <Text fontWeight="medium">${amount.toFixed(2)}</Text>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '15%',
      render: (date) => (
        <VStack align="start" spacing={1}>
          <Text fontSize="sm">
            {new Date(date).toLocaleDateString()}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      width: '20%',
      render: (_, item) => (
        <VStack spacing={1} align="stretch" minW="120px">
          {item.status === OrderStatus.Pending && (
            <Button
              size="xs"
              colorScheme="green"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(item.id, OrderStatus.Shipped);
              }}
            >
              Mark Shipped
            </Button>
          )}
          {item.status === OrderStatus.Shipped && (
            <Button
              size="xs"
              colorScheme="blue"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusUpdate(item.id, OrderStatus.Delivered);
              }}
            >
              Mark Delivered
            </Button>
          )}
          <Button
            size="xs"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedOrder(item);
              onOpen();
            }}
          >
            View Details
          </Button>
        </VStack>
      ),
    },
  ], [getStatusColorScheme, handleStatusUpdate, onOpen]);

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Text fontSize="xl" fontWeight="semibold">
          Orders
        </Text>
        <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
          {orders.length} orders
        </Badge>
      </HStack>
      
      {/* Orders Table */}
      <Box>
        <VirtualTable
          data={orders}
          columns={columns}
          loading={loading}
          emptyMessage="No orders yet. Orders will appear here when customers purchase your products."
          itemHeight={100}
          maxHeight={600}
          onRowClick={handleRowClick}
        />
      </Box>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent maxW="800px">
            <ModalHeader>
              <HStack justify="space-between">
                <Text>Order Details #{selectedOrder.orderNumber}</Text>
                <Badge 
                  colorScheme={getStatusColorScheme(selectedOrder.status)}
                  size="lg"
                >
                  {OrderStatus[selectedOrder.status]}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
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
                        <Text>{selectedOrder.customerName}</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="medium" minW="100px">Email:</Text>
                        <Text>{selectedOrder.customerEmail}</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="medium" minW="100px">Order Date:</Text>
                        <Text>{new Date(selectedOrder.createdAt).toLocaleString()}</Text>
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
                          {selectedOrder.items.map((item, index) => (
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
                      <Text fontWeight="medium">{selectedOrder.shippingAddress.fullName}</Text>
                      <Text>{selectedOrder.shippingAddress.addressLine1}</Text>
                      {selectedOrder.shippingAddress.addressLine2 && (
                        <Text>{selectedOrder.shippingAddress.addressLine2}</Text>
                      )}
                      <Text>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                      </Text>
                      <Text>{selectedOrder.shippingAddress.country}</Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Order Total */}
                <Card bg="blue.50" borderColor="blue.200">
                  <CardBody>
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold">Total Amount:</Text>
                      <Text fontSize="xl" fontWeight="bold" color="blue.600">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </Text>
                    </HStack>
                  </CardBody>
                </Card>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </VStack>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const OrdersTab = memo(OrdersTabComponent);