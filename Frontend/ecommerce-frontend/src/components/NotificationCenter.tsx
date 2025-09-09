import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardBody,
  Avatar,
  useColorModeValue,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'store' | 'admin' | 'security' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const readBg = useColorModeValue('gray.50', 'gray.600');

  // Mock notifications data based on user role
  React.useEffect(() => {
    const mockNotifications: Notification[] = [];
    
    // Common notifications
    mockNotifications.push(
      {
        id: '1',
        type: 'security',
        title: 'Password Changed',
        message: 'Your password was successfully updated',
        timestamp: '2 hours ago',
        isRead: false,
        priority: 'medium',
      },
      {
        id: '2',
        type: 'order',
        title: 'Order Delivered',
        message: 'Your order #12345 has been delivered successfully',
        timestamp: '1 day ago',
        isRead: true,
        priority: 'low',
        actionUrl: '/orders/12345',
      }
    );

    // Role-specific notifications
    if (user?.roles.includes('Admin')) {
      mockNotifications.push(
        {
          id: '3',
          type: 'admin',
          title: 'New Store Application',
          message: '3 new store applications require review',
          timestamp: '30 minutes ago',
          isRead: false,
          priority: 'high',
          actionUrl: '/admin/stores',
        },
        {
          id: '4',
          type: 'admin',
          title: 'System Alert',
          message: 'High server load detected - investigating',
          timestamp: '3 hours ago',
          isRead: false,
          priority: 'high',
        }
      );
    }

    if (user?.roles.includes('StoreOwner')) {
      mockNotifications.push(
        {
          id: '5',
          type: 'store',
          title: 'New Order Received',
          message: '2 new orders waiting for processing',
          timestamp: '15 minutes ago',
          isRead: false,
          priority: 'high',
          actionUrl: '/store/orders',
        },
        {
          id: '6',
          type: 'store',
          title: 'Low Stock Alert',
          message: '5 products are running low on stock',
          timestamp: '2 hours ago',
          isRead: false,
          priority: 'medium',
          actionUrl: '/store/products',
        }
      );
    }

    if (user?.roles.includes('Customer')) {
      mockNotifications.push(
        {
          id: '7',
          type: 'promotion',
          title: 'Special Offer',
          message: '20% off on electronics - limited time!',
          timestamp: '4 hours ago',
          isRead: false,
          priority: 'medium',
        },
        {
          id: '8',
          type: 'order',
          title: 'Order Shipped',
          message: 'Your order #12346 is on the way',
          timestamp: '1 day ago',
          isRead: true,
          priority: 'low',
          actionUrl: '/orders/12346',
        }
      );
    }

    // Simulate loading
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, [user]);

  const getTypeIcon = (type: Notification['type']) => {
    const icons = {
      order: '📦',
      payment: '💳',
      store: '🏪',
      admin: '👨‍💼',
      security: '🔒',
      promotion: '🏷️',
    };
    return icons[type];
  };

  const getTypeColor = (type: Notification['type']) => {
    const colors = {
      order: 'blue',
      payment: 'green',
      store: 'purple',
      admin: 'red',
      security: 'orange',
      promotion: 'teal',
    };
    return colors[type];
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    const colors = {
      high: 'red',
      medium: 'orange',
      low: 'gray',
    };
    return colors[priority];
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'high':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <VStack spacing={4} py={8}>
        <Spinner size="xl" color="blue.500" />
        <Text>Loading notifications...</Text>
      </VStack>
    );
  }

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <HStack>
            <Text fontSize="2xl" fontWeight="bold">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Badge colorScheme="red" borderRadius="full">
                {unreadCount}
              </Badge>
            )}
          </HStack>
          <Text color="gray.500" fontSize="sm">
            Stay updated with your latest activities
          </Text>
        </VStack>

        <HStack spacing={2}>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
              Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setFilter('all')}>All</MenuItem>
              <MenuItem onClick={() => setFilter('unread')}>Unread</MenuItem>
              <MenuItem onClick={() => setFilter('high')}>High Priority</MenuItem>
            </MenuList>
          </Menu>

          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          {filter === 'all' 
            ? 'No notifications yet' 
            : `No ${filter} notifications`}
        </Alert>
      ) : (
        <VStack spacing={4} align="stretch">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              bg={notification.isRead ? readBg : cardBg}
              border="1px"
              borderColor={borderColor}
              opacity={notification.isRead ? 0.8 : 1}
              cursor={notification.actionUrl ? 'pointer' : 'default'}
              _hover={notification.actionUrl ? { shadow: 'md' } : {}}
              onClick={() => {
                if (!notification.isRead) markAsRead(notification.id);
                if (notification.actionUrl) {
                  window.location.href = notification.actionUrl;
                }
              }}
            >
              <CardBody>
                <HStack justify="space-between" align="start">
                  <HStack spacing={3} align="start" flex="1">
                    <Avatar
                      size="sm"
                      icon={<Text fontSize="lg">{getTypeIcon(notification.type)}</Text>}
                      bg={`${getTypeColor(notification.type)}.100`}
                    />
                    <VStack align="start" spacing={1} flex="1">
                      <HStack spacing={2}>
                        <Text fontWeight="semibold" fontSize="sm">
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <Box
                            w="8px"
                            h="8px"
                            bg="blue.500"
                            borderRadius="full"
                          />
                        )}
                      </HStack>
                      <Text color="gray.600" fontSize="sm">
                        {notification.message}
                      </Text>
                      <HStack spacing={2}>
                        <Text color="gray.400" fontSize="xs">
                          {notification.timestamp}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={getTypeColor(notification.type)}
                          variant="outline"
                        >
                          {notification.type === 'security' ? 'Güvenlik' : 
                           notification.type === 'order' ? 'Sipariş' :
                           notification.type === 'payment' ? 'Ödeme' :
                           notification.type === 'store' ? 'Mağaza' :
                           notification.type === 'admin' ? 'Yönetici' :
                           notification.type === 'promotion' ? 'Promosyon' : 
                           notification.type}
                        </Badge>
                      </HStack>
                    </VStack>
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
};