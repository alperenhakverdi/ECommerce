import React from 'react';
import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Button,
  Text,
  Avatar,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: string[];
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeColor = useColorModeValue('blue.50', 'blue.900');
  const activeBorderColor = useColorModeValue('blue.500', 'blue.300');

  // Common navigation items for all users
  const commonNavItems: NavigationItem[] = [
    { id: 'overview', label: 'Profile Overview', icon: '👤', path: '/profile' },
    { id: 'security', label: 'Security Settings', icon: '🔒', path: '/profile/security' },
    { id: 'orders', label: 'Order History', icon: '📦', path: '/orders' },
    { id: 'payments', label: 'Payment Methods', icon: '💳', path: '/saved-cards' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/profile/notifications' },
  ];

  // Role-specific navigation items
  const roleSpecificNavItems: NavigationItem[] = [
    // Customer specific
    { id: 'wishlist', label: 'Wishlist', icon: '❤️', path: '/profile/wishlist', roles: ['Customer'] },
    { id: 'addresses', label: 'Delivery Addresses', icon: '📍', path: '/profile/addresses', roles: ['Customer'] },
    { id: 'reviews', label: 'My Reviews', icon: '⭐', path: '/profile/reviews', roles: ['Customer'] },
    
    // Store Owner specific
    { id: 'store-dashboard', label: 'Store Dashboard', icon: '🏪', path: '/store/dashboard', roles: ['StoreOwner'] },
    { id: 'store-analytics', label: 'Store Analytics', icon: '📊', path: '/store/analytics', roles: ['StoreOwner'] },
    { id: 'store-orders', label: 'Store Orders', icon: '📋', path: '/store/orders', roles: ['StoreOwner'] },
    
    // Admin specific
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: '👨‍💼', path: '/admin/dashboard', roles: ['Admin'] },
    { id: 'admin-analytics', label: 'System Analytics', icon: '📈', path: '/admin/analytics/overview', roles: ['Admin'] },
    { id: 'user-management', label: 'User Management', icon: '👥', path: '/admin/roles', roles: ['Admin'] },
  ];

  // Filter navigation items based on user roles
  const getFilteredNavItems = () => {
    if (!user) return commonNavItems;
    
    const filteredRoleItems = roleSpecificNavItems.filter(item => 
      !item.roles || item.roles.some(role => user.roles.includes(role))
    );
    
    return [...commonNavItems, ...filteredRoleItems];
  };

  const navItems = getFilteredNavItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close mobile drawer after navigation
  };

  const NavigationContent = () => (
    <VStack align="stretch" spacing={2}>
      {/* Profile Header */}
      <Box p={4} borderBottom="1px" borderColor={borderColor}>
        <VStack spacing={3}>
          <Avatar
            size="lg"
            name={`${user?.firstName} ${user?.lastName}`}
            bg="blue.500"
          />
          <VStack spacing={1}>
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              {user?.email}
            </Text>
            {user?.roles && (
              <Text fontSize="xs" color="blue.600" fontWeight="medium">
                {user.roles.join(', ')}
              </Text>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Navigation Items */}
      <VStack align="stretch" spacing={1} p={2}>
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<Text>{item.icon}</Text>}
            onClick={() => handleNavigation(item.path)}
            bg={isActive(item.path) ? activeColor : 'transparent'}
            borderLeft="3px solid"
            borderLeftColor={isActive(item.path) ? activeBorderColor : 'transparent'}
            borderRadius="md"
            py={3}
            px={4}
            _hover={{
              bg: activeColor,
            }}
            fontSize="sm"
            fontWeight={isActive(item.path) ? "semibold" : "normal"}
          >
            {item.label}
          </Button>
        ))}
      </VStack>
    </VStack>
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
        {/* Desktop Sidebar */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          width="280px"
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          height="fit-content"
          position="sticky"
          top="8"
        >
          <NavigationContent />
        </Box>

        {/* Mobile Header */}
        <HStack
          display={{ base: 'flex', lg: 'none' }}
          justify="space-between"
          p={4}
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          mb={4}
        >
          <HStack>
            <Avatar
              size="sm"
              name={`${user?.firstName} ${user?.lastName}`}
              bg="blue.500"
            />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="bold">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text fontSize="xs" color="gray.500">
                Profile Settings
              </Text>
            </VStack>
          </HStack>
          <IconButton
            aria-label="Open navigation menu"
            icon={<HamburgerIcon />}
            onClick={onOpen}
            variant="ghost"
          />
        </HStack>

        {/* Mobile Drawer */}
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          size="sm"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Profile Navigation</DrawerHeader>
            <DrawerBody px={0}>
              <NavigationContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content Area */}
        <Box flex="1">
          {children}
        </Box>
      </Flex>
    </Container>
  );
};