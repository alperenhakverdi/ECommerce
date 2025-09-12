import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Select,
  Switch,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  useColorModeValue,
  Card,
  CardBody,
  Flex,
  Image,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiEye,
  FiPackage,
  FiDollarSign,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { productsApi, categoriesApi } from '../services/api';
import { Product, Category } from '../types';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
  isActive: boolean;
}

const AdminProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    imageUrl: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (user && user.roles.includes('Admin')) {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      imageUrl: '',
      isActive: true
    });
    setEditingProduct(null);
    setErrors({});
  };

  const handleCreate = () => {
    resetForm();
    onOpen();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || '',
      isActive: product.isActive
    });
    setErrors({});
    onOpen();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (formData.stock < 0) {
      newErrors.stock = 'Stock quantity cannot be negative';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl || null,
        isActive: formData.isActive
      };

      if (editingProduct) {
        // Update existing product
        await productsApi.update(editingProduct.id, payload);
        toast({
          title: 'Success',
          description: 'Product updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new product
        await productsApi.create(payload);
        toast({
          title: 'Success',
          description: 'Product created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      await fetchProducts();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingProduct ? 'update' : 'create'} product`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await productsApi.delete(product.id);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
            <Text>Loading products...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg" mb={2}>Product Management</Heading>
              <Text color="gray.600">Manage your product catalog</Text>
            </Box>
            <Button
              colorScheme="blue"
              leftIcon={<FiPlus />}
              onClick={handleCreate}
            >
              Add Product
            </Button>
          </Flex>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <HStack>
                  <Box p={2} bg="blue.100" borderRadius="md">
                    <FiPackage color="blue" size={20} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Total Products</Text>
                    <Text fontSize="2xl" fontWeight="bold">{products.length}</Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <HStack>
                  <Box p={2} bg="green.100" borderRadius="md">
                    <FiEye color="green" size={20} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Active Products</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {products.filter(p => p.isActive).length}
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <HStack>
                  <Box p={2} bg="yellow.100" borderRadius="md">
                    <FiDollarSign color="orange" size={20} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Avg. Price</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      ${products.length > 0 
                        ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) 
                        : '0.00'
                      }
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Products Table */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th>Category</Th>
                      <Th>Price</Th>
                      <Th>Stock</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products.map((product) => (
                      <Tr key={product.id}>
                        <Td>
                          <HStack>
                            {product.imageUrl && (
                              <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                boxSize="40px" 
                                objectFit="cover" 
                                objectPosition="center"
                                borderRadius="md"
                                fallbackSrc="https://via.placeholder.com/40"
                              />
                            )}
                            <Box>
                              <Text fontWeight="medium" fontSize="sm">
                                {product.name}
                              </Text>
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {product.description}
                              </Text>
                            </Box>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge size="sm" colorScheme="blue">
                            {getCategoryName(product.categoryId)}
                          </Badge>
                        </Td>
                        <Td fontWeight="semibold">
                          ${product.price.toFixed(2)}
                        </Td>
                        <Td>
                          <Badge 
                            size="sm" 
                            colorScheme={product.stock > 10 ? 'green' : 
                                       product.stock > 0 ? 'yellow' : 'red'}
                          >
                            {product.stock}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge 
                            size="sm" 
                            colorScheme={product.isActive ? 'green' : 'gray'}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Edit product"
                              icon={<FiEdit />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(product)}
                            />
                            <IconButton
                              aria-label="Delete product"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDelete(product)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Product Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Product Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    clearFieldError('name');
                  }}
                  placeholder="Enter product name"
                />
                {errors.name && <Text color="red.500" fontSize="sm">{errors.name}</Text>}
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    clearFieldError('description');
                  }}
                  placeholder="Enter product description"
                  rows={3}
                />
                {errors.description && <Text color="red.500" fontSize="sm">{errors.description}</Text>}
              </FormControl>

              <HStack>
                <FormControl isInvalid={!!errors.price}>
                  <FormLabel>Price ($)</FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(_, value) => {
                      setFormData(prev => ({ ...prev, price: value || 0 }));
                      clearFieldError('price');
                    }}
                    min={0}
                    precision={2}
                    step={0.01}
                  >
                    <NumberInputField placeholder="0.00" />
                  </NumberInput>
                  {errors.price && <Text color="red.500" fontSize="sm">{errors.price}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.stock}>
                  <FormLabel>Stock Quantity</FormLabel>
                  <NumberInput
                    value={formData.stock}
                    onChange={(_, value) => {
                      setFormData(prev => ({ ...prev, stock: value || 0 }));
                      clearFieldError('stock');
                    }}
                    min={0}
                  >
                    <NumberInputField placeholder="0" />
                  </NumberInput>
                  {errors.stock && <Text color="red.500" fontSize="sm">{errors.stock}</Text>}
                </FormControl>
              </HStack>

              <FormControl isInvalid={!!errors.categoryId}>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, categoryId: e.target.value }));
                    clearFieldError('categoryId');
                  }}
                  placeholder="Select a category"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {errors.categoryId && <Text color="red.500" fontSize="sm">{errors.categoryId}</Text>}
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Enter image URL (optional)"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="isActive" mb="0">
                  Active Product
                </FormLabel>
                <Switch
                  id="isActive"
                  isChecked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={submitting}
              loadingText={editingProduct ? 'Updating...' : 'Creating...'}
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminProductsPage;
