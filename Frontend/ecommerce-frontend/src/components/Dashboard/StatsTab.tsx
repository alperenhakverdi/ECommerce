import React, { memo } from 'react';
import {
  VStack,
  Grid,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Text,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiDollarSign, FiPackage, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Store, StoreStats } from '../../types';

interface StatsTabProps {
  store: Store;
  stats: StoreStats | null;
  loading: boolean;
  error: string | null;
}

const StatsTabComponent: React.FC<StatsTabProps> = ({
  store,
  stats,
  loading,
  error,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
      {/* Store Status Card */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="semibold">
              {store.name}
            </Text>
            <Badge 
              colorScheme={store.isApproved ? 'green' : 'yellow'}
              size="lg"
            >
              {store.isApproved ? 'Approved' : 'Pending Approval'}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <Text color="gray.600">{store.description}</Text>
        </CardBody>
      </Card>

      {/* Statistics Cards */}
      {loading ? (
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="120px" />
          ))}
        </Grid>
      ) : stats ? (
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          {/* Revenue Card */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack>
                  <FiDollarSign color="green" />
                  <StatLabel>Total Revenue</StatLabel>
                </HStack>
                <StatNumber>${stats.totalRevenue.toLocaleString()}</StatNumber>
                <StatHelpText>All time revenue</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Products Card */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack>
                  <FiPackage color="blue" />
                  <StatLabel>Total Products</StatLabel>
                </HStack>
                <StatNumber>{stats.totalProducts}</StatNumber>
                <StatHelpText>Active products</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Sales Card */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack>
                  <FiTrendingUp color="purple" />
                  <StatLabel>Total Sales</StatLabel>
                </HStack>
                <StatNumber>{stats.totalSales}</StatNumber>
                <StatHelpText>All time sales count</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* Rating Card */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <HStack>
                  <FiUsers color="orange" />
                  <StatLabel>Store Rating</StatLabel>
                </HStack>
                <StatNumber>{store.rating.toFixed(1)}/5.0</StatNumber>
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
  );
};

// Memoize the component to prevent unnecessary re-renders
export const StatsTab = memo(StatsTabComponent);