import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Image,
  Text,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { updateCartItem, removeFromCart, loading } = useCart();

  const handleQuantityChange = (quantity: number) => {
    if (quantity !== item.quantity) {
      updateCartItem(item.id, quantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <Box
      bg={bg}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'center' }}
        gap={4}
      >
        <Image
          src={item.productImage}
          alt={item.productName}
          boxSize={{ base: '100%', md: '100px' }}
          objectFit="cover"
          objectPosition="center"
          borderRadius="md"
          fallbackSrc="https://via.placeholder.com/100x100?text=No+Image"
        />

        <VStack flex={1} align="stretch" spacing={2}>
          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize="lg">
              {item.productName}
            </Text>
            <IconButton
              aria-label="Remove item"
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={handleRemove}
              isLoading={loading}
            />
          </HStack>

          <HStack justify="space-between" align="center">
            <HStack>
              <Text fontSize="sm" color="gray.600">
                Quantity:
              </Text>
              <NumberInput
                size="sm"
                maxW={20}
                value={item.quantity}
                min={1}
                max={99}
                onChange={(_, value) => handleQuantityChange(value)}
                isDisabled={loading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>

            <VStack align="flex-end" spacing={1}>
              <Text fontSize="sm" color="gray.600">
                ${item.price.toFixed(2)} each
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="brand.500">
                ${item.subTotal.toFixed(2)}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Flex>
    </Box>
  );
};

export default CartItem;
