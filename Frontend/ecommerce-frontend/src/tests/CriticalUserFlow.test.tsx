import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../context/CartContext';
import theme from '../theme';

// Mock API responses
const mockApiResponses = {
  register: {
    success: true,
    message: 'Registration successful',
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['Customer'],
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    errors: []
  },
  login: {
    success: true,
    message: 'Login successful',
    token: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['Customer'],
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    errors: []
  },
  products: [
    {
      id: 'product-1',
      name: 'Test Product 1',
      description: 'A great test product',
      price: 29.99,
      stock: 10,
      imageUrl: 'https://via.placeholder.com/300',
      categoryId: 'category-1',
      categoryName: 'Electronics',
      isActive: true
    },
    {
      id: 'product-2',
      name: 'Test Product 2',
      description: 'Another test product',
      price: 49.99,
      stock: 5,
      imageUrl: 'https://via.placeholder.com/300',
      categoryId: 'category-1',
      categoryName: 'Electronics',
      isActive: true
    }
  ],
  categories: [
    {
      id: 'category-1',
      name: 'Electronics',
      description: 'Electronic products',
      isActive: true,
      productCount: 2
    }
  ],
  cart: {
    id: 'cart-1',
    userId: 'test-user-id',
    items: [],
    totalAmount: 0,
    totalItems: 0
  },
  cartWithItems: {
    id: 'cart-1',
    userId: 'test-user-id',
    items: [
      {
        id: 'cart-item-1',
        productId: 'product-1',
        productName: 'Test Product 1',
        productImage: 'https://via.placeholder.com/300',
        price: 29.99,
        quantity: 2,
        subTotal: 59.98
      }
    ],
    totalAmount: 59.98,
    totalItems: 2
  },
  addresses: [
    {
      id: 'address-1',
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
      userId: 'test-user-id',
      createdAt: '2023-01-01T00:00:00.000Z',
      fullName: 'Test User',
      fullAddress: '123 Test Street, Test City, Test State 12345, US'
    }
  ],
  order: {
    id: 'order-1',
    userId: 'test-user-id',
    totalAmount: 59.98,
    status: 1, // Pending
    customerEmail: 'test@example.com',
    customerName: 'Test User',
    addressId: 'address-1',
    shippingAddress: {
      id: 'address-1',
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
      userId: 'test-user-id',
      createdAt: '2023-01-01T00:00:00.000Z',
      fullName: 'Test User',
      fullAddress: '123 Test Street, Test City, Test State 12345, US'
    },
    createdAt: '2023-01-01T00:00:00.000Z',
    items: [
      {
        id: 'order-item-1',
        productId: 'product-1',
        productName: 'Test Product 1',
        quantity: 2,
        price: 29.99,
        subTotal: 59.98
      }
    ]
  },
  paymentResult: {
    isSuccess: true,
    transactionId: 'txn-123456',
    paymentReference: 'PAY_20230101_1234',
    status: 3, // Completed
    amount: 59.98,
    currency: 'USD',
    processedAt: '2023-01-01T00:00:00.000Z',
    providerResponse: {
      providerName: 'FakePaymentProvider',
      providerTransactionId: 'txn-123456',
      providerReference: 'PAY_REF_123456',
      additionalData: {
        processing_time_ms: 1500,
        fraud_score: 15.5
      }
    }
  }
};

// Mock axios
jest.mock('axios', () => ({
  create: () => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
}));

// Setup API mocks
const setupApiMocks = () => {
  const axios = require('axios');
  const mockApi = axios.create();

  // Auth endpoints
  mockApi.post.mockImplementation((url: string, data: any) => {
    if (url.includes('/auth/register')) {
      return Promise.resolve({ data: mockApiResponses.register });
    }
    if (url.includes('/auth/login')) {
      return Promise.resolve({ data: mockApiResponses.login });
    }
    if (url.includes('/cart/') && url.includes('/items')) {
      return Promise.resolve({ data: mockApiResponses.cartWithItems });
    }
    if (url.includes('/orders/')) {
      return Promise.resolve({ data: mockApiResponses.order });
    }
    if (url.includes('/payment/process')) {
      return Promise.resolve({ data: mockApiResponses.paymentResult });
    }
    if (url.includes('/address')) {
      return Promise.resolve({ data: mockApiResponses.addresses[0] });
    }
    return Promise.resolve({ data: {} });
  });

  mockApi.get.mockImplementation((url: string) => {
    if (url.includes('/products')) {
      return Promise.resolve({ data: mockApiResponses.products });
    }
    if (url.includes('/categories')) {
      return Promise.resolve({ data: mockApiResponses.categories });
    }
    if (url.includes('/cart/')) {
      return Promise.resolve({ data: mockApiResponses.cart });
    }
    if (url.includes('/address')) {
      return Promise.resolve({ data: mockApiResponses.addresses });
    }
    if (url.includes('/auth/me')) {
      return Promise.resolve({ data: mockApiResponses.login.user });
    }
    return Promise.resolve({ data: [] });
  });

  mockApi.put.mockImplementation(() => Promise.resolve({ data: mockApiResponses.cartWithItems }));
  mockApi.delete.mockImplementation(() => Promise.resolve({ data: mockApiResponses.cart }));
  mockApi.patch.mockImplementation(() => Promise.resolve({ data: {} }));

  return mockApi;
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

describe('Critical User Flow E2E Test', () => {
  const user = userEvent;

  beforeEach(() => {
    setupApiMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
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

  test('Complete user journey: Register → Login → Add to Cart → Checkout → Order', async () => {
    // Render the app
    render(<App />, { wrapper: TestWrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/welcome to our store/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // ==========================================
    // STEP 1: User Registration
    // ==========================================
    console.log('🔄 Step 1: Testing User Registration...');

    // Navigate to registration (assuming there's a register link/button)
    const registerButton = await screen.findByRole('button', { name: /register/i });
    await user.click(registerButton);

    // Wait for registration form
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Fill registration form
    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPassword123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'TestPassword123!');

    // Submit registration
    const submitRegisterButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitRegisterButton);

    // Wait for successful registration
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    console.log('✅ Step 1: User Registration completed successfully');

    // ==========================================
    // STEP 2: User Login
    // ==========================================
    console.log('🔄 Step 2: Testing User Login...');

    // Navigate to login
    const loginButton = await screen.findByRole('button', { name: /login/i });
    await user.click(loginButton);

    // Wait for login form
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Fill login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'TestPassword123!');

    // Submit login
    const submitLoginButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitLoginButton);

    // Wait for successful login
    await waitFor(() => {
      expect(screen.getByText(/test user/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    console.log('✅ Step 2: User Login completed successfully');

    // ==========================================
    // STEP 3: Browse Products and Add to Cart
    // ==========================================
    console.log('🔄 Step 3: Testing Add to Cart...');

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Find and click "Add to Cart" button for first product
    const productCards = screen.getAllByText('Test Product 1');
    const firstProductCard = productCards[0].closest('[data-testid="product-card"]') || 
                            productCards[0].closest('div');
    
    const addToCartButton = within(firstProductCard as HTMLElement)
      .getByRole('button', { name: /add to cart/i });
    
    await user.click(addToCartButton);

    // Wait for item to be added to cart
    await waitFor(() => {
      const cartIcon = screen.getByRole('button', { name: /cart/i });
      expect(cartIcon).toHaveTextContent('1'); // Cart count should be 1
    }, { timeout: 3000 });

    // Add another quantity
    await user.click(addToCartButton);

    await waitFor(() => {
      const cartIcon = screen.getByRole('button', { name: /cart/i });
      expect(cartIcon).toHaveTextContent('2'); // Cart count should be 2
    }, { timeout: 3000 });

    console.log('✅ Step 3: Add to Cart completed successfully');

    // ==========================================
    // STEP 4: Navigate to Cart and Review
    // ==========================================
    console.log('🔄 Step 4: Testing Cart Review...');

    // Click on cart icon
    const cartIcon = screen.getByRole('button', { name: /cart/i });
    await user.click(cartIcon);

    // Wait for cart page
    await waitFor(() => {
      expect(screen.getByText(/shopping cart/i)).toBeInTheDocument();
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText(/\$59\.98/)).toBeInTheDocument(); // Total amount
    }, { timeout: 3000 });

    console.log('✅ Step 4: Cart Review completed successfully');

    // ==========================================
    // STEP 5: Proceed to Checkout
    // ==========================================
    console.log('🔄 Step 5: Testing Checkout Process...');

    // Click checkout button
    const checkoutButton = screen.getByRole('button', { name: /checkout/i });
    await user.click(checkoutButton);

    // Wait for checkout page
    await waitFor(() => {
      expect(screen.getByText(/checkout/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Fill customer information (Step 1 of checkout)
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next.*shipping/i });
    await user.click(nextButton);

    // Wait for address selection (Step 2)
    await waitFor(() => {
      expect(screen.getByText(/shipping address/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Select address (assuming there's a default address)
    const addressOption = await screen.findByText(/123 test street/i);
    await user.click(addressOption);

    // Click Next to Payment
    const nextToPaymentButton = screen.getByRole('button', { name: /next.*payment/i });
    await user.click(nextToPaymentButton);

    console.log('✅ Step 5: Checkout Process completed successfully');

    // ==========================================
    // STEP 6: Payment Processing
    // ==========================================
    console.log('🔄 Step 6: Testing Payment Process...');

    // Wait for payment form (Step 3)
    await waitFor(() => {
      expect(screen.getByText(/payment information/i)).toBeInTheDocument();
      expect(screen.getByText(/\$59\.98/)).toBeInTheDocument(); // Payment amount
    }, { timeout: 3000 });

    // Fill payment form
    await user.type(screen.getByLabelText(/card number/i), '4111111111111111');
    await user.type(screen.getByLabelText(/card holder name/i), 'Test User');
    await user.selectOptions(screen.getByLabelText(/expiry month/i), '12');
    await user.selectOptions(screen.getByLabelText(/expiry year/i), '2025');
    await user.type(screen.getByLabelText(/cvv/i), '123');

    // Fill billing address
    await user.type(screen.getByLabelText(/first name/i), 'Test');
    await user.type(screen.getByLabelText(/last name/i), 'User');
    await user.type(screen.getByLabelText(/address line 1/i), '123 Test Street');
    await user.type(screen.getByLabelText(/city/i), 'Test City');
    await user.type(screen.getByLabelText(/state/i), 'Test State');
    await user.type(screen.getByLabelText(/postal code/i), '12345');

    // Submit payment form to go to review
    const processPaymentButton = screen.getByRole('button', { name: /process payment/i });
    await user.click(processPaymentButton);

    // Wait for review step (Step 4)
    await waitFor(() => {
      expect(screen.getByText(/review your order/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Final order submission
    const completeOrderButton = screen.getByRole('button', { name: /complete order.*pay/i });
    await user.click(completeOrderButton);

    console.log('✅ Step 6: Payment Process completed successfully');

    // ==========================================
    // STEP 7: Order Confirmation
    // ==========================================
    console.log('🔄 Step 7: Testing Order Confirmation...');

    // Wait for payment confirmation page
    await waitFor(() => {
      expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
      expect(screen.getByText(/txn-123456/)).toBeInTheDocument(); // Transaction ID
      expect(screen.getByText(/order.*confirmed/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    console.log('✅ Step 7: Order Confirmation completed successfully');

    // ==========================================
    // VERIFICATION: Final State Checks
    // ==========================================
    console.log('🔄 Final Verification: Checking final state...');

    // Verify payment details are displayed
    expect(screen.getByText(/\$59\.98/)).toBeInTheDocument();
    expect(screen.getByText(/USD/)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();

    // Verify order link is available
    const viewOrderButton = screen.getByRole('button', { name: /view order details/i });
    expect(viewOrderButton).toBeInTheDocument();

    console.log('✅ Final Verification: All checks passed');

    console.log('🎉 CRITICAL USER FLOW E2E TEST COMPLETED SUCCESSFULLY!');
  }, 60000); // 60 second timeout for the entire test

  test('Error handling: Failed payment scenario', async () => {
    console.log('🔄 Testing Error Handling: Failed Payment...');

    // Mock failed payment response
    const axios = require('axios');
    const mockApi = axios.create();
    mockApi.post.mockImplementation((url: string) => {
      if (url.includes('/payment/process')) {
        return Promise.resolve({
          data: {
            isSuccess: false,
            transactionId: 'txn-failed-123',
            paymentReference: 'PAY_FAILED_123',
            status: 4, // Failed
            amount: 59.98,
            currency: 'USD',
            processedAt: '2023-01-01T00:00:00.000Z',
            errorMessage: 'Card declined',
            errorCode: 'CARD_DECLINED'
          }
        });
      }
      return Promise.resolve({ data: mockApiResponses.login });
    });

    render(<App />, { wrapper: TestWrapper });

    // Fast-track to payment (assuming user is logged in and has items in cart)
    // This is a simplified test focusing on error handling
    
    await waitFor(() => {
      expect(screen.getByText(/welcome to our store/i)).toBeInTheDocument();
    });

    // Navigate to checkout (simplified)
    const checkoutButton = await screen.findByRole('button', { name: /checkout/i });
    await user.click(checkoutButton);

    // ... (skip intermediate steps for brevity in error test)

    // Submit payment with failed card
    await waitFor(() => {
      expect(screen.getByText(/payment information/i)).toBeInTheDocument();
    });

    const processPaymentButton = screen.getByRole('button', { name: /process payment/i });
    await user.click(processPaymentButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/card declined/i)).toBeInTheDocument();
      expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    console.log('✅ Error Handling: Failed payment scenario tested successfully');
  }, 30000);
});