import React, { useState, useEffect } from 'react';
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
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersApi } from '../services/api';
import { paymentApi } from '../services/paymentApi';
import { CreateOrderRequest, Address } from '../types';
import { PaymentMethod, PaymentRequest } from '../types/payment';
import { AddressSelector } from '../components/Address';
import TrendyolStylePaymentForm from '../components/Payment/TrendyolStylePaymentForm';

const CheckoutPage: React.FC = () => {
  const { cart, getUserId, loadCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const steps = isAuthenticated ? [
    { title: 'Shipping Address', description: 'Delivery location' },
    { title: 'Payment', description: 'Payment method' },
    { title: 'Review', description: 'Final confirmation' },
  ] : [
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    customerName?: string;
    customerEmail?: string;
    address?: string;
  }>({});

  // Auto-fill customer info for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerInfo({
        customerName: `${user.firstName} ${user.lastName}`.trim(),
        customerEmail: user.email,
      });
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePaymentSubmit = (paymentData: any) => {
    // Convert TrendyolStylePaymentForm data to PaymentMethod format
    let paymentMethodData: PaymentMethod;
    
    if (paymentData.method === 'saved-card' && paymentData.savedCardId) {
      // For saved card payments
      paymentMethodData = {
        type: 1, // CreditCard
        savedCardId: paymentData.savedCardId,
        installments: paymentData.installments || 1
      };
    } else if (paymentData.method === 'new-card' && paymentData.newCard) {
      // For new card payments
      paymentMethodData = {
        type: 1, // CreditCard
        creditCard: paymentData.newCard,
        installments: paymentData.installments || 1,
        saveCard: paymentData.saveCard || false
      };
    } else {
      toast({
        title: 'Payment Error',
        description: 'Please select a valid payment method.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setPaymentMethod(paymentMethodData);
    setActiveStep(isAuthenticated ? 2 : 3); // Move to review step
  };

  const validateCustomerInfo = (): boolean => {
    const newErrors: typeof errors = {};

    if (!customerInfo.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!customerInfo.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddress = (): boolean => {
    if (!selectedAddress) {
      setErrors(prev => ({ ...prev, address: 'Please select a shipping address' }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!isAuthenticated && activeStep === 0) {
      // Guest user: validate customer info first
      if (validateCustomerInfo()) {
        setActiveStep(1);
      }
    } else if ((isAuthenticated && activeStep === 0) || (!isAuthenticated && activeStep === 1)) {
      // Address selection step
      if (validateAddress()) {
        const nextStep = isAuthenticated ? 1 : 2;
        setActiveStep(nextStep); // Next step is payment
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (!cart || cart.items.length === 0 || !selectedAddress || !paymentMethod) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all steps before submitting.',
        status: 'error',
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

      // First, process the payment
      const paymentRequest: PaymentRequest = {
        amount: cart.totalAmount,
        currency: 'USD',
        paymentMethod,
        orderId: '', // Will be set after order creation
        customerEmail: customerInfo.customerEmail,
        description: `Payment for ${cart.totalItems} items`,
      };

      // Create order first to get order ID
      const orderData: CreateOrderRequest = {
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        addressId: selectedAddress.id,
      };

      const orderResponse = await ordersApi.create(userId, orderData);
      const orderId = orderResponse.data.id;
      const orderNumber = orderResponse.data.orderNumber;

      // Update payment request with order ID
      paymentRequest.orderId = orderId;

      // Process payment
      const paymentResult = await paymentApi.processPayment(paymentRequest);

      if (paymentResult.isSuccess) {
        const isDemo = paymentResult.errorMessage?.includes('Demo Mode');
        toast({
          title: 'Payment Successful!',
          description: isDemo 
            ? `Order #${orderNumber} has been created successfully! (Demo Mode - No real payment processed)`
            : `Order #${orderNumber} has been created and payment processed.`,
          status: 'success',
          duration: 7000,
          isClosable: true,
        });

        // Reload cart to reflect the cleared state
        await loadCart();

        // Redirect to payment confirmation page
        const confirmationUrl = `/payment/confirmation?transactionId=${paymentResult.transactionId}&orderId=${orderId}&orderNumber=${orderNumber}&amount=${cart.totalAmount}&currency=USD`;
        navigate(confirmationUrl, { replace: true });
      } else {
        toast({
          title: 'Payment Failed',
          description: paymentResult.errorMessage || 'Payment processing failed. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast({
        title: 'Checkout Failed',
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
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" textAlign="center">
          Checkout
        </Heading>

        {/* Stepper */}
        <Stepper index={activeStep} colorScheme="blue">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            {/* Step 0: Customer Information (Guest users only) */}
            {!isAuthenticated && activeStep === 0 && (
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

                <HStack justify="flex-end" pt={4}>
                  <Button colorScheme="blue" onClick={handleNext}>
                    Next: Shipping Address
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Shipping Address Step */}
            {((!isAuthenticated && activeStep === 1) || (isAuthenticated && activeStep === 0)) && (
              <VStack spacing={6} align="stretch">
                <Heading size="md">Shipping Address</Heading>

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

                <HStack justify="space-between" pt={4}>
                  {!isAuthenticated && (
                    <Button variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}
                  <Button 
                    colorScheme="blue" 
                    onClick={handleNext}
                    ml={isAuthenticated ? 'auto' : 0}
                  >
                    Next: Payment
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Payment Step */}
            {((!isAuthenticated && activeStep === 2) || (isAuthenticated && activeStep === 1)) && (
              <VStack spacing={6} align="stretch">
                <Heading size="md">Payment Information</Heading>

                <TrendyolStylePaymentForm
                  totalAmount={cart.totalAmount}
                  currency="$"
                  onPaymentSubmit={handlePaymentSubmit}
                  loading={loading}
                />

                <HStack justify="space-between" pt={4}>
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                </HStack>
              </VStack>
            )}

            {/* Review Step */}
            {((!isAuthenticated && activeStep === 3) || (isAuthenticated && activeStep === 2)) && (
              <VStack spacing={6} align="stretch">
                <Heading size="md">Review Your Order</Heading>

                {/* Customer Info Review */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>Customer Information</Text>
                  <Text>Name: {customerInfo.customerName}</Text>
                  <Text>Email: {customerInfo.customerEmail}</Text>
                </Box>

                <Divider />

                {/* Shipping Address Review */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>Shipping Address</Text>
                  {selectedAddress && (
                    <Text>
                      {selectedAddress.addressLine1}{selectedAddress.addressLine2 && ', ' + selectedAddress.addressLine2}
                      <br />
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                      <br />
                      {selectedAddress.country}
                    </Text>
                  )}
                </Box>

                <Divider />

                {/* Payment Method Review */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>Payment Method</Text>
                  {paymentMethod && (
                    <VStack align="start" spacing={1}>
                      <Text>
                        {paymentMethod.type === 1 ? 'Credit Card' : 
                         paymentMethod.type === 2 ? 'Debit Card' :
                         paymentMethod.type === 3 ? 'PayPal' :
                         paymentMethod.type === 4 ? 'Bank Transfer' : 'Unknown'}
                        {paymentMethod.creditCard && ` ending in ${paymentMethod.creditCard.cardNumber.slice(-4)}`}
                        {paymentMethod.savedCardId && ' (Saved Card)'}
                      </Text>
                      {(paymentMethod as any).installments && (paymentMethod as any).installments > 1 && (
                        <Text fontSize="sm" color="blue.600">
                          {(paymentMethod as any).installments} installments
                        </Text>
                      )}
                      {(paymentMethod as any).saveCard && (
                        <Text fontSize="sm" color="green.600">
                          Card will be saved for future purchases
                        </Text>
                      )}
                    </VStack>
                  )}
                </Box>

                <Divider />

                {/* Order Summary */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>Order Summary</Text>
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

                  <Divider my={4} />

                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">
                      Total ({cart.totalItems} items):
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="brand.500">
                      ${cart.totalAmount.toFixed(2)}
                    </Text>
                  </HStack>
                </Box>

                <HStack justify="space-between" pt={4}>
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleFinalSubmit}
                    isLoading={loading}
                    loadingText="Processing..."
                  >
                    Complete Order & Pay
                  </Button>
                </HStack>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Order Summary Sidebar - Always visible */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="sm">Order Summary</Heading>

              <VStack spacing={2} align="stretch">
                {cart.items.map(item => (
                  <HStack key={item.id} justify="space-between" fontSize="sm">
                    <Text>{item.productName} × {item.quantity}</Text>
                    <Text fontWeight="semibold">
                      ${item.subTotal.toFixed(2)}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="bold">
                  Total ({cart.totalItems} items):
                </Text>
                <Text fontWeight="bold" color="brand.500">
                  ${cart.totalAmount.toFixed(2)}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default CheckoutPage;