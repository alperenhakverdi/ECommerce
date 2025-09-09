import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Product, Store } from '../types';
import { productsApi, storesApi, recentlyViewedApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import N11ProductDetail from '../components/Product/N11ProductDetail';

const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCart, loading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isProductInWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.storeId) {
      fetchStore();
    }
  }, [product?.storeId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsApi.getById(id!);
      setProduct(response.data);
      
      // Track recently viewed if user is authenticated
      if (isAuthenticated) {
        try {
          await recentlyViewedApi.add(id!);
        } catch (error) {
          // Silently fail - recently viewed is not critical
          console.log('Failed to track recently viewed:', error);
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to load product';
      setError(errorMessage);
      toast({
        title: t('common.error'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStore = async () => {
    if (!product?.storeId) return;
    
    try {
      setStoreLoading(true);
      const response = await storesApi.getById(product.storeId);
      setStore(response.data);
    } catch (error) {
      console.error('Failed to fetch store:', error);
    } finally {
      setStoreLoading(false);
    }
  };

  const handleAddToCart = async (quantity: number, selectedVariant?: any) => {
    if (!product) return;

    try {
      await addToCart({
        productId: product.id,
        quantity,
        // Add variant data if available
        ...(selectedVariant && { variant: selectedVariant }),
      });

      toast({
        title: 'Ürün Sepete Eklendi',
        description: `${product.name} sepetinize eklendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.message || 'Ürün sepete eklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    setWishlistLoading(true);
    try {
      await addToWishlist({ productId: product.id });
      toast({
        title: 'Favorilere Eklendi',
        description: `${product.name} favorilerinize eklendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Favorilere eklenirken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!product) return;

    setWishlistLoading(true);
    try {
      await removeFromWishlist(product.id);
      toast({
        title: 'Favorilerden Çıkarıldı',
        description: `${product.name} favorilerinizden çıkarıldı.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Favorilerden çıkarılırken bir hata oluştu.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="600px" />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error || 'Ürün bulunamadı'}
        </Alert>
      </Container>
    );
  }

  return (
    <N11ProductDetail
      product={product}
      store={store}
      loading={loading}
      onAddToCart={handleAddToCart}
      onAddToWishlist={handleAddToWishlist}
      onRemoveFromWishlist={handleRemoveFromWishlist}
      isInWishlist={isProductInWishlist}
      cartLoading={cartLoading}
      wishlistLoading={wishlistLoading}
    />
  );
};

export default ProductDetailPage;