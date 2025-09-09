import React from 'react';
import {
  Box,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FiGift,
  FiPackage,
  FiPercent,
  FiCreditCard,
  FiTruck,
  FiShield,
  FiHeart,
  FiStar,
} from 'react-icons/fi';

interface QuickAccessItem {
  id: string;
  title: string;
  icon: any;
  link: string;
  color: string;
}

const QuickAccessBar: React.FC = () => {
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('orange.50', 'orange.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const quickAccessItems: QuickAccessItem[] = [
    {
      id: 'coupons',
      title: 'Coupons', // 'Kuponlar',
      icon: FiGift,
      link: '/coupons',
      color: 'orange.400'
    },
    {
      id: 'myOrders',
      title: 'My Orders', // 'Siparişlerim',
      icon: FiPackage,
      link: '/orders',
      color: 'blue.500'
    },
    {
      id: 'campaigns',
      title: 'Campaigns', // 'Kampanyalar',
      icon: FiPercent,
      link: '/campaigns',
      color: 'orange.400'
    },
    {
      id: 'freeShipping',
      title: 'Free Shipping', // 'Ücretsiz Kargo',
      icon: FiTruck,
      link: '/search?freeShipping=true',
      color: 'blue.500'
    },
    {
      id: 'wishlist',
      title: 'Wishlist', // 'Favoriler',
      icon: FiHeart,
      link: '/wishlist',
      color: 'blue.500'
    }
  ];

  const handleItemClick = (item: QuickAccessItem) => {
    navigate(item.link);
  };

  return (
    <Box
      bg={bg}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="all 0.2s ease"
    >
      <HStack
        spacing={{ base: 2, md: 4 }}
        justify="space-between"
        overflowX="auto"
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        {quickAccessItems.map((item) => (
          <Link
            key={item.id}
            onClick={() => handleItemClick(item)}
            cursor="pointer"
            _hover={{ textDecoration: 'none' }}
            minW="fit-content"
          >
            <HStack
              spacing={2}
              px={3}
              py={2}
              borderRadius="lg"
              transition="all 0.2s ease"
              _hover={{
                bg: hoverBg,
                transform: 'translateY(-1px)',
              }}
            >
              <Icon
                as={item.icon}
                color={item.color}
                boxSize={{ base: 4, md: 5 }}
              />
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight="500"
                color={textColor}
                whiteSpace="nowrap"
              >
                {item.title}
              </Text>
            </HStack>
          </Link>
        ))}
      </HStack>
    </Box>
  );
};

export default QuickAccessBar;