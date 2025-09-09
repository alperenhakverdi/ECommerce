import React from 'react';
import {
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  Box,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import CartItem from '../components/Cart/CartItem';

const CartPage: React.FC = () => {
  const { t } = useTranslation();
  const { cart, loading, error, clearCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: t('cart.cleared'),
        description: t('cart.clearedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('cart.clearFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading && !cart) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>{t('cart.loading')}</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxW="container.lg" py={8}>
        <Center minH="400px">
          <VStack spacing={4}>
            <Heading size="md" color="gray.500">
              {t('cart.empty')}
            </Heading>
            <Text color="gray.600" textAlign="center">
              {t('cart.emptyDescription')}
            </Text>
            <Button onClick={() => navigate('/')} colorScheme="brand">
              {t('cart.continueShopping')}
            </Button>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="lg">{t('cart.title')}</Heading>
          <Button
            variant="outline"
            colorScheme="red"
            size="sm"
            onClick={handleClearCart}
            isLoading={loading}
          >
            {t('cart.clear')}
          </Button>
        </HStack>

        <VStack spacing={4} align="stretch">
          {cart.items.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </VStack>

        <Divider />

        <Box
          bg="gray.50"
          _dark={{ bg: 'gray.700' }}
          p={6}
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
          sx={{
            _dark: { borderColor: 'gray.600' }
          }}
        >
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="lg" fontWeight="semibold">
                {t('cart.totalItems')}:
              </Text>
              <Text fontSize="lg" fontWeight="semibold">
                {cart.totalItems}
              </Text>
            </HStack>

            <HStack justify="space-between" w="full">
              <Text fontSize="xl" fontWeight="bold">
                {t('cart.total')}:
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="brand.500">
                ${cart.totalAmount.toFixed(2)}
              </Text>
            </HStack>

            <HStack spacing={4} w="full" pt={4}>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                flex={1}
              >
                {t('cart.continueShopping')}
              </Button>
              <Button
                onClick={handleCheckout}
                flex={1}
                isDisabled={cart.items.length === 0}
              >
                {t('cart.proceedToCheckout')}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CartPage;