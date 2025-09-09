import React from 'react';
import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  HStack,
  VStack,
  useColorModeValue,
  Tooltip,
  Box,
} from '@chakra-ui/react';
import { 
  FiSun, 
  FiMoon, 
  FiMonitor, 
  FiCheck,
  FiChevronDown 
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'dropdown';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'md', 
  variant = 'icon',
  showLabel = false 
}) => {
  const { t } = useTranslation();
  const { themeMode, setThemeMode, toggleColorMode } = useTheme();
  
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const hoverColor = useColorModeValue('gray.800', 'gray.200');

  const getThemeIcon = (mode: string) => {
    switch (mode) {
      case 'light':
        return <FiSun />;
      case 'dark':
        return <FiMoon />;
      case 'system':
        return <FiMonitor />;
      default:
        return <FiSun />;
    }
  };

  const getCurrentThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return t('theme.light');
      case 'dark':
        return t('theme.dark');
      case 'system':
        return t('theme.system');
      default:
        return t('theme.light');
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip label={t('theme.toggle')} hasArrow>
        <IconButton
          aria-label={t('theme.toggle')}
          icon={getThemeIcon(themeMode)}
          variant="ghost"
          size={size}
          color={iconColor}
          _hover={{ color: hoverColor }}
          onClick={toggleColorMode}
        />
      </Tooltip>
    );
  }

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label={t('theme.selectTheme')}
        icon={
          <HStack spacing={1}>
            {getThemeIcon(themeMode)}
            {showLabel && (
              <Text fontSize="sm" display={{ base: 'none', md: 'block' }}>
                {getCurrentThemeLabel()}
              </Text>
            )}
            <Box transform="scale(0.8)">
              <FiChevronDown />
            </Box>
          </HStack>
        }
        variant="ghost"
        size={size}
        color={iconColor}
        _hover={{ color: hoverColor }}
      />
      <MenuList>
        <Text px={3} py={2} fontSize="sm" fontWeight="semibold" color="gray.500">
          {t('theme.appearance')}
        </Text>
        <MenuDivider />
        
        <MenuItem
          icon={<FiSun />}
          onClick={() => setThemeMode('light')}
        >
          <HStack justify="space-between" width="100%">
            <VStack align="start" spacing={0}>
              <Text>{t('theme.light')}</Text>
              <Text fontSize="xs" color="gray.500">
                {t('theme.lightDescription')}
              </Text>
            </VStack>
            {themeMode === 'light' && <FiCheck color="green" />}
          </HStack>
        </MenuItem>
        
        <MenuItem
          icon={<FiMoon />}
          onClick={() => setThemeMode('dark')}
        >
          <HStack justify="space-between" width="100%">
            <VStack align="start" spacing={0}>
              <Text>{t('theme.dark')}</Text>
              <Text fontSize="xs" color="gray.500">
                {t('theme.darkDescription')}
              </Text>
            </VStack>
            {themeMode === 'dark' && <FiCheck color="green" />}
          </HStack>
        </MenuItem>
        
        <MenuItem
          icon={<FiMonitor />}
          onClick={() => setThemeMode('system')}
        >
          <HStack justify="space-between" width="100%">
            <VStack align="start" spacing={0}>
              <Text>{t('theme.system')}</Text>
              <Text fontSize="xs" color="gray.500">
                {t('theme.systemDescription')}
              </Text>
            </VStack>
            {themeMode === 'system' && <FiCheck color="green" />}
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ThemeToggle;