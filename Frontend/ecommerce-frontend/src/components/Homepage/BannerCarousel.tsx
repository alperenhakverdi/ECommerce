import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  IconButton,
  HStack,
  Skeleton,
  VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Banner } from '../../types';

interface BannerCarouselProps {
  banners: Banner[];
  isLoading?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: string;
  borderRadius?: string;
}

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
`;

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  isLoading = false,
  autoPlay = true,
  autoPlayInterval = 5000,
  height = '400px',
  borderRadius = 'xl',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const dotColor = useColorModeValue('whiteAlpha.600', 'whiteAlpha.500');
  const activeDotColor = useColorModeValue('white', 'white');

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleCTAClick = (banner: Banner) => {
    if (banner.ctaLink) {
      if (banner.ctaLink.startsWith('/')) {
        navigate(banner.ctaLink);
      } else {
        window.open(banner.ctaLink, '_blank');
      }
    }
  };

  if (isLoading) {
    return (
      <Skeleton
        height={{ base: '300px', md: height }}
        borderRadius={borderRadius}
        startColor="gray.200"
        endColor="gray.300"
        boxShadow="2xl"
      />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <Box
      position="relative"
      height={{ base: '300px', md: height }}
      borderRadius={borderRadius}
      overflow="hidden"
      bg="gray.100"
      boxShadow="2xl"
      _hover={{
        boxShadow: '3xl',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.3s ease"
    >
      {/* Banner Image and Content */}
      <Box
        position="relative"
        height="100%"
        bgImage={`url(${currentBanner.imageUrl})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
      >
        {/* Simplified Overlay - 40% Opacity */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.400"
          transition="opacity 0.3s ease"
        />

        {/* Clean, Centered Content */}
        <Flex
          position="relative"
          height="100%"
          align="center"
          justify="center"
          px={{ base: 6, md: 12 }}
          zIndex={2}
        >
          <VStack
            spacing={{ base: 4, md: 6 }}
            textAlign="center"
            maxW={{ base: '90%', md: '80%', lg: '70%' }}
            bg="whiteAlpha.100"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            border="1px solid"
            borderColor="whiteAlpha.200"
            boxShadow="xl"
            animation={`${fadeIn} 0.8s ease-out`}
          >
            {currentBanner.subtitle && (
              <Text
                fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
                fontWeight="semibold"
                opacity={0.95}
                textTransform="uppercase"
                letterSpacing="wider"
                color="blue.200"
              >
                {currentBanner.subtitle}
              </Text>
            )}

            <Text
              fontSize={{ base: '2xl', md: '4xl', lg: '6xl' }}
              fontWeight="black"
              lineHeight="shorter"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
              color="blue.500"
            >
              {currentBanner.title}
            </Text>

            {currentBanner.description && (
              <Text
                fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                color="gray.600"
                maxW={{ base: '100%', md: '500px' }}
                fontWeight="medium"
                textShadow="0 1px 2px rgba(0,0,0,0.2)"
                bg="whiteAlpha.800"
                px={4}
                py={2}
                borderRadius="lg"
              >
                {currentBanner.description}
              </Text>
            )}

            <Button
              bg="orange.400"
              color="white"
              size={{ base: 'md', md: 'lg' }}
              onClick={() => {
                if (currentBanner.ctaLink) {
                  if (currentBanner.ctaLink.startsWith('http')) {
                    window.open(currentBanner.ctaLink, '_blank');
                  } else {
                    navigate(currentBanner.ctaLink);
                  }
                }
              }}
              rightIcon={<FiExternalLink />}
              animation={`${scaleIn} 1s ease-out 0.3s both`}
              _hover={{
                bg: "orange.500",
                transform: 'translateY(-2px) scale(1.05)',
                boxShadow: '0 8px 25px rgba(251, 146, 60, 0.4)',
              }}
              _active={{
                bg: "orange.600",
                transform: 'translateY(-1px) scale(1.02)',
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              px={{ base: 8, md: 10 }}
              py={{ base: 3, md: 4 }}
              fontWeight="700"
              borderRadius="xl"
              boxShadow="0 4px 14px rgba(251, 146, 60, 0.25)"
              fontSize={{ base: "md", md: "lg" }}
              textShadow="0 1px 2px rgba(0,0,0,0.1)"
              border="2px solid"
              borderColor="whiteAlpha.200"
            >
              {currentBanner.ctaText || 'Shop Now'} {/* 'Alışverişe Başla' */}
            </Button>
          </VStack>
        </Flex>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <IconButton
              aria-label="Previous banner"
              icon={<FiChevronLeft />}
              position="absolute"
              left={{ base: 2, md: 4 }}
              top="50%"
              transform="translateY(-50%)"
              variant="ghost"
              color="white"
              size={{ base: 'md', md: 'lg' }}
              onClick={goToPrevious}
              bg="blackAlpha.300"
              backdropFilter="blur(8px)"
              borderRadius="full"
              _hover={{ 
                bg: 'blackAlpha.500',
                transform: 'translateY(-50%) scale(1.1)',
              }}
              transition="all 0.2s ease"
              zIndex={2}
            />
            <IconButton
              aria-label="Next banner"
              icon={<FiChevronRight />}
              position="absolute"
              right={{ base: 2, md: 4 }}
              top="50%"
              transform="translateY(-50%)"
              variant="ghost"
              color="white"
              size={{ base: 'md', md: 'lg' }}
              onClick={goToNext}
              bg="blackAlpha.300"
              backdropFilter="blur(8px)"
              borderRadius="full"
              _hover={{ 
                bg: 'blackAlpha.500',
                transform: 'translateY(-50%) scale(1.1)',
              }}
              transition="all 0.2s ease"
              zIndex={2}
            />
          </>
        )}

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <HStack
            position="absolute"
            bottom={{ base: 3, md: 6 }}
            left="50%"
            transform="translateX(-50%)"
            spacing={3}
            zIndex={2}
            bg="blackAlpha.400"
            px={4}
            py={2}
            borderRadius="full"
            backdropFilter="blur(10px)"
          >
            {banners.map((_, index) => (
              <Box
                key={index}
                w={index === currentIndex ? 4 : 3}
                h={index === currentIndex ? 4 : 3}
                borderRadius="full"
                bg={index === currentIndex ? activeDotColor : dotColor}
                cursor="pointer"
                onClick={() => goToSlide(index)}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                border={index === currentIndex ? '2px solid' : 'none'}
                borderColor={index === currentIndex ? 'blue.300' : 'transparent'}
                _hover={{
                  bg: activeDotColor,
                  transform: 'scale(1.3)',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
                }}
              />
            ))}
          </HStack>
        )}
      </Box>
    </Box>
  );
};

export default BannerCarousel;