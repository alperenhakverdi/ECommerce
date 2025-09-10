import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Select,
  Image,
  Card,
  CardHeader,
  CardBody,
  useToast,
  useColorModeValue,
  Icon,
  AspectRatio,
} from '@chakra-ui/react';
import { FiArrowLeft, FiUpload, FiSave } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { productsApi, storesApi } from '../services/api';
import { generateProductId } from '../utils/storeUtils';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

const ProductFormPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    images: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [userStores, setUserStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const loadUserStores = async () => {
    try {
      const response = await storesApi.getMyStores();
      setUserStores(response.data);
      if (response.data.length > 0) {
        setSelectedStoreId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load user stores:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your stores.',
        status: 'error',
        duration: 4000,
      });
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:5133/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Load user stores and redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && (!user || !user.roles?.includes('StoreOwner'))) {
      navigate('/');
    } else if (user && user.roles?.includes('StoreOwner')) {
      loadUserStores();
      loadCategories();
    }
  }, [user, isLoading, navigate, loadUserStores, loadCategories]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          images: [result] // For now, single image
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields with valid values.',
        status: 'error',
        duration: 4000,
      });
      return;
    }

    if (!selectedStoreId) {
      toast({
        title: 'Error',
        description: 'Please select a store for this product.',
        status: 'error',
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the selected store
      const selectedStore = userStores.find(store => store.id === selectedStoreId);
      
      // Generate proper product ID
      const productId = generateProductId(formData.name, selectedStoreId);

      // Find selected category
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      
      // Prepare product data for API (CreateProductDto format)
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        basePrice: formData.price,  // Backend expects basePrice
        price: formData.price,      // Backward compatibility
        stock: formData.stock,
        imageUrl: 'https://via.placeholder.com/300x300?text=Product',
        categoryId: formData.category,  // This should be a valid GUID string
        // storeId will be set by the backend from URL parameter
        hasVariants: false,
        weight: 0,
        tags: null,
        variants: []
      };

      // Create product via backend API
      console.log('Creating product for store:', selectedStoreId, 'with data:', productData);
      
      try {
        // Use store-specific API (preferred)
        console.log('Trying storesApi.createProduct...');
        await storesApi.createProduct(selectedStoreId, productData);
        console.log('✅ storesApi.createProduct succeeded');
      } catch (firstError: any) {
        console.log('❌ storesApi.createProduct failed:', firstError?.response?.status, firstError?.response?.data);
        
        try {
          // Fallback to general products API  
          console.log('Trying productsApi.create...');
          await productsApi.create(productData);
          console.log('✅ productsApi.create succeeded');
        } catch (secondError: any) {
          console.log('❌ Both API endpoints failed:', secondError?.response?.status, secondError?.response?.data);
          throw secondError; // Re-throw the last error
        }
      }

      toast({
        title: 'Success!',
        description: `Product "${formData.name}" has been created successfully.`,
        status: 'success',
        duration: 4000,
      });

      // Navigate back to store dashboard
      navigate('/store/dashboard?tab=products');
    } catch (error: any) {
      console.error('Product creation failed:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to create product. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/store/dashboard?tab=products')}
          >
            Back to Store Dashboard
          </Button>
        </HStack>

        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="2xl" fontWeight="bold">
              Add New Product
            </Text>
          </CardHeader>

          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Product Name */}
              <FormControl isRequired>
                <FormLabel>Product Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                />
              </FormControl>

              {/* Description */}
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </FormControl>

              <HStack spacing={4} align="start">
                {/* Price */}
                <FormControl isRequired>
                  <FormLabel>Price ($)</FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(valueString) => handleInputChange('price', parseFloat(valueString) || 0)}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                {/* Stock */}
                <FormControl isRequired>
                  <FormLabel>Stock Quantity</FormLabel>
                  <NumberInput
                    value={formData.stock}
                    onChange={(valueString) => handleInputChange('stock', parseInt(valueString) || 0)}
                    min={0}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </HStack>

              {/* Category */}
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Select category"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Store Selection */}
              <FormControl isRequired>
                <FormLabel>Store</FormLabel>
                <Select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  placeholder="Select store"
                >
                  {userStores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Image Upload */}
              <FormControl>
                <FormLabel>Product Image</FormLabel>
                <VStack spacing={4} align="stretch">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    display="none"
                    id="image-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="image-upload"
                    leftIcon={<FiUpload />}
                    variant="outline"
                    cursor="pointer"
                  >
                    Upload Image
                  </Button>
                  
                  {imagePreview && (
                    <AspectRatio ratio={16/9} maxW="300px">
                      <Image
                        src={imagePreview}
                        alt="Product preview"
                        borderRadius="md"
                        objectFit="cover"
                        border="1px"
                        borderColor={borderColor}
                      />
                    </AspectRatio>
                  )}
                </VStack>
              </FormControl>

              {/* Submit Button */}
              <HStack justify="flex-end" pt={4}>
                <Button
                  variant="outline"
                  onClick={() => navigate('/store/dashboard?tab=products')}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiSave />}
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Creating..."
                >
                  Create Product
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default ProductFormPage;