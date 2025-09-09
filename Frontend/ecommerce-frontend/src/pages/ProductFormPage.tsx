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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Redirect if not authenticated or not a store owner
  React.useEffect(() => {
    if (!isLoading && (!user || !user.roles?.includes('StoreOwner'))) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

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

    setIsSubmitting(true);

    try {
      // TODO: Implement actual API call
      // await productsApi.create(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock product object
      const newProduct = {
        id: `user-product-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        imageUrl: formData.images[0] || 'https://via.placeholder.com/300x300?text=Product',
        categoryId: formData.category,
        categoryName: formData.category,
        isActive: true,
        storeId: 'current-store-id', // This should be dynamic
        storeName: 'Current Store',
        averageRating: 0,
        totalReviews: 0,
        isNew: true,
        createdAt: new Date().toISOString()
      };

      // Add to localStorage
      const existingProducts = JSON.parse(localStorage.getItem('newProducts') || '[]');
      const updatedProducts = [...existingProducts, newProduct];
      localStorage.setItem('newProducts', JSON.stringify(updatedProducts));

      toast({
        title: 'Success!',
        description: `Product "${formData.name}" has been created successfully.`,
        status: 'success',
        duration: 4000,
      });

      // Navigate back to products tab
      navigate('/store/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
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
            onClick={() => navigate('/store/products')}
          >
            Back to Products
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
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports</option>
                  <option value="beauty">Beauty</option>
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
                  onClick={() => navigate('/store/products')}
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