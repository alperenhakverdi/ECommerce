import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  SimpleGrid,
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
  IconButton,
} from '@chakra-ui/react';
import { FiArrowLeft, FiUpload, FiSave, FiPlus, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { productsApi, storesApi, uploadsApi } from '../services/api';
import { generateProductId } from '../utils/storeUtils';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  imageUrl: string;
  imageUrls: string[];
  maxPerOrder: number;
  gender?: 'women' | 'men' | 'unisex' | '';
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
    imageUrl: '',
    imageUrls: [],
    maxPerOrder: 10,
    gender: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // local previews for immediate UX
  const [userStores, setUserStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const { id: editProductId } = useParams();
  const isEditMode = Boolean(editProductId);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const loadUserStores = useCallback(async () => {
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
  }, [toast]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5133/api/categories');
      const data = await response.json();
      setCategories(data);
      setFormData(prev => {
        if (Array.isArray(data) && data.length > 0 && !prev.category) {
          return { ...prev, category: data[0].id };
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const loadProductForEdit = useCallback(async (productId: string) => {
    try {
      const response = await productsApi.getById(productId);
      const p = response.data;
      setFormData(prev => ({
        ...prev,
        name: p.name || '',
        description: p.description || '',
        price: p.price || 0,
        category: p.categoryId || '',
        stock: p.stock || 0,
        imageUrl: p.imageUrl || '',
        imageUrls: (() => {
          // Prefer p.imageUrls; fallback to tags JSON
          const arr = (p as any).imageUrls as string[] | undefined;
          if (Array.isArray(arr) && arr.length > 0) return arr.slice(0,4);
          try {
            const tagsObj = (p as any).tags ? JSON.parse((p as any).tags) : null;
            if (tagsObj && Array.isArray(tagsObj.imageUrls)) return tagsObj.imageUrls.slice(0,4);
          } catch {}
          return p.imageUrl ? [p.imageUrl] : [];
        })(),
        maxPerOrder: (() => {
          try {
            const tagsObj = (p as any).tags ? JSON.parse((p as any).tags) : null;
            if (tagsObj && typeof tagsObj.maxPerOrder === 'number') return tagsObj.maxPerOrder;
          } catch {}
          return 10;
        })(),
        gender: (() => {
          try {
            const tagsObj = (p as any).tags ? JSON.parse((p as any).tags) : null;
            if (tagsObj && typeof tagsObj.gender === 'string') return tagsObj.gender as any;
          } catch {}
          return '' as any;
        })()
      }));
      if (p.storeId) setSelectedStoreId(p.storeId);
      const preview = (p as any).imageUrls?.[0] || (p as any).imageUrl || '';
      if (preview) setImagePreview(preview);
    } catch (error) {
      console.error('Failed to load product for edit:', error);
      toast({ title: 'Error', description: 'Failed to load product.', status: 'error', duration: 4000 });
    }
  }, [toast]);

  // Load user stores and redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && (!user || !user.roles?.includes('StoreOwner'))) {
      navigate('/');
    } else if (user && user.roles?.includes('StoreOwner')) {
      loadUserStores();
      loadCategories();
      if (isEditMode && editProductId) {
        loadProductForEdit(editProductId);
      }
    }
  }, [user, isLoading, navigate, loadUserStores, loadCategories, isEditMode, editProductId, loadProductForEdit]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const limited = files.slice(0, 4);
    // Show local previews immediately
    const localPreviews = limited.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => Array.from(new Set([...prev, ...localPreviews])).slice(0, 4));
    if (!imagePreview && localPreviews[0]) setImagePreview(localPreviews[0]);
    setIsUploadingImage(true);
    try {
      const uploads = await Promise.all(
        limited.map(async (file) => {
          try {
            const res = await uploadsApi.uploadImage(file);
            return res.data?.url as string;
          } catch (e) {
            return '';
          }
        })
      );
      const urls = uploads.filter(Boolean);
      setFormData(prev => {
        const merged = Array.from(new Set([...(prev.imageUrls || []), ...urls])).slice(0, 4);
        // Set primary imageUrl for backward-compat
        if (!prev.imageUrl && merged[0]) setImagePreview(merged[0]);
        return { ...prev, imageUrls: merged, imageUrl: prev.imageUrl || merged[0] || '' };
      });
      if (!imagePreview && urls[0]) setImagePreview(urls[0]);
    } finally {
      setIsUploadingImage(false);
      // Allow selecting the same file again by resetting the input
      try { (event.target as HTMLInputElement).value = ''; } catch {}
    }
  };

  const handleSlotImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = (event.target.files && event.target.files[0]) || null;
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreviewUrls(prev => {
      const arr = [...(prev || [])];
      while (arr.length < 4) arr.push('');
      arr[index] = localUrl;
      return arr.slice(0,4);
    });
    if (!imagePreview) setImagePreview(localUrl);

    setIsUploadingImage(true);
    try {
      const res = await uploadsApi.uploadImage(file);
      const url = res.data?.url || '';
      if (!url) return;
      setFormData(prev => {
        const arr = [...(prev.imageUrls || [])];
        while (arr.length < 4) arr.push('');
        arr[index] = url;
        const imageUrl = prev.imageUrl || url;
        return { ...prev, imageUrls: arr.slice(0,4), imageUrl };
      });
      setImagePreview(url);
    } finally {
      setIsUploadingImage(false);
      try { (event.target as HTMLInputElement).value = ''; } catch {}
    }
  };

  const handleRemoveImageSlot = (index: number) => {
    setFormData(prev => {
      const newUrls = [...(prev.imageUrls || [])];
      while (newUrls.length < 4) newUrls.push('');
      const removedUrl = newUrls[index];
      newUrls[index] = '';
      // determine a new primary url if needed
      let nextPrimary = prev.imageUrl;
      if (removedUrl && (prev.imageUrl === removedUrl)) {
        nextPrimary = newUrls.find(u => !!u) || '';
      }
      return { ...prev, imageUrls: newUrls, imageUrl: nextPrimary };
    });
    setPreviewUrls(prev => {
      const arr = [...(prev || [])];
      while (arr.length < 4) arr.push('');
      const removedPrev = arr[index];
      arr[index] = '';
      // update imagePreview if pointing to removed
      if (imagePreview && (imagePreview === removedPrev)) {
        const next = (arr.find(u => !!u) || '');
        setImagePreview(next);
      }
      return arr;
    });
    if (imagePreview && imagePreview === formData.imageUrl && !formData.imageUrls.find(u => !!u)) {
      setImagePreview('');
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

    if (!formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Please select a category.',
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

    // Basic client-side validation to prevent avoidable 400s
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Product name is required.', status: 'error', duration: 3000 });
      return;
    }
    if (!formData.category) {
      toast({ title: 'Error', description: 'Please select a category.', status: 'error', duration: 3000 });
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast({ title: 'Error', description: 'Price must be greater than 0.', status: 'error', duration: 3000 });
      return;
    }
    if (formData.stock < 0) {
      toast({ title: 'Error', description: 'Stock cannot be negative.', status: 'error', duration: 3000 });
      return;
    }
    if (formData.imageUrl && !/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(formData.imageUrl.trim())) {
      toast({ title: 'Error', description: 'Please enter a valid image URL (jpg, jpeg, png, gif, webp).', status: 'error', duration: 3000 });
      return;
    }

    if (isUploadingImage) {
      toast({ title: 'Please wait', description: 'Image is still uploading. Try again in a moment.', status: 'info', duration: 3000 });
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
        price: formData.price,      // Used by backend for creation
        stock: formData.stock,
        imageUrl: (formData.imageUrl?.trim() || formData.imageUrls[0] || ''),
        categoryId: formData.category,  // Must be a valid GUID string
        // storeId will be set by the backend from URL parameter
        hasVariants: false,
        weight: 0,
        tags: JSON.stringify({ imageUrls: (formData.imageUrls || []).slice(0,4), maxPerOrder: formData.maxPerOrder || 1, gender: (formData.gender || '').toLowerCase() || undefined }),
        variants: []
      };

      if (isEditMode && editProductId) {
        // Update existing product
        const updatePayload = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          imageUrl: productData.imageUrl,
          categoryId: productData.categoryId,
          isActive: true,
        };
        await productsApi.update(editProductId, updatePayload);
      } else {
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
            // Fallback to general products API (include storeId explicitly)
            console.log('Trying productsApi.create...');
            const generalPayload = { ...productData, storeId: selectedStoreId };
            await productsApi.create(generalPayload);
            console.log('✅ productsApi.create succeeded');
          } catch (secondError: any) {
            console.log('❌ Both API endpoints failed:', secondError?.response?.status, secondError?.response?.data);
            throw secondError; // Re-throw the last error
          }
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
      // Try to extract backend validation errors (ModelState)
      let errorMessage = 'Failed to create product. Please try again.';
      const data = error?.response?.data;
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.errors) {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey) {
          const msgs = data.errors[firstKey];
          if (Array.isArray(msgs) && msgs.length > 0) {
            errorMessage = msgs[0];
          }
        }
      }
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
              {isEditMode ? 'Edit Product' : 'Add New Product'}
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

              {/* Gender */}
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Select
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', (e.target.value || '') as any)}
                  placeholder="All / Not specified"
                >
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="unisex">Unisex</option>
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

              {/* Image URL (preferred) */}
              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </FormControl>

              {/* Image Upload */}
              <FormControl>
                <FormLabel>Product Images (max 4)</FormLabel>
                <VStack spacing={4} align="stretch">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
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
                    Upload Images
                  </Button>
                  {/* 4-slot grid with plus or thumbnail (rectangular) */}
                  <SimpleGrid columns={4} gap={3}>
                    {Array.from({ length: 4 }).map((_, idx) => {
                      const slotUrl = (formData.imageUrls[idx] || previewUrls[idx] || '');
                      const inputId = `image-upload-slot-${idx}`;
                      return (
                        <Box key={idx}>
                          <Input
                            type="file"
                            accept="image/*"
                            display="none"
                            id={inputId}
                            onChange={(e) => handleSlotImageUpload(idx, e)}
                          />
                          <Box
                            w="120px"
                            h="80px"
                            border="2px dashed"
                            borderColor={borderColor}
                            borderRadius="md"
                            overflow="hidden"
                            position="relative"
                            cursor="pointer"
                            onClick={() => {
                              if (slotUrl) {
                                setImagePreview(slotUrl);
                              } else {
                                const el = document.getElementById(inputId) as HTMLInputElement | null;
                                el?.click();
                              }
                            }}
                          >
                            {slotUrl && (
                              <IconButton
                                aria-label="Remove image"
                                icon={<FiX />}
                                size="xs"
                                position="absolute"
                                top={1}
                                right={1}
                                zIndex={1}
                                onClick={(e) => { e.stopPropagation(); handleRemoveImageSlot(idx); }}
                              />
                            )}
                            {slotUrl ? (
                              <Image src={slotUrl} alt={`Image ${idx + 1}`} w="100%" h="100%" objectFit="cover" objectPosition="center" />
                            ) : (
                              <VStack w="100%" h="100%" align="center" justify="center">
                                <Icon as={FiPlus} boxSize={6} color="gray.400" />
                                <Text fontSize="xs" color="gray.500">Add</Text>
                              </VStack>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </SimpleGrid>

                  {(formData.imageUrls.length > 0 || previewUrls.length > 0 || imagePreview || formData.imageUrl) && (
                    <AspectRatio ratio={16/9} maxW="300px">
                      <Image
                        src={imagePreview || formData.imageUrl || (formData.imageUrls[0] || previewUrls[0] || '')}
                        alt="Product preview"
                        borderRadius="md"
                        objectFit="cover"
                        objectPosition="center"
                        border="1px"
                        borderColor={borderColor}
                      />
                    </AspectRatio>
                  )}
                </VStack>
              </FormControl>

              {/* Max Per Order */}
              <FormControl isRequired>
                <FormLabel>Max Per Order (per customer)</FormLabel>
                <NumberInput
                  value={formData.maxPerOrder}
                  onChange={(valueString) => handleInputChange('maxPerOrder', Math.max(1, parseInt(valueString) || 1))}
                  min={1}
                  max={formData.stock || 999999}
                >
                  <NumberInputField />
                </NumberInput>
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
                  isLoading={isSubmitting || isUploadingImage}
                  loadingText={isUploadingImage ? 'Uploading image...' : (isEditMode ? 'Saving...' : 'Creating...')}
                >
                  {isEditMode ? 'Save Changes' : 'Create Product'}
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
