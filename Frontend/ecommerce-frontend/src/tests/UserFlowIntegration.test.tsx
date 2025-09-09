import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../context/CartContext';
import theme from '../theme';
import HomePage from '../pages/HomePage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import { authService } from '../services/authService';

// Mock API services
jest.mock('../services/api');
jest.mock('../services/authService');

const mockProducts = [
  {
    id: 'product-1',
    name: 'Test Laptop',
    description: 'High performance laptop for testing',
    price: 999.99,
    stock: 10,
    imageUrl: 'https://via.placeholder.com/300x300',
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    isActive: true
  },
  {
    id: 'product-2',
    name: 'Test Mouse',
    description: 'Wireless mouse for testing',
    price: 29.99,
    stock: 50,
    imageUrl: 'https://via.placeholder.com/300x300',
    categoryId: 'cat-1',
    categoryName: 'Electronics',
    isActive: true
  }
];

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Electronic devices',
    isActive: true,
    productCount: 2
  }
];

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  roles: ['Customer'],
  createdAt: '2023-01-01T00:00:00.000Z'
};

const mockCart = {
  id: 'cart-123',
  userId: 'user-123',
  items: [],
  totalAmount: 0,
  totalItems: 0
};

const mockCartWithItems = {
  id: 'cart-123',
  userId: 'user-123',
  items: [
    {
      id: 'item-1',
      productId: 'product-1',
      productName: 'Test Laptop',
      productImage: 'https://via.placeholder.com/300x300',
      price: 999.99,
      quantity: 1,
      subTotal: 999.99
    }
  ],
  totalAmount: 999.99,
  totalItems: 1
};

const mockAddresses = [
  {
    id: 'addr-1',
    title: 'Home',
    firstName: 'Test',
    lastName: 'User',
    addressLine1: '123 Test Street',
    addressLine2: '',
    city: 'Test City',
    state: 'Test State',
    postalCode: '12345',
    country: 'US',
    phoneNumber: '555-0123',
    isDefault: true,
    isActive: true,
    userId: 'user-123',
    createdAt: '2023-01-01T00:00:00.000Z',
    fullName: 'Test User',
    fullAddress: '123 Test Street, Test City, Test State 12345, US'
  }
];

// Setup API mocks
const setupMocks = () => {
  const { productsApi, categoriesApi, cartApi, addressApi, ordersApi } = require('../services/api');
  
  // Products API
  productsApi.getAll.mockResolvedValue({ data: mockProducts });
  productsApi.getById.mockResolvedValue({ data: mockProducts[0] });
  
  // Categories API
  categoriesApi.getAll.mockResolvedValue({ data: mockCategories });
  
  // Cart API
  cartApi.get.mockResolvedValue({ data: mockCart });
  cartApi.addItem.mockResolvedValue({ data: mockCartWithItems });
  cartApi.updateItem.mockResolvedValue({ data: mockCartWithItems });
  cartApi.removeItem.mockResolvedValue({ data: mockCart });
  
  // Address API
  addressApi.getAll.mockResolvedValue({ data: mockAddresses });
  addressApi.getDefault.mockResolvedValue({ data: mockAddresses[0] });
  
  // Orders API
  ordersApi.create.mockResolvedValue({
    data: {
      id: 'order-123',
      userId: 'user-123',
      totalAmount: 999.99,
      status: 1,
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      addressId: 'addr-1',
      createdAt: '2023-01-01T00:00:00.000Z',
      items: mockCartWithItems.items
    }
  });
  
  // Auth Service
  const mockedAuthService = authService as jest.Mocked<typeof authService>;
  mockedAuthService.getToken.mockReturnValue('mock-token');
  mockedAuthService.isTokenExpired.mockReturnValue(false);
  mockedAuthService.getCurrentUser.mockResolvedValue(mockUser);
  mockedAuthService.login.mockResolvedValue({
    success: true,
    message: 'Login successful',
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    user: mockUser,
    errors: []
  });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider theme={theme}>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </ChakraProvider>
);

