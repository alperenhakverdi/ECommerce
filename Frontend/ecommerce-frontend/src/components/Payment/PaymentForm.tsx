import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';
import { PaymentType, PaymentMethod, CreditCardDetails, PayPalDetails, BankTransferDetails } from '../../types/payment';

interface PaymentFormProps {
  totalAmount: number;
  currency?: string;
  onPaymentSubmit: (paymentMethod: PaymentMethod) => void;
  loading?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  totalAmount,
  currency = 'USD',
  onPaymentSubmit,
  loading = false
}) => {
  const [paymentType, setPaymentType] = useState<string>(PaymentType.CreditCard.toString());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Credit Card State
  const [creditCard, setCreditCard] = useState<CreditCardDetails>({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: ''
  });

  // PayPal State
  const [paypal, setPaypal] = useState<PayPalDetails>({
    email: '',
    payerId: ''
  });

  // Bank Transfer State
  const [bankTransfer, setBankTransfer] = useState<BankTransferDetails>({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: ''
  });


  const validateCreditCard = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Minimal validation - just check if fields are not empty
    if (!creditCard.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    }
    if (!creditCard.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Card holder name is required';
    }
    if (!creditCard.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    }
    if (!creditCard.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    }
    if (!creditCard.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePayPal = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paypal.email || !paypal.email.includes('@')) {
      newErrors.paypalEmail = 'Valid PayPal email is required';
    }
    if (!paypal.payerId.trim()) {
      newErrors.paypalPayerId = 'PayPal Payer ID is required';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateBankTransfer = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bankTransfer.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }
    if (!bankTransfer.accountNumber || bankTransfer.accountNumber.length < 8) {
      newErrors.accountNumber = 'Valid account number is required';
    }
    if (!bankTransfer.routingNumber || bankTransfer.routingNumber.length !== 9) {
      newErrors.routingNumber = 'Valid routing number (9 digits) is required';
    }
    if (!bankTransfer.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let paymentMethod: PaymentMethod;
    const type = parseInt(paymentType) as PaymentType;

    switch (type) {
      case PaymentType.CreditCard:
      case PaymentType.DebitCard:
        if (!validateCreditCard()) return;
        paymentMethod = {
          type,
          creditCard,
        };
        break;
      case PaymentType.PayPal:
        if (!validatePayPal()) return;
        paymentMethod = {
          type,
          payPal: paypal,
        };
        break;
      case PaymentType.BankTransfer:
        if (!validateBankTransfer()) return;
        paymentMethod = {
          type,
          bankTransfer,
        };
        break;
      default:
        setErrors({ general: 'Please select a valid payment method' });
        return;
    }

    onPaymentSubmit(paymentMethod);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardBody>
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {/* Payment Amount Display */}
            <Box textAlign="center" py={4} bg="gray.50" _dark={{ bg: 'gray.800' }} borderRadius="md">
              <Text fontSize="lg" fontWeight="bold">
                Total Amount: {currency} {totalAmount.toFixed(2)}
              </Text>
            </Box>

            {/* Payment Method Selection */}
            <FormControl>
              <FormLabel>Payment Method</FormLabel>
              <RadioGroup value={paymentType} onChange={setPaymentType}>
                <Stack spacing={4}>
                  <Radio value={PaymentType.CreditCard.toString()}>Credit Card</Radio>
                  <Radio value={PaymentType.DebitCard.toString()}>Debit Card</Radio>
                  <Radio value={PaymentType.PayPal.toString()}>PayPal</Radio>
                  <Radio value={PaymentType.BankTransfer.toString()}>Bank Transfer</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {/* Payment Method Details */}
            {(parseInt(paymentType) === PaymentType.CreditCard || 
              parseInt(paymentType) === PaymentType.DebitCard) && (
              <VStack spacing={4} align="stretch">
                <Text fontWeight="semibold">Card Information</Text>
                <FormControl isInvalid={!!errors.cardNumber}>
                  <FormLabel>Card Number</FormLabel>
                  <Input
                    value={creditCard.cardNumber}
                    onChange={(e) => {
                      setCreditCard(prev => ({ ...prev, cardNumber: e.target.value }));
                      clearFieldError('cardNumber');
                    }}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && <Text color="red.500" fontSize="sm">{errors.cardNumber}</Text>}
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Test cards: 4111111111111111 (success), 4000000000000002 (declined)
                  </Text>
                </FormControl>

                <FormControl isInvalid={!!errors.cardHolderName}>
                  <FormLabel>Card Holder Name</FormLabel>
                  <Input
                    value={creditCard.cardHolderName}
                    onChange={(e) => {
                      setCreditCard(prev => ({ ...prev, cardHolderName: e.target.value }));
                      clearFieldError('cardHolderName');
                    }}
                    placeholder="John Doe"
                  />
                  {errors.cardHolderName && <Text color="red.500" fontSize="sm">{errors.cardHolderName}</Text>}
                </FormControl>

                <HStack>
                  <FormControl isInvalid={!!errors.expiryMonth}>
                    <FormLabel>Expiry Month</FormLabel>
                    <Select
                      value={creditCard.expiryMonth}
                      onChange={(e) => {
                        setCreditCard(prev => ({ ...prev, expiryMonth: e.target.value }));
                        clearFieldError('expiryMonth');
                      }}
                      placeholder="Month"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </Select>
                    {errors.expiryMonth && <Text color="red.500" fontSize="sm">{errors.expiryMonth}</Text>}
                  </FormControl>

                  <FormControl isInvalid={!!errors.expiryYear}>
                    <FormLabel>Expiry Year</FormLabel>
                    <Select
                      value={creditCard.expiryYear}
                      onChange={(e) => {
                        setCreditCard(prev => ({ ...prev, expiryYear: e.target.value }));
                        clearFieldError('expiryYear');
                      }}
                      placeholder="Year"
                    >
                      {years.map(year => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </Select>
                    {errors.expiryYear && <Text color="red.500" fontSize="sm">{errors.expiryYear}</Text>}
                  </FormControl>

                  <FormControl isInvalid={!!errors.cvv}>
                    <FormLabel>CVV</FormLabel>
                    <Input
                      value={creditCard.cvv}
                      onChange={(e) => {
                        setCreditCard(prev => ({ ...prev, cvv: e.target.value }));
                        clearFieldError('cvv');
                      }}
                      placeholder="123"
                    />
                    {errors.cvv && <Text color="red.500" fontSize="sm">{errors.cvv}</Text>}
                  </FormControl>
                </HStack>
              </VStack>
            )}

            {parseInt(paymentType) === PaymentType.PayPal && (
              <VStack spacing={4} align="stretch">
                <Text fontWeight="semibold">PayPal Information</Text>
                <FormControl isInvalid={!!errors.paypalEmail}>
                  <FormLabel>PayPal Email</FormLabel>
                  <Input
                    type="email"
                    value={paypal.email}
                    onChange={(e) => {
                      setPaypal(prev => ({ ...prev, email: e.target.value }));
                      clearFieldError('paypalEmail');
                    }}
                    placeholder="your@paypal.com"
                  />
                  {errors.paypalEmail && <Text color="red.500" fontSize="sm">{errors.paypalEmail}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.paypalPayerId}>
                  <FormLabel>Payer ID</FormLabel>
                  <Input
                    value={paypal.payerId}
                    onChange={(e) => {
                      setPaypal(prev => ({ ...prev, payerId: e.target.value }));
                      clearFieldError('paypalPayerId');
                    }}
                    placeholder="PAYERID123456789"
                  />
                  {errors.paypalPayerId && <Text color="red.500" fontSize="sm">{errors.paypalPayerId}</Text>}
                </FormControl>
              </VStack>
            )}

            {parseInt(paymentType) === PaymentType.BankTransfer && (
              <VStack spacing={4} align="stretch">
                <Text fontWeight="semibold">Bank Transfer Information</Text>
                <FormControl isInvalid={!!errors.bankName}>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    value={bankTransfer.bankName}
                    onChange={(e) => {
                      setBankTransfer(prev => ({ ...prev, bankName: e.target.value }));
                      clearFieldError('bankName');
                    }}
                    placeholder="Bank of America"
                  />
                  {errors.bankName && <Text color="red.500" fontSize="sm">{errors.bankName}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.accountNumber}>
                  <FormLabel>Account Number</FormLabel>
                  <Input
                    value={bankTransfer.accountNumber}
                    onChange={(e) => {
                      setBankTransfer(prev => ({ ...prev, accountNumber: e.target.value.replace(/\D/g, '') }));
                      clearFieldError('accountNumber');
                    }}
                    placeholder="1234567890"
                  />
                  {errors.accountNumber && <Text color="red.500" fontSize="sm">{errors.accountNumber}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.routingNumber}>
                  <FormLabel>Routing Number</FormLabel>
                  <Input
                    value={bankTransfer.routingNumber}
                    onChange={(e) => {
                      setBankTransfer(prev => ({ ...prev, routingNumber: e.target.value.replace(/\D/g, '') }));
                      clearFieldError('routingNumber');
                    }}
                    placeholder="123456789"
                    maxLength={9}
                  />
                  {errors.routingNumber && <Text color="red.500" fontSize="sm">{errors.routingNumber}</Text>}
                </FormControl>

                <FormControl isInvalid={!!errors.accountHolderName}>
                  <FormLabel>Account Holder Name</FormLabel>
                  <Input
                    value={bankTransfer.accountHolderName}
                    onChange={(e) => {
                      setBankTransfer(prev => ({ ...prev, accountHolderName: e.target.value }));
                      clearFieldError('accountHolderName');
                    }}
                    placeholder="John Doe"
                  />
                  {errors.accountHolderName && <Text color="red.500" fontSize="sm">{errors.accountHolderName}</Text>}
                </FormControl>

                <Alert status="info" size="sm">
                  <AlertIcon />
                  Bank transfers may take 1-3 business days to process.
                </Alert>
              </VStack>
            )}


            {/* Submit Button */}
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={loading}
              loadingText="Processing Payment..."
            >
              Process Payment ({currency} {totalAmount.toFixed(2)})
            </Button>

            {errors.general && (
              <Alert status="error">
                <AlertIcon />
                {errors.general}
              </Alert>
            )}
          </VStack>
        </Box>
      </CardBody>
    </Card>
  );
};

export default PaymentForm;