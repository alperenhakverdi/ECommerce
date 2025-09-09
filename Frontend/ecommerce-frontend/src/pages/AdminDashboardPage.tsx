import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
} from '@chakra-ui/react';
import { 
  FiShoppingCart, 
  FiBarChart, 
  FiTruck,
  FiShoppingBag,
  FiUsers,
  FiSettings
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  averageOrderValue: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

const AdminDashboardPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Use the dedicated admin analytics endpoint
        const response = await adminApi.getDashboardStats();
        const data = response.data;

        const dashboardStats: DashboardStats = {
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue,
          totalProducts: data.totalProducts,
          totalCustomers: data.totalCustomers,
          pendingOrders: data.pendingOrders,
          shippedOrders: data.shippedOrders,
          deliveredOrders: data.deliveredOrders,
          averageOrderValue: data.averageOrderValue,
          topSellingProducts: data.topSellingProducts,
          recentOrders: data.recentOrders
        };

        setStats(dashboardStats);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getOrderStatusText = (status: number) => {
    const statusMap: Record<number, { text: string; color: string }> = {
      1: { text: 'Pending', color: 'yellow' },
      2: { text: 'Paid', color: 'blue' },
      3: { text: 'Shipped', color: 'purple' },
      4: { text: 'Delivered', color: 'green' },
      5: { text: 'Cancelled', color: 'red' },
    };
    return statusMap[status] || { text: 'Unknown', color: 'gray' };
  };

  // Show loading skeleton while auth is initializing
  if (authLoading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={4} justify="center" minH="60vh">
            <Spinner size="xl" color="blue.500" />
            <Text>Authenticating...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Only check user permissions after auth loading is complete
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
            <Text>Loading dashboard data...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.md">
          <Alert status="error">
            <AlertIcon />
            {error || 'Failed to load dashboard data'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>Admin Dashboard</Heading>
            <Text color="gray.600">Welcome back, {user.firstName} {user.lastName}. Here's your business overview.</Text>
          </Box>

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Orders</StatLabel>
                  <StatNumber>{stats.totalOrders}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    12% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Revenue</StatLabel>
                  <StatNumber>${stats.totalRevenue.toFixed(2)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    8% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Active Products</StatLabel>
                  <StatNumber>{stats.totalProducts}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    5 added this week
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Customers</StatLabel>
                  <StatNumber>{stats.totalCustomers}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    3% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Quick Actions */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Quick Actions</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Button
                    leftIcon={<Icon as={FiShoppingBag} />}
                    colorScheme="blue"
                    variant="outline"
                    size="lg"
                    h="auto"
                    py={4}
                    onClick={() => navigate('/admin/stores')}
                  >
                    <VStack spacing={1}>
                      <Text fontWeight="bold">Store Management</Text>
                      <Text fontSize="sm" color="gray.600">Manage store applications</Text>
                    </VStack>
                  </Button>

                  <Button
                    leftIcon={<Icon as={FiUsers} />}
                    colorScheme="green"
                    variant="outline"
                    size="lg"
                    h="auto"
                    py={4}
                    onClick={() => navigate('/admin/roles')}
                  >
                    <VStack spacing={1}>
                      <Text fontWeight="bold">User Roles</Text>
                      <Text fontSize="sm" color="gray.600">Manage user permissions</Text>
                    </VStack>
                  </Button>

                  <Button
                    leftIcon={<Icon as={FiSettings} />}
                    colorScheme="purple"
                    variant="outline"
                    size="lg"
                    h="auto"
                    py={4}
                    onClick={() => navigate('/admin/products')}
                  >
                    <VStack spacing={1}>
                      <Text fontWeight="bold">Products</Text>
                      <Text fontSize="sm" color="gray.600">Manage products & inventory</Text>
                    </VStack>
                  </Button>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Order Status Overview */}
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Order Status Overview</Heading>
                  
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiShoppingCart} color="yellow.500" />
                        <Text>Pending Orders</Text>
                      </HStack>
                      <Badge colorScheme="yellow">{stats.pendingOrders}</Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiTruck} color="purple.500" />
                        <Text>Shipped Orders</Text>
                      </HStack>
                      <Badge colorScheme="purple">{stats.shippedOrders}</Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiBarChart} color="green.500" />
                        <Text>Delivered Orders</Text>
                      </HStack>
                      <Badge colorScheme="green">{stats.deliveredOrders}</Badge>
                    </HStack>
                  </VStack>

                  <Divider />

                  <HStack justify="space-between">
                    <Text fontWeight="semibold">Average Order Value</Text>
                    <Text fontWeight="bold" color="blue.500">
                      ${stats.averageOrderValue.toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Top Selling Products */}
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Top Selling Products</Heading>
                  
                  <VStack spacing={3} align="stretch">
                    {stats.topSellingProducts.map((product, index) => (
                      <HStack key={product.id} justify="space-between">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text 
                            fontWeight="medium" 
                            fontSize="sm" 
                            noOfLines={1}
                            color="blue.600"
                            cursor="pointer"
                            _hover={{ textDecoration: 'underline', color: 'blue.700' }}
                            onClick={() => navigate(`/admin/products/${product.id}`)}
                          >
                            {product.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {product.totalSold} units sold
                          </Text>
                        </VStack>
                        <Text fontWeight="semibold" color="green.500">
                          ${product.revenue.toFixed(0)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    colorScheme="green"
                    onClick={() => navigate('/admin/products')}
                    mt={2}
                  >
                    View All Products
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Recent Orders */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Heading size="md">Recent Orders</Heading>
                  <Button size="sm" variant="outline" onClick={() => navigate('/admin/orders')}>
                    View All Orders
                  </Button>
                </Flex>

                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Order ID</Th>
                        <Th>Customer</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        <Th>Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {stats.recentOrders.map((order) => {
                        const statusInfo = getOrderStatusText(order.status as any);
                        return (
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
                            <Td fontWeight="semibold">
                              ${order.totalAmount.toFixed(2)}
                            </Td>
                            <Td>
                              <Badge colorScheme={statusInfo.color} size="sm">
                                {statusInfo.text}
                              </Badge>
                            </Td>
                            <Td fontSize="sm" color="gray.600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;