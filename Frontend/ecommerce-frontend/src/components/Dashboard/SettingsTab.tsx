import React, { memo, useCallback, useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiEdit } from 'react-icons/fi';
import { Store } from '../../types';

interface SettingsTabProps {
  store: Store;
  loading: boolean;
  error: string | null;
  onUpdateStore?: (storeId: string, data: Partial<Store>) => Promise<void>;
}

const SettingsTabComponent: React.FC<SettingsTabProps> = ({
  store,
  loading,
  error,
  onUpdateStore,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Form state for store editing
  const [formData, setFormData] = useState({
    name: store.name,
    description: store.description,
    businessAddress: store.businessAddress || '',
    contactPhone: store.contactPhone,
    taxNumber: store.taxNumber || '',
  });

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle form submission
  const handleSaveChanges = useCallback(async () => {
    setIsUpdating(true);
    try {
      if (onUpdateStore) {
        await onUpdateStore(store.id, formData);
      }
      
      toast({
        title: 'Store Updated',
        description: 'Store information has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update store information. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  }, [store.id, formData, onUpdateStore, toast, onClose]);

  // Reset form when modal opens
  const handleOpenModal = useCallback(() => {
    setFormData({
      name: store.name,
      description: store.description,
      businessAddress: store.businessAddress || '',
      contactPhone: store.contactPhone,
      taxNumber: store.taxNumber || '',
    });
    onOpen();
  }, [store, onOpen]);

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Text fontSize="xl" fontWeight="semibold">
        Store Settings
      </Text>
      
      {/* Store Information Card */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">Store Information</Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text>Business Name:</Text>
              <Text fontWeight="medium">{store.name}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text>Description:</Text>
              <Text fontWeight="medium" textAlign="right" maxW="300px" noOfLines={2}>
                {store.description}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text>Contact Email:</Text>
              <Text fontWeight="medium">{store.contactEmail}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text>Contact Phone:</Text>
              <Text fontWeight="medium">{store.contactPhone}</Text>
            </HStack>
            
            {store.businessAddress && (
              <HStack justify="space-between">
                <Text>Business Address:</Text>
                <Text fontWeight="medium" textAlign="right" maxW="300px" noOfLines={2}>
                  {store.businessAddress}
                </Text>
              </HStack>
            )}
            
            {store.taxNumber && (
              <HStack justify="space-between">
                <Text>Tax Number:</Text>
                <Text fontWeight="medium">{store.taxNumber}</Text>
              </HStack>
            )}
            
            <Divider />
            
            <Button
              colorScheme="blue"
              variant="outline"
              leftIcon={<FiEdit />}
              onClick={handleOpenModal}
              isLoading={loading}
            >
              Edit Store Information
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Store Status Information */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">Store Status</Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text>Store ID:</Text>
              <Text fontWeight="medium" fontSize="sm" fontFamily="mono">
                {store.id}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text>Registration Date:</Text>
              <Text fontWeight="medium">
                {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text>Store Rating:</Text>
              <Text fontWeight="medium">
                ⭐ {store.rating.toFixed(1)} / 5.0
              </Text>
            </HStack>
            
            {!store.isApproved && (
              <Alert status="warning" mt={4}>
                <AlertIcon />
                Your store is pending approval. You will receive an email notification once approved.
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Store Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Store Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Store Name</FormLabel>
                <Input 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Business Address</FormLabel>
                <Input 
                  value={formData.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  placeholder="Enter your business address"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Contact Phone</FormLabel>
                <Input 
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tax Number</FormLabel>
                <Input 
                  value={formData.taxNumber}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  placeholder="Enter your tax number"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <HStack justify="flex-end" p={6} pt={4}>
            <Button 
              variant="outline" 
              onClick={onClose}
              isDisabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="blue"
              onClick={handleSaveChanges}
              isLoading={isUpdating}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </HStack>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const SettingsTab = memo(SettingsTabComponent);