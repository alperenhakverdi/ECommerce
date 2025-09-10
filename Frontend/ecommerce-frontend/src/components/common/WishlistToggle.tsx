import React from 'react';
import { IconButton, useToken } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

interface WishlistToggleProps {
  isActive: boolean;
  isLoading?: boolean;
  onToggle: (e: React.MouseEvent) => void;
  ariaLabelAdd?: string;
  ariaLabelRemove?: string;
  position?: {
    top?: number | string;
    right?: number | string;
    left?: number | string;
    bottom?: number | string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const pop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const WishlistToggle: React.FC<WishlistToggleProps> = ({
  isActive,
  isLoading = false,
  onToggle,
  ariaLabelAdd = 'Add to wishlist',
  ariaLabelRemove = 'Remove from wishlist',
  position,
  size = 'sm',
}) => {
  const [white] = useToken('colors', ['white']);

  return (
    <IconButton
      aria-label={isActive ? ariaLabelRemove : ariaLabelAdd}
      icon={isActive ? <FaHeart /> : <FiHeart />}
      size={size}
      isRound
      onClick={onToggle}
      isLoading={isLoading}
      position={position ? 'absolute' : undefined}
      top={position?.top}
      right={position?.right}
      left={position?.left}
      bottom={position?.bottom}
      color={isActive ? 'red.600' : 'gray.600'}
      bg={isActive ? 'redAlpha.200' : 'whiteAlpha.800'}
      borderWidth="1px"
      borderColor={isActive ? 'red.500' : 'whiteAlpha.400'}
      backdropFilter="blur(6px)"
      _hover={{
        bg: isActive ? 'redAlpha.300' : 'gray.100',
        color: 'red.600',
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
      }}
      _active={{
        transform: 'scale(0.95)'
      }}
      sx={{
        '& svg': {
          animation: `${pop} 180ms ease-in-out`,
        },
        boxShadow: `0 0 0 2px ${white}`,
      }}
      zIndex={3}
    />
  );
};

export default WishlistToggle;

