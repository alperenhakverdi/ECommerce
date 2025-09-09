import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  Spinner,
  Center,
  Divider,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { Address } from '../../types';
import { addressApi } from '../../services/api';

interface AddressListProps {
  onEdit: (address: Address) => void;
  onAddNew: () => void;
  refreshTrigger?: number; // To trigger refresh from parent
}

const AddressList: React.FC<AddressListProps> = ({ 
  onEdit, 
  onAddNew, 
  refreshTrigger = 0 
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [defaultLoading, setDefaultLoading] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressApi.getAll();
      setAddresses(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch addresses',
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
  }, [refreshTrigger]);

  const handleDelete = async (address: Address) => {
    setSelectedAddress(address);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!selectedAddress) return;

    try {
      setDeleteLoading(selectedAddress.id);
      await addressApi.delete(selectedAddress.id);
      
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Remove from local state
      setAddresses(addresses.filter(addr => addr.id !== selectedAddress.id));
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(null);
      setSelectedAddress(null);
    }
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return; // Already default

    try {
      setDefaultLoading(address.id);
      await addressApi.setDefault(address.id);
      
      toast({
        title: 'Success',
        description: 'Default address updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Update local state - set all to false, then this one to true
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === address.id
      })));
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to set default address',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDefaultLoading(null);
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">My Addresses</Heading>
        <Button colorScheme="blue" onClick={onAddNew}>
          Add New Address
        </Button>
      </Flex>

      {addresses.length === 0 ? (
        <Card>
          <CardBody>
            <Center py={8}>
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.500">
                  No addresses found
                </Text>
                <Text color="gray.400" textAlign="center">
                  Add your first address to make ordering easier
                </Text>
                <Button colorScheme="blue" onClick={onAddNew}>
                  Add Address
                </Button>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {addresses.map((address) => (
            <Card key={address.id} variant="outline">
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Text fontWeight="bold" fontSize="lg">
                      {address.title}
                    </Text>
                    {address.isDefault && (
                      <Badge colorScheme="green" variant="solid" size="sm">
                        Default
                      </Badge>
                    )}
                  </HStack>
                  
                  <HStack spacing={2}>
                    {!address.isDefault && (
                      <IconButton
                        aria-label="Set as default"
                        icon={<StarIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="yellow"
                        isLoading={defaultLoading === address.id}
                        onClick={() => handleSetDefault(address)}
                        title="Set as default address"
                      />
                    )}
                    
                    <IconButton
                      aria-label="Edit address"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => onEdit(address)}
                    />
                    
                    <IconButton
                      aria-label="Delete address"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      isLoading={deleteLoading === address.id}
                      onClick={() => handleDelete(address)}
                    />
                  </HStack>
                </Flex>
              </CardHeader>

              <CardBody pt={0}>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="medium">
                    {address.fullName}
                  </Text>
                  
                  <Text color="gray.600" fontSize="sm">
                    {address.fullAddress}
                  </Text>
                  
                  {address.phoneNumber && (
                    <>
                      <Divider />
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          Phone:
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {address.phoneNumber}
                        </Text>
                      </HStack>
                    </>
                  )}

                  <HStack spacing={4} fontSize="xs" color="gray.400" pt={2}>
                    <Text>
                      Added: {new Date(address.createdAt).toLocaleDateString()}
                    </Text>
                    {address.updatedAt && (
                      <Text>
                        Updated: {new Date(address.updatedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Address
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the address "{selectedAddress?.title}"?
              <br />
              <Text fontSize="sm" color="gray.600" mt={2}>
                {selectedAddress?.fullAddress}
              </Text>
              <br />
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDelete}
                ml={3}
                isLoading={!!deleteLoading}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AddressList;