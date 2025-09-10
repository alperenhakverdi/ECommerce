import React, { memo, useMemo, useCallback } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  Badge,
  Box,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Product, Store } from '../../types';
import { VirtualTable } from '../VirtualTable';

interface ProductsTabProps {
  store: Store;
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface ProductTableColumn {
  key: keyof Product;
  header: string;
  render?: (value: any, item: Product, index: number) => React.ReactNode;
  width?: string;
}

const ProductsTabComponent: React.FC<ProductsTabProps> = ({
  store,
  products,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  // Memoized table columns to prevent re-creation on each render
  const columns = useMemo<ProductTableColumn[]>(() => [
    {
      key: 'name',
      header: 'Product Name',
      width: '30%',
      render: (_, item) => (
        <VStack align="start" spacing={1}>
          <Text fontWeight="medium">{item.name}</Text>
          <Text fontSize="sm" color="gray.600">
            ID: {item.id}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      width: '15%',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      width: '15%',
      render: (stock) => (
        <Badge colorScheme={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      width: '15%',
      render: (isActive) => (
        <Badge colorScheme={isActive ? 'green' : 'gray'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      width: '25%',
      render: (_, item) => (
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiEdit />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/store/products/${item.id}/edit`);
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            leftIcon={<FiTrash2 />}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement delete functionality
              console.log('Delete product:', item.id);
            }}
          >
            Delete
          </Button>
        </HStack>
      ),
    },
  ], [navigate]);

  // Memoized row click handler
  const handleRowClick = useCallback((product: Product) => {
    navigate(`/product/${product.id}`);
  }, [navigate]);

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
          Products ({products.length})
        </Text>
        <Button
          colorScheme="blue"
          leftIcon={<FiPlus />}
          onClick={() => navigate('/store/products/new')}
          isDisabled={!store.isApproved}
        >
          Add Product
        </Button>
      </HStack>

      {/* Store Approval Warning */}
      {!store.isApproved && (
        <Alert status="warning">
          <AlertIcon />
          You can add products after your store is approved by an admin.
        </Alert>
      )}

      {/* Products Table */}
      <Box>
        <VirtualTable
          data={products}
          columns={columns}
          loading={loading}
          emptyMessage="No products yet. Add your first product to get started!"
          itemHeight={80}
          maxHeight={500}
          onRowClick={handleRowClick}
        />
      </Box>
    </VStack>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ProductsTab = memo(ProductsTabComponent);