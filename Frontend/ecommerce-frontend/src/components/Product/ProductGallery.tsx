import React, { useState } from 'react';
import {
  Box,
  Image,
  HStack,
  VStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  AspectRatio,
  Button,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiZoomIn, FiChevronLeft, FiChevronRight, FiMaximize } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isOutOfStock?: boolean;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ 
  images, 
  productName, 
  isOutOfStock = false 
}) => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const activeBorderColor = useColorModeValue('blue.500', 'blue.400');
  const overlayColor = useColorModeValue('blackAlpha.600', 'blackAlpha.800');

  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : ['/placeholder-image.jpg'];

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleImageClick = () => {
    onOpen();
  };

  return (
    <>
      <VStack spacing={4} width="100%">
        {/* Main Image */}
        <Box position="relative" width="100%" borderRadius="lg" overflow="hidden">
          <AspectRatio ratio={1} width="100%">
            <Box
              position="relative"
              cursor="zoom-in"
              onClick={handleImageClick}
              role="button"
              aria-label={t('productGallery.zoomImage')}
            >
              <Image
                src={displayImages[currentImageIndex]}
                alt={`${productName} - Image ${currentImageIndex + 1}`}
                width="100%"
                height="100%"
                objectFit="cover"
                fallback={
                  <Box 
                    bg="gray.200" 
                    height="100%" 
                    width="100%" 
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    No Image
                  </Box>
                }
              />
              
              {/* Zoom overlay icon */}
              <Box
                position="absolute"
                top={4}
                left={4}
                bg={overlayColor}
                borderRadius="md"
                p={2}
                opacity={0}
                transition="opacity 0.2s"
                _hover={{ opacity: 1 }}
              >
                <FiZoomIn color="white" size={16} />
              </Box>

              {/* Out of stock badge */}
              {isOutOfStock && (
                <Badge
                  position="absolute"
                  top={4}
                  right={4}
                  colorScheme="red"
                  fontSize="lg"
                  px={3}
                  py={1}
                >
                  {t('productCard.outOfStockBadge')}
                </Badge>
              )}

              {/* Navigation arrows for multiple images */}
              {displayImages.length > 1 && (
                <>
                  <IconButton
                    aria-label="Previous image"
                    icon={<FiChevronLeft />}
                    position="absolute"
                    left={2}
                    top="50%"
                    transform="translateY(-50%)"
                    bg={overlayColor}
                    color="white"
                    size="sm"
                    borderRadius="full"
                    opacity={0}
                    transition="opacity 0.2s"
                    _hover={{ opacity: 1, bg: 'blackAlpha.700' }}
                    _groupHover={{ opacity: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious();
                    }}
                  />
                  
                  <IconButton
                    aria-label="Next image"
                    icon={<FiChevronRight />}
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    bg={overlayColor}
                    color="white"
                    size="sm"
                    borderRadius="full"
                    opacity={0}
                    transition="opacity 0.2s"
                    _hover={{ opacity: 1, bg: 'blackAlpha.700' }}
                    _groupHover={{ opacity: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                  />
                </>
              )}
            </Box>
          </AspectRatio>
        </Box>

        {/* Thumbnail Images */}
        {displayImages.length > 1 && (
          <HStack spacing={2} wrap="wrap" justify="center">
            {displayImages.map((image, index) => (
              <Box
                key={index}
                position="relative"
                cursor="pointer"
                onClick={() => handleThumbnailClick(index)}
                borderWidth={2}
                borderColor={index === currentImageIndex ? activeBorderColor : borderColor}
                borderRadius="md"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ 
                  borderColor: activeBorderColor,
                  transform: 'scale(1.05)' 
                }}
              >
                <AspectRatio ratio={1} width="60px">
                  <Image
                    src={image}
                    alt={`${productName} - Thumbnail ${index + 1}`}
                    objectFit="cover"
                    fallback={
                      <Box bg="gray.200" display="flex" alignItems="center" justifyContent="center">
                        <Box fontSize="xs" color="gray.500">
                          {index + 1}
                        </Box>
                      </Box>
                    }
                  />
                </AspectRatio>
              </Box>
            ))}
          </HStack>
        )}

        {/* Expand button */}
        <Button
          leftIcon={<FiMaximize />}
          variant="outline"
          size="sm"
          onClick={handleImageClick}
        >
          {t('productGallery.viewFullSize')}
        </Button>
      </VStack>

      {/* Zoom Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="6xl"
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.900" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton
            color="white"
            size="lg"
            top={4}
            right={4}
            zIndex={2}
            bg="blackAlpha.600"
            borderRadius="full"
            _hover={{ bg: 'blackAlpha.800' }}
          />
          <ModalBody p={4}>
            <VStack spacing={4}>
              {/* Full Size Image */}
              <Box position="relative" maxW="100%" maxH="80vh">
                <Image
                  src={displayImages[currentImageIndex]}
                  alt={`${productName} - Full size ${currentImageIndex + 1}`}
                  maxW="100%"
                  maxH="80vh"
                  objectFit="contain"
                  fallback={
                    <Box 
                      bg="gray.200" 
                      minH="400px" 
                      minW="400px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      Image not available
                    </Box>
                  }
                />
                
                {/* Modal Navigation */}
                {displayImages.length > 1 && (
                  <>
                    <IconButton
                      aria-label="Previous image"
                      icon={<FiChevronLeft />}
                      position="absolute"
                      left={4}
                      top="50%"
                      transform="translateY(-50%)"
                      bg="blackAlpha.600"
                      color="white"
                      borderRadius="full"
                      _hover={{ bg: 'blackAlpha.800' }}
                      onClick={handlePrevious}
                      size="lg"
                    />
                    
                    <IconButton
                      aria-label="Next image"
                      icon={<FiChevronRight />}
                      position="absolute"
                      right={4}
                      top="50%"
                      transform="translateY(-50%)"
                      bg="blackAlpha.600"
                      color="white"
                      borderRadius="full"
                      _hover={{ bg: 'blackAlpha.800' }}
                      onClick={handleNext}
                      size="lg"
                    />
                  </>
                )}
              </Box>

              {/* Modal Thumbnail Navigation */}
              {displayImages.length > 1 && (
                <HStack spacing={2} wrap="wrap" justify="center">
                  {displayImages.map((image, index) => (
                    <Box
                      key={index}
                      cursor="pointer"
                      onClick={() => handleThumbnailClick(index)}
                      borderWidth={2}
                      borderColor={index === currentImageIndex ? 'white' : 'whiteAlpha.400'}
                      borderRadius="md"
                      overflow="hidden"
                      transition="all 0.2s"
                      _hover={{ 
                        borderColor: 'white',
                        transform: 'scale(1.1)' 
                      }}
                    >
                      <AspectRatio ratio={1} width="50px">
                        <Image
                          src={image}
                          alt={`${productName} - Modal Thumbnail ${index + 1}`}
                          objectFit="cover"
                          fallback={
                            <Box 
                              bg="whiteAlpha.200" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                            >
                              <Box fontSize="xs" color="white">
                                {index + 1}
                              </Box>
                            </Box>
                          }
                        />
                      </AspectRatio>
                    </Box>
                  ))}
                </HStack>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductGallery;