import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { ProductReviewStats } from '../../types';
import StarRating from './StarRating';

interface ReviewStatsProps {
  stats: ProductReviewStats;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const getRatingPercentage = (rating: number) => {
    if (stats.totalReviews === 0) return 0;
    const count = stats.ratingDistribution[rating] || 0;
    return (count / stats.totalReviews) * 100;
  };

  const formatRating = (rating: number) => {
    return Number(rating.toFixed(1));
  };

  if (stats.totalReviews === 0) {
    return (
      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
      >
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Customer Reviews
          </Text>
          <Text color={textColor}>
            No reviews yet. Be the first to review this product!
          </Text>
        </VStack>
      </Box>
    );
  }

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
          Customer Reviews
        </Text>

        <HStack spacing={8} align="start">
          {/* Overall Rating */}
          <VStack spacing={2}>
            <Text fontSize="3xl" fontWeight="bold">
              {formatRating(stats.averageRating)}
            </Text>
            <StarRating rating={stats.averageRating} size="md" />
            <Text fontSize="sm" color={textColor}>
              {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </Text>
          </VStack>

          {/* Rating Distribution */}
          <VStack spacing={2} flex={1}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0;
              const percentage = getRatingPercentage(rating);
              
              return (
                <HStack key={rating} spacing={3} w="full">
                  <HStack spacing={1} minW="60px">
                    <Text fontSize="sm">{rating}</Text>
                    <StarRating rating={1} maxRating={1} size="sm" />
                  </HStack>
                  
                  <Progress
                    value={percentage}
                    size="sm"
                    colorScheme="yellow"
                    flex={1}
                    bg="gray.200"
                  />
                  
                  <Text fontSize="sm" color={textColor} minW="40px">
                    {count}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ReviewStats;