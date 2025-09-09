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
  Progress,
  Flex,
  Button,
  Select,
  Avatar,
} from '@chakra-ui/react';
import { 
  FiTrendingUp, 
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiBarChart,
  FiPieChart,
  FiTarget,
  FiGlobe,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';

interface AnalyticsData {
  revenueGrowth: {
    current: number;
    previous: number;
    percentage: number;
    trend: 'up' | 'down';
  };
  userGrowth: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    growthRate: number;
  };
  salesMetrics: {
    totalSales: number;
    averageOrderValue: number;
    conversionRate: number;
    totalOrders: number;
  };
  topCategories: Array<{
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  performanceMetrics: {
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    mobileTraffic: number;
  };
  topPerformers: Array<{
    storeName: string;
    revenue: number;
    orders: number;
    rating: number;
  }>;
}

const AdminAnalyticsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Mock data for now - replace with actual API call
        const mockAnalytics: AnalyticsData = {
          revenueGrowth: {
            current: 125420,
            previous: 98300,
            percentage: 27.6,
            trend: 'up'
          },
          userGrowth: {
            totalUsers: 15847,
            newUsers: 1290,
            activeUsers: 8420,
            growthRate: 15.8
          },
          salesMetrics: {
            totalSales: 2840,
            averageOrderValue: 87.50,
            conversionRate: 3.24,
            totalOrders: 1847
          },
          topCategories: [
            { name: 'Electronics', revenue: 45800, orders: 524, growth: 18.5 },
            { name: 'Fashion', revenue: 32400, orders: 487, growth: 12.3 },
            { name: 'Home & Garden', revenue: 28900, orders: 356, growth: 22.1 },
            { name: 'Books', revenue: 18600, orders: 298, growth: -5.2 }
          ],
          performanceMetrics: {
            pageViews: 247580,
            bounceRate: 24.5,
            avgSessionDuration: 4.2,
            mobileTraffic: 68.3
          },
          topPerformers: [
            { storeName: 'Tech Haven', revenue: 28400, orders: 145, rating: 4.8 },
            { storeName: 'Fashion Forward', revenue: 24800, orders: 198, rating: 4.7 },
            { storeName: 'Green Garden', revenue: 19600, orders: 112, rating: 4.9 },
            { storeName: 'Book Nook', revenue: 15200, orders: 89, rating: 4.6 }
          ]
        };

        setAnalytics(mockAnalytics);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user?.roles.includes('Admin')) {
      fetchAnalyticsData();
    }
  }, [authLoading, user, timeRange]);

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
            <Spinner size="xl" color="purple.500" />
            <Text>Loading analytics data...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error || !analytics) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.md">
          <Alert status="error">
            <AlertIcon />
            {error || 'Failed to load analytics data'}
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
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" mb={2} color="purple.600">📊 Business Analytics</Heading>
              <Text color="gray.600">Comprehensive business insights and performance metrics</Text>
            </Box>
            <HStack spacing={4}>
              <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} maxW="150px">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </Select>
              <Button
                leftIcon={<Icon as={FiBarChart} />}
                colorScheme="purple"
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                Back to Dashboard
              </Button>
            </HStack>
          </Flex>

          {/* Key Performance Indicators */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="purple.500">💰 Total Revenue</StatLabel>
                  <StatNumber>${analytics.revenueGrowth.current.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {analytics.revenueGrowth.percentage}% from last period
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="blue.500">👥 Active Users</StatLabel>
                  <StatNumber>{analytics.userGrowth.activeUsers.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {analytics.userGrowth.growthRate}% growth rate
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="green.500">🛒 Total Orders</StatLabel>
                  <StatNumber>{analytics.salesMetrics.totalOrders.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    Average: ${analytics.salesMetrics.averageOrderValue}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel color="orange.500">📈 Conversion Rate</StatLabel>
                  <StatNumber>{analytics.salesMetrics.conversionRate}%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Industry avg: 2.5%
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Performance Metrics */}
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color="blue.600">🎯 Performance Metrics</Heading>
                  
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">Page Views</Text>
                        <Text fontSize="sm" color="blue.500" fontWeight="bold">
                          {analytics.performanceMetrics.pageViews.toLocaleString()}
                        </Text>
                      </Flex>
                      <Progress value={75} colorScheme="blue" size="sm" borderRadius="full" />
                    </Box>

                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">Mobile Traffic</Text>
                        <Text fontSize="sm" color="green.500" fontWeight="bold">
                          {analytics.performanceMetrics.mobileTraffic}%
                        </Text>
                      </Flex>
                      <Progress value={analytics.performanceMetrics.mobileTraffic} colorScheme="green" size="sm" borderRadius="full" />
                    </Box>

                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">Bounce Rate</Text>
                        <Text fontSize="sm" color="yellow.600" fontWeight="bold">
                          {analytics.performanceMetrics.bounceRate}%
                        </Text>
                      </Flex>
                      <Progress value={analytics.performanceMetrics.bounceRate} colorScheme="yellow" size="sm" borderRadius="full" />
                    </Box>

                    <Divider />

                    <HStack justify="space-between">
                      <Text fontWeight="semibold">Avg Session Duration</Text>
                      <Text fontWeight="bold" color="purple.500">
                        {analytics.performanceMetrics.avgSessionDuration} min
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Top Categories */}
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md" color="green.600">📦 Top Categories</Heading>
                  
                  <VStack spacing={3} align="stretch">
                    {analytics.topCategories.map((category, index) => (
                      <HStack key={category.name} justify="space-between">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {category.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {category.orders} orders
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="bold" color="green.500">
                            ${category.revenue.toLocaleString()}
                          </Text>
                          <Badge 
                            colorScheme={category.growth > 0 ? 'green' : 'red'} 
                            size="sm"
                          >
                            {category.growth > 0 ? '+' : ''}{category.growth}%
                          </Badge>
                        </VStack>
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
                    View All Categories
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Top Performing Stores */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="orange.600">🏆 Top Performing Stores</Heading>
                  <Button size="sm" variant="outline" onClick={() => navigate('/admin/stores')}>
                    View All Stores
                  </Button>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  {analytics.topPerformers.map((store, index) => (
                    <Card key={store.storeName} variant="outline" borderColor="orange.200">
                      <CardBody>
                        <VStack spacing={3}>
                          <Avatar name={store.storeName} bg="orange.100" color="orange.600" size="md" />
                          <VStack spacing={1} textAlign="center">
                            <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                              {store.storeName}
                            </Text>
                            <HStack spacing={1}>
                              {Array.from({ length: 5 }, (_, i) => (
                                <Text key={i} color={i < Math.floor(store.rating) ? "yellow.400" : "gray.300"}>
                                  ⭐
                                </Text>
                              ))}
                              <Text fontSize="xs" color="gray.500">
                                ({store.rating})
                              </Text>
                            </HStack>
                          </VStack>
                          <Divider />
                          <VStack spacing={1} w="full">
                            <HStack justify="space-between" w="full">
                              <Text fontSize="xs" color="gray.500">Revenue:</Text>
                              <Text fontSize="xs" fontWeight="bold" color="green.500">
                                ${store.revenue.toLocaleString()}
                              </Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="xs" color="gray.500">Orders:</Text>
                              <Text fontSize="xs" fontWeight="bold" color="blue.500">
                                {store.orders}
                              </Text>
                            </HStack>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="purple.600">⚡ Quick Actions</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Button
                    leftIcon={<Icon as={FiTrendingUp} />}
                    colorScheme="blue"
                    variant="outline"
                    size="lg"
                    h="auto"
                    py={4}
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    <VStack spacing={1}>
                      <Text fontWeight="bold">Revenue Report</Text>
                      <Text fontSize="sm" color="gray.600">Generate detailed reports</Text>
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
                      <Text fontWeight="bold">User Analytics</Text>
                      <Text fontSize="sm" color="gray.600">User behavior insights</Text>
                    </VStack>
                  </Button>

                  <Button
                    leftIcon={<Icon as={FiShoppingBag} />}
                    colorScheme="purple"
                    variant="outline"
                    size="lg"
                    h="auto"
                    py={4}
                    onClick={() => navigate('/admin/stores')}
                  >
                    <VStack spacing={1}>
                      <Text fontWeight="bold">Store Performance</Text>
                      <Text fontSize="sm" color="gray.600">Detailed store metrics</Text>
                    </VStack>
                  </Button>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminAnalyticsPage;