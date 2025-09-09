import React from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Circle,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  FiClock,
  FiPackage,
  FiTruck,
  FiHome,
  FiX,
  FiRefreshCw,
  FiCreditCard,
} from 'react-icons/fi';
import { OrderStatus } from '../../types';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  createdAt: string;
  shippedDate?: string;
  deliveredDate?: string;
}

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: any;
  color: string;
  description: string;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  createdAt,
  shippedDate,
  deliveredDate,
}) => {
  const activeColor = useColorModeValue('green.500', 'green.300');
  const inactiveColor = useColorModeValue('gray.300', 'gray.600');
  const completedBg = useColorModeValue('green.50', 'green.900');
  const pendingBg = useColorModeValue('orange.50', 'orange.900');
  const cancelledBg = useColorModeValue('red.50', 'red.900');

  const getTimelineSteps = (): TimelineStep[] => {
    const baseSteps: TimelineStep[] = [
      {
        status: OrderStatus.Pending,
        label: 'Order Placed',
        icon: FiClock,
        color: 'orange.500',
        description: 'Your order has been received and is awaiting payment confirmation.',
      },
      {
        status: OrderStatus.Paid,
        label: 'Payment Confirmed',
        icon: FiCreditCard,
        color: 'blue.500',
        description: 'Payment has been confirmed and order is ready for processing.',
      },
      {
        status: OrderStatus.Processing,
        label: 'Processing',
        icon: FiPackage,
        color: 'purple.500',
        description: 'Your order is being prepared and packaged.',
      },
      {
        status: OrderStatus.Shipped,
        label: 'Shipped',
        icon: FiTruck,
        color: 'teal.500',
        description: 'Your order has been shipped and is on its way.',
      },
      {
        status: OrderStatus.Delivered,
        label: 'Delivered',
        icon: FiHome,
        color: 'green.500',
        description: 'Your order has been successfully delivered.',
      },
    ];

    // Handle cancelled orders
    if (currentStatus === OrderStatus.Cancelled) {
      return [
        baseSteps[0], // Order Placed
        {
          status: OrderStatus.Cancelled,
          label: 'Cancelled',
          icon: FiX,
          color: 'red.500',
          description: 'This order has been cancelled.',
        },
      ];
    }

    // Handle refunded orders
    if (currentStatus === OrderStatus.Refunded) {
      return [
        ...baseSteps,
        {
          status: OrderStatus.Refunded,
          label: 'Refunded',
          icon: FiRefreshCw,
          color: 'red.500',
          description: 'Payment has been refunded for this order.',
        },
      ];
    }

    return baseSteps;
  };

  const timelineSteps = getTimelineSteps();

  const isStepCompleted = (stepStatus: OrderStatus): boolean => {
    if (currentStatus === OrderStatus.Cancelled) {
      return stepStatus === OrderStatus.Pending || stepStatus === OrderStatus.Cancelled;
    }
    
    if (currentStatus === OrderStatus.Refunded) {
      return true; // All steps are considered completed for refunded orders
    }

    return stepStatus <= currentStatus;
  };

  const getStepDate = (stepStatus: OrderStatus): string | undefined => {
    switch (stepStatus) {
      case OrderStatus.Pending:
        return createdAt;
      case OrderStatus.Shipped:
        return shippedDate;
      case OrderStatus.Delivered:
        return deliveredDate;
      default:
        return undefined;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBg = () => {
    if (currentStatus === OrderStatus.Cancelled || currentStatus === OrderStatus.Refunded) {
      return cancelledBg;
    }
    if (currentStatus === OrderStatus.Delivered) {
      return completedBg;
    }
    return pendingBg;
  };

  return (
    <Box p={6} bg={getStatusBg()} borderRadius="lg" border="1px" borderColor="gray.200">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Order Status Timeline
      </Text>
      
      <VStack align="stretch" spacing={4}>
        {timelineSteps.map((step, index) => {
          const isCompleted = isStepCompleted(step.status);
          const isCurrent = step.status === currentStatus;
          const stepDate = getStepDate(step.status);

          return (
            <Flex key={step.status} align="flex-start">
              <Box position="relative">
                <Circle
                  size="10"
                  bg={isCompleted ? activeColor : inactiveColor}
                  color="white"
                  border={isCurrent ? '3px solid' : 'none'}
                  borderColor={isCurrent ? step.color : 'transparent'}
                >
                  <Icon as={step.icon} boxSize="5" />
                </Circle>
                
                {index < timelineSteps.length - 1 && (
                  <Box
                    position="absolute"
                    left="50%"
                    transform="translateX(-50%)"
                    width="2px"
                    height="6"
                    bg={isCompleted ? activeColor : inactiveColor}
                    top="10"
                  />
                )}
              </Box>
              
              <VStack align="flex-start" ml={4} spacing={1} flex={1}>
                <HStack>
                  <Text
                    fontSize="md"
                    fontWeight={isCurrent ? 'bold' : 'medium'}
                    color={isCompleted ? 'inherit' : 'gray.500'}
                  >
                    {step.label}
                  </Text>
                  {stepDate && (
                    <Text fontSize="sm" color="gray.500">
                      {formatDate(stepDate)}
                    </Text>
                  )}
                </HStack>
                
                <Text
                  fontSize="sm"
                  color={isCompleted ? 'gray.600' : 'gray.400'}
                  maxW="md"
                >
                  {step.description}
                </Text>
              </VStack>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

export default OrderStatusTimeline;