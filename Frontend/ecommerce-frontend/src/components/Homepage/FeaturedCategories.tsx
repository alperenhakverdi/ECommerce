import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  Skeleton,
  Image,
  HStack,
  Icon,
  Button,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { Category } from '../../types';

interface FeaturedCategoriesProps {
  categories: Category[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

const floatUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const hoverScale = keyframes`
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-8px) scale(1.02); }
`;

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  categories,
  isLoading = false,
  title = "Shop by Category",
  subtitle = "Discover products in your favorite categories",
}) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');
  const shadowColor = useColorModeValue('md', 'dark-lg');
  const hoverBgColor = useColorModeValue('white', 'gray.600');

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/search?category=${categoryId}`);
  };

  // Generate high-quality images with consistent styling
  const getCategoryImage = (categoryName: string) => {
    const imageMap: { [key: string]: string } = {
      'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Books & Media': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Home & Garden': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Sports & Fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Beauty & Personal Care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Toys & Games': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Toys': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
      'Automotive': 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=300&h=300&fit=crop&crop=center&auto=format&q=80',
    };
    
    return imageMap[categoryName] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=300&fit=crop&crop=center&auto=format&q=80';
  };

  const getCategoryColors = (categoryName: string) => {
    const colorMap: { [key: string]: { bg: string; border: string } } = {
      'Electronics': { bg: 'linear(135deg, blue.500, cyan.400)', border: 'blue.500' },
      'Clothing': { bg: 'linear(135deg, purple.500, pink.400)', border: 'purple.500' },
      'Books': { bg: 'linear(135deg, green.500, teal.400)', border: 'green.500' },
      'Home & Garden': { bg: 'linear(135deg, orange.500, yellow.400)', border: 'orange.500' },
      'Sports': { bg: 'linear(135deg, red.500, orange.400)', border: 'red.500' },
      'Beauty': { bg: 'linear(135deg, pink.500, rose.400)', border: 'pink.500' },
      'Toys': { bg: 'linear(135deg, yellow.500, orange.400)', border: 'yellow.500' },
      'Automotive': { bg: 'linear(135deg, gray.600, gray.400)', border: 'gray.600' },
    };
    
    return colorMap[categoryName] || { bg: 'linear(135deg, blue.500, purple.500)', border: 'blue.500' };
  };

  if (isLoading) {
    return (
      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={6}
      >
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} align="center">
            <Skeleton height="32px" width="200px" />
            <Skeleton height="20px" width="300px" />
          </VStack>
          
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height="120px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
    );
  }

  if (categories.length === 0) {
    return null;
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
        {/* Header */}
        <VStack spacing={2} textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="md" color="gray.600">
            {subtitle}
          </Text>
        </VStack>

        {/* Categories Grid */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={6}>
          {categories.slice(0, 6).map((category, index) => {
            const colors = getCategoryColors(category.name);
            return (
              <Box
                key={category.id}
                cursor="pointer"
                onClick={() => handleCategoryClick(category.id)}
                borderRadius="2xl"
                overflow="hidden"
                bg={cardBg}
                boxShadow={shadowColor}
                border="1px"
                borderColor={borderColor}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                animation={`${floatUp} 0.6s ease-out ${index * 0.1}s both`}
                position="relative"
                _hover={{
                  animation: `${hoverScale} 0.3s ease-out forwards`,
                  boxShadow: '0 25px 50px rgba(59, 130, 246, 0.25), 0 0 0 2px rgba(59, 130, 246, 0.3)',
                  borderColor: 'blue.500',
                  bg: hoverBgColor,
                  transform: 'translateY(-12px) scale(1.05)',
                }}
                _active={{
                  transform: 'translateY(-6px) scale(0.98)',
                }}
              >
                {/* Background Gradient Overlay */}
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="50px"
                  h="50px"
                  bgGradient={colors.bg}
                  borderRadius="full"
                  transform="translate(25px, -25px)"
                  opacity={0.1}
                  transition="all 0.3s ease"
                  _groupHover={{
                    opacity: 0.2,
                    transform: 'translate(20px, -20px) scale(1.2)',
                  }}
                />

                <VStack spacing={0} p={4} position="relative">
                  {/* Category Image - Full Card */}
                  <Box
                    position="relative"
                    width="100%"
                    height="160px"
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="lg"
                    _groupHover={{
                      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.2)',
                    }}
                    transition="all 0.3s ease"
                  >
                    <Image
                      src={getCategoryImage(category.name)}
                      alt={category.name}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      objectPosition="center"
                      transition="transform 0.3s ease"
                      _hover={{ transform: 'scale(1.1)' }}
                      fallback={
                        <Box
                          bg="gray.200"
                          width="100%"
                          height="100%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          color="gray.500"
                          fontSize="4xl"
                          fontWeight="black"
                        >
                          {category.name.charAt(0)}
                        </Box>
                      }
                    />
                    
                    {/* Gradient Overlay */}
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bgGradient="linear(to-t, blackAlpha.600, transparent)"
                      opacity={0.8}
                    />

                    {/* Category Name Overlay */}
                    <Box
                      position="absolute"
                      bottom={4}
                      left={4}
                      right={4}
                    >
                      <Text
                        fontSize="lg"
                        fontWeight="black"
                        color="white"
                        textShadow="0 3px 6px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)"
                        mb={1}
                        letterSpacing="tight"
                      >
                        {category.name}
                      </Text>
                      {category.productCount > 0 && (
                        <Text
                          fontSize="sm"
                          color="white"
                          textShadow="0 2px 4px rgba(0,0,0,0.7)"
                          fontWeight="600"
                        >
                          {category.productCount} products
                        </Text>
                      )}
                    </Box>

                    {/* Shop Now Button on Hover */}
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      opacity={0}
                      _groupHover={{
                        opacity: 1,
                      }}
                      transition="all 0.3s ease"
                    >
                      <Button
                        size="sm"
                        bg="orange.400"
                        color="white"
                        _hover={{ bg: 'orange.500' }}
                        borderRadius="full"
                        px={6}
                        boxShadow="lg"
                        leftIcon={<Icon as={FiShoppingBag} />}
                      >
                        Shop Now
                      </Button>
                    </Box>
                  </Box>
                </VStack>

                {/* Hover Effect Ring */}
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  border="3px solid transparent"
                  borderRadius="2xl"
                  _hover={{
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 0 0 1px rgba(59, 130, 246, 0.2)',
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  pointerEvents="none"
                />
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Show more link if there are more categories */}
        {categories.length > 6 && (
          <HStack justify="center">
            <Text
              fontSize="sm"
              color="blue.500"
              cursor="pointer"
              onClick={() => navigate('/search')}
              _hover={{ textDecoration: 'underline' }}
            >
              View all categories →
            </Text>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default FeaturedCategories;
