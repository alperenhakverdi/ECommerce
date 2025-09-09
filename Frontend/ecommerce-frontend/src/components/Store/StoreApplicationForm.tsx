import React, { useState } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Text,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { storesApi } from '../../services/api';
import { StoreApplicationRequest } from '../../types';

interface StoreApplicationFormProps {
  onSuccess?: () => void;
}

const StoreApplicationForm: React.FC<StoreApplicationFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [formData, setFormData] = useState<StoreApplicationRequest>({
    businessName: '',
    businessDescription: '',
    contactPhone: '',
    contactEmail: '',
    taxNumber: '',
    businessAddress: '',
    website: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const required = ['businessName', 'businessDescription', 'contactPhone', 'contactEmail', 'taxNumber', 'businessAddress'];
    
    for (const field of required) {
      if (!formData[field as keyof StoreApplicationRequest]) {
        setError(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    if (formData.contactPhone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Website validation (if provided)
    if (formData.website && formData.website.trim() !== '') {
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(formData.website)) {
        setError('Please enter a valid website URL (including http:// or https://)');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Map frontend fields to backend DTO structure
      const submitData = {
        name: formData.businessName,
        description: formData.businessDescription,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        businessAddress: formData.businessAddress,
        taxNumber: formData.taxNumber,
        website: formData.website?.trim() || '',
        logoUrl: '',
        bannerUrl: ''
      };

      await storesApi.applyToBecomeStore(submitData);

      toast({
        title: 'Application Submitted Successfully',
        description: t('store.application.success'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('store.application.error');
      setError(errorMessage);
      toast({
        title: 'Application Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Text fontSize="md" color="gray.600" mb={4}>
          Fill out this form to apply to become a store owner. All fields marked with * are required.
          Your application will be reviewed by our admin team.
        </Text>

        <FormControl isRequired>
          <FormLabel>{t('store.application.businessName')} *</FormLabel>
          <Input
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            placeholder="Enter your business name"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('store.application.businessDescription')} *</FormLabel>
          <Textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleInputChange}
            placeholder="Describe your business and the products you plan to sell"
            rows={4}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('store.application.contactPhone')} *</FormLabel>
          <Input
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            placeholder="Enter your contact phone number"
            type="tel"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('store.application.contactEmail')} *</FormLabel>
          <Input
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            placeholder="Enter your contact email"
            type="email"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('store.application.taxNumber')} *</FormLabel>
          <Input
            name="taxNumber"
            value={formData.taxNumber}
            onChange={handleInputChange}
            placeholder="Enter your tax identification number"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t('store.application.businessAddress')} *</FormLabel>
          <Textarea
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleInputChange}
            placeholder="Enter your complete business address"
            rows={3}
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('store.application.website')}</FormLabel>
          <Input
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://your-website.com (optional)"
            type="url"
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          isLoading={isSubmitting}
          loadingText="Submitting Application..."
        >
          {t('store.application.submit')}
        </Button>

        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium">What happens next?</Text>
            <Text fontSize="sm">
              • Your application will be reviewed by our admin team
            </Text>
            <Text fontSize="sm">
              • You'll receive an email notification about the review status
            </Text>
            <Text fontSize="sm">
              • Once approved, you can start adding products to your store
            </Text>
          </VStack>
        </Alert>
      </VStack>
    </form>
  );
};

export default StoreApplicationForm;