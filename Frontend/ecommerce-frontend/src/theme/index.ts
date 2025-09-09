import { extendTheme } from '@chakra-ui/react';

type ThemeConfig = {
  initialColorMode: 'light' | 'dark';
  useSystemColorMode: boolean;
};

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    gray: {
      50: '#f9f9f9',
      100: '#ededed',
      200: '#d3d3d3',
      300: '#b3b3b3',
      400: '#a0a0a0',
      500: '#898989',
      600: '#6c6c6c',
      700: '#202020',
      800: '#121212',
      900: '#111',
    },
  },
  fonts: {
    heading: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.700' : 'brand.600',
            _disabled: {
              bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
            },
          },
        }),
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          boxShadow: props.colorMode === 'dark' ? 'lg' : 'md',
        },
      }),
    },
  },
});

export default theme;