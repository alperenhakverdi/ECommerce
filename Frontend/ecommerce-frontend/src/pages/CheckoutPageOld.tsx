import React, { useState } from 'react';
import {
  Container,
  Heading,
  VStack,
  HStack,
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../services/api';
import { paymentApi } from '../services/paymentApi';
import { CreateOrderRequest, Address } from '../types';
import { PaymentMethod, BillingAddress, PaymentRequest } from '../types/payment';
import { AddressSelector } from '../components/Address';
import { PaymentForm } from '../components/Payment';

const CheckoutPage: React.FC = () => {
  const { cart, getUserId, loadCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const steps = [
    { title: 'Customer Info', description: 'Basic information' },
    { title: 'Shipping Address', description: 'Delivery location' },
    { title: 'Payment', description: 'Payment method' },
    { title: 'Review', description: 'Final confirmation' },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerEmail: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    customerName?: string;
    customerEmail?: string;
    address?: string;
  }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof customerInfo]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    // Clear address error if present
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
  };

  const handleAddressError = (error: string) => {
    setErrors(prev => ({ ...prev, address: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: {
      customerName?: string;
      customerEmail?: string;
      address?: string;
    } = {};

    if (!customerInfo.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!customerInfo.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }

    if (!selectedAddress) {
      newErrors.address = 'Please select a shipping address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!cart || cart.items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checkout.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to complete checkout.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      const orderData: CreateOrderRequest = {
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        addressId: selectedAddress!.id,
      };
      
      const response = await ordersApi.create(userId, orderData);
      
      toast({
        title: 'Order placed successfully!',
        description: `Your order ID is ${response.data.id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reload cart to reflect the cleared state
      await loadCart();
      
      // Redirect to order confirmation or orders page
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: 'Order failed',
        description: 'There was an error processing your order. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Your cart is empty. Please add items before checkout.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" textAlign="center">
          Checkout
        </Heading>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="white"
          _dark={{ bg: 'gray.700' }}
          p={6}
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
          sx={{
            _dark: { borderColor: 'gray.600' }
          }}
        >
          <VStack spacing={6} align="stretch">
            <Heading size="md">Customer Information</Heading>

            <FormControl isInvalid={!!errors.customerName}>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="customerName"
                value={customerInfo.customerName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
              {errors.customerName && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.customerName}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.customerEmail}>
              <FormLabel>Email Address</FormLabel>
              <Input
                name="customerEmail"
                type="email"
                value={customerInfo.customerEmail}
                onChange={handleInputChange}
                placeholder="Enter your email address"
              />
              {errors.customerEmail && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.customerEmail}
                </Text>
              )}
            </FormControl>

            {/* Shipping Address Selector */}
            <Box>
              <AddressSelector
                selectedAddressId={selectedAddress?.id}
                onAddressSelect={handleAddressSelect}
                onError={handleAddressError}
              />
              {errors.address && (
                <Text color="red.500" fontSize="sm" mt={2}>
                  {errors.address}
                </Text>
              )}
            </Box>
          </VStack>
        </Box>

        {/* Order Summary */}
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
          <VStack spacing={4} align="stretch">
            <Heading size="md">Order Summary</Heading>

            <VStack spacing={2} align="stretch">
              {cart.items.map(item => (
                <HStack key={item.id} justify="space-between">
                  <Text>{item.productName} × {item.quantity}</Text>
                  <Text fontWeight="semibold">
                    ${item.subTotal.toFixed(2)}
                  </Text>
                </HStack>
              ))}
            </VStack>

            <Divider />

            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">
                Total ({cart.totalItems} items):
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="brand.500">
                ${cart.totalAmount.toFixed(2)}
              </Text>
            </HStack>

            <HStack spacing={4} pt={4}>
              <Button
                variant="outline"
                onClick={() => navigate('/cart')}
                flex={1}
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                isLoading={loading}
                loadingText="Placing Order..."
                flex={1}
              >
                Place Order
              </Button>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CheckoutPage;