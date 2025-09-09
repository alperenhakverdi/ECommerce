import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const buttonBg = useColorModeValue('white', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.50', 'gray.600');
  const menuItemActiveBg = useColorModeValue('blue.50', 'blue.900');

  return (
    <Menu>
      <MenuButton
        as={Button}
        size="sm"
        variant="outline"
        rightIcon={<ChevronDownIcon />}
        bg={buttonBg}
        _hover={{ bg: buttonHoverBg }}
        _active={{ bg: buttonHoverBg }}
      >
        <HStack spacing={2}>
          <Text fontSize="lg">{currentLanguage.flag}</Text>
          <Text fontSize="sm" display={{ base: 'none', md: 'block' }}>
            {currentLanguage.name}
          </Text>
        </HStack>
      </MenuButton>
      
      <MenuList>
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            bg={currentLanguage.code === language.code ? menuItemActiveBg : undefined}
          >
            <HStack spacing={3}>
              <Text fontSize="lg">{language.flag}</Text>
              <Text fontWeight={currentLanguage.code === language.code ? 'bold' : 'normal'}>
                {language.name}
              </Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSwitcher;