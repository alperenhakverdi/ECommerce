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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHeart } from 'react-icons/fi';
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

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
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

  return (
    <Box
      bg={bg}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      cursor="pointer"
      onClick={handleCardClick}
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
      position="relative"
    >
      {product.stock === 0 && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="red"
          zIndex={1}
        >
          {t('productCard.outOfStockBadge')}
        </Badge>
      )}

      {isAuthenticated && (
        <WishlistToggle
          isActive={isProductInWishlist}
          isLoading={wishlistLoading}
          onToggle={handleWishlistToggle}
          ariaLabelAdd="Add to wishlist"
          ariaLabelRemove="Remove from wishlist"
          position={{ top: 2, right: 2 }}
          size="sm"
        />
      )}

      <VStack spacing={3} align="stretch">
        <Box position="relative" overflow="hidden" borderRadius="md">
          <Image
            src={product.imageUrl}
            alt={product.name}
            objectFit="cover"
            h="200px"
            w="100%"
            fallback={<Box bg="gray.100" h="200px" w="100%" />}
          />
        </Box>

        <VStack align="stretch" spacing={2}>
          <Tooltip label={product.name} hasArrow>
            <Text
              fontWeight="semibold"
              fontSize="md"
              noOfLines={1}
            >
              {product.name}
            </Text>
          </Tooltip>

          <Text
            fontSize="sm"
            color="gray.600"
            noOfLines={2}
            minH="40px"
          >
            {product.description}
          </Text>

          {/* Rating */}
          {product.averageRating && product.totalReviews && product.totalReviews > 0 && (
            <HStack spacing={2}>
              <StarRating rating={product.averageRating} size="sm" />
              <Text fontSize="xs" color="gray.600">
                ({product.totalReviews})
              </Text>
            </HStack>
          )}

          <HStack justify="space-between" align="center">
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="brand.500"
            >
              ${product.price.toFixed(2)}
            </Text>
            
          </HStack>

          <VStack spacing={2}>
            <Button
              onClick={handleAddToCart}
              isDisabled={product.stock === 0}
              isLoading={loading}
              loadingText={t('productCard.adding')}
              size="sm"
              width="full"
              colorScheme="blue"
            >
              {t('productCard.addToCart')}
            </Button>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.id}`);
              }}
              size="sm"
              width="full"
              variant="outline"
            >
              View Details
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ProductCard;
