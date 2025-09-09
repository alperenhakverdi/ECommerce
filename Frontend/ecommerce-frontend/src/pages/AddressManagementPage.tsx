import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { AddressManagement } from '../components/Address';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const AddressManagementPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Box minH="calc(100vh - 80px)" bg="gray.50">
        <AddressManagement />
      </Box>
    </ProtectedRoute>
  );
};

export default AddressManagementPage;