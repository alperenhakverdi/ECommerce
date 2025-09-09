import React from 'react';
import {
  Box,
  Container,
  Text,
  useColorModeValue,
  Divider,
  Flex,
  Link,
  Stack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const bg = useColorModeValue('gray.100', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bg={bg} borderTop="1px" borderColor={borderColor} mt="auto">
      <Container maxW="container.xl" py={8}>
        <Stack spacing={6}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'center', md: 'flex-start' }}
            gap={4}
          >
            <Stack spacing={2} align={{ base: 'center', md: 'flex-start' }}>
              <Text fontSize="lg" fontWeight="bold" color="brand.500">
                E-Commerce
              </Text>
              <Text fontSize="sm" color="gray.600">
                {t('footer.subtitle')}
              </Text>
            </Stack>

            <Stack
              direction={{ base: 'column', md: 'row' }}
              align="center"
            >
              <Link href="#" fontSize="sm" _hover={{ color: 'brand.500' }}>
                {t('footer.aboutUs')}
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'brand.500' }}>
                {t('footer.contact')}
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'brand.500' }}>
                {t('footer.privacyPolicy')}
              </Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'brand.500' }}>
                {t('footer.termsOfService')}
              </Link>
            </Stack>
          </Flex>

          <Divider />
          
          <Text
            fontSize="sm"
            color="gray.600"
            textAlign="center"
          >
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;