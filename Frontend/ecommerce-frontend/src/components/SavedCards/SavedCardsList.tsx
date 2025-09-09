import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  IconButton,
  Alert,
  AlertIcon,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { SavedCard } from '../../types';
import { savedCardsApi } from '../../services/api';
import SavedCardForm from './SavedCardForm';

const SavedCardsList: React.FC = () => {
  const { t } = useTranslation();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<SavedCard | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchSavedCards = async () => {
    try {
      setLoading(true);
      const response = await savedCardsApi.getAll();
      setSavedCards(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch saved cards:', error);
      setError(t('savedCards.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCards();
  }, []);

  const handleEditCard = (card: SavedCard) => {
    setEditingCard(card);
    onEditOpen();
  };

  const handleDeleteClick = (cardId: string) => {
    setDeletingCardId(cardId);
    onDeleteOpen();
  };

  const handleDeleteCard = async () => {
    if (!deletingCardId) return;

    try {
      setActionLoading(deletingCardId);
      await savedCardsApi.delete(deletingCardId);
      
      setSavedCards(prev => prev.filter(card => card.id !== deletingCardId));
      
      toast({
        title: t('savedCards.cardDeleted'),
        description: t('savedCards.cardDeletedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onDeleteClose();
      setDeletingCardId(null);
    } catch (error) {
      console.error('Failed to delete card:', error);
      toast({
        title: t('common.error'),
        description: t('savedCards.deleteError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      setActionLoading(cardId);
      await savedCardsApi.setDefault(cardId);
      
      // Update local state
      setSavedCards(prev => prev.map(card => ({
        ...card,
        isDefault: card.id === cardId
      })));
      
      toast({
        title: t('savedCards.defaultSet'),
        description: t('savedCards.defaultSetDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to set default card:', error);
      toast({
        title: t('common.error'),
        description: t('savedCards.setDefaultError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCardSaved = () => {
    fetchSavedCards();
    onEditClose();
    setEditingCard(null);
  };

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 MasterCard';
      case 'amex':
      case 'american express':
        return '💳 American Express';
      default:
        return '💳';
    }
  };

  if (loading) {
    return (
      <VStack spacing={4} py={8}>
        <Spinner size="xl" color="brand.500" />
        <Text>{t('savedCards.loading')}</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (savedCards.length === 0) {
    return (
      <VStack spacing={4} py={8}>
        <Text fontSize="lg" color="gray.500" textAlign="center">
          {t('savedCards.noCards')}
        </Text>
        <Text fontSize="sm" color="gray.600" textAlign="center">
          {t('savedCards.noCardsDescription')}
        </Text>
      </VStack>
    );
  }

  return (
    <>
      <VStack spacing={4} align="stretch">
        {savedCards.map((card) => (
          <Card key={card.id} bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={2} flex={1}>
                  <HStack spacing={3}>
                    <Text fontSize="lg" fontWeight="semibold">
                      {getCardTypeIcon(card.cardType)}
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {card.cardNumberMasked}
                    </Text>
                    {card.isDefault && (
                      <Badge colorScheme="green" fontSize="xs">
                        {t('savedCards.defaultCard')}
                      </Badge>
                    )}
                  </HStack>
                  
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      {t('savedCards.cardHolderName')}: {card.cardHolderName}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {t('savedCards.expiryDate')}: {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                    </Text>
                  </VStack>
                </VStack>

                <VStack spacing={2}>
                  <HStack spacing={1}>
                    <IconButton
                      aria-label={t('savedCards.editCard')}
                      icon={<EditIcon />}
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCard(card)}
                      isLoading={actionLoading === card.id}
                    />
                    <IconButton
                      aria-label={t('savedCards.deleteCard')}
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="outline"
                      colorScheme="red"
                      onClick={() => handleDeleteClick(card.id)}
                      isLoading={actionLoading === card.id}
                    />
                  </HStack>
                  
                  {!card.isDefault && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleSetDefault(card.id)}
                      isLoading={actionLoading === card.id}
                      loadingText={t('savedCards.setting')}
                    >
                      {t('savedCards.setAsDefault')}
                    </Button>
                  )}
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </VStack>

      {/* Edit Card Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('savedCards.editCard')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {editingCard && (
              <SavedCardForm
                card={editingCard}
                onSuccess={handleCardSaved}
                onCancel={onEditClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('savedCards.deleteCard')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{t('savedCards.deleteConfirm')}</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              {t('common.cancel')}
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteCard}
              isLoading={actionLoading === deletingCardId}
              loadingText={t('savedCards.deleting')}
            >
              {t('savedCards.deleteCard')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SavedCardsList;