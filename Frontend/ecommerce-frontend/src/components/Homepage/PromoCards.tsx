import React, { useState } from 'react';
import {
  Box,
  Grid,
  Text,
  Icon,
  Flex,
  VStack,
  useColorModeValue,
  Badge,
  Button,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  FiPercent, 
  FiStar, 
  FiTruck, 
  FiCreditCard, 
  FiGift, 
  FiZap 
} from 'react-icons/fi';
import { keyframes } from '@emotion/react';

const floatUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const hoverScale = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

interface PromoCard {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgGradient: string;
  link?: string;
  badge?: string;
  badgeColor?: string;
  couponCode?: string;
  isCoupon?: boolean;
}

const PromoCards: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverShadow = useColorModeValue('2xl', 'dark-lg');

  const promoCards: PromoCard[] = [
    {
      id: 'coupon',
      title: '25% Off Coupon',
      subtitle: 'Copy code below',
      icon: FiGift,
      color: 'orange.500',
      bgGradient: 'linear(135deg, orange.500, orange.400)',
      badge: 'LIMITED',
      badgeColor: 'orange',
      couponCode: 'SAVE25',
      isCoupon: true
    },
    {
      id: 'sale',
      title: '20% Off Sale', // '%20 İndirim',
      subtitle: 'Selected products', // 'Seçili ürünlerde',
      icon: FiPercent,
      color: 'blue.500',
      bgGradient: 'linear(135deg, blue.500, blue.400)',
      link: '/search?discount=true',
      badge: 'HOT',
      badgeColor: 'orange'
    },
    {
      id: 'newArrivals',
      title: 'New Arrivals', // 'Yeni Gelenler',
      subtitle: 'Fresh products', // 'Taze ürünler',
      icon: FiStar,
      color: 'blue.500',
      bgGradient: 'linear(135deg, blue.500, blue.400)',
      link: '/search?sortBy=newest',
      badge: 'NEW',
      badgeColor: 'blue'
    },
    {
      id: 'freeShipping',
      title: 'Free Shipping', // 'Ücretsiz Kargo',
      subtitle: 'Orders over $250', // '250₺ üzeri',
      icon: FiTruck,
      color: 'blue.500',
      bgGradient: 'linear(135deg, blue.500, blue.400)',
      link: '/search?minPrice=250'
    },
    {
      id: 'quickPayment',
      title: 'Quick Payment', // 'Hızlı Ödeme',
      subtitle: 'Easy shopping', // 'Kolay alışveriş',
      icon: FiCreditCard,
      color: 'blue.500',
      bgGradient: 'linear(135deg, blue.500, blue.400)',
      link: '/saved-cards'
    }
  ];

  const handleCardClick = (card: PromoCard) => {
    if (card.isCoupon || !card.link) {
      return; // Don't navigate for coupon cards or cards without links
    }
    navigate(card.link);
  };

  const handleCopyCoupon = async (couponCode: string) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCode(couponCode);
      toast({
        title: 'Coupon Copied!',
        description: `Code "${couponCode}" copied to clipboard`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy coupon code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Grid
      templateColumns={{ 
        base: 'repeat(2, 1fr)', 
        md: 'repeat(4, 1fr)' 
      }}
      gap={{ base: 3, md: 4 }}
      mt={{ base: 4, md: 6 }}
    >
      {promoCards.map((card, index) => (
        <Box
          key={card.id}
          bgGradient={card.isCoupon ? card.bgGradient : undefined}
          bg={card.isCoupon ? undefined : cardBg}
          borderRadius="xl"
          p={{ base: 4, md: 5 }}
          cursor={card.isCoupon ? "default" : "pointer"}
          onClick={() => handleCardClick(card)}
          position="relative"
          overflow="hidden"
          boxShadow="lg"
          _hover={{
            boxShadow: hoverShadow,
            transform: 'translateY(-4px)',
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          animation={`${floatUp} 0.6s ease-out ${index * 0.1}s both`}
          _active={{
            transform: 'translateY(-2px) scale(0.98)',
          }}
        >
          {/* Enhanced Background Gradient for non-coupon cards */}
          {!card.isCoupon && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(135deg, blue.50, blue.100)"
              _dark={{ bgGradient: 'linear(135deg, blue.900, blue.800)' }}
              opacity={0.3}
              borderRadius="xl"
            />
          )}
          
          {/* Decorative Gradient Circle */}
          <Box
            position="absolute"
            top={0}
            right={0}
            w="80px"
            h="80px"
            bgGradient={card.isCoupon ? "radial(white, whiteAlpha.300)" : card.bgGradient}
            borderRadius="full"
            transform="translate(25px, -25px)"
            opacity={card.isCoupon ? 0.2 : 0.1}
            transition="all 0.3s ease"
            _groupHover={{
              opacity: card.isCoupon ? 0.3 : 0.2,
              transform: 'translate(20px, -20px) scale(1.2)',
            }}
          />

          {/* Badge */}
          {card.badge && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme={card.badgeColor}
              fontSize="2xs"
              fontWeight="bold"
              px={2}
              py={1}
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {card.badge}
            </Badge>
          )}

          <VStack spacing={3} align="start" h="full" position="relative">
            <Flex
              align="center"
              justify="center"
              w="40px"
              h="40px"
              borderRadius="lg"
              bgGradient={card.isCoupon ? "linear(135deg, white, whiteAlpha.800)" : card.bgGradient}
              color={card.isCoupon ? card.color : "white"}
              boxShadow="md"
              _groupHover={{
                animation: `${hoverScale} 1s ease-in-out infinite`,
              }}
            >
              <Icon as={card.icon} boxSize={5} />
            </Flex>

            <VStack spacing={1} align="start" flex={1}>
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                fontWeight="bold"
                color={card.isCoupon ? "white" : card.color}
                lineHeight="short"
              >
                {card.title}
              </Text>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color={card.isCoupon ? "whiteAlpha.900" : "gray.600"}
                _dark={{ color: card.isCoupon ? "whiteAlpha.900" : 'gray.300' }}
                lineHeight="short"
              >
                {card.subtitle}
              </Text>
              
              {/* Coupon Code Section */}
              {card.isCoupon && card.couponCode && (
                <HStack
                  spacing={2}
                  mt={2}
                  w="full"
                  bg="whiteAlpha.200"
                  borderRadius="lg"
                  p={2}
                  border="1px dashed"
                  borderColor="whiteAlpha.400"
                >
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="white"
                    fontFamily="mono"
                    flex={1}
                  >
                    {card.couponCode}
                  </Text>
                  <Button
                    size="xs"
                    bg="white"
                    color={card.color}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCoupon(card.couponCode!);
                    }}
                    _hover={{
                      bg: "whiteAlpha.900",
                      transform: 'scale(1.05)',
                    }}
                    _active={{
                      transform: 'scale(0.95)',
                    }}
                    borderRadius="md"
                    fontWeight="bold"
                    px={3}
                    isDisabled={copiedCode === card.couponCode}
                  >
                    {copiedCode === card.couponCode ? 'COPIED!' : 'COPY'}
                  </Button>
                </HStack>
              )}
            </VStack>
          </VStack>

          {/* Hover Effect Ring */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            border="2px solid transparent"
            borderRadius="xl"
            _hover={{
              borderColor: card.color,
              boxShadow: `0 0 0 1px ${card.color}20`,
            }}
            transition="all 0.3s ease"
            pointerEvents="none"
          />
        </Box>
      ))}
    </Grid>
  );
};

export default PromoCards;