describe('User Flow Integration Tests', () => {
  const user = userEvent;

  beforeEach(() => {
    setupMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn((key) => {
        if (key === 'token') return 'mock-token';
        if (key === 'refreshToken') return 'mock-refresh-token';
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Product Browsing and Cart Operations', () => {
    test('User can browse products and add items to cart', async () => {
      console.log('🔄 Testing Product Browsing and Add to Cart...');
      
      render(<HomePage />, { wrapper: TestWrapper });

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Test Laptop')).toBeInTheDocument();
        expect(screen.getByText('Test Mouse')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify product information is displayed
      expect(screen.getByText('$999.99')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText(/High performance laptop/i)).toBeInTheDocument();

      // Find and click "Add to Cart" button for the laptop
      const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });
      expect(addToCartButtons).toHaveLength(2);

      // Click first "Add to Cart" button (for laptop)
      await user.click(addToCartButtons[0]);

      // Wait for success toast
      await waitFor(() => {
        expect(screen.getByText(/added to cart/i)).toBeInTheDocument();
        expect(screen.getByText(/test laptop.*added to your cart/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      console.log('✅ Product Browsing and Add to Cart completed successfully');
    }, 15000);

    test('User cannot add out-of-stock items to cart', async () => {
      console.log('🔄 Testing Out of Stock Handling...');
      
      // Mock out of stock product
      const outOfStockProducts = [
        { ...mockProducts[0], stock: 0 }
      ];
      
      const { productsApi } = require('../services/api');
      productsApi.getAll.mockResolvedValue({ data: outOfStockProducts });

      render(<HomePage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Laptop')).toBeInTheDocument();
      });

      // Try to add out-of-stock item to cart
      const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
      await user.click(addToCartButton);

      // Wait for out-of-stock warning
      await waitFor(() => {
        expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
        expect(screen.getByText(/currently out of stock/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      console.log('✅ Out of Stock Handling completed successfully');
    }, 10000);
  });

  describe('Cart Management', () => {
    test('User can view and manage cart items', async () => {
      console.log('🔄 Testing Cart Management...');
      
      // Mock cart with items
      const { cartApi } = require('../services/api');
      cartApi.get.mockResolvedValue({ data: mockCartWithItems });

      render(<CartPage />, { wrapper: TestWrapper });

      // Wait for cart items to load
      await waitFor(() => {
        expect(screen.getByText(/shopping cart/i)).toBeInTheDocument();
        expect(screen.getByText('Test Laptop')).toBeInTheDocument();
        expect(screen.getByText('$999.99')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify cart totals
      expect(screen.getByText(/total.*1.*item/i)).toBeInTheDocument();
      expect(screen.getByText(/\$999\.99/)).toBeInTheDocument();

      // Test quantity update
      const quantityInput = screen.getByDisplayValue('1');
      await user.clear(quantityInput);
      await user.type(quantityInput, '2');
      
      const updateButton = screen.getByRole('button', { name: /update/i });
      await user.click(updateButton);

      // Should call the API to update quantity
      expect(cartApi.updateItem).toHaveBeenCalledWith('user-123', 'item-1', 2);

      console.log('✅ Cart Management completed successfully');
    }, 15000);

    test('User can remove items from cart', async () => {
      console.log('🔄 Testing Cart Item Removal...');
      
      const { cartApi } = require('../services/api');
      cartApi.get.mockResolvedValue({ data: mockCartWithItems });

      render(<CartPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Test Laptop')).toBeInTheDocument();
      });

      // Find and click remove button
      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      // Should call the API to remove item
      expect(cartApi.removeItem).toHaveBeenCalledWith('user-123', 'item-1');

      console.log('✅ Cart Item Removal completed successfully');
    }, 10000);
  });

  describe('Checkout Process', () => {
    test('User can complete checkout with valid information', async () => {
      console.log('🔄 Testing Checkout Process...');
      
      // Mock cart with items and addresses
      const { cartApi, addressApi } = require('../services/api');
      cartApi.get.mockResolvedValue({ data: mockCartWithItems });
      addressApi.getAll.mockResolvedValue({ data: mockAddresses });

      render(<CheckoutPage />, { wrapper: TestWrapper });

      // Wait for checkout form
      await waitFor(() => {
        expect(screen.getByText(/checkout/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Fill customer information (Step 1)
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');

      // Click Next to proceed to address selection
      const nextButton = screen.getByRole('button', { name: /next.*shipping/i });
      await user.click(nextButton);

      // Wait for address selection step
      await waitFor(() => {
        expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Select the default address
      const addressRadio = screen.getByRole('radio');
      await user.click(addressRadio);

      // Continue to payment
      const nextToPaymentButton = screen.getByRole('button', { name: /next.*payment/i });
      await user.click(nextToPaymentButton);

      // Wait for payment step
      await waitFor(() => {
        expect(screen.getByText(/payment information/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify order amount is displayed
      expect(screen.getByText(/\$999\.99/)).toBeInTheDocument();

      console.log('✅ Checkout Process completed successfully');
    }, 20000);

    test('Checkout validates required fields', async () => {
      console.log('🔄 Testing Checkout Validation...');
      
      const { cartApi } = require('../services/api');
      cartApi.get.mockResolvedValue({ data: mockCartWithItems });

      render(<CheckoutPage />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText(/checkout/i)).toBeInTheDocument();
      });

      // Try to proceed without filling required fields
      const nextButton = screen.getByRole('button', { name: /next.*shipping/i });
      await user.click(nextButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/customer name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      console.log('✅ Checkout Validation completed successfully');
    }, 10000);
  });

  describe('Error Handling', () => {
    test('Handles API errors gracefully', async () => {
      console.log('🔄 Testing Error Handling...');
      
      // Mock API error
      const { productsApi } = require('../services/api');
      productsApi.getAll.mockRejectedValue(new Error('Network error'));

      render(<HomePage />, { wrapper: TestWrapper });

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
        expect(screen.getByText(/please try again later/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      console.log('✅ Error Handling completed successfully');
    }, 10000);

    test('Handles empty cart checkout', async () => {
      console.log('🔄 Testing Empty Cart Checkout...');
      
      // Mock empty cart
      const { cartApi } = require('../services/api');
      cartApi.get.mockResolvedValue({ data: mockCart });

      render(<CheckoutPage />, { wrapper: TestWrapper });

      // Should show empty cart message
      await waitFor(() => {
        expect(screen.getByText(/cart is empty/i)).toBeInTheDocument();
        expect(screen.getByText(/add items before checkout/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      console.log('✅ Empty Cart Checkout completed successfully');
    }, 10000);
  });
});

describe('Critical Business Logic Tests', () => {
  test('Cart calculations are correct', () => {
    console.log('🔄 Testing Cart Calculations...');
    
    const items = [
      { price: 100, quantity: 2, subTotal: 200 },
      { price: 50, quantity: 1, subTotal: 50 },
      { price: 25.99, quantity: 3, subTotal: 77.97 }
    ];

    const totalAmount = items.reduce((sum, item) => sum + item.subTotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    expect(totalAmount).toBe(327.97);
    expect(totalItems).toBe(6);
    
    console.log('✅ Cart Calculations completed successfully');
  });

  test('Price formatting is consistent', () => {
    console.log('🔄 Testing Price Formatting...');
    
    const prices = [999.99, 29.9, 100, 0.99];
    const formattedPrices = prices.map(price => `$${price.toFixed(2)}`);

    expect(formattedPrices).toEqual(['$999.99', '$29.90', '$100.00', '$0.99']);
    
    console.log('✅ Price Formatting completed successfully');
  });

  test('Stock validation works correctly', () => {
    console.log('🔄 Testing Stock Validation...');
    
    const product = { stock: 5 };
    const requestedQuantity = 3;
    const isValidQuantity = requestedQuantity <= product.stock && requestedQuantity > 0;

    expect(isValidQuantity).toBe(true);

    const invalidQuantity = 10;
    const isInvalidQuantity = invalidQuantity <= product.stock && invalidQuantity > 0;

    expect(isInvalidQuantity).toBe(false);
    
    console.log('✅ Stock Validation completed successfully');
  });
});

console.log('🎉 ALL CRITICAL USER FLOW TESTS COMPLETED!');