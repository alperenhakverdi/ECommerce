import React, { useState, useEffect } from 'react';
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
  CardHeader,
  Heading,
  Badge,
  Divider,
  Checkbox,
  SimpleGrid,
  Icon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { LockIcon, AddIcon } from '@chakra-ui/icons';
import { FiShield, FiCreditCard } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { SavedCard } from '../../types';
import { savedCardsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentFormProps {
  totalAmount: number;
  currency?: string;
  onPaymentSubmit: (paymentData: any) => void;
  loading?: boolean;
}

const TrendyolStylePaymentForm: React.FC<PaymentFormProps> = ({
  totalAmount,
  currency = 'USD',
  onPaymentSubmit,
  loading = false
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<'saved-card' | 'new-card'>('saved-card');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [installments, setInstallments] = useState<string>('1');
  const [saveNewCard, setSaveNewCard] = useState<boolean>(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    kvkk: false,
    sms: false
  });
  
  // New card form data
  const [newCardData, setNewCardData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  // Fetch saved cards on mount
  useEffect(() => {
    const fetchSavedCards = async () => {
      if (!user) return;
      
      try {
        setLoadingCards(true);
        const response = await savedCardsApi.getAll();
        setSavedCards(response.data);
        
        // Auto select default card if available
        const defaultCard = response.data.find(card => card.isDefault);
        if (defaultCard) {
          setSelectedCardId(defaultCard.id);
        } else if (response.data.length > 0) {
          setSelectedCardId(response.data[0].id);
        }
        
        // If no saved cards, switch to new card mode
        if (response.data.length === 0) {
          setPaymentMethod('new-card');
        }
      } catch (error) {
        console.error('Failed to fetch saved cards:', error);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchSavedCards();
  }, [user]);

  // Generate installment options
  const installmentOptions = [
    { value: '1', label: t('payment.installments.single'), fee: 0 },
    { value: '2', label: t('payment.installments.twoMonths'), fee: 0 },
    { value: '3', label: t('payment.installments.threeMonths'), fee: 2.5 },
    { value: '6', label: t('payment.installments.sixMonths'), fee: 5 },
    { value: '9', label: t('payment.installments.nineMonths'), fee: 7.5 },
    { value: '12', label: t('payment.installments.twelveMonths'), fee: 10 }
  ];

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 MasterCard';
      case 'amex':
      case 'american express':
        return '💳 Amex';
      default:
        return '💳';
    }
  };

  const calculateInstallmentAmount = (total: number, installment: number, feePercent: number) => {
    const feeAmount = (total * feePercent) / 100;
    const totalWithFee = total + feeAmount;
    return totalWithFee / installment;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow any input without restrictions for now
    const value = e.target.value;
    setNewCardData(prev => ({ ...prev, cardNumber: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'saved-card' && !selectedCardId) {
      newErrors.selectedCard = t('payment.errors.selectCard');
    }

    if (paymentMethod === 'new-card') {
      // Minimal validation - just check if fields are not empty
      if (!newCardData.cardNumber.trim()) {
        newErrors.cardNumber = t('payment.errors.cardNumberRequired');
      }
      if (!newCardData.cardHolderName.trim()) {
        newErrors.cardHolderName = t('payment.errors.cardHolderRequired');
      }
      if (!newCardData.expiryMonth || !newCardData.expiryYear) {
        newErrors.expiry = t('payment.errors.expiryRequired');
      }
      if (!newCardData.cvv.trim()) {
        newErrors.cvv = t('payment.errors.cvvRequired');
      }
    }

    if (!agreements.terms) {
      newErrors.terms = t('payment.errors.termsRequired');
    }
    if (!agreements.kvkk) {
      newErrors.kvkv = t('payment.errors.kvkkRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: t('common.error'),
        description: t('payment.errors.pleaseFillRequired'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const paymentData = {
      method: paymentMethod,
      savedCardId: paymentMethod === 'saved-card' ? selectedCardId : undefined,
      newCard: paymentMethod === 'new-card' ? newCardData : undefined,
      installments: parseInt(installments),
      saveCard: saveNewCard,
      totalAmount,
      agreements
    };

    onPaymentSubmit(paymentData);
  };

  const selectedInstallment = installmentOptions.find(opt => opt.value === installments);
  const installmentAmount = selectedInstallment 
    ? calculateInstallmentAmount(totalAmount, parseInt(installments), selectedInstallment.fee)
    : totalAmount;

  return (
    <Box bg={bgColor} p={6} borderRadius="xl" maxW="600px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Security Badge */}
        <HStack justify="center" spacing={3} p={3} bg={cardBg} borderRadius="lg" border="1px" borderColor={borderColor}>
          <Icon as={FiShield} color="green.500" boxSize={5} />
          <Text fontSize="sm" fontWeight="semibold" color="green.600">
            {t('payment.securePayment')}
          </Text>
          <Icon as={LockIcon} color="green.500" boxSize={4} />
        </HStack>

        {/* Payment Method Selection */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader pb={2}>
            <Heading size="md">{t('payment.paymentMethod')}</Heading>
          </CardHeader>
          <CardBody pt={2}>
            <RadioGroup value={paymentMethod} onChange={(value) => setPaymentMethod(value as any)}>
              <Stack spacing={4}>
                {/* Saved Cards Option */}
                {savedCards.length > 0 && (
                  <Box>
                    <Radio value="saved-card" size="lg" colorScheme="blue">
                      <Text fontWeight="semibold">{t('payment.savedCards')}</Text>
                    </Radio>
                    
                    {paymentMethod === 'saved-card' && (
                      <VStack spacing={3} mt={4} align="stretch">
                        {loadingCards ? (
                          <Text fontSize="sm" color="gray.500">{t('savedCards.loading')}</Text>
                        ) : (
                          savedCards.map((card) => (
                            <Box
                              key={card.id}
                              p={4}
                              border="2px"
                              borderColor={selectedCardId === card.id ? selectedBorderColor : borderColor}
                              borderRadius="lg"
                              cursor="pointer"
                              bg={selectedCardId === card.id ? 'blue.50' : 'white'}
                              onClick={() => setSelectedCardId(card.id)}
                              _hover={{ borderColor: selectedBorderColor }}
                            >
                              <HStack justify="space-between">
                                <HStack spacing={3}>
                                  <Icon as={FiCreditCard} boxSize={6} color="gray.600" />
                                  <VStack align="start" spacing={1}>
                                    <HStack spacing={2}>
                                      <Text fontWeight="semibold">
                                        {getCardTypeIcon(card.cardType)} {card.cardNumberMasked}
                                      </Text>
                                      {card.isDefault && (
                                        <Badge colorScheme="green" size="sm">
                                          {t('savedCards.defaultCard')}
                                        </Badge>
                                      )}
                                    </HStack>
                                    <Text fontSize="sm" color="gray.600">
                                      {card.cardHolderName}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <Radio
                                  isChecked={selectedCardId === card.id}
                                  value={card.id}
                                  colorScheme="blue"
                                />
                              </HStack>
                            </Box>
                          ))
                        )}
                      </VStack>
                    )}
                  </Box>
                )}

                {/* New Card Option */}
                <Box>
                  <Radio value="new-card" size="lg" colorScheme="blue">
                    <HStack spacing={2}>
                      <Icon as={AddIcon} boxSize={4} />
                      <Text fontWeight="semibold">{t('payment.newCard')}</Text>
                    </HStack>
                  </Radio>
                  
                  {paymentMethod === 'new-card' && (
                    <Box mt={4} p={4} bg="gray.50" borderRadius="lg">
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isInvalid={!!errors.cardNumber} gridColumn={{ base: 1, md: "1 / -1" }}>
                          <FormLabel>{t('payment.form.cardNumber')}</FormLabel>
                          <Input
                            value={newCardData.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder={t('payment.form.cardNumberPlaceholder')}
                            maxLength={19}
                          />
                        </FormControl>

                        <FormControl isInvalid={!!errors.cardHolderName} gridColumn={{ base: 1, md: "1 / -1" }}>
                          <FormLabel>{t('payment.form.cardHolderName')}</FormLabel>
                          <Input
                            value={newCardData.cardHolderName}
                            onChange={(e) => setNewCardData(prev => ({ ...prev, cardHolderName: e.target.value }))}
                            placeholder={t('payment.form.cardHolderPlaceholder')}
                          />
                        </FormControl>

                        <FormControl isInvalid={!!errors.expiry}>
                          <FormLabel>{t('payment.form.expiryMonth')}</FormLabel>
                          <Select
                            value={newCardData.expiryMonth}
                            onChange={(e) => setNewCardData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                            placeholder={t('common.select')}
                          >
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl isInvalid={!!errors.expiry}>
                          <FormLabel>{t('payment.form.expiryYear')}</FormLabel>
                          <Select
                            value={newCardData.expiryYear}
                            onChange={(e) => setNewCardData(prev => ({ ...prev, expiryYear: e.target.value }))}
                            placeholder={t('common.select')}
                          >
                            {Array.from({ length: 15 }, (_, i) => {
                              const year = new Date().getFullYear() + i;
                              return (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              );
                            })}
                          </Select>
                        </FormControl>

                        <FormControl isInvalid={!!errors.cvv}>
                          <FormLabel>{t('payment.form.cvv')}</FormLabel>
                          <Input
                            value={newCardData.cvv}
                            onChange={(e) => setNewCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                            placeholder="123"
                            maxLength={4}
                            width="120px"
                          />
                        </FormControl>
                      </SimpleGrid>

                      <Checkbox
                        mt={4}
                        isChecked={saveNewCard}
                        onChange={(e) => setSaveNewCard(e.target.checked)}
                        colorScheme="blue"
                      >
                        {t('payment.form.saveCard')}
                      </Checkbox>
                    </Box>
                  )}
                </Box>
              </Stack>
            </RadioGroup>
          </CardBody>
        </Card>

        {/* Installment Options */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader pb={2}>
            <Heading size="md">{t('payment.installments.title')}</Heading>
          </CardHeader>
          <CardBody pt={2}>
            <RadioGroup value={installments} onChange={setInstallments}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {installmentOptions.map((option) => (
                  <Box
                    key={option.value}
                    p={3}
                    border="2px"
                    borderColor={installments === option.value ? selectedBorderColor : borderColor}
                    borderRadius="lg"
                    cursor="pointer"
                    bg={installments === option.value ? 'blue.50' : 'white'}
                    onClick={() => setInstallments(option.value)}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{option.label}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {option.value === '1' 
                            ? `${currency} ${totalAmount.toFixed(2)}`
                            : `${option.value}x ${currency} ${calculateInstallmentAmount(totalAmount, parseInt(option.value), option.fee).toFixed(2)}`
                          }
                        </Text>
                        {option.fee > 0 && (
                          <Text fontSize="xs" color="orange.600">
                            +{option.fee}% {t('payment.installments.fee')}
                          </Text>
                        )}
                      </VStack>
                      <Radio
                        value={option.value}
                        isChecked={installments === option.value}
                        colorScheme="blue"
                      />
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </RadioGroup>
          </CardBody>
        </Card>

        {/* Agreements */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Checkbox
                isChecked={agreements.terms}
                onChange={(e) => setAgreements(prev => ({ ...prev, terms: e.target.checked }))}
                colorScheme="blue"
                isInvalid={!!errors.terms}
              >
                <Text fontSize="sm">
                  {t('payment.agreements.terms')} <Text as="span" color="blue.500" cursor="pointer">{t('payment.agreements.read')}</Text>
                </Text>
              </Checkbox>

              <Checkbox
                isChecked={agreements.kvkk}
                onChange={(e) => setAgreements(prev => ({ ...prev, kvkk: e.target.checked }))}
                colorScheme="blue"
                isInvalid={!!errors.kvkv}
              >
                <Text fontSize="sm">
                  {t('payment.agreements.kvkk')} <Text as="span" color="blue.500" cursor="pointer">{t('payment.agreements.read')}</Text>
                </Text>
              </Checkbox>

              <Checkbox
                isChecked={agreements.sms}
                onChange={(e) => setAgreements(prev => ({ ...prev, sms: e.target.checked }))}
                colorScheme="blue"
              >
                <Text fontSize="sm">{t('payment.agreements.sms')}</Text>
              </Checkbox>
            </VStack>
          </CardBody>
        </Card>

        {/* Order Summary */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={3}>
              <HStack justify="space-between" w="full">
                <Text>{t('payment.summary.subtotal')}</Text>
                <Text fontWeight="semibold">{currency} {totalAmount.toFixed(2)}</Text>
              </HStack>
              
              {selectedInstallment && selectedInstallment.fee > 0 && (
                <HStack justify="space-between" w="full">
                  <Text color="orange.600">{t('payment.installments.fee')}</Text>
                  <Text color="orange.600" fontWeight="semibold">
                    +{currency} {((totalAmount * selectedInstallment.fee) / 100).toFixed(2)}
                  </Text>
                </HStack>
              )}
              
              <Divider />
              
              <HStack justify="space-between" w="full">
                <Text fontSize="lg" fontWeight="bold">{t('payment.summary.total')}</Text>
                <Text fontSize="lg" fontWeight="bold" color="green.600">
                  {currency} {(totalAmount + (selectedInstallment ? (totalAmount * selectedInstallment.fee) / 100 : 0)).toFixed(2)}
                </Text>
              </HStack>
              
              {installments !== '1' && (
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {installments}x {currency} {installmentAmount.toFixed(2)} {t('payment.installments.perMonth')}
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          colorScheme="green"
          size="lg"
          height="60px"
          fontSize="lg"
          fontWeight="bold"
          isLoading={loading}
          loadingText={t('payment.processing')}
          leftIcon={<LockIcon />}
        >
          {t('payment.completePayment')}
        </Button>

        {/* 3D Secure Notice */}
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Text fontSize="sm">{t('payment.threeDSecureNotice')}</Text>
        </Alert>

        {Object.keys(errors).length > 0 && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              {Object.values(errors).map((error, index) => (
                <Text key={index} fontSize="sm">{error}</Text>
              ))}
            </VStack>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default TrendyolStylePaymentForm;