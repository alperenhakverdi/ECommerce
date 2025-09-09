import React, { ReactNode } from 'react';
import { Box, Spinner, Text, VStack, Button, useDisclosure } from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = [], 
  fallback 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box textAlign="center" py={10}>
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.600">
            You need to be signed in to access this page
          </Text>
          <Button colorScheme="blue" onClick={onOpen}>
            Sign In
          </Button>
          <AuthModal isOpen={isOpen} onClose={onClose} defaultMode="login" />
        </VStack>
      </Box>
    );
  }

  // Check roles if specified
  if (roles.length > 0 && user) {
    const hasRequiredRole = roles.some(role => user.roles.includes(role));
    if (!hasRequiredRole) {
      return (
        <Box textAlign="center" py={10}>
          <VStack spacing={4}>
            <Text fontSize="lg" color="red.500">
              Access Denied
            </Text>
            <Text color="gray.600">
              You don't have permission to access this page
            </Text>
          </VStack>
        </Box>
      );
    }
  }

  return <>{children}</>;
};