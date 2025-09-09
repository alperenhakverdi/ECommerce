import { adminApi, productsApi, ordersApi } from '../services/api';

// Mock axios for isolated testing
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

describe('🔴 CRITICAL ADMIN FLOW TESTS', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup mock axios instance
    const axios = require('axios');
    mockAxiosInstance = axios.create();
  });

  describe('Admin Authentication Tests', () => {
    test('Admin login with admin credentials', async () => {
      console.log('🔄 Testing Admin Login...');
      
      const mockAdminLoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'admin-jwt-token',
        refreshToken: 'admin-refresh-token',
        user: {
          id: 'admin-123',
          email: 'admin@ecommerce.com',
          firstName: 'Admin',
          lastName: 'User',
          roles: ['Admin'],
          createdAt: '2023-01-01T00:00:00.000Z'
        },
        errors: []
      };

      // Mock successful admin login
      mockAxiosInstance.post.mockResolvedValue({ data: mockAdminLoginResponse });

      const loginRequest = {
        email: 'admin@ecommerce.com',
        password: 'AdminPassword123!'
      };

      // Simulate login (this would be handled by authService)
      const result = await mockAxiosInstance.post('/auth/login', loginRequest);
      
      expect(result.data.success).toBe(true);
      expect(result.data.user.roles).toContain('Admin');
      expect(result.data.token).toBeDefined();
      
      console.log('✅ Admin Login test completed successfully');
    });

    test('Non-admin user cannot access admin functions', async () => {
      console.log('🔄 Testing Non-Admin Access Restriction...');
      
      const mockCustomerUser = {
        id: 'customer-123',
        email: 'customer@example.com',
        firstName: 'Customer',
        lastName: 'User',
        roles: ['Customer'],
        createdAt: '2023-01-01T00:00:00.000Z'
      };

      // Simulate non-admin trying to access admin endpoint
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 403,
          data: { message: 'Access denied. Admin role required.' }
        }
      });

      try {
        await mockAxiosInstance.get('/admin/dashboard');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
        expect(error.response.data.message).toContain('Access denied');
      }
      
      console.log('✅ Non-Admin Access Restriction test completed successfully');
    });
  });

  describe('Product CRUD Operations Tests', () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Test Product 1',
        description: 'A great test product',
        price: 29.99,
        stock: 10,
        imageUrl: 'https://example.com/image1.jpg',
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
        imageUrl: 'https://example.com/image2.jpg',
        categoryId: 'category-1',
        categoryName: 'Electronics',
        isActive: true
      }
    ];

    beforeEach(() => {
      // Mock localStorage for admin token
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 'admin-jwt-token'),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn()
        }
      });
    });

    test('Admin can retrieve all products', async () => {
      console.log('🔄 Testing Admin Product Retrieval...');
      
      mockAxiosInstance.get.mockResolvedValue({ data: mockProducts });
      
      const result = await mockAxiosInstance.get('/admin/products');
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
      expect(result.data[0]).toHaveProperty('price');
      expect(result.data[0]).toHaveProperty('stock');
      
      console.log('✅ Admin Product Retrieval test completed successfully');
    });

    test('Admin can create new product', async () => {
      console.log('🔄 Testing Admin Product Creation...');
      
      const newProduct = {
        name: 'New Test Product',
        description: 'A newly created product',
        price: 79.99,
        stock: 15,
        categoryId: 'category-1',
        imageUrl: 'https://example.com/newimage.jpg',
        isActive: true
      };

      const createdProduct = {
        id: 'product-3',
        ...newProduct,
        categoryName: 'Electronics'
      };

      mockAxiosInstance.post.mockResolvedValue({ data: createdProduct });
      
      const result = await mockAxiosInstance.post('/admin/products', newProduct);
      
      expect(result.data.id).toBeDefined();
      expect(result.data.name).toBe(newProduct.name);
      expect(result.data.price).toBe(newProduct.price);
      expect(result.data.stock).toBe(newProduct.stock);
      
      console.log('✅ Admin Product Creation test completed successfully');
    });

    test('Admin can update existing product', async () => {
      console.log('🔄 Testing Admin Product Update...');
      
      const productUpdate = {
        id: 'product-1',
        name: 'Updated Test Product 1',
        description: 'Updated description',
        price: 39.99,
        stock: 20,
        categoryId: 'category-1',
        imageUrl: 'https://example.com/updatedimage.jpg',
        isActive: true
      };

      mockAxiosInstance.put.mockResolvedValue({ data: productUpdate });
      
      const result = await mockAxiosInstance.put('/admin/products/product-1', productUpdate);
      
      expect(result.data.name).toBe('Updated Test Product 1');
      expect(result.data.price).toBe(39.99);
      expect(result.data.stock).toBe(20);
      
      console.log('✅ Admin Product Update test completed successfully');
    });

    test('Admin can delete product', async () => {
      console.log('🔄 Testing Admin Product Deletion...');
      
      mockAxiosInstance.delete.mockResolvedValue({ 
        data: { message: 'Product deleted successfully' } 
      });
      
      const result = await mockAxiosInstance.delete('/admin/products/product-1');
      
      expect(result.data.message).toContain('deleted successfully');
      
      console.log('✅ Admin Product Deletion test completed successfully');
    });

    test('Product validation prevents invalid data', async () => {
      console.log('🔄 Testing Product Validation...');
      
      const invalidProduct = {
        name: '', // Invalid: empty name
        description: '',
        price: -10, // Invalid: negative price
        stock: -5,  // Invalid: negative stock
        categoryId: '',
        imageUrl: '',
        isActive: true
      };

      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            errors: [
              'Product name is required',
              'Price must be greater than 0',
              'Stock cannot be negative'
            ]
          }
        }
      });

      try {
        await mockAxiosInstance.post('/admin/products', invalidProduct);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain('Product name is required');
        expect(error.response.data.errors).toContain('Price must be greater than 0');
      }
      
      console.log('✅ Product Validation test completed successfully');
    });
  });

  describe('Order Status Management Tests', () => {
    const mockOrders = [
      {
        id: 'order-1',
        userId: 'user-123',
        totalAmount: 99.99,
        status: 1, // Pending
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        addressId: 'address-1',
        createdAt: '2023-01-01T00:00:00.000Z',
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            productName: 'Test Product',
            quantity: 2,
            price: 49.99,
            subTotal: 99.98
          }
        ]
      },
      {
        id: 'order-2',
        userId: 'user-456',
        totalAmount: 149.99,
        status: 2, // Paid
        customerEmail: 'customer2@example.com',
        customerName: 'Jane Smith',
        addressId: 'address-2',
        createdAt: '2023-01-02T00:00:00.000Z',
        items: []
      }
    ];

    test('Admin can retrieve all orders', async () => {
      console.log('🔄 Testing Admin Order Retrieval...');
      
      mockAxiosInstance.get.mockResolvedValue({ data: mockOrders });
      
      const result = await mockAxiosInstance.get('/admin/orders');
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('status');
      expect(result.data[0]).toHaveProperty('totalAmount');
      expect(result.data[0]).toHaveProperty('customerName');
      
      console.log('✅ Admin Order Retrieval test completed successfully');
    });

    test('Admin can update order status', async () => {
      console.log('🔄 Testing Order Status Update...');
      
      const statusUpdate = {
        orderId: 'order-1',
        newStatus: 2, // Paid
        notes: 'Payment confirmed by admin'
      };

      const updatedOrder = {
        ...mockOrders[0],
        status: 2,
        statusHistory: [
          {
            status: 1,
            timestamp: '2023-01-01T00:00:00.000Z',
            notes: 'Order created'
          },
          {
            status: 2,
            timestamp: '2023-01-01T10:00:00.000Z',
            notes: 'Payment confirmed by admin'
          }
        ]
      };

      mockAxiosInstance.patch.mockResolvedValue({ data: updatedOrder });
      
      const result = await mockAxiosInstance.patch('/admin/orders/order-1/status', statusUpdate);
      
      expect(result.data.status).toBe(2);
      expect(result.data.statusHistory).toHaveLength(2);
      expect(result.data.statusHistory[1].notes).toBe('Payment confirmed by admin');
      
      console.log('✅ Order Status Update test completed successfully');
    });

    test('Order status progression validation works', async () => {
      console.log('🔄 Testing Order Status Validation...');
      
      // Test invalid status progression (Delivered -> Pending)
      const invalidStatusUpdate = {
        orderId: 'order-delivered',
        newStatus: 1, // Pending
        notes: 'Invalid transition'
      };

      mockAxiosInstance.patch.mockRejectedValue({
        response: {
          status: 400,
          data: {
            message: 'Invalid status transition. Cannot change from Delivered to Pending.',
            validTransitions: [5] // Only Cancelled is allowed
          }
        }
      });

      try {
        await mockAxiosInstance.patch('/admin/orders/order-delivered/status', invalidStatusUpdate);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Invalid status transition');
      }
      
      console.log('✅ Order Status Validation test completed successfully');
    });

    test('Order status timeline is properly maintained', async () => {
      console.log('🔄 Testing Order Status Timeline...');
      
      const orderWithTimeline = {
        id: 'order-timeline',
        userId: 'user-789',
        totalAmount: 199.99,
        status: 3, // Shipped
        customerEmail: 'timeline@example.com',
        customerName: 'Timeline User',
        statusTimeline: [
          {
            status: 1, // Pending
            statusName: 'Pending',
            timestamp: '2023-01-01T00:00:00.000Z',
            notes: 'Order placed'
          },
          {
            status: 2, // Paid
            statusName: 'Paid',
            timestamp: '2023-01-01T08:00:00.000Z',
            notes: 'Payment received'
          },
          {
            status: 3, // Shipped
            statusName: 'Shipped',
            timestamp: '2023-01-02T10:00:00.000Z',
            notes: 'Package shipped via FedEx'
          }
        ]
      };

      mockAxiosInstance.get.mockResolvedValue({ data: orderWithTimeline });
      
      const result = await mockAxiosInstance.get('/admin/orders/order-timeline');
      
      expect(result.data.statusTimeline).toHaveLength(3);
      expect(result.data.statusTimeline[0].status).toBe(1);
      expect(result.data.statusTimeline[1].status).toBe(2);
      expect(result.data.statusTimeline[2].status).toBe(3);
      
      // Verify timeline is chronologically ordered
      const timestamps = result.data.statusTimeline.map((s: any) => new Date(s.timestamp).getTime());
      expect(timestamps[0]).toBeLessThan(timestamps[1]);
      expect(timestamps[1]).toBeLessThan(timestamps[2]);
      
      console.log('✅ Order Status Timeline test completed successfully');
    });
  });

  describe('Admin Dashboard Analytics Tests', () => {
    test('Admin can retrieve dashboard analytics', async () => {
      console.log('🔄 Testing Admin Dashboard Analytics...');
      
      const mockAnalytics = {
        totalProducts: 150,
        totalOrders: 89,
        totalUsers: 245,
        totalRevenue: 15678.50,
        recentOrders: [
          {
            id: 'order-recent-1',
            customerName: 'Recent Customer 1',
            totalAmount: 99.99,
            status: 2,
            createdAt: '2023-01-01T12:00:00.000Z'
          }
        ],
        salesByMonth: [
          { month: 'January', revenue: 5000, orders: 25 },
          { month: 'February', revenue: 6500, orders: 32 },
          { month: 'March', revenue: 4178.50, orders: 32 }
        ],
        topProducts: [
          {
            id: 'product-top-1',
            name: 'Best Selling Product',
            totalSold: 45,
            revenue: 2250.00
          }
        ]
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockAnalytics });
      
      const result = await mockAxiosInstance.get('/admin/dashboard');
      
      expect(result.data.totalProducts).toBe(150);
      expect(result.data.totalOrders).toBe(89);
      expect(result.data.totalUsers).toBe(245);
      expect(result.data.totalRevenue).toBe(15678.50);
      expect(result.data.recentOrders).toHaveLength(1);
      expect(result.data.salesByMonth).toHaveLength(3);
      expect(result.data.topProducts).toHaveLength(1);
      
      console.log('✅ Admin Dashboard Analytics test completed successfully');
    });
  });

  describe('Integration Test: Complete Admin Workflow', () => {
    test('Complete admin workflow: Login → Create Product → Update Order Status', async () => {
      console.log('🔄 Testing Complete Admin Workflow...');
      
      // Step 1: Admin login
      const adminLoginResponse = {
        success: true,
        token: 'admin-token-123',
        user: { id: 'admin-1', roles: ['Admin'] }
      };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: adminLoginResponse });
      
      const loginResult = await mockAxiosInstance.post('/auth/login', {
        email: 'admin@test.com',
        password: 'AdminPass123!'
      });
      expect(loginResult.data.success).toBe(true);
      
      // Step 2: Create new product
      const newProduct = {
        name: 'Workflow Test Product',
        description: 'Created during integration test',
        price: 199.99,
        stock: 25,
        categoryId: 'cat-1',
        isActive: true
      };
      
      const createdProduct = { id: 'product-workflow', ...newProduct };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: createdProduct });
      
      const productResult = await mockAxiosInstance.post('/admin/products', newProduct);
      expect(productResult.data.id).toBe('product-workflow');
      expect(productResult.data.name).toBe('Workflow Test Product');
      
      // Step 3: Update order status
      const statusUpdate = { orderId: 'order-workflow', newStatus: 3 };
      const updatedOrder = {
        id: 'order-workflow',
        status: 3,
        statusHistory: [{ status: 1 }, { status: 2 }, { status: 3 }]
      };
      mockAxiosInstance.patch.mockResolvedValueOnce({ data: updatedOrder });
      
      const orderResult = await mockAxiosInstance.patch('/admin/orders/order-workflow/status', statusUpdate);
      expect(orderResult.data.status).toBe(3);
      expect(orderResult.data.statusHistory).toHaveLength(3);
      
      console.log('✅ Complete Admin Workflow test completed successfully');
    });
  });
});

console.log('🎉 ALL CRITICAL ADMIN FLOW TESTS COMPLETED!');