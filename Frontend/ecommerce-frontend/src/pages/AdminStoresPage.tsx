import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Textarea,
  FormControl,
  FormLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Radio,
  RadioGroup,
  Stack,
  FormHelperText,
} from '@chakra-ui/react';
import { 
  FiCheck, 
  FiX, 
  FiEye, 
  FiShoppingBag, 
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiFileText
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';
import { Store, StoreStatus } from '../types';

interface StoreApplication extends Store {
  applicationDate: string;
  documentsSubmitted: boolean;
  address: string;
  phoneNumber: string;
}

const AdminStoresPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [pendingStores, setPendingStores] = useState<StoreApplication[]>([]);
  const [allStores, setAllStores] = useState<StoreApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRejectionCategory, setSelectedRejectionCategory] = useState('');
  const [modalType, setModalType] = useState<'approve' | 'reject' | 'view'>('view');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // Predefined rejection categories and reasons
  const rejectionCategories = {
    'documentation': {
      label: 'Döküman Eksiklikleri',
      reasons: [
        'Eksik veya geçersiz vergi numarası',
        'Ticaret sicil belgesi eksik',
        'İmza sirküleri eksik',
        'Kimlik doğrulama belgeleri eksik',
        'Adres belgesi geçersiz'
      ]
    },
    'business': {
      label: 'İş Modeli Problemleri', 
      reasons: [
        'Yasaklı ürün kategorileri',
        'Telif hakkı ihlali riski',
        'Platformla uyumsuz iş modeli',
        'Kalite standartları yetersiz',
        'Müşteri hizmeti altyapısı eksik'
      ]
    },
    'legal': {
      label: 'Hukuki Sorunlar',
      reasons: [
        'Yasal yükümlülükler karşılanmamış',
        'KVKK uyumluluk eksiklikleri',
        'Tüketici hakları politikası eksik',
        'İade ve değişim politikası belirsiz',
        'Sözleşme şartları kabul edilmemiş'
      ]
    },
    'technical': {
      label: 'Teknik Yetersizlikler',
      reasons: [
        'E-ticaret altyapısı yetersiz',
        'Ürün katalog yönetimi eksik',
        'Sipariş işleme kapasitesi düşük',
        'Entegrasyon sorunları',
        'Sistem güvenlik açıkları'
      ]
    },
    'other': {
      label: 'Diğer Sebepler',
      reasons: [
        'Başvuru formu eksik doldurulmuş',
        'İletişim bilgileri doğrulanamadı',
        'Referans kontrolü olumsuz',
        'Platform politikalarına uyumsuzluk',
        'Özel durum (detay aşağıda belirtilmiştir)'
      ]
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      // Fetch pending store applications
      const pendingResponse = await adminApi.getPendingStoreApprovals();
      const pendingWithAppData = (pendingResponse.data || []).map((store: Store): StoreApplication => ({
        ...store,
        applicationDate: store.createdAt,
        documentsSubmitted: true,
        address: store.businessAddress,
        phoneNumber: store.contactPhone
      }));
      setPendingStores(pendingWithAppData);
      
      // Fetch all stores
      const allResponse = await adminApi.getAllStores();
      // Handle paginated response structure
      const storesArray = allResponse.data.stores || [];
      const allWithAppData = storesArray.map((store: Store): StoreApplication => ({
        ...store,
        applicationDate: store.createdAt,
        documentsSubmitted: true,
        address: store.businessAddress,
        phoneNumber: store.contactPhone
      }));
      setAllStores(allWithAppData);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      toast({
        title: 'Error',
        description: 'Failed to load store data.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStoreAction = (store: StoreApplication, action: 'approve' | 'reject' | 'view') => {
    setSelectedStore(store);
    setModalType(action);
    setRejectionReason('');
    setSelectedRejectionCategory('');
    onOpen();
  };

  const handleApproveStore = async () => {
    if (!selectedStore) return;

    try {
      setActionLoading('approve');
      await adminApi.approveStore(selectedStore.id);
      
      // Update local state
      setPendingStores(prev => prev.filter(store => store.id !== selectedStore.id));
      setAllStores(prev => prev.map(store => 
        store.id === selectedStore.id 
          ? { ...store, status: StoreStatus.Active }
          : store
      ));

      toast({
        title: 'Store Approved',
        description: `${selectedStore.name} has been approved successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error('Failed to approve store:', error);
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve the store. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectStore = async () => {
    if (!selectedStore || !selectedRejectionCategory) {
      toast({
        title: 'Red Kategorisi Gerekli',
        description: 'Lütfen mağaza başvurusunu reddetme kategorisi seçin.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!rejectionReason.trim()) {
      toast({
        title: 'Red Sebebi Gerekli',
        description: 'Lütfen mağaza başvurusunu reddetme sebebini belirtin.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setActionLoading('reject');
      const structuredReason = {
        category: selectedRejectionCategory,
        categoryLabel: rejectionCategories[selectedRejectionCategory as keyof typeof rejectionCategories]?.label,
        reason: rejectionReason.trim(),
        timestamp: new Date().toISOString()
      };
      await adminApi.rejectStore(selectedStore.id, JSON.stringify(structuredReason));
      
      // Update local state
      setPendingStores(prev => prev.filter(store => store.id !== selectedStore.id));
      setAllStores(prev => prev.map(store => 
        store.id === selectedStore.id 
          ? { ...store, status: StoreStatus.Rejected }
          : store
      ));

      toast({
        title: 'Store Rejected',
        description: `${selectedStore.name} application has been rejected.`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error('Failed to reject store:', error);
      toast({
        title: 'Rejection Failed',
        description: 'Failed to reject the store. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: StoreStatus) => {
    const statusMap = {
      [StoreStatus.Pending]: { color: 'yellow', text: 'Pending' },
      [StoreStatus.Active]: { color: 'green', text: 'Active' },
      [StoreStatus.Suspended]: { color: 'red', text: 'Suspended' },
      [StoreStatus.Rejected]: { color: 'red', text: 'Rejected' },
      [StoreStatus.Inactive]: { color: 'gray', text: 'Inactive' },
    };
    
    const statusInfo = statusMap[status] || { color: 'gray', text: 'Unknown' };
    return (
      <Badge colorScheme={statusInfo.color}>
        {statusInfo.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user || !user.roles.includes('Admin')) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={4} justify="center" minH="60vh">
            <Spinner size="xl" color="blue.500" />
            <Text>Loading store applications...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>Store Management</Heading>
            <Text color="gray.600">
              Manage store applications and monitor store activities
            </Text>
          </Box>

          {/* Statistics */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                  {pendingStores.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Pending Applications</Text>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {allStores.filter(s => s.status === StoreStatus.Active).length}
                </Text>
                <Text fontSize="sm" color="gray.600">Active Stores</Text>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {allStores.filter(s => s.status === StoreStatus.Suspended).length}
                </Text>
                <Text fontSize="sm" color="gray.600">Suspended Stores</Text>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {allStores.length}
                </Text>
                <Text fontSize="sm" color="gray.600">Total Stores</Text>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Tabs for different views */}
          <Tabs>
            <TabList>
              <Tab>
                <HStack>
                  <FiClock />
                  <Text>Pending Applications ({pendingStores.length})</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <FiShoppingBag />
                  <Text>All Stores ({allStores.length})</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Pending Applications Tab */}
              <TabPanel px={0}>
                {pendingStores.length === 0 ? (
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={4} py={8}>
                        <Text fontSize="lg" color="gray.500">
                          No pending store applications
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          All store applications have been processed.
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : (
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    {pendingStores.map((store) => (
                      <Card key={store.id} bg={cardBg} border="1px" borderColor={borderColor}>
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            {/* Store Header */}
                            <HStack justify="space-between">
                              <HStack>
                                <Avatar 
                                  size="md" 
                                  name={store.name}
                                  src={store.logoUrl}
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold" fontSize="lg">
                                    {store.name}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    by {store.ownerName}
                                  </Text>
                                </VStack>
                              </HStack>
                              {getStatusBadge(store.status)}
                            </HStack>

                            <Divider />

                            {/* Store Details */}
                            <VStack spacing={2} align="stretch">
                              <HStack>
                                <FiMail color="gray" />
                                <Text fontSize="sm">{store.contactEmail}</Text>
                              </HStack>
                              <HStack>
                                <FiPhone color="gray" />
                                <Text fontSize="sm">{store.phoneNumber}</Text>
                              </HStack>
                              <HStack>
                                <FiMapPin color="gray" />
                                <Text fontSize="sm" noOfLines={2}>{store.address}</Text>
                              </HStack>
                              <HStack>
                                <FiFileText color="gray" />
                                <Text fontSize="sm">Tax: {store.taxNumber}</Text>
                              </HStack>
                              <HStack>
                                <FiClock color="gray" />
                                <Text fontSize="sm">Applied: {formatDate(store.applicationDate)}</Text>
                              </HStack>
                            </VStack>

                            <Divider />

                            {/* Action Buttons */}
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<FiEye />}
                                onClick={() => handleStoreAction(store, 'view')}
                                flex={1}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="green"
                                leftIcon={<FiCheck />}
                                onClick={() => handleStoreAction(store, 'approve')}
                                flex={1}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                leftIcon={<FiX />}
                                onClick={() => handleStoreAction(store, 'reject')}
                                flex={1}
                              >
                                Reject
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </TabPanel>

              {/* All Stores Tab */}
              <TabPanel px={0}>
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <TableContainer>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Store</Th>
                            <Th>Owner</Th>
                            <Th>Status</Th>
                            <Th>Created</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {allStores.map((store) => (
                            <Tr key={store.id}>
                              <Td>
                                <HStack>
                                  <Avatar size="sm" name={store.name} src={store.logoUrl} />
                                  <Text fontWeight="medium">{store.name}</Text>
                                </HStack>
                              </Td>
                              <Td>{store.ownerName}</Td>
                              <Td>{getStatusBadge(store.status)}</Td>
                              <Td>{formatDate(store.createdAt)}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    leftIcon={<FiEye />}
                                    onClick={() => handleStoreAction(store as StoreApplication, 'view')}
                                  >
                                    View
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Action Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {modalType === 'approve' && 'Approve Store Application'}
                {modalType === 'reject' && 'Reject Store Application'}
                {modalType === 'view' && 'Store Details'}
              </ModalHeader>
              <ModalCloseButton />
              
              <ModalBody>
                {selectedStore && (
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <Avatar 
                        size="lg" 
                        name={selectedStore.name}
                        src={selectedStore.logoUrl}
                      />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="xl">
                          {selectedStore.name}
                        </Text>
                        <Text color="gray.600">by {selectedStore.ownerName}</Text>
                        {getStatusBadge(selectedStore.status)}
                      </VStack>
                    </HStack>

                    <Divider />

                    <SimpleGrid columns={2} spacing={4}>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="semibold">Contact Information</Text>
                        <Text fontSize="sm"><strong>Email:</strong> {selectedStore.contactEmail}</Text>
                        <Text fontSize="sm"><strong>Phone:</strong> {selectedStore.phoneNumber}</Text>
                      </VStack>
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="semibold">Business Information</Text>
                        <Text fontSize="sm"><strong>Tax Number:</strong> {selectedStore.taxNumber}</Text>
                        <Text fontSize="sm"><strong>Applied:</strong> {formatDate(selectedStore.applicationDate)}</Text>
                      </VStack>
                    </SimpleGrid>

                    <VStack align="start" spacing={2}>
                      <Text fontWeight="semibold">Address</Text>
                      <Text fontSize="sm">{selectedStore.address}</Text>
                    </VStack>

                    {selectedStore.description && (
                      <VStack align="start" spacing={2}>
                        <Text fontWeight="semibold">Store Description</Text>
                        <Text fontSize="sm">{selectedStore.description}</Text>
                      </VStack>
                    )}

                    {modalType === 'approve' && (
                      <Alert status="info">
                        <AlertIcon />
                        Are you sure you want to approve this store application? The store owner will be notified via email.
                      </Alert>
                    )}

                    {modalType === 'reject' && (
                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>Red Kategorisi</FormLabel>
                          <Select
                            placeholder="Kategori seçiniz..."
                            value={selectedRejectionCategory}
                            onChange={(e) => {
                              setSelectedRejectionCategory(e.target.value);
                              setRejectionReason(''); // Reset reason when category changes
                            }}
                          >
                            {Object.entries(rejectionCategories).map(([key, category]) => (
                              <option key={key} value={key}>
                                {category.label}
                              </option>
                            ))}
                          </Select>
                          <FormHelperText>
                            Reddetme sebebini kategorize etmek için bir kategori seçin.
                          </FormHelperText>
                        </FormControl>

                        {selectedRejectionCategory && (
                          <FormControl isRequired>
                            <FormLabel>Önceden Tanımlı Sebepler</FormLabel>
                            <RadioGroup 
                              value={rejectionReason} 
                              onChange={setRejectionReason}
                            >
                              <Stack spacing={2}>
                                {rejectionCategories[selectedRejectionCategory as keyof typeof rejectionCategories]?.reasons.map((reason, index) => (
                                  <Radio key={index} value={reason}>
                                    <Text fontSize="sm">{reason}</Text>
                                  </Radio>
                                ))}
                              </Stack>
                            </RadioGroup>
                          </FormControl>
                        )}

                        {rejectionReason === 'Özel durum (detay aşağıda belirtilmiştir)' && (
                          <FormControl isRequired>
                            <FormLabel>Özel Durum Detayı</FormLabel>
                            <Textarea
                              placeholder="Özel durumu detaylandırın..."
                              rows={3}
                              onChange={(e) => {
                                // Update the reason with custom detail
                                setRejectionReason(`Özel durum: ${e.target.value}`);
                              }}
                            />
                          </FormControl>
                        )}

                        {selectedRejectionCategory && rejectionReason && rejectionReason !== 'Özel durum (detay aşağıda belirtilmiştir)' && (
                          <FormControl>
                            <FormLabel>Ek Açıklama (İsteğe Bağlı)</FormLabel>
                            <Textarea
                              placeholder="Seçilen sebebe ek detay eklemek isterseniz buraya yazın..."
                              rows={2}
                              onChange={(e) => {
                                if (e.target.value.trim()) {
                                  const baseReason = rejectionReason.includes('Ek detay:') 
                                    ? rejectionReason.split('Ek detay:')[0].trim()
                                    : rejectionReason;
                                  setRejectionReason(`${baseReason} - Ek detay: ${e.target.value}`);
                                } else {
                                  // Remove additional detail if textarea is cleared
                                  const baseReason = rejectionReason.includes('Ek detay:') 
                                    ? rejectionReason.split('Ek detay:')[0].trim()
                                    : rejectionReason;
                                  setRejectionReason(baseReason.replace(' -', '').trim());
                                }
                              }}
                            />
                          </FormControl>
                        )}

                        <Alert status="warning" size="sm">
                          <AlertIcon />
                          <Text fontSize="sm">
                            Bu bilgiler mağaza sahibine e-posta ile gönderilecektir.
                          </Text>
                        </Alert>
                      </VStack>
                    )}
                  </VStack>
                )}
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                
                {modalType === 'approve' && (
                  <Button
                    colorScheme="green"
                    onClick={handleApproveStore}
                    isLoading={actionLoading === 'approve'}
                    loadingText="Approving..."
                  >
                    Approve Store
                  </Button>
                )}
                
                {modalType === 'reject' && (
                  <Button
                    colorScheme="red"
                    onClick={handleRejectStore}
                    isLoading={actionLoading === 'reject'}
                    loadingText="Rejecting..."
                  >
                    Reject Application
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminStoresPage;