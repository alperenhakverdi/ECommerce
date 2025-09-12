import React, { useState } from 'react';
import {
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Grid,
  GridItem,
  Image,
  Box,
  IconButton,
  Avatar,
  SimpleGrid,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiTrash2, FiShoppingCart, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const WishlistPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setRemovingItemId(productId);
      await removeFromWishlist(productId);
      toast({
        title: 'Removed from Wishlist',
        description: 'Product has been removed from your wishlist.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove product from wishlist.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCartId(productId);
      await addToCart({ productId, quantity: 1 });
      toast({
        title: 'Added to Cart',
        description: 'Product has been added to your cart.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product to cart.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      toast({
        title: 'Wishlist Cleared',
        description: 'All items have been removed from your wishlist.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear wishlist.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please log in to view your wishlist.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading your wishlist...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <HStack spacing={2}>
                <FiHeart size="24" />
                <Heading size="lg">My Wishlist</Heading>
              </HStack>
              <Text color="gray.600">
                {wishlist?.totalItems || 0} item(s) in your wishlist
              </Text>
            </VStack>
            
            {wishlist && wishlist.items.length > 0 && (
              <Button
                variant="outline"
                colorScheme="red"
                leftIcon={<FiTrash2 />}
                onClick={onOpen}
                size="sm"
              >
                Clear All
              </Button>
            )}
          </HStack>

          {/* Wishlist Content */}
          {!wishlist || wishlist.items.length === 0 ? (
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <VStack spacing={6} py={12}>
                  <Box color="gray.400" fontSize="6xl">
                    <FiHeart />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="md" color="gray.600">
                      Your wishlist is empty
                    </Heading>
                    <Text color="gray.500" textAlign="center">
                      Save your favorite products to your wishlist and shop them later.
                    </Text>
                  </VStack>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FiShoppingBag />}
                    onClick={() => navigate('/')}
                  >
                    Continue Shopping
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {wishlist.items.map((item) => (
                <Card
                  key={item.id}
                  bg={cardBg}
                  border="1px"
                  borderColor={borderColor}
                  transition="all 0.2s"
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                >
                  <CardBody p={4}>
                    <VStack spacing={3} align="stretch">
                      {/* Product Image */}
                      <Box 
                        position="relative" 
                        overflow="hidden" 
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        <Image
                          src={item.productImageUrl}
                          alt={item.productName}
                          objectFit="cover"
                          objectPosition="center"
                          h="200px"
                          w="100%"
                          fallback={<Box bg="gray.100" h="200px" w="100%" />}
                        />
                        
                        {/* Availability Badge */}
                        {!item.isAvailable && (
                          <Badge
                            position="absolute"
                            top={2}
                            right={2}
                            colorScheme='red'
                          >
                            {t('productCard.outOfStockBadge') || 'Out of Stock'}
                          </Badge>
                        )}
                      </Box>

                      {/* Product Info */}
                      <VStack align="stretch" spacing={2}>
                        <Text
                          fontWeight="semibold"
                          fontSize="md"
                          noOfLines={2}
                          cursor="pointer"
                          onClick={() => navigate(`/product/${item.productId}`)}
                          _hover={{ color: 'blue.500' }}
                        >
                          {item.productName}
                        </Text>

                        {item.productDescription && (
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            noOfLines={2}
                          >
                            {item.productDescription}
                          </Text>
                        )}

                        {/* Store Info */}
                        {item.storeName && (
                          <HStack spacing={2}>
                            <Avatar size="xs" name={item.storeName} />
                            <Text fontSize="xs" color="gray.500">
                              by {item.storeName}
                            </Text>
                          </HStack>
                        )}

                        {/* Price */}
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="blue.500"
                        >
                          ${item.productPrice.toFixed(2)}
                        </Text>

                        {/* Added Date */}
                        <Text fontSize="xs" color="gray.400">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </Text>
                      </VStack>

                      <Divider />

                      {/* Action Buttons */}
                      <VStack spacing={2}>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          width="full"
                          leftIcon={<FiShoppingCart />}
                          onClick={() => handleAddToCart(item.productId)}
                          isLoading={addingToCartId === item.productId}
                          loadingText="Adding..."
                          isDisabled={!item.isAvailable}
                        >
                          {item.isAvailable ? t('productCard.addToCart') : (t('productCard.outOfStockBadge') || 'Out of Stock')}
                        </Button>
                        
                        <Button
                          variant="outline"
                          colorScheme="red"
                          size="sm"
                          width="full"
                          leftIcon={<FiTrash2 />}
                          onClick={() => handleRemoveFromWishlist(item.productId)}
                          isLoading={removingItemId === item.productId}
                          loadingText="Removing..."
                        >
                          Remove
                        </Button>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>

        {/* Clear Wishlist Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Clear Wishlist</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to remove all items from your wishlist? 
                This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleClearWishlist}>
                Clear All
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
};

export default WishlistPage;
