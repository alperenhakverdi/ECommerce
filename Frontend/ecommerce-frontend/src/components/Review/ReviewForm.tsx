import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { Review, CreateReviewRequest, UpdateReviewRequest } from '../../types';
import StarRating from './StarRating';
import { reviewsApi } from '../../services/api';

interface ReviewFormProps {
  productId: string;
  existingReview?: Review;
  onSuccess?: (review: Review) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Please write a comment';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters long';
    } else if (comment.trim().length > 1000) {
      newErrors.comment = 'Comment must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      let response;

      if (existingReview) {
        // Update existing review
        const updateRequest: UpdateReviewRequest = {
          rating,
          comment: comment.trim(),
        };
        response = await reviewsApi.update(existingReview.id, updateRequest);
      } else {
        // Create new review
        const createRequest: CreateReviewRequest = {
          productId,
          rating,
          comment: comment.trim(),
        };
        response = await reviewsApi.create(createRequest);
      }

      toast({
        title: existingReview ? 'Review Updated' : 'Review Created',
        description: existingReview 
          ? 'Your review has been updated successfully.'
          : 'Thank you for your review!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      // Reset form if creating new review
      if (!existingReview) {
        setRating(0);
        setComment('');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
        (existingReview ? 'Failed to update review.' : 'Failed to create review.');
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(0);
      setComment('');
    }
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Box
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
    >
      <VStack spacing={6} align="stretch">
        <Text fontSize="lg" fontWeight="semibold">
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </Text>

        {/* Rating */}
        <FormControl isInvalid={!!errors.rating}>
          <FormLabel>Rating</FormLabel>
          <HStack spacing={4}>
            <StarRating
              rating={rating}
              size="lg"
              isInteractive
              onRatingChange={setRating}
            />
            <Text fontSize="sm" color="gray.600">
              {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
            </Text>
          </HStack>
          <FormErrorMessage>{errors.rating}</FormErrorMessage>
        </FormControl>

        {/* Comment */}
        <FormControl isInvalid={!!errors.comment}>
          <FormLabel>Comment</FormLabel>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            resize="vertical"
          />
          <HStack justify="space-between" mt={1}>
            <FormErrorMessage>{errors.comment}</FormErrorMessage>
            <Text fontSize="xs" color="gray.500">
              {comment.length}/1000 characters
            </Text>
          </HStack>
        </FormControl>

        {/* Actions */}
        <HStack spacing={3} justify="flex-end">
          <Button
            variant="ghost"
            onClick={handleCancel}
            isDisabled={loading}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText={existingReview ? 'Updating...' : 'Submitting...'}
          >
            {existingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ReviewForm;