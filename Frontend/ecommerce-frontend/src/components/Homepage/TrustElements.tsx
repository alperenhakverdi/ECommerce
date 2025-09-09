import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  HStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  FiShield,
  FiTruck,
  FiCreditCard,
  FiHeadphones,
} from 'react-icons/fi';

const TrustElements: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const trustFeatures = [
    {
      icon: FiShield,
      title: 'Secure Shopping',
    },
    {
      icon: FiTruck,
      title: 'Fast Delivery',
    },
    {
      icon: FiCreditCard,
      title: 'Easy Payment',
    },
    {
      icon: FiHeadphones,
      title: '24/7 Support',
    },
  ];

  return (
    <Box
      bg={bg}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      boxShadow="sm"
    >
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
        {trustFeatures.map((feature) => (
          <HStack
            key={feature.title}
            spacing={3}
            justify="center"
            p={3}
            _hover={{
              transform: 'translateY(-2px)',
              transition: 'transform 0.2s ease',
            }}
          >
            <Icon
              as={feature.icon}
              color="blue.600"
              boxSize={5}
            />
            <Text
              fontSize="sm"
              fontWeight="600"
              color={textColor}
              textAlign="center"
            >
              {feature.title}
            </Text>
          </HStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default TrustElements;