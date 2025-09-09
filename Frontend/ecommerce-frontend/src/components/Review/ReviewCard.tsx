import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  useColorModeValue,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { Review } from '../../types';
import StarRating from './StarRating';
import { useAuth } from '../../contexts/AuthContext';
import { reviewsApi } from '../../services/api';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  showActions?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const isOwnReview = user?.id === review.userId;
  const canShowActions = showActions && isOwnReview;

  const handleDelete = async () => {
    try {
      await reviewsApi.delete(review.id);
      if (onDelete) {
        onDelete(review.id);
      }
      toast({
        title: 'Review Deleted',
        description: 'Your review has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete review. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        transition="all 0.2s"
        _hover={{ boxShadow: 'md' }}
      >
        <VStack align="stretch" spacing={3}>
          {/* Header */}
          <HStack justify="space-between" align="start">
            <HStack spacing={3}>
              <Avatar
                size="sm"
                name={review.userName}
                bg="blue.500"
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold" fontSize="sm">
                  {review.userName}
                </Text>
                <HStack spacing={2}>
                  <StarRating rating={review.rating} size="sm" />
                  <Text fontSize="xs" color={textColor}>
                    {formatDate(review.createdAt)}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <HStack spacing={1}>
              {review.isVerifiedPurchase && (
                <Badge
                  colorScheme="green"
                  variant="subtle"
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <FiShoppingBag size="12" />
                  Verified Purchase
                </Badge>
              )}
              
              {canShowActions && (
                <HStack spacing={1}>
                  <IconButton
                    aria-label="Edit review"
                    icon={<FiEdit2 />}
                    size="xs"
                    variant="ghost"
                    onClick={() => onEdit && onEdit(review)}
                  />
                  <IconButton
                    aria-label="Delete review"
                    icon={<FiTrash2 />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={onOpen}
                  />
                </HStack>
              )}
            </HStack>
          </HStack>

          {/* Comment */}
          {review.comment && (
            <Text fontSize="sm" lineHeight="1.5">
              {review.comment}
            </Text>
          )}

          {/* Updated indicator */}
          {review.updatedAt !== review.createdAt && (
            <Text fontSize="xs" color={textColor} fontStyle="italic">
              Edited on {formatDate(review.updatedAt)}
            </Text>
          )}
        </VStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Review
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ReviewCard;