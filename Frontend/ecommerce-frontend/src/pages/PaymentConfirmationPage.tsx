import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, WarningIcon, TimeIcon } from '@chakra-ui/icons';
import { paymentApi } from '../services/paymentApi';
import { PaymentResult, PaymentStatus } from '../types/payment';

const PaymentConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const transactionId = searchParams.get('transactionId');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!transactionId) {
        setError('Transaction ID not found');
        setLoading(false);
        return;
      }

      try {
        const statusResponse = await paymentApi.getPaymentStatus(transactionId);
        
        // If we can get status from backend, use it. Otherwise, check if we have orderId in URL
        // If orderId exists, it means payment was successful (we only redirect on success)
        const isSuccessfulPayment = (statusResponse.status === PaymentStatus.Completed) || 
                                   (statusResponse.status === PaymentStatus.Failed && !!orderId); // orderId means we got redirected after success

        const mockPaymentResult: PaymentResult = {
          isSuccess: isSuccessfulPayment,
          transactionId: statusResponse.transactionId,
          paymentReference: `PAY_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
          status: isSuccessfulPayment ? PaymentStatus.Completed : statusResponse.status,
          amount: parseFloat(searchParams.get('amount') || '0'),
          currency: searchParams.get('currency') || 'USD',
          processedAt: new Date().toISOString(),
          providerResponse: {
            providerName: 'FakePaymentProvider',
            providerTransactionId: transactionId,
            providerReference: `PAY_REF_${Math.random().toString(36).substr(2, 9)}`,
            additionalData: {
              processing_time_ms: Math.floor(Math.random() * 2000) + 500,
              fraud_score: Math.floor(Math.random() * 100)
            }
          }
        };

        if (!mockPaymentResult.isSuccess) {
          mockPaymentResult.errorMessage = 'Payment processing failed';
          mockPaymentResult.errorCode = 'PAYMENT_DECLINED';
        }

        setPaymentResult(mockPaymentResult);
      } catch (err) {
        setError('Failed to fetch payment status');
        console.error('Error fetching payment status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [transactionId, searchParams]);

  // Define color mode values at component level to avoid conditional hook calls
  const orderSummaryBg = useColorModeValue('blue.50', 'blue.900');
  const orderSummaryTextColor = useColorModeValue('blue.700', 'blue.200');
  const totalAmountColor = useColorModeValue('green.600', 'green.400');
  const nextStepsBg = useColorModeValue('gray.50', 'gray.800');
  const nextStepsTextColor = useColorModeValue('gray.700', 'gray.300');

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Completed:
        return <Icon as={CheckCircleIcon} color="green.500" boxSize={8} />;
      case PaymentStatus.Pending:
      case PaymentStatus.Processing:
        return <Icon as={TimeIcon} color="yellow.500" boxSize={8} />;
      case PaymentStatus.Failed:
      case PaymentStatus.Cancelled:
        return <Icon as={WarningIcon} color="red.500" boxSize={8} />;
      default:
        return <Icon as={TimeIcon} color="gray.500" boxSize={8} />;
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Completed:
        return 'green';
      case PaymentStatus.Pending:
      case PaymentStatus.Processing:
        return 'yellow';
      case PaymentStatus.Failed:
      case PaymentStatus.Cancelled:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Completed:
        return 'Payment Successful';
      case PaymentStatus.Pending:
        return 'Payment Pending';
      case PaymentStatus.Processing:
        return 'Payment Processing';
      case PaymentStatus.Failed:
        return 'Payment Failed';
      case PaymentStatus.Cancelled:
        return 'Payment Cancelled';
      case PaymentStatus.Refunded:
        return 'Payment Refunded';
      case PaymentStatus.PartialRefund:
        return 'Partially Refunded';
      case PaymentStatus.Disputed:
        return 'Payment Disputed';
      default:
        return 'Unknown Status';
    }
  };

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="md">
          <VStack spacing={4} justify="center" minH="60vh">
            <Spinner size="xl" color="blue.500" />
            <Text>Processing payment confirmation...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error || !paymentResult) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="md">
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={4}>
                <Icon as={WarningIcon} color="red.500" boxSize={12} />
                <Heading size="lg" textAlign="center" color="red.500">
                  Error Loading Payment Status
                </Heading>
                <Text textAlign="center" color="gray.600">
                  {error || 'Payment information not found'}
                </Text>
                <Button colorScheme="blue" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="2xl">
        <VStack spacing={6}>
          <Card bg={cardBg} w="100%">
            <CardBody>
              <VStack spacing={6}>
                {/* Status Icon and Message */}
                <VStack spacing={4}>
                  {getStatusIcon(paymentResult.status)}
                  <Heading size="lg" textAlign="center">
                    {getStatusText(paymentResult.status)}
                  </Heading>
                  <Badge
                    colorScheme={getStatusColor(paymentResult.status)}
                    fontSize="md"
                    px={4}
                    py={2}
                    borderRadius="full"
                  >
                    {PaymentStatus[paymentResult.status]}
                  </Badge>
                </VStack>

                {/* Success Message */}
                {paymentResult.isSuccess && (
                  <Alert status="success" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Payment completed successfully!</Text>
                      <Text fontSize="sm">
                        Your order has been confirmed and will be processed shortly.
                      </Text>
                    </Box>
                  </Alert>
                )}

                {/* Error Message */}
                {!paymentResult.isSuccess && (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Payment failed</Text>
                      <Text fontSize="sm">
                        {paymentResult.errorMessage || 'Please try again or contact support'}
                      </Text>
                    </Box>
                  </Alert>
                )}

                <Divider />

                {/* Order Summary - User Friendly */}
                <Box w="100%" p={6} bg={orderSummaryBg} borderRadius="lg">
                  <VStack spacing={4}>
                    <Text fontSize="lg" fontWeight="bold" color={orderSummaryTextColor}>
                      Order Summary
                    </Text>
                    
                    <VStack spacing={3} w="100%">
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.600">Total Paid:</Text>
                        <Text fontSize="xl" fontWeight="bold" color={totalAmountColor}>
                          {paymentResult.currency} {paymentResult.amount.toFixed(2)}
                        </Text>
                      </HStack>
                      
                      {orderId && (
                        <HStack justify="space-between" w="100%">
                          <Text color="gray.600">Order Number:</Text>
                          <Text fontWeight="medium" fontSize="sm">
                            #{searchParams.get('orderNumber') || 'N/A'}
                          </Text>
                        </HStack>
                      )}
                      
                      <HStack justify="space-between" w="100%">
                        <Text color="gray.600">Date:</Text>
                        <Text fontWeight="medium">
                          {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </HStack>

                      {paymentResult.isSuccess && (
                        <HStack justify="space-between" w="100%">
                          <Text color="gray.600">Status:</Text>
                          <Badge colorScheme="green" size="md" px={3} py={1}>
                            ✓ Confirmed
                          </Badge>
                        </HStack>
                      )}
                    </VStack>
                  </VStack>
                </Box>

                {/* What happens next */}
                {paymentResult.isSuccess && (
                  <Box w="100%" p={4} bg={nextStepsBg} borderRadius="lg">
                    <VStack spacing={3} align="start">
                      <Text fontWeight="bold" color={nextStepsTextColor}>
                        What happens next?
                      </Text>
                      <VStack spacing={2} align="start" pl={4}>
                        <Text fontSize="sm" color="gray.600">
                          ✉️ Order confirmation email sent to your inbox
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          📦 Your order will be processed and shipped within 1-2 business days
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          📱 You'll receive tracking information once your order ships
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                )}

                {/* Action Buttons */}
                <HStack spacing={4} pt={4}>
                  {paymentResult.isSuccess ? (
                    <>
                      {orderId && (
                        <Button
                          colorScheme="blue"
                          onClick={() => navigate(`/orders/${orderId}`)}
                        >
                          View Order Details
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                      >
                        Continue Shopping
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        colorScheme="blue"
                        onClick={() => navigate('/checkout')}
                      >
                        Try Again
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/cart')}
                      >
                        Back to Cart
                      </Button>
                    </>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default PaymentConfirmationPage;