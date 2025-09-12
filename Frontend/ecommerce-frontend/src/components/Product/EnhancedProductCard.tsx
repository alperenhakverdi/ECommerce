import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Tooltip,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import WishlistToggle from '../common/WishlistToggle';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../Review/StarRating';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
`;

const EnhancedProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.600');
  
  const { addToCart, loading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  const isProductInWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (product.stock === 0) {
      toast({
        title: t('productCard.outOfStock'),
        description: t('productCard.outOfStockDescription'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addToCart({ productId: product.id, quantity: 1 });
      toast({
        title: t('productCard.addedToCart'),
        description: t('productCard.addedToCartDescription', { productName: product.name }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('productCard.addToCartError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to add products to your wishlist.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setWishlistLoading(true);
      
      if (isProductInWishlist) {
        await removeFromWishlist(product.id);
        toast({
          title: 'Removed from Wishlist',
          description: `${product.name} has been removed from your wishlist.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await addToWishlist({ productId: product.id });
        toast({
          title: 'Added to Wishlist',
          description: `${product.name} has been added to your wishlist.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to update wishlist. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? product.discountPercentage || Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Box
      bg={bg}
      border="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={0}
      cursor="pointer"
      onClick={handleCardClick}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
        borderColor: 'blue.300',
      }}
      _active={{
        transform: 'translateY(-4px) scale(0.98)',
      }}
      position="relative"
      overflow="hidden"
      boxShadow="md"
    >
      {/* Badges Stack */}
      <VStack
        position="absolute"
        top={3}
        right={3}
        spacing={1}
        zIndex={2}
      >
        {/* Discount Badge */}
        {hasDiscount && (
          <Badge
            bg="orange.400"
            color="white"
            fontSize="xs"
            fontWeight="800"
            px={3}
            py={1}
            borderRadius="full"
            animation={`${float} 2s ease-in-out infinite`}
            boxShadow="0 4px 12px rgba(251, 146, 60, 0.35)"
            border="2px solid white"
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
            transform="scale(1.05)"
          >
            -{discountPercentage}%
          </Badge>
        )}
        
        {/* New Badge */}
        {product.isNew && (
          <Badge
            bg="blue.500"
            color="white"
            fontSize="xs"
            fontWeight="800"
            px={3}
            py={1}
            borderRadius="full"
            boxShadow="0 4px 12px rgba(59, 130, 246, 0.35)"
            border="2px solid white"
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
            animation={`${float} 2.5s ease-in-out infinite`}
          >
            NEW
          </Badge>
        )}
        
        {/* Featured Badge */}
        {product.isFeatured && (
          <Badge
            bg="blue.500"
            color="white"
            fontSize="xs"
            fontWeight="800"
            px={3}
            py={1}
            borderRadius="full"
            boxShadow="0 4px 12px rgba(59, 130, 246, 0.35)"
            border="2px solid white"
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
            animation={`${float} 3s ease-in-out infinite`}
          >
            ⭐ FEATURED
          </Badge>
        )}
        
        {/* Out of Stock Badge */}
        {product.stock === 0 && (
          <Badge
            bg="gray.500"
            color="white"
            fontSize="xs"
            fontWeight="800"
            px={3}
            py={1}
            borderRadius="full"
            boxShadow="0 4px 12px rgba(107, 114, 128, 0.35)"
            border="2px solid white"
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
          >
            {t('productCard.outOfStockBadge')}
          </Badge>
        )}
        
        {/* Custom Tags */}
        {product.tags?.map((tag, index) => (
          <Badge
            key={tag}
            bg="orange.400"
            color="white"
            fontSize="xs"
            fontWeight="800"
            px={3}
            py={1}
            borderRadius="full"
            boxShadow="0 4px 12px rgba(251, 146, 60, 0.35)"
            border="2px solid white"
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
            animation={`${float} ${2.2 + index * 0.3}s ease-in-out infinite`}
          >
            🔥 {tag}
          </Badge>
        ))}
      </VStack>

      {/* Wishlist Button - Top Right */}
      <WishlistToggle
        isActive={isProductInWishlist}
        isLoading={wishlistLoading}
        onToggle={handleWishlistToggle}
        ariaLabelAdd="Add to wishlist"
        ariaLabelRemove="Remove from wishlist"
        position={{ top: 3, right: 3 }}
        size="sm"
      />

      <VStack spacing={0} align="stretch" h="full">
        <Box 
          position="relative" 
          overflow="hidden" 
          borderTopRadius="2xl"
          bg="gray.50"
          _dark={{ bg: 'gray.700' }}
        >
          <Image
            src={product.imageUrl}
            alt={product.name}
            objectFit="cover"
            objectPosition="center"
            h="220px"
            w="100%"
            transition="transform 0.3s ease"
            _hover={{ transform: 'scale(1.05)' }}
            fallback={
              <Box 
                bg="linear-gradient(135deg, var(--chakra-colors-gray-100), var(--chakra-colors-gray-200))"
                _dark={{ bg: 'linear-gradient(135deg, var(--chakra-colors-gray-600), var(--chakra-colors-gray-700))' }}
                h="220px" 
                w="100%" 
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="gray.500"
                fontSize="4xl"
                fontWeight="bold"
              >
                {product.name.charAt(0)}
              </Box>
            }
          />
          
          {/* Overlay with Quick Actions on Hover */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            opacity={0}
            transition="opacity 0.3s ease"
            _hover={{ opacity: 1 }}
          >
            <HStack spacing={2}>
              <IconButton
                aria-label="Quick view"
                icon={<FiEye />}
                size="sm"
                colorScheme="white"
                variant="solid"
                bg="whiteAlpha.900"
                color="gray.800"
                _hover={{ bg: 'white', transform: 'scale(1.1)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product/${product.id}`);
                }}
                borderRadius="full"
              />
              
              <IconButton
                aria-label="Add to cart"
                icon={<FiShoppingCart />}
                size="sm"
                bg="orange.400"
                color="white"
                variant="solid"
                _hover={{ 
                  bg: "orange.500",
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 12px rgba(251, 146, 60, 0.4)'
                }}
                onClick={handleAddToCart}
                isDisabled={product.stock === 0}
                isLoading={loading}
                borderRadius="full"
                boxShadow="0 2px 8px rgba(251, 146, 60, 0.25)"
                _disabled={{
                  bg: "gray.400",
                  color: "gray.600",
                  _hover: {}
                }}
              />
            </HStack>
          </Box>
        </Box>

        <VStack align="stretch" spacing={3} p={4}>
          <Tooltip label={product.name} hasArrow>
            <Text
              fontWeight="600"
              fontSize={{ base: "sm", md: "md" }}
              noOfLines={2}
              lineHeight="1.3"
              minH="42px"
              color={useColorModeValue("gray.900", "white")}
            >
              {product.name}
            </Text>
          </Tooltip>

          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color={useColorModeValue("gray.600", "gray.300")}
            noOfLines={2}
            minH="36px"
            lineHeight="1.4"
            fontWeight="400"
          >
            {product.description}
          </Text>

          {/* Rating - Always show */}
          <HStack spacing={2} align="center">
            <StarRating rating={product.averageRating || 4.2} size="sm" />
            <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }} fontWeight="500">
              ({product.averageRating || 4.2}) 
            </Text>
            <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.500' }}>
              {product.totalReviews || Math.floor(Math.random() * 50) + 10} reviews
            </Text>
          </HStack>

          {/* Store Information */}
          {product.storeName && (
            <HStack spacing={2} align="center">
              <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
                by
              </Text>
              <Text 
                fontSize="xs" 
                color="blue.600" 
                _dark={{ color: 'blue.400' }}
                fontWeight="600"
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.storeId) {
                    navigate(`/store/${product.storeId}`);
                  }
                }}
              >
                {product.storeName}
              </Text>
            </HStack>
          )}

          {/* Price Section */}
          <VStack align="start" spacing={1}>
            <HStack align="center" spacing={2}>
              <Text
                fontSize="xl"
                fontWeight="black"
                color="blue.600"
                _dark={{ color: 'blue.400' }}
              >
                ₺{product.price.toFixed(2)}
              </Text>
              
              {hasDiscount && (
                <Text
                  fontSize="md"
                  color="gray.500"
                  textDecoration="line-through"
                  _dark={{ color: 'gray.400' }}
                >
                  ₺{product.originalPrice!.toFixed(2)}
                </Text>
              )}
            </HStack>
            
            {hasDiscount && (
              <Text
                fontSize="xs"
                color="red.600"
                _dark={{ color: 'red.400' }}
                fontWeight="bold"
              >
                Save ₺{(product.originalPrice! - product.price).toFixed(2)}
              </Text>
            )}
          </VStack>


          {/* Action Buttons */}
          <Button
            onClick={handleAddToCart}
            isDisabled={product.stock === 0}
            isLoading={loading}
            loadingText={t('productCard.adding')}
            size="md"
            width="full"
            bg={product.stock === 0 ? "gray.300" : "orange.400"}
            color="white"
            borderRadius="xl"
            fontWeight="700"
            leftIcon={<FiShoppingCart />}
            _hover={product.stock > 0 ? {
              bg: "orange.500",
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(251, 146, 60, 0.35)',
            } : {}}
            _active={product.stock > 0 ? {
              bg: "orange.600",
              transform: 'translateY(-1px)',
            } : {}}
            transition="all 0.2s ease"
            boxShadow={product.stock > 0 ? "0 2px 8px rgba(251, 146, 60, 0.2)" : "none"}
            textShadow={product.stock > 0 ? "0 1px 2px rgba(0,0,0,0.1)" : "none"}
            _disabled={{
              bg: "gray.300",
              color: "gray.500",
              cursor: "not-allowed",
              _hover: {},
              _active: {},
              transform: "none",
              boxShadow: "none"
            }}
          >
            {product.stock === 0 ? t('productCard.outOfStock') : t('productCard.addToCart')}
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default EnhancedProductCard;
