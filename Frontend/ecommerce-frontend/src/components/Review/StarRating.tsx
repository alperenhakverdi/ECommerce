import React from 'react';
import { HStack, Icon, Box } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  isInteractive?: boolean;
  onRatingChange?: (rating: number) => void;
  color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  isInteractive = false,
  onRatingChange,
  color = 'yellow.400',
}) => {
  const sizeMap = {
    sm: '16px',
    md: '20px',
    lg: '24px',
  };

  const iconSize = sizeMap[size];

  const handleStarClick = (starRating: number) => {
    if (isInteractive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <HStack spacing={1}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starIndex = index + 1;
        const isFullStar = starIndex <= Math.floor(rating);
        const isHalfStar = starIndex === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <Box
            key={index}
            position="relative"
            cursor={isInteractive ? 'pointer' : 'default'}
            onClick={() => handleStarClick(starIndex)}
            _hover={isInteractive ? { transform: 'scale(1.1)' } : {}}
            transition="transform 0.2s"
          >
            {/* Background (empty) star */}
            <Icon
              as={FiStar}
              w={iconSize}
              h={iconSize}
              color="gray.300"
              fill="gray.300"
            />
            
            {/* Foreground (filled) star */}
            {(isFullStar || isHalfStar) && (
              <Icon
                as={FiStar}
                w={iconSize}
                h={iconSize}
                color={color}
                fill={color}
                position="absolute"
                top={0}
                left={0}
                clipPath={isHalfStar ? 'inset(0 50% 0 0)' : 'none'}
              />
            )}
          </Box>
        );
      })}
    </HStack>
  );
};

export default StarRating;