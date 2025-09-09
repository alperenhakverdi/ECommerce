import React, { useState } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Divider,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import SavedCardsList from '../components/SavedCards/SavedCardsList';
import SavedCardForm from '../components/SavedCards/SavedCardForm';

const SavedCardsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleCardAdded = () => {
    setRefreshKey(prev => prev + 1); // Force refresh of the list
    onAddClose();
  };

  return (
    <ProtectedRoute>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box
            bg={bg}
            p={6}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="lg">{t('savedCards.title')}</Heading>
                  <Text color="gray.600" fontSize="sm">
                    {t('savedCards.subtitle')}
                  </Text>
                </VStack>
                
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={onAddOpen}
                  size="sm"
                >
                  {t('savedCards.addNewCard')}
                </Button>
              </HStack>

              <Divider />
              
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  <strong>{t('savedCards.securityNote')}:</strong>
                </Text>
                <VStack align="start" spacing={1} fontSize="xs" color="gray.500">
                  <Text>• {t('savedCards.securityPoint1')}</Text>
                  <Text>• {t('savedCards.securityPoint2')}</Text>
                  <Text>• {t('savedCards.securityPoint3')}</Text>
                </VStack>
              </VStack>
            </VStack>
          </Box>

          {/* Saved Cards List */}
          <Box
            bg={bg}
            p={6}
            borderRadius="lg"
            border="1px"
            borderColor={borderColor}
          >
            <SavedCardsList key={refreshKey} />
          </Box>
        </VStack>

        {/* Add New Card Modal */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('savedCards.addNewCard')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <SavedCardForm
                onSuccess={handleCardAdded}
                onCancel={onAddClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </ProtectedRoute>
  );
};

export default SavedCardsPage;