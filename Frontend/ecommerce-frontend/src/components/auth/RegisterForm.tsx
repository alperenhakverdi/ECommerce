import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Link,
  Divider,
  useToast,
  FormErrorMessage,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterRequest } from '../../types/auth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [accountType, setAccountType] = useState<'customer' | 'seller'>('customer');
  const [sellerData, setSellerData] = useState({
    storeName: '',
    taxId: '',
    phone: '',
    iban: '',
    storeDescription: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSellerDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSellerData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newFieldErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newFieldErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newFieldErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newFieldErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newFieldErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newFieldErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = 'Passwords do not match';
    }

    // Seller-specific validation
    if (accountType === 'seller') {
      if (!sellerData.storeName.trim()) {
        newFieldErrors.storeName = 'Store name is required';
      }
      
      if (!sellerData.taxId.trim()) {
        newFieldErrors.taxId = 'Tax ID is required';
      }
      
      if (!sellerData.phone.trim()) {
        newFieldErrors.phone = 'Phone number is required';
      }
      
      if (!sellerData.iban.trim()) {
        newFieldErrors.iban = 'IBAN is required';
      }
    }

    setFieldErrors(newFieldErrors);
    return Object.keys(newFieldErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await register(formData);
      
      if (response.success) {
        toast({
          title: 'Registration Successful',
          description: 'Welcome to our store!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onSuccess?.();
      } else {
        setErrors(response.errors);
      }
    } catch (error) {
      setErrors(['An unexpected error occurred']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" p={6}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
          Create Account
        </Text>

        {errors.length > 0 && (
          <Alert status="error">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              {errors.map((error, index) => (
                <Text key={index} fontSize="sm">
                  {error}
                </Text>
              ))}
            </VStack>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Account Type</FormLabel>
              <Select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as 'customer' | 'seller')}
                bg="white"
                _dark={{ bg: 'gray.700' }}
              >
                <option value="customer">Customer - Shop for products</option>
                <option value="seller">Seller - Sell your products</option>
              </Select>
            </FormControl>

            <FormControl isRequired isInvalid={!!fieldErrors.firstName}>
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
              />
              <FormErrorMessage>{fieldErrors.firstName}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!fieldErrors.lastName}>
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
              />
              <FormErrorMessage>{fieldErrors.lastName}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!fieldErrors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
              <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!fieldErrors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password (min 6 characters)"
              />
              <FormErrorMessage>{fieldErrors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!fieldErrors.confirmPassword}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
              />
              <FormErrorMessage>{fieldErrors.confirmPassword}</FormErrorMessage>
            </FormControl>

            {accountType === 'seller' && (
              <>
                <Text fontSize="md" fontWeight="bold" color="blue.600" alignSelf="start">
                  Store Information
                </Text>

                <FormControl isRequired isInvalid={!!fieldErrors.storeName}>
                  <FormLabel>Store Name</FormLabel>
                  <Input
                    type="text"
                    name="storeName"
                    value={sellerData.storeName}
                    onChange={handleSellerDataChange}
                    placeholder="Enter your store name"
                  />
                  <FormErrorMessage>{fieldErrors.storeName}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!fieldErrors.storeDescription}>
                  <FormLabel>Store Description</FormLabel>
                  <Textarea
                    name="storeDescription"
                    value={sellerData.storeDescription}
                    onChange={handleSellerDataChange}
                    placeholder="Describe your store and products..."
                    rows={3}
                  />
                  <FormErrorMessage>{fieldErrors.storeDescription}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!fieldErrors.taxId}>
                  <FormLabel>Tax ID / Business Registration Number</FormLabel>
                  <Input
                    type="text"
                    name="taxId"
                    value={sellerData.taxId}
                    onChange={handleSellerDataChange}
                    placeholder="Enter your tax ID"
                  />
                  <FormErrorMessage>{fieldErrors.taxId}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!fieldErrors.phone}>
                  <FormLabel>Business Phone</FormLabel>
                  <Input
                    type="tel"
                    name="phone"
                    value={sellerData.phone}
                    onChange={handleSellerDataChange}
                    placeholder="Enter your business phone"
                  />
                  <FormErrorMessage>{fieldErrors.phone}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!fieldErrors.iban}>
                  <FormLabel>IBAN</FormLabel>
                  <Input
                    type="text"
                    name="iban"
                    value={sellerData.iban}
                    onChange={handleSellerDataChange}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                  <FormErrorMessage>{fieldErrors.iban}</FormErrorMessage>
                </FormControl>
              </>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isSubmitting}
              loadingText={accountType === 'seller' ? "Setting up store..." : "Creating account..."}
            >
              {accountType === 'seller' ? 'Create Seller Account' : 'Create Account'}
            </Button>
          </VStack>
        </form>

        <Divider />

        <Text textAlign="center" fontSize="sm">
          Already have an account?{' '}
          <Link color="blue.500" onClick={onSwitchToLogin} cursor="pointer">
            Sign in here
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};