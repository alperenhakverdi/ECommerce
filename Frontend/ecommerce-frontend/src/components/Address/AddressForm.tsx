import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  VStack,
  HStack,
  Text,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { AddressFormData, AddressFormErrors, Address } from '../../types';

interface AddressFormProps {
  address?: Address; // For edit mode
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const toast = useToast();
  
  const [formData, setFormData] = useState<AddressFormData>({
    title: address?.title || '',
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    addressLine1: address?.addressLine1 || '',
    addressLine2: address?.addressLine2 || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'Turkey',
    phoneNumber: address?.phoneNumber || '',
    isDefault: address?.isDefault || false,
  });

  const [errors, setErrors] = useState<AddressFormErrors>({});

  useEffect(() => {
    if (address) {
      setFormData({
        title: address.title,
        firstName: address.firstName,
        lastName: address.lastName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        phoneNumber: address.phoneNumber || '',
        isDefault: address.isDefault,
      });
    }
  }, [address]);

  const validateForm = (): boolean => {
    const newErrors: AddressFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Address title is required';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field as keyof AddressFormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: `Address ${address ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || `Failed to ${address ? 'update' : 'create'} address`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addressTitleOptions = [
    { value: 'Home', label: 'Home' },
    { value: 'Work', label: 'Work' },
    { value: 'Office', label: 'Office' },
    { value: 'Other', label: 'Other' },
  ];

  const turkishCities = [
    'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 
    'Gaziantep', 'Kayseri', 'Mersin', 'Eskisehir', 'Diyarbakir', 'Other'
  ];

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="xl" fontWeight="bold" mb={2}>
          {address ? 'Edit Address' : 'Add New Address'}
        </Text>

        {/* Address Title */}
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Address Title</FormLabel>
          <Select
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Select address type"
          >
            {addressTitleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.title && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.title}
            </Text>
          )}
        </FormControl>

        {/* Name Fields */}
        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.firstName}>
            <FormLabel>First Name</FormLabel>
            <Input
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.firstName}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.lastName}>
            <FormLabel>Last Name</FormLabel>
            <Input
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.lastName}
              </Text>
            )}
          </FormControl>
        </HStack>

        {/* Address Lines */}
        <FormControl isInvalid={!!errors.addressLine1}>
          <FormLabel>Address Line 1</FormLabel>
          <Input
            value={formData.addressLine1}
            onChange={(e) => handleInputChange('addressLine1', e.target.value)}
            placeholder="Street address, building number"
          />
          {errors.addressLine1 && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.addressLine1}
            </Text>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>Address Line 2 (Optional)</FormLabel>
          <Input
            value={formData.addressLine2}
            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            placeholder="Apartment, suite, floor (optional)"
          />
        </FormControl>

        {/* City, State, Postal */}
        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.city}>
            <FormLabel>City</FormLabel>
            <Select
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Select city"
            >
              {turkishCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
            {errors.city && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.city}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.state}>
            <FormLabel>State/Province</FormLabel>
            <Input
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State/Province"
            />
            {errors.state && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.state}
              </Text>
            )}
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.postalCode}>
            <FormLabel>Postal Code</FormLabel>
            <Input
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="Postal code"
            />
            {errors.postalCode && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.postalCode}
              </Text>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.country}>
            <FormLabel>Country</FormLabel>
            <Select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
            >
              <option value="Turkey">Turkey</option>
              <option value="United States">United States</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Other">Other</option>
            </Select>
            {errors.country && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {errors.country}
              </Text>
            )}
          </FormControl>
        </HStack>

        {/* Phone Number */}
        <FormControl isInvalid={!!errors.phoneNumber}>
          <FormLabel>Phone Number (Optional)</FormLabel>
          <Input
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+90 555 123 45 67"
          />
          {errors.phoneNumber && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.phoneNumber}
            </Text>
          )}
        </FormControl>

        {/* Default Address Toggle */}
        <FormControl display="flex" alignItems="center">
          <Switch
            id="is-default"
            isChecked={formData.isDefault}
            onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            mr={3}
          />
          <FormLabel htmlFor="is-default" mb={0}>
            Set as default address
          </FormLabel>
        </FormControl>

        {formData.isDefault && (
          <Alert status="info" size="sm">
            <AlertIcon />
            This will be used as your default shipping address for orders.
          </Alert>
        )}

        {/* Action Buttons */}
        <Box 
          pt={6}
          mt={6}
          borderTop="1px"
          borderColor="gray.100"
        >
          <HStack spacing={4}>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              loadingText={address ? 'Updating...' : 'Creating...'}
              flex={1}
              size="lg"
            >
              {address ? 'Update Address' : 'Add Address'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              flex={1}
              size="lg"
            >
              Cancel
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default AddressForm;