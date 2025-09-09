import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Card,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  ModalFooter,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiChevronDown, FiEye } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: number;
  statusName: string;
  createdAt: string;
  itemsCount: number;
}

interface OrdersResponse {
  orders: Order[];
  totalOrders: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

const AdminOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllOrders(currentPage, pageSize);
      const data: OrdersResponse = response.data;
      
      let filteredOrders = data.orders;
      
      // Apply filters
      if (searchTerm) {
        filteredOrders = filteredOrders.filter(order =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => 
          order.status.toString() === statusFilter
        );
      }
      
      setOrders(filteredOrders);
      setTotalOrders(data.totalOrders);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status: number, statusName: string) => {
    const statusConfig: Record<number, { color: string; variant?: string }> = {
      1: { color: 'yellow' }, // Pending
      2: { color: 'blue' },   // Paid
      3: { color: 'purple' }, // Shipped
      4: { color: 'green' },  // Delivered
      5: { color: 'red' },    // Cancelled
    };
    
    const config = statusConfig[status] || { color: 'gray' };
    return (
      <Badge colorScheme={config.color} variant="solid">
        {statusName}
      </Badge>
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: number) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      toast({
        title: 'Order Updated',
        description: 'Order status has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchOrders(); // Refresh the orders list
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  if (!user || !user.roles.includes('Admin')) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={4} justify="center" minH="60vh">
            <Spinner size="xl" color="blue.500" />
            <Text>Loading orders...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.md">
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>Order Management</Heading>
            <Text color="gray.600">Manage and track all customer orders</Text>
          </Box>

          {/* Filters and Search */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Flex gap={4} flexWrap="wrap" align="center">
                <InputGroup maxW="300px">
                  <InputLeftElement>
                    <FiSearch />
                  </InputLeftElement>
                  <Input
                    placeholder="Search orders, customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </InputGroup>
                
                <Select 
                  placeholder="Filter by status" 
                  maxW="200px"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="1">Pending</option>
                  <option value="2">Paid</option>
                  <option value="3">Shipped</option>
                  <option value="4">Delivered</option>
                  <option value="5">Cancelled</option>
                </Select>
                
                <Button leftIcon={<FiSearch />} onClick={handleSearch}>
                  Search
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setCurrentPage(1);
                    fetchOrders();
                  }}
                >
                  Clear Filters
                </Button>
              </Flex>
            </CardBody>
          </Card>

          {/* Orders Stats */}
          <HStack spacing={4}>
            <Card bg={cardBg} border="1px" borderColor={borderColor} flex="1">
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">{totalOrders}</Text>
                <Text fontSize="sm" color="gray.600">Total Orders</Text>
              </CardBody>
            </Card>
            <Card bg={cardBg} border="1px" borderColor={borderColor} flex="1">
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">{orders.length}</Text>
                <Text fontSize="sm" color="gray.600">Filtered Results</Text>
              </CardBody>
            </Card>
          </HStack>

          {/* Orders Table */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Box overflowX="auto">
                <Table size="md">
                  <Thead>
                    <Tr>
                      <Th>Order ID</Th>
                      <Th>Customer</Th>
                      <Th>Items</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orders.map((order) => (
                      <Tr key={order.id}>
                        <Td fontFamily="mono" fontSize="sm">
                          #{order.id.slice(-8)}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="medium">
                              {order.customerName}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {order.customerEmail}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge variant="outline">{order.itemsCount} items</Badge>
                        </Td>
                        <Td fontWeight="semibold">
                          ${order.totalAmount.toFixed(2)}
                        </Td>
                        <Td>
                          {getOrderStatusBadge(order.status, order.statusName)}
                        </Td>
                        <Td fontSize="sm" color="gray.600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<FiEye />}
                              onClick={() => handleViewOrder(order)}
                            >
                              View
                            </Button>
                            <Menu>
                              <MenuButton as={Button} size="sm" rightIcon={<FiChevronDown />}>
                                Update Status
                              </MenuButton>
                              <MenuList>
                                <MenuItem onClick={() => updateOrderStatus(order.id, 1)}>
                                  Mark as Pending
                                </MenuItem>
                                <MenuItem onClick={() => updateOrderStatus(order.id, 2)}>
                                  Mark as Paid
                                </MenuItem>
                                <MenuItem onClick={() => updateOrderStatus(order.id, 3)}>
                                  Mark as Shipped
                                </MenuItem>
                                <MenuItem onClick={() => updateOrderStatus(order.id, 4)}>
                                  Mark as Delivered
                                </MenuItem>
                                <MenuItem onClick={() => updateOrderStatus(order.id, 5)}>
                                  Mark as Cancelled
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Flex justify="center" mt={6}>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      isDisabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? 'solid' : 'outline'}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      size="sm"
                      isDisabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Order Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Order ID:</Text>
                  <Text fontFamily="mono">#{selectedOrder.id.slice(-8)}</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Customer:</Text>
                  <VStack align="end" spacing={0}>
                    <Text>{selectedOrder.customerName}</Text>
                    <Text fontSize="sm" color="gray.600">{selectedOrder.customerEmail}</Text>
                  </VStack>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Total Amount:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.500">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Status:</Text>
                  {getOrderStatusBadge(selectedOrder.status, selectedOrder.statusName)}
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Items:</Text>
                  <Badge variant="outline">{selectedOrder.itemsCount} items</Badge>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Order Date:</Text>
                  <Text>{new Date(selectedOrder.createdAt).toLocaleDateString()}</Text>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminOrdersPage;