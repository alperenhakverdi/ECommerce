import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Address, AddressFormData, CreateAddressRequest, UpdateAddressRequest } from '../../types';
import { addressApi } from '../../services/api';
import AddressList from './AddressList';
import AddressForm from './AddressForm';

const AddressManagement: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const refreshAddresses = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleAddNew = () => {
    setSelectedAddress(null);
    onOpen();
  };

  const handleEdit = (address: Address) => {
    setSelectedAddress(address);
    onOpen();
  };

  const handleFormSubmit = async (formData: AddressFormData) => {
    try {
      setFormLoading(true);

      if (selectedAddress) {
        // Update existing address
        const updateData: UpdateAddressRequest = {
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

        await addressApi.update(selectedAddress.id, updateData);
        
        toast({
          title: 'Success',
          description: 'Address updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new address
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

        await addressApi.create(createData);
        
        toast({
          title: 'Success',
          description: 'Address created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Close modal and refresh list
      onClose();
      refreshAddresses();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 
          `Failed to ${selectedAddress ? 'update' : 'create'} address`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error; // Re-throw to let AddressForm handle it
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setSelectedAddress(null);
    onClose();
  };

  return (
    <Container maxW="container.md" py={8}>
      <Box>
        <AddressList
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          refreshTrigger={refreshTrigger}
        />

        {/* Address Form Modal */}
        <Modal 
          isOpen={isOpen} 
          onClose={handleFormCancel}
          size="lg"
          scrollBehavior="outside"
          isCentered
        >
          <ModalOverlay />
          <ModalContent mx={4} maxH="90vh">
            <ModalCloseButton />
            <Box p={6} overflowY="auto">
              <AddressForm
                address={selectedAddress || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={formLoading}
              />
            </Box>
          </ModalContent>
        </Modal>
      </Box>
    </Container>
  );
};

export default AddressManagement;