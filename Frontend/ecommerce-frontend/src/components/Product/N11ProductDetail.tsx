import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Image,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Divider,
  IconButton,
  Avatar,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  List,
  ListItem,
  ListIcon,
  Icon,
  Progress,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTruck,
  FaShieldAlt,
  FaExchangeAlt,
  FaCheckCircle,
  FaExpandArrowsAlt,
} from 'react-icons/fa';
import { Product, Store } from '../../types';
import { useNavigate } from 'react-router-dom';

interface N11ProductDetailProps {
  product: Product;
  store?: Store | null;
  loading?: boolean;
  onAddToCart: (quantity: number, selectedVariant?: any) => void;
  onAddToWishlist: () => void;
  onRemoveFromWishlist: () => void;
  isInWishlist: boolean;
  cartLoading?: boolean;
  wishlistLoading?: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  available: boolean;
  priceAdjustment?: number;
}

const N11ProductDetail: React.FC<N11ProductDetailProps> = ({
  product,
  store,
  loading = false,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  isInWishlist,
  cartLoading = false,
  wishlistLoading = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.500');
  
  // Derive product images (up to 4) from product.imageUrls or tags JSON; fallback to imageUrl
  let derivedImages: string[] = [];
  if (Array.isArray((product as any).imageUrls) && (product as any).imageUrls.length > 0) {
    derivedImages = (product as any).imageUrls as string[];
  } else if (product && (product as any).tags) {
    try {
      const tagsObj = JSON.parse((product as any).tags);
      if (Array.isArray(tagsObj?.imageUrls)) {
        derivedImages = tagsObj.imageUrls;
      }
    } catch {}
  }
  if (derivedImages.length === 0 && product.imageUrl) {
    derivedImages = [product.imageUrl];
  }
  const productImages = Array.from(new Set(derivedImages.filter(Boolean))).slice(0, 4);
  
  // Mock variants for demo
  const mockVariants = {
    color: [
      { id: '1', name: 'color', value: 'Siyah', available: true },
      { id: '2', name: 'color', value: 'Beyaz', available: true },
      { id: '3', name: 'color', value: 'Kırmızı', available: false },
    ] as ProductVariant[],
    size: [
      { id: '1', name: 'size', value: 'S', available: true },
      { id: '2', name: 'size', value: 'M', available: true },
      { id: '3', name: 'size', value: 'L', available: true },
      { id: '4', name: 'size', value: 'XL', available: false },
    ] as ProductVariant[],
  };
  
  const handleAddToCart = () => {
    let maxPerOrder: number | null = null;
    try {
      const tagsObj = (product as any).tags ? JSON.parse((product as any).tags) : null;
      if (tagsObj && typeof tagsObj.maxPerOrder === 'number') maxPerOrder = tagsObj.maxPerOrder;
    } catch {}
    const allowed = Math.max(1, Math.min(product.stock, maxPerOrder ?? product.stock));
    const q = Math.min(quantity, allowed);
    onAddToCart(q, selectedVariants);
  };
  
  const handleWishlistToggle = () => {
    if (isInWishlist) {
      onRemoveFromWishlist();
    } else {
      onAddToWishlist();
    }
  };
  
  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantType]: value,
    }));
  };
  
  const renderStarRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<Icon key={i} as={FaStar} color="yellow.400" />);
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<Icon key={i} as={FaStarHalfAlt} color="yellow.400" />);
      } else {
        stars.push(<Icon key={i} as={FaRegStar} color="gray.300" />);
      }
    }
    return stars;
  };
  
  return (
    <Container maxW="container.xl" py={6}>
      {/* Breadcrumb */}
      <Breadcrumb mb={6} fontSize="sm" color={mutedTextColor}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Ana Sayfa</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/category">{product.categoryName}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Text>{product.name}</Text>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} mb={8}>
        {/* Left Side - Product Images */}
        <GridItem>
          <VStack spacing={4}>
            {/* Main Image */}
            <Box
              position="relative"
              w="full"
              h={{ base: '400px', md: '500px' }}
              bg="gray.50"
              borderRadius="lg"
              overflow="hidden"
              border="1px solid"
              borderColor={borderColor}
              cursor="zoom-in"
              onClick={onOpen}
            >
              <Image
                src={productImages[selectedImageIndex]}
                alt={product.name}
                w="full"
                h="full"
                objectFit="cover"
                objectPosition="center"
              />
              
              {/* Zoom Button */}
              <IconButton
                aria-label="Zoom image"
                icon={<FaExpandArrowsAlt />}
                position="absolute"
                top={4}
                right={4}
                size="sm"
                bg="rgba(255,255,255,0.9)"
                onClick={(e) => { e.stopPropagation(); onOpen(); }}
              />
              
              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <IconButton
                    aria-label="Previous image"
                    icon={<FaChevronLeft />}
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    size="sm"
                    bg="rgba(255,255,255,0.9)"
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === 0 ? productImages.length - 1 : prev - 1
                    )}
                  />
                  <IconButton
                    aria-label="Next image"
                    icon={<FaChevronRight />}
                    position="absolute"
                    right={4}
                    top="50%"
                    transform="translateY(-50%)"
                    size="sm"
                    bg="rgba(255,255,255,0.9)"
                    onClick={() => setSelectedImageIndex(prev => 
                      (prev + 1) % productImages.length
                    )}
                  />
                </>
              )}
            </Box>
            
            {/* Thumbnail Images */}
            <HStack spacing={2} justify="center" wrap="wrap">
              {productImages.map((img, index) => (
                <Box
                  key={index}
                  w="60px"
                  h="60px"
                  border="2px solid"
                  borderColor={selectedImageIndex === index ? 'brand.500' : borderColor}
                  borderRadius="md"
                  cursor="pointer"
                  overflow="hidden"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    w="full"
                    h="full"
                    objectFit="cover"
                    objectPosition="center"
                  />
                </Box>
              ))}
            </HStack>
          </VStack>
        </GridItem>
        
        {/* Right Side - Product Info */}
        <GridItem>
          <VStack align="stretch" spacing={6}>
            {/* Title and Rating */}
            <VStack align="stretch" spacing={2}>
              <Heading size="lg" lineHeight="short">
                {product.name}
              </Heading>
              
              {/* Rating */}
              <HStack spacing={2}>
                <HStack spacing={1}>
                  {renderStarRating(product.averageRating || 4.5)}
                </HStack>
                <Text fontSize="sm" color={mutedTextColor}>
                  ({product.totalReviews || 128} değerlendirme)
                </Text>
              </HStack>
            </VStack>
            
            {/* Price */}
            <Box>
              <HStack align="baseline" spacing={3}>
                <Text fontSize="3xl" fontWeight="bold" color="brand.500">
                  ₺{product.price.toFixed(2)}
                </Text>
              </HStack>
              
              {/* Installment info */}
              <Text fontSize="sm" color="green.600" mt={1}>
                12 taksitle aylık ₺{(product.price / 12).toFixed(2)}
              </Text>
            </Box>
            
            {/* Variants - Color Selection */}
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="semibold">Renk: {selectedVariants.color || 'Seçiniz'}</Text>
              <HStack spacing={2} wrap="wrap">
                {mockVariants.color.map((variant) => (
                  <Button
                    key={variant.id}
                    size="sm"
                    variant={selectedVariants.color === variant.value ? "solid" : "outline"}
                    colorScheme={selectedVariants.color === variant.value ? "brand" : "gray"}
                    isDisabled={!variant.available}
                    onClick={() => handleVariantChange('color', variant.value)}
                  >
                    {variant.value}
                  </Button>
                ))}
              </HStack>
            </VStack>
            
            {/* Variants - Size Selection */}
            <VStack align="stretch" spacing={3}>
              <Text fontWeight="semibold">Beden: {selectedVariants.size || 'Seçiniz'}</Text>
              <HStack spacing={2} wrap="wrap">
                {mockVariants.size.map((variant) => (
                  <Button
                    key={variant.id}
                    size="sm"
                    variant={selectedVariants.size === variant.value ? "solid" : "outline"}
                    colorScheme={selectedVariants.size === variant.value ? "brand" : "gray"}
                    isDisabled={!variant.available}
                    onClick={() => handleVariantChange('size', variant.value)}
                  >
                    {variant.value}
                  </Button>
                ))}
              </HStack>
            </VStack>
            
            {/* Quantity */}
            <HStack>
              <Text fontWeight="semibold">Adet:</Text>
              <NumberInput
                size="md"
                maxW={24}
                value={quantity}
                onChange={(_, value) => setQuantity(isNaN(value) ? 1 : value)}
                min={1}
                max={(function(){
                  let maxPerOrder: number | null = null;
                  try {
                    const tagsObj = (product as any).tags ? JSON.parse((product as any).tags) : null;
                    if (tagsObj && typeof tagsObj.maxPerOrder === 'number') {
                      maxPerOrder = tagsObj.maxPerOrder;
                    }
                  } catch {}
                  return Math.max(1, Math.min(product.stock, maxPerOrder ?? product.stock));
                })()}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
            
            {/* Action Buttons */}
            <VStack spacing={3}>
              <Button
                size="lg"
                colorScheme="orange"
                w="full"
                leftIcon={<FaShoppingCart />}
                onClick={handleAddToCart}
                isLoading={cartLoading}
                loadingText="Sepete Ekleniyor..."
                isDisabled={product.stock === 0}
              >
                Sepete Ekle
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                w="full"
                leftIcon={isInWishlist ? <FaHeart /> : <FaRegHeart />}
                onClick={handleWishlistToggle}
                isLoading={wishlistLoading}
                color={isInWishlist ? "red.500" : undefined}
                borderColor={isInWishlist ? "red.500" : undefined}
              >
                {isInWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              </Button>
            </VStack>
            
            {/* Features */}
            <VStack align="stretch" spacing={2} pt={4}>
              <HStack>
                <Icon as={FaTruck} color="green.500" />
                <Text fontSize="sm">Ücretsiz kargo (150₺ ve üzeri)</Text>
              </HStack>
              <HStack>
                <Icon as={FaShieldAlt} color="blue.500" />
                <Text fontSize="sm">2 yıl garanti</Text>
              </HStack>
              <HStack>
                <Icon as={FaExchangeAlt} color="orange.500" />
                <Text fontSize="sm">15 gün içinde iade</Text>
              </HStack>
            </VStack>
            
            {/* Store Info */}
            {store && (
              <Card>
                <CardBody>
                  <HStack spacing={4}>
                    <Avatar size="md" name={store.name} src={store.logoUrl} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="semibold">{store.name}</Text>
                      <HStack>
                        <HStack spacing={1}>
                          {renderStarRating(store.rating || 4.2)}
                        </HStack>
                        <Text fontSize="sm" color={mutedTextColor}>
                          ({store.totalSales} satış)
                        </Text>
                      </HStack>
                    </VStack>
                    <Button size="sm" variant="outline" onClick={() => {
                      const targetId = product.storeId || store?.id;
                      if (targetId) navigate(`/store/${targetId}`);
                    }}>
                      Mağazayı Ziyaret Et
                    </Button>
                  </HStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </GridItem>
      </Grid>
      
      {/* Product Details Tabs */}
      <Card>
        <CardBody>
          <Tabs variant="enclosed" colorScheme="brand">
            <TabList>
              <Tab>Açıklama</Tab>
              <Tab>Özellikler</Tab>
              <Tab>Yorumlar</Tab>
              <Tab>Teslimat</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <Text>{product.description}</Text>
                <Text mt={4} color={textColor}>
                  Bu ürün en kaliteli malzemelerden üretilmiş olup, uzun süre kullanım için tasarlanmıştır. 
                  Günlük kullanıma uygun olan bu ürün, hem estetik hem de fonksiyonel özellikleriyle dikkat çeker.
                </Text>
              </TabPanel>
              
              <TabPanel>
                <List spacing={2}>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Materyal: %100 Organik Pamuk
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Renk: Çok renkli seçenek
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Bakım: 30°C'de makinede yıkanabilir
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Orijin: Türkiye
                  </ListItem>
                </List>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {/* Rating Summary */}
                  <HStack spacing={8}>
                    <VStack>
                      <Text fontSize="3xl" fontWeight="bold">
                        {product.averageRating?.toFixed(1) || '4.5'}
                      </Text>
                      <HStack>
                        {renderStarRating(product.averageRating || 4.5)}
                      </HStack>
                      <Text fontSize="sm" color={mutedTextColor}>
                        {product.totalReviews || 128} değerlendirme
                      </Text>
                    </VStack>
                    
                    <VStack align="stretch" flex={1}>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <HStack key={star} spacing={2}>
                          <Text fontSize="sm" w="20px">{star}</Text>
                          <Icon as={FaStar} color="yellow.400" />
                          <Progress
                            value={star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 2 : 1}
                            size="sm"
                            colorScheme="yellow"
                            flex={1}
                          />
                          <Text fontSize="sm" w="30px">
                            {star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 2 : 1}%
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </HStack>
                  
                  <Divider />
                  
                  {/* Sample Reviews */}
                  <VStack spacing={4} align="stretch">
                    <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <HStack>
                          <Avatar size="sm" name="Ahmet Y." />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold" fontSize="sm">Ahmet Y.</Text>
                            <HStack spacing={1}>
                              {renderStarRating(5)}
                            </HStack>
                          </VStack>
                        </HStack>
                        <Text fontSize="sm" color={mutedTextColor}>2 gün önce</Text>
                      </HStack>
                      <Text fontSize="sm">
                        Ürün çok kaliteli, sipariş verdiğim gün kargoya verildi. Fotoğraftaki gibi geldi, çok memnunum.
                      </Text>
                    </Box>
                    
                    <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <HStack>
                          <Avatar size="sm" name="Zeynep K." />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold" fontSize="sm">Zeynep K.</Text>
                            <HStack spacing={1}>
                              {renderStarRating(4)}
                            </HStack>
                          </VStack>
                        </HStack>
                        <Text fontSize="sm" color={mutedTextColor}>1 hafta önce</Text>
                      </HStack>
                      <Text fontSize="sm">
                        Güzel bir ürün, kalitesi iyi. Sadece kargo biraz geç geldi ama ürün beklentimi karşıladı.
                      </Text>
                    </Box>
                  </VStack>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Text fontWeight="semibold">Teslimat Seçenekleri</Text>
                  
                  <Box p={4} border="1px solid" borderColor={borderColor} borderRadius="md">
                    <HStack justify="space-between">
                      <VStack align="start">
                        <Text fontWeight="medium">Standart Teslimat</Text>
                        <Text fontSize="sm" color={mutedTextColor}>3-5 iş günü</Text>
                      </VStack>
                      <Text fontWeight="semibold">₺9.99</Text>
                    </HStack>
                  </Box>
                  
                  <Box p={4} border="1px solid" borderColor="green.200" borderRadius="md" bg="green.50">
                    <HStack justify="space-between">
                      <VStack align="start">
                        <Text fontWeight="medium">Hızlı Teslimat</Text>
                        <Text fontSize="sm" color={mutedTextColor}>1-2 iş günü</Text>
                      </VStack>
                      <Text fontWeight="semibold">₺19.99</Text>
                    </HStack>
                  </Box>
                  
                  <Box p={4} border="1px solid" borderColor="orange.200" borderRadius="md" bg="orange.50">
                    <HStack justify="space-between">
                      <VStack align="start">
                        <Text fontWeight="medium">Ücretsiz Kargo</Text>
                        <Text fontSize="sm" color={mutedTextColor}>150₺ ve üzeri siparişlerde</Text>
                      </VStack>
                      <Text fontWeight="semibold" color="green.600">Ücretsiz</Text>
                    </HStack>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
      
      {/* Image Zoom Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0}>
            <Image
              src={productImages[selectedImageIndex]}
              alt={product.name}
              w="full"
              h="auto"
              maxH="80vh"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default N11ProductDetail;
