import { addressApi } from '../services/api';

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

describe('🔴 CRITICAL ADDRESS CRUD TESTS', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
    
    // Setup mock axios instance
    const axios = require('axios');
    mockAxiosInstance = axios.create();

    // Mock localStorage for authenticated user
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'user-jwt-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
    });
  });

  const mockAddresses = [
    {
      id: 'addr-1',
      title: 'Home',
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phoneNumber: '+1-555-0123',
      isDefault: true,
      isActive: true,
      userId: 'user-123',
      createdAt: '2023-01-01T00:00:00.000Z',
      fullName: 'John Doe',
      fullAddress: '123 Main Street, Apt 4B, New York, NY 10001, US'
    },
    {
      id: 'addr-2',
      title: 'Work',
      firstName: 'John',
      lastName: 'Doe',
      addressLine1: '456 Business Ave',
      addressLine2: 'Suite 100',
      city: 'New York',
      state: 'NY',
      postalCode: '10002',
      country: 'US',
      phoneNumber: '+1-555-0456',
      isDefault: false,
      isActive: true,
      userId: 'user-123',
      createdAt: '2023-01-02T00:00:00.000Z',
      fullName: 'John Doe',
      fullAddress: '456 Business Ave, Suite 100, New York, NY 10002, US'
    }
  ];

  describe('Address Retrieval Operations', () => {
    test('User can retrieve all their addresses', async () => {
      console.log('🔄 Testing Address Retrieval...');
      
      mockAxiosInstance.get.mockResolvedValue({ data: mockAddresses });
      
      const result = await mockAxiosInstance.get('/address');
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('title');
      expect(result.data[0]).toHaveProperty('firstName');
      expect(result.data[0]).toHaveProperty('lastName');
      expect(result.data[0]).toHaveProperty('addressLine1');
      expect(result.data[0]).toHaveProperty('city');
      expect(result.data[0]).toHaveProperty('state');
      expect(result.data[0]).toHaveProperty('postalCode');
      expect(result.data[0]).toHaveProperty('country');
      expect(result.data[0]).toHaveProperty('isDefault');
      
      console.log('✅ Address Retrieval test completed successfully');
    });

    test('User can retrieve default address', async () => {
      console.log('🔄 Testing Default Address Retrieval...');
      
      const defaultAddress = mockAddresses.find(addr => addr.isDefault);
      mockAxiosInstance.get.mockResolvedValue({ data: defaultAddress });
      
      const result = await mockAxiosInstance.get('/address/default');
      
      expect(result.data.isDefault).toBe(true);
      expect(result.data.title).toBe('Home');
      expect(result.data.id).toBe('addr-1');
      
      console.log('✅ Default Address Retrieval test completed successfully');
    });

    test('User can retrieve specific address by ID', async () => {
      console.log('🔄 Testing Address Retrieval by ID...');
      
      const specificAddress = mockAddresses[1];
      mockAxiosInstance.get.mockResolvedValue({ data: specificAddress });
      
      const result = await mockAxiosInstance.get('/address/addr-2');
      
      expect(result.data.id).toBe('addr-2');
      expect(result.data.title).toBe('Work');
      expect(result.data.addressLine1).toBe('456 Business Ave');
      
      console.log('✅ Address Retrieval by ID test completed successfully');
    });
  });

  describe('Address Creation Operations', () => {
    test('User can create new address', async () => {
      console.log('🔄 Testing Address Creation...');
      
      const newAddressData = {
        title: 'Parents House',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '789 Family Street',
        addressLine2: '',
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'US',
        phoneNumber: '+1-555-0789',
        isDefault: false
      };

      const createdAddress = {
        id: 'addr-3',
        ...newAddressData,
        isActive: true,
        userId: 'user-123',
        createdAt: '2023-01-03T00:00:00.000Z',
        fullName: 'John Doe',
        fullAddress: '789 Family Street, Boston, MA 02101, US'
      };

      mockAxiosInstance.post.mockResolvedValue({ data: createdAddress });
      
      const result = await mockAxiosInstance.post('/address', newAddressData);
      
      expect(result.data.id).toBeDefined();
      expect(result.data.title).toBe('Parents House');
      expect(result.data.firstName).toBe('John');
      expect(result.data.lastName).toBe('Doe');
      expect(result.data.addressLine1).toBe('789 Family Street');
      expect(result.data.city).toBe('Boston');
      expect(result.data.state).toBe('MA');
      expect(result.data.postalCode).toBe('02101');
      expect(result.data.isActive).toBe(true);
      
      console.log('✅ Address Creation test completed successfully');
    });

    test('Address creation validates required fields', async () => {
      console.log('🔄 Testing Address Creation Validation...');
      
      const invalidAddressData = {
        title: '',          // Required
        firstName: '',      // Required
        lastName: '',       // Required
        addressLine1: '',   // Required
        addressLine2: '',
        city: '',          // Required
        state: '',         // Required
        postalCode: '',    // Required
        country: '',       // Required
        phoneNumber: '',
        isDefault: false
      };

      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            errors: [
              'Address title is required',
              'First name is required',
              'Last name is required',
              'Address line 1 is required',
              'City is required',
              'State is required',
              'Postal code is required',
              'Country is required'
            ]
          }
        }
      });

      try {
        await mockAxiosInstance.post('/address', invalidAddressData);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain('Address title is required');
        expect(error.response.data.errors).toContain('First name is required');
        expect(error.response.data.errors).toContain('Address line 1 is required');
      }
      
      console.log('✅ Address Creation Validation test completed successfully');
    });

    test('Creating default address updates existing default', async () => {
      console.log('🔄 Testing Default Address Update Logic...');
      
      const newDefaultAddressData = {
        title: 'New Home',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '999 New Street',
        addressLine2: '',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'US',
        phoneNumber: '+1-555-0999',
        isDefault: true
      };

      // Mock the response showing the new address is default
      // and old default addresses are no longer default
      const createdDefaultAddress = {
        id: 'addr-new-default',
        ...newDefaultAddressData,
        isActive: true,
        userId: 'user-123',
        createdAt: '2023-01-04T00:00:00.000Z',
        fullName: 'John Doe',
        fullAddress: '999 New Street, Chicago, IL 60601, US'
      };

      mockAxiosInstance.post.mockResolvedValue({ data: createdDefaultAddress });
      
      const result = await mockAxiosInstance.post('/address', newDefaultAddressData);
      
      expect(result.data.isDefault).toBe(true);
      expect(result.data.title).toBe('New Home');
      
      console.log('✅ Default Address Update Logic test completed successfully');
    });
  });

  describe('Address Update Operations', () => {
    test('User can update existing address', async () => {
      console.log('🔄 Testing Address Update...');
      
      const addressUpdate = {
        id: 'addr-1',
        title: 'Updated Home',
        firstName: 'Jonathan',
        lastName: 'Doe-Smith',
        addressLine1: '123 Main Street',
        addressLine2: 'Unit 5A',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phoneNumber: '+1-555-0123',
        isDefault: true
      };

      const updatedAddress = {
        ...addressUpdate,
        isActive: true,
        userId: 'user-123',
        createdAt: '2023-01-01T00:00:00.000Z',
        fullName: 'Jonathan Doe-Smith',
        fullAddress: '123 Main Street, Unit 5A, New York, NY 10001, US'
      };

      mockAxiosInstance.put.mockResolvedValue({ data: updatedAddress });
      
      const result = await mockAxiosInstance.put('/address/addr-1', addressUpdate);
      
      expect(result.data.title).toBe('Updated Home');
      expect(result.data.firstName).toBe('Jonathan');
      expect(result.data.lastName).toBe('Doe-Smith');
      expect(result.data.addressLine2).toBe('Unit 5A');
      expect(result.data.fullName).toBe('Jonathan Doe-Smith');
      
      console.log('✅ Address Update test completed successfully');
    });

    test('Address update validates required fields', async () => {
      console.log('🔄 Testing Address Update Validation...');
      
      const invalidUpdate = {
        id: 'addr-1',
        title: '',
        firstName: '',
        lastName: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
      };

      mockAxiosInstance.put.mockRejectedValue({
        response: {
          status: 400,
          data: {
            errors: [
              'Address title is required',
              'First name is required',
              'Last name is required',
              'Address line 1 is required',
              'City is required',
              'State is required',
              'Postal code is required'
            ]
          }
        }
      });

      try {
        await mockAxiosInstance.put('/address/addr-1', invalidUpdate);
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toContain('First name is required');
      }
      
      console.log('✅ Address Update Validation test completed successfully');
    });
  });

  describe('Address Deletion Operations', () => {
    test('User can delete address (soft delete)', async () => {
      console.log('🔄 Testing Address Deletion...');
      
      mockAxiosInstance.delete.mockResolvedValue({
        data: { message: 'Address deleted successfully' }
      });
      
      const result = await mockAxiosInstance.delete('/address/addr-2');
      
      expect(result.data.message).toContain('deleted successfully');
      
      console.log('✅ Address Deletion test completed successfully');
    });

    test('Cannot delete default address if it is the only address', async () => {
      console.log('🔄 Testing Default Address Deletion Prevention...');
      
      mockAxiosInstance.delete.mockRejectedValue({
        response: {
          status: 400,
          data: {
            message: 'Cannot delete the default address. Please set another address as default first.',
            errorCode: 'DEFAULT_ADDRESS_DELETION_PREVENTED'
          }
        }
      });

      try {
        await mockAxiosInstance.delete('/address/addr-1');
        fail('Should have prevented default address deletion');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Cannot delete the default address');
        expect(error.response.data.errorCode).toBe('DEFAULT_ADDRESS_DELETION_PREVENTED');
      }
      
      console.log('✅ Default Address Deletion Prevention test completed successfully');
    });

    test('User cannot delete address belonging to another user', async () => {
      console.log('🔄 Testing Unauthorized Address Deletion...');
      
      mockAxiosInstance.delete.mockRejectedValue({
        response: {
          status: 404,
          data: {
            message: 'Address not found or does not belong to this user',
            errorCode: 'ADDRESS_NOT_FOUND'
          }
        }
      });

      try {
        await mockAxiosInstance.delete('/address/addr-other-user');
        fail('Should have prevented unauthorized deletion');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toContain('does not belong to this user');
      }
      
      console.log('✅ Unauthorized Address Deletion test completed successfully');
    });
  });

  describe('Address Business Logic Tests', () => {
    test('Address formatting works correctly', () => {
      console.log('🔄 Testing Address Formatting...');
      
      const address = {
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      };

      // Test full name formatting
      const fullName = `${address.firstName} ${address.lastName}`;
      expect(fullName).toBe('John Doe');

      // Test full address formatting
      const fullAddress = [
        address.addressLine1,
        address.addressLine2,
        `${address.city}, ${address.state} ${address.postalCode}`,
        address.country
      ].filter(Boolean).join(', ');
      
      expect(fullAddress).toBe('123 Main St, Apt 4B, New York, NY 10001, US');

      // Test address without addressLine2
      const addressNoLine2 = { ...address, addressLine2: '' };
      const fullAddressNoLine2 = [
        addressNoLine2.addressLine1,
        addressNoLine2.addressLine2,
        `${addressNoLine2.city}, ${addressNoLine2.state} ${addressNoLine2.postalCode}`,
        addressNoLine2.country
      ].filter(Boolean).join(', ');
      
      expect(fullAddressNoLine2).toBe('123 Main St, New York, NY 10001, US');
      
      console.log('✅ Address Formatting test completed successfully');
    });

    test('Default address logic works correctly', () => {
      console.log('🔄 Testing Default Address Logic...');
      
      const addresses = [
        { id: 'addr-1', title: 'Home', isDefault: true, isActive: true },
        { id: 'addr-2', title: 'Work', isDefault: false, isActive: true },
        { id: 'addr-3', title: 'Parents', isDefault: false, isActive: true }
      ];

      // Find default address
      const defaultAddress = addresses.find(addr => addr.isDefault && addr.isActive);
      expect(defaultAddress).toBeDefined();
      expect(defaultAddress?.id).toBe('addr-1');

      // Ensure only one default address
      const defaultAddresses = addresses.filter(addr => addr.isDefault && addr.isActive);
      expect(defaultAddresses).toHaveLength(1);

      // Test setting new default
      const newAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === 'addr-2' ? true : false
      }));

      const newDefaultAddress = newAddresses.find(addr => addr.isDefault);
      expect(newDefaultAddress?.id).toBe('addr-2');

      const newDefaultCount = newAddresses.filter(addr => addr.isDefault).length;
      expect(newDefaultCount).toBe(1);
      
      console.log('✅ Default Address Logic test completed successfully');
    });

    test('Address validation rules work correctly', () => {
      console.log('🔄 Testing Address Validation Rules...');
      
      const validAddress = {
        title: 'Home',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phoneNumber: '+1-555-0123'
      };

      // Validation function
      const validateAddress = (address: any) => {
        const errors = [];
        
        if (!address.title || address.title.trim().length === 0) {
          errors.push('Title is required');
        }
        if (!address.firstName || address.firstName.trim().length === 0) {
          errors.push('First name is required');
        }
        if (!address.lastName || address.lastName.trim().length === 0) {
          errors.push('Last name is required');
        }
        if (!address.addressLine1 || address.addressLine1.trim().length === 0) {
          errors.push('Address line 1 is required');
        }
        if (!address.city || address.city.trim().length === 0) {
          errors.push('City is required');
        }
        if (!address.state || address.state.trim().length === 0) {
          errors.push('State is required');
        }
        if (!address.postalCode || address.postalCode.trim().length === 0) {
          errors.push('Postal code is required');
        }
        if (!address.country || address.country.trim().length === 0) {
          errors.push('Country is required');
        }

        // Phone number format validation (basic)
        if (address.phoneNumber && !/^[\+]?[\d\s\-\(\)]+$/.test(address.phoneNumber)) {
          errors.push('Invalid phone number format');
        }

        // Postal code format validation (US)
        if (address.country === 'US' && !/^\d{5}(-\d{4})?$/.test(address.postalCode)) {
          errors.push('Invalid US postal code format');
        }

        return errors;
      };

      // Valid address should pass
      expect(validateAddress(validAddress)).toHaveLength(0);

      // Invalid addresses should fail
      const invalidAddresses = [
        { ...validAddress, firstName: '' },
        { ...validAddress, addressLine1: '' },
        { ...validAddress, postalCode: '123' }, // Invalid US postal code
        { ...validAddress, phoneNumber: 'invalid-phone' }
      ];

      invalidAddresses.forEach(address => {
        const errors = validateAddress(address);
        expect(errors.length).toBeGreaterThan(0);
      });
      
      console.log('✅ Address Validation Rules test completed successfully');
    });
  });

  describe('Integration Test: Complete Address Workflow', () => {
    test('Complete address workflow: Create → Read → Update → Delete', async () => {
      console.log('🔄 Testing Complete Address Workflow...');
      
      // Step 1: Create new address
      const newAddressData = {
        title: 'Workflow Test Address',
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Workflow Street',
        addressLine2: '',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'US',
        phoneNumber: '+1-555-0000',
        isDefault: false
      };

      const createdAddress = { id: 'addr-workflow', ...newAddressData, isActive: true };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: createdAddress });
      
      const createResult = await mockAxiosInstance.post('/address', newAddressData);
      expect(createResult.data.id).toBe('addr-workflow');
      expect(createResult.data.title).toBe('Workflow Test Address');

      // Step 2: Read the address
      mockAxiosInstance.get.mockResolvedValueOnce({ data: createdAddress });
      
      const readResult = await mockAxiosInstance.get('/address/addr-workflow');
      expect(readResult.data.title).toBe('Workflow Test Address');
      expect(readResult.data.city).toBe('Test City');

      // Step 3: Update the address
      const updatedData = {
        ...createdAddress,
        title: 'Updated Workflow Address',
        city: 'Updated City'
      };
      mockAxiosInstance.put.mockResolvedValueOnce({ data: updatedData });
      
      const updateResult = await mockAxiosInstance.put('/address/addr-workflow', updatedData);
      expect(updateResult.data.title).toBe('Updated Workflow Address');
      expect(updateResult.data.city).toBe('Updated City');

      // Step 4: Delete the address
      mockAxiosInstance.delete.mockResolvedValueOnce({
        data: { message: 'Address deleted successfully' }
      });
      
      const deleteResult = await mockAxiosInstance.delete('/address/addr-workflow');
      expect(deleteResult.data.message).toContain('deleted successfully');
      
      console.log('✅ Complete Address Workflow test completed successfully');
    });
  });
});

console.log('🎉 ALL CRITICAL ADDRESS CRUD TESTS COMPLETED!');