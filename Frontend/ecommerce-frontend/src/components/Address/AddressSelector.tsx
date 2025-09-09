import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  RadioGroup,
  Radio,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { Address, AddressFormData, CreateAddressRequest } from '../../types';
import { addressApi } from '../../services/api';
import AddressForm from './AddressForm';

interface AddressSelectorProps {
  selectedAddressId?: string;
  onAddressSelect: (address: Address) => void;
  onError?: (error: string) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onAddressSelect,
  onError,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressApi.getAll();
      setAddresses(response.data);
      
      // Auto-select default address if no address is selected
      if (!selectedAddressId && response.data.length > 0) {
        const defaultAddress = response.data.find(addr => addr.isDefault) || response.data[0];
        onAddressSelect(defaultAddress);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to fetch addresses';
      onError?.(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddressChange = (addressId: string) => {
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
    }
  };

  const handleAddAddress = async (formData: AddressFormData) => {
    try {
      setFormLoading(true);
      
      const createData: CreateAddressRequest = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phoneNumber: formData.phoneNumber || undefined,
        isDefault: formData.isDefault,
      };

      const response = await addressApi.create(createData);
      
      toast({
        title: 'Success',
        description: 'Address added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh addresses and select the new one
      await fetchAddresses();
      onAddressSelect(response.data);
      onClose();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to add address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="lg" />
        <Text ml={3}>Loading addresses...</Text>
      </Center>
    );
  }

  if (addresses.length === 0) {
    return (
      <Box>
        <Alert status="info" mb={4}>
          <AlertIcon />
          <VStack align="start" spacing={2} flex={1}>
            <Text fontWeight="medium">No shipping addresses found</Text>
            <Text fontSize="sm">Please add a shipping address to continue with checkout.</Text>
          </VStack>
        </Alert>
        
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen} size="lg" width="full">
          Add Shipping Address
        </Button>

        <Modal 
          isOpen={isOpen} 
          onClose={onClose} 
          size="lg" 
          scrollBehavior="outside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent mx={4} maxH="90vh">
            <ModalCloseButton />
            <Box p={6} overflowY="auto">
              <AddressForm
                onSubmit={handleAddAddress}
                onCancel={onClose}
                isLoading={formLoading}
              />
            </Box>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="semibold">
          Select Shipping Address
        </Text>
        <Button
          leftIcon={<AddIcon />}
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={onOpen}
        >
          Add New
        </Button>
      </HStack>

      <RadioGroup
        value={selectedAddressId || ''}
        onChange={handleAddressChange}
      >
        <VStack spacing={3} align="stretch">
          {addresses.map((address) => (
            <Card
              key={address.id}
              variant="outline"
              cursor="pointer"
              borderColor={selectedAddressId === address.id ? 'blue.500' : 'gray.200'}
              bg={selectedAddressId === address.id ? 'blue.50' : 'white'}
              _hover={{
                borderColor: 'blue.300',
                bg: selectedAddressId === address.id ? 'blue.50' : 'gray.50'
              }}
              onClick={() => handleAddressChange(address.id)}
            >
              <CardBody py={4}>
                <HStack spacing={3} align="start">
                  <Radio
                    value={address.id}
                    size="lg"
                    colorScheme="blue"
                    mt={1}
                  />
                  
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack spacing={2}>
                      <Text fontWeight="bold" fontSize="md">
                        {address.title}
                      </Text>
                      {address.isDefault && (
                        <Badge colorScheme="green" size="sm">
                          Default
                        </Badge>
                      )}
                    </HStack>
                    
                    <Text fontSize="sm" fontWeight="medium">
                      {address.fullName}
                    </Text>
                    
                    <Text fontSize="sm" color="gray.600">
                      {address.fullAddress}
                    </Text>
                    
                    {address.phoneNumber && (
                      <Text fontSize="sm" color="gray.600">
                        Phone: {address.phoneNumber}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </RadioGroup>

      {/* Add Address Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg" 
        scrollBehavior="outside"
        isCentered
      >
        <ModalOverlay />
        <ModalContent mx={4} maxH="90vh">
          <ModalCloseButton />
          <Box p={6} overflowY="auto">
            <AddressForm
              onSubmit={handleAddAddress}
              onCancel={onClose}
              isLoading={formLoading}
            />
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AddressSelector;