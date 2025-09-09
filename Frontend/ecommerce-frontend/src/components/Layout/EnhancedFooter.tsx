import React, { useState } from 'react';
import {
  Box,
  Container,
  Text,
  useColorModeValue,
  Divider,
  Flex,
  Link,
  VStack,
  HStack,
  SimpleGrid,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaGithub,
} from 'react-icons/fa';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiShield,
  FiTruck,
  FiCreditCard,
  FiHeadphones,
} from 'react-icons/fi';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const EnhancedFooter: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const linkHoverBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const socialIconColor = useColorModeValue('gray.600', 'gray.400');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter a valid email address.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubscribing(true);
    
    // Simulate newsletter subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Subscription Successful!',
      description: 'Thank you for subscribing to our newsletter.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    setEmail('');
    setSubscribing(false);
  };

  const socialLinks = [
    { icon: FaFacebook, label: 'Facebook', href: 'https://facebook.com', color: '#1877F2' },
    { icon: FaTwitter, label: 'Twitter', href: 'https://twitter.com', color: '#1DA1F2' },
    { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com', color: '#E4405F' },
    { icon: FaLinkedin, label: 'LinkedIn', href: 'https://linkedin.com', color: '#0A66C2' },
    { icon: FaYoutube, label: 'YouTube', href: 'https://youtube.com', color: '#FF0000' },
    { icon: FaGithub, label: 'GitHub', href: 'https://github.com', color: '#333' },
  ];

  const quickLinks = [
    { title: t('footer.aboutUs'), href: '/about' },
    { title: t('footer.contact'), href: '/contact' },
    { title: t('footer.privacyPolicy'), href: '/privacy' },
    { title: t('footer.termsOfService'), href: '/terms' },
    { title: 'FAQ', href: '/faq' },
    { title: 'Returns', href: '/returns' },
  ];

  const categories = [
    { title: 'Electronics', href: '/search?category=electronics' },
    { title: 'Clothing', href: '/search?category=clothing' },
    { title: 'Books', href: '/search?category=books' },
    { title: 'Home & Garden', href: '/search?category=home' },
    { title: 'Sports', href: '/search?category=sports' },
    { title: 'Beauty', href: '/search?category=beauty' },
  ];

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'Orders over $250' },
    { icon: FiShield, title: 'Secure Payment', desc: '100% Protected' },
    { icon: FiCreditCard, title: 'Easy Returns', desc: '30 Day Policy' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Always Here' },
  ];

  return (
    <Box bg={bg} borderTop="1px" borderColor={borderColor} mt="auto">
      {/* Promotional Banner */}
      <Box
        bg="linear-gradient(135deg, #3B82F6 0%, #FB923C 100%)"
        color="white"
        py={4}
        textAlign="center"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="radial(circle at 30% 50%, whiteAlpha.200, transparent)"
        />
        <Container maxW="container.xl" position="relative">
          <VStack spacing={3}>
            <HStack justify="center" spacing={4} flexWrap="wrap">
              <Badge colorScheme="yellow" variant="solid" px={3} py={1} borderRadius="full" fontSize="xs">
                🎉 SPECIAL OFFER
              </Badge>
              <Text fontSize={{ base: "sm", md: "md" }} fontWeight="600">
                Get 20% OFF on your first order! Use code:
              </Text>
            </HStack>
            <HStack spacing={3}>
              <Badge
                bg="whiteAlpha.200"
                color="white"
                px={4}
                py={2}
                borderRadius="md"
                fontSize="lg"
                fontWeight="bold"
                border="1px dashed white"
                fontFamily="mono"
                letterSpacing="wider"
              >
                WELCOME20
              </Badge>
              <Button
                size="sm"
                bg="whiteAlpha.200"
                color="white"
                border="2px solid"
                borderColor="orange.400"
                _hover={{ 
                  bg: "orange.400",
                  borderColor: "orange.500",
                  transform: "scale(1.05)"
                }}
                _active={{
                  bg: "orange.500",
                  transform: "scale(0.95)"
                }}
                onClick={() => {
                  navigator.clipboard.writeText('WELCOME20');
                  toast({
                    title: 'Code Copied!',
                    description: 'WELCOME20 has been copied to your clipboard',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                  });
                }}
                borderRadius="md"
                fontWeight="700"
                transition="all 0.2s ease"
                boxShadow="0 2px 8px rgba(251, 146, 60, 0.3)"
              >
                Copy
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box bg={cardBg} py={8}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            {features.map((feature, index) => (
              <VStack
                key={feature.title}
                spacing={3}
                textAlign="center"
                p={4}
                borderRadius="xl"
                _hover={{
                  bg: linkHoverBg,
                  transform: 'translateY(-2px)',
                }}
                transition="all 0.3s ease"
                animation={`${pulse} 2s ease-in-out infinite ${index * 0.5}s`}
              >
                <Box
                  p={3}
                  borderRadius="full"
                  bg="blue.50"
                  _dark={{ bg: 'blue.900' }}
                  color="blue.500"
                >
                  <Icon as={feature.icon} boxSize={6} />
                </Box>
                <VStack spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">
                    {feature.title}
                  </Text>
                  <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.400' }}>
                    {feature.desc}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Divider />

      {/* Main Footer Content */}
      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
          {/* Company Info */}
          <VStack align="start" spacing={6}>
            <VStack align="start" spacing={4}>
              <Text fontSize="2xl" fontWeight="black" color="blue.500">
                E-Commerce
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                {t('footer.subtitle')}
              </Text>
            </VStack>

            {/* Contact Info */}
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Icon as={FiMapPin} color="blue.500" />
                <Text fontSize="sm">
                  123 E-Commerce St, Digital City, DC 12345
                </Text>
              </HStack>
              <HStack spacing={3}>
                <Icon as={FiPhone} color="blue.500" />
                <Text fontSize="sm">+1 (555) 123-4567</Text>
              </HStack>
              <HStack spacing={3}>
                <Icon as={FiMail} color="blue.500" />
                <Text fontSize="sm">info@ecommerce.com</Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Quick Links */}
          <VStack align="start" spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              Quick Links
            </Text>
            <VStack align="start" spacing={2}>
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: 'gray.300' }}
                  _hover={{
                    color: 'blue.500',
                    textDecoration: 'none',
                    transform: 'translateX(4px)',
                  }}
                  transition="all 0.2s ease"
                >
                  {link.title}
                </Link>
              ))}
            </VStack>
          </VStack>

          {/* Categories */}
          <VStack align="start" spacing={4}>
            <Text fontSize="lg" fontWeight="bold">
              Categories
            </Text>
            <VStack align="start" spacing={2}>
              {categories.map((category) => (
                <Link
                  key={category.title}
                  href={category.href}
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: 'gray.300' }}
                  _hover={{
                    color: 'blue.500',
                    textDecoration: 'none',
                    transform: 'translateX(4px)',
                  }}
                  transition="all 0.2s ease"
                >
                  {category.title}
                </Link>
              ))}
            </VStack>
          </VStack>

          {/* Newsletter */}
          <VStack align="start" spacing={6}>
            <VStack align="start" spacing={2}>
              <Text fontSize="lg" fontWeight="bold">
                Newsletter
              </Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                {t('footer.newsletter')}
              </Text>
            </VStack>

            <Box w="full">
              <form onSubmit={handleNewsletterSubmit}>
                <InputGroup>
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    bg={cardBg}
                    borderRadius="xl"
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Subscribe"
                      icon={<FiSend />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      type="submit"
                      isLoading={subscribing}
                      borderRadius="full"
                    />
                  </InputRightElement>
                </InputGroup>
              </form>
              
              <Button
                type="submit"
                onClick={handleNewsletterSubmit}
                isLoading={subscribing}
                loadingText="Subscribing..."
                bg="linear-gradient(135deg, #FF6B35, #FF8E53)"
                color="white"
                size="sm"
                w="full"
                mt={3}
                borderRadius="xl"
                leftIcon={<FiMail />}
                _hover={{
                  bg: "linear-gradient(135deg, #E55A2E, #E5784A)",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.35)',
                }}
                _active={{
                  bg: "linear-gradient(135deg, #CC4F29, #CC6A42)",
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.2s ease"
                boxShadow="0 2px 8px rgba(255, 107, 53, 0.2)"
                textShadow="0 1px 2px rgba(0,0,0,0.1)"
                fontWeight="600"
              >
                {t('footer.subscribe')}
              </Button>
            </Box>

            {/* Social Media */}
            <VStack align="start" spacing={3} w="full">
              <Text fontSize="md" fontWeight="semibold">
                {t('footer.followUs')}
              </Text>
              <Flex wrap="wrap" gap={3}>
                {socialLinks.map((social) => (
                  <IconButton
                    key={social.label}
                    as="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    icon={<Icon as={social.icon} />}
                    size="md"
                    borderRadius="full"
                    bg="gray.100"
                    _dark={{ bg: 'gray.700' }}
                    color={socialIconColor}
                    _hover={{
                      bg: social.color,
                      color: 'white',
                      transform: 'translateY(-3px) scale(1.1)',
                      boxShadow: `0 6px 20px ${social.color}40`,
                    }}
                    transition="all 0.3s ease"
                  />
                ))}
              </Flex>
            </VStack>
          </VStack>
        </SimpleGrid>
      </Container>

      {/* Bottom Bar */}
      <Box bg={useColorModeValue('gray.100', 'gray.800')} py={4}>
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </Text>
            
            <HStack spacing={4}>
              <Badge colorScheme="green" variant="subtle">
                SSL Secured
              </Badge>
              <Badge colorScheme="blue" variant="subtle">
                PCI Compliant
              </Badge>
              <Badge colorScheme="purple" variant="subtle">
                GDPR Ready
              </Badge>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default EnhancedFooter;