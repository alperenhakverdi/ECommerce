import React, { useState } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  Text,
  Checkbox,
  Select,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SavedCard, CreateSavedCardRequest, UpdateSavedCardRequest } from '../../types';
import { savedCardsApi } from '../../services/api';

interface SavedCardFormProps {
  card?: SavedCard; // If provided, we're editing. If not, we're creating.
  onSuccess: () => void;
  onCancel: () => void;
}

const SavedCardForm: React.FC<SavedCardFormProps> = ({ card, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolderName: card?.cardHolderName || '',
    expiryMonth: card?.expiryMonth || 1,
    expiryYear: card?.expiryYear || new Date().getFullYear(),
    isDefault: card?.isDefault || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const isEditing = !!card;

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1).padStart(2, '0')
  }));

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 15 }, (_, i) => ({
    value: currentYear + i,
    label: String(currentYear + i)
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'expiryMonth' || name === 'expiryYear') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else if (name === 'cardNumber') {
      // Format card number with spaces every 4 digits
      let formattedValue = value.replace(/\s/g, '').replace(/\D/g, '');
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!isEditing && (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13)) {
      setError(t('savedCards.form.invalidCardNumber'));
      return false;
    }

    if (!formData.cardHolderName.trim()) {
      setError(t('savedCards.form.cardHolderRequired'));
      return false;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (formData.expiryYear < currentYear || 
        (formData.expiryYear === currentYear && formData.expiryMonth < currentMonth)) {
      setError(t('savedCards.form.expiredCard'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditing && card) {
        // Update existing card
        const updateData: UpdateSavedCardRequest = {
          cardHolderName: formData.cardHolderName,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          isDefault: formData.isDefault,
        };

        await savedCardsApi.update(card.id, updateData);
        
        toast({
          title: t('savedCards.cardUpdated'),
          description: t('savedCards.cardUpdatedDescription'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new card
        const createData: CreateSavedCardRequest = {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardHolderName: formData.cardHolderName,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          isDefault: formData.isDefault,
        };

        await savedCardsApi.create(createData);
        
        toast({
          title: t('savedCards.cardAdded'),
          description: t('savedCards.cardAddedDescription'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save card:', error);
      
      let errorMessage = t('savedCards.form.saveError');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
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

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {!isEditing && (
          <FormControl isRequired>
            <FormLabel>{t('savedCards.form.cardNumber')}</FormLabel>
            <Input
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder={t('savedCards.form.cardNumberPlaceholder')}
              maxLength={19} // 16 digits + 3 spaces
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {t('savedCards.form.cardNumberHelp')}
            </Text>
          </FormControl>
        )}

        <FormControl isRequired>
          <FormLabel>{t('savedCards.form.cardHolderName')}</FormLabel>
          <Input
            name="cardHolderName"
            value={formData.cardHolderName}
            onChange={handleInputChange}
            placeholder={t('savedCards.form.cardHolderPlaceholder')}
          />
        </FormControl>

        <HStack spacing={4}>
          <FormControl isRequired flex={1}>
            <FormLabel>{t('savedCards.form.expiryMonth')}</FormLabel>
            <Select
              name="expiryMonth"
              value={formData.expiryMonth}
              onChange={handleInputChange}
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired flex={1}>
            <FormLabel>{t('savedCards.form.expiryYear')}</FormLabel>
            <Select
              name="expiryYear"
              value={formData.expiryYear}
              onChange={handleInputChange}
            >
              {yearOptions.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </Select>
          </FormControl>
        </HStack>

        <FormControl>
          <Checkbox
            name="isDefault"
            isChecked={formData.isDefault}
            onChange={handleInputChange}
          >
            {t('savedCards.form.setAsDefault')}
          </Checkbox>
        </FormControl>

        <HStack spacing={3} pt={4}>
          <Button
            variant="outline"
            onClick={onCancel}
            flex={1}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText={isEditing ? t('savedCards.form.updating') : t('savedCards.form.adding')}
            flex={1}
          >
            {isEditing ? t('savedCards.form.updateCard') : t('savedCards.form.addCard')}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default SavedCardForm;