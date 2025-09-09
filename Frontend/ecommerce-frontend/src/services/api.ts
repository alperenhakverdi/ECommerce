import axios from 'axios';
import { Product, Category, Cart, Order, AddToCartRequest, CreateOrderRequest, Address, CreateAddressRequest, UpdateAddressRequest, SavedCard, CreateSavedCardRequest, UpdateSavedCardRequest, Store, CreateStoreRequest, UpdateStoreRequest, StoreStats, StoreApplicationRequest, Wishlist, AddToWishlistRequest, RemoveFromWishlistRequest, Review, CreateReviewRequest, UpdateReviewRequest, ProductReviewStats, ProductSearchRequest, ProductSearchResponse, Banner, RecentlyViewedItem } from '../types';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5133/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshSuccess = await authService.refreshToken();
        
        if (refreshSuccess) {
          // Retry the original request with new token
          const token = authService.getToken();
          if (token) {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        authService.logout();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }

      // If refresh failed, logout and redirect
      authService.logout();
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

// Products API
export const productsApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  getByCategory: (categoryId: string) => api.get<Product[]>(`/products/category/${categoryId}`),
  search: (query: string) => api.get<Product[]>(`/products/search?query=${encodeURIComponent(query)}`),
  
  // Advanced search with filters
  searchAdvanced: (searchRequest: ProductSearchRequest) => {
    const params = new URLSearchParams();
    
    if (searchRequest.searchTerm) params.append('searchTerm', searchRequest.searchTerm);
    if (searchRequest.categoryId) params.append('categoryId', searchRequest.categoryId);
    if (searchRequest.minPrice !== undefined) params.append('minPrice', searchRequest.minPrice.toString());
    if (searchRequest.maxPrice !== undefined) params.append('maxPrice', searchRequest.maxPrice.toString());
    if (searchRequest.inStockOnly !== undefined) params.append('inStockOnly', searchRequest.inStockOnly.toString());
    if (searchRequest.page) params.append('page', searchRequest.page.toString());
    if (searchRequest.pageSize) params.append('pageSize', searchRequest.pageSize.toString());
    if (searchRequest.sortBy) params.append('sortBy', searchRequest.sortBy);
    if (searchRequest.sortDirection) params.append('sortDirection', searchRequest.sortDirection);
    
    return api.get<ProductSearchResponse>(`/products/search/advanced?${params.toString()}`);
  },
  
  // Get search filters metadata
  getSearchFilters: () => api.get<{
    categories: Category[];
    priceRange: { min: number; max: number };
    availableStores: Store[];
  }>('/products/search/filters'),
  
  // Admin operations
  create: (product: any) => api.post<Product>('/products', product),
  update: (id: string, product: any) => api.put<Product>(`/products/${id}`, product),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
};

// Cart API
export const cartApi = {
  get: (userId: string) => api.get<Cart>(`/cart/${userId}`),
  addItem: (userId: string, item: AddToCartRequest) => 
    api.post<Cart>(`/cart/${userId}/items`, item),
  updateItem: (userId: string, cartItemId: string, quantity: number) => 
    api.put<Cart>(`/cart/${userId}/items/${cartItemId}`, { quantity }),
  removeItem: (userId: string, cartItemId: string) => 
    api.delete(`/cart/${userId}/items/${cartItemId}`),
  clear: (userId: string) => api.delete(`/cart/${userId}`),
};

// Orders API
export const ordersApi = {
  create: (userId: string, order: CreateOrderRequest) => 
    api.post<Order>(`/orders/${userId}`, order),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  getUserOrders: (userId: string) => api.get<Order[]>(`/orders/user/${userId}`),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// Address API (Requires Authentication)
export const addressApi = {
  // Get all user addresses
  getAll: () => api.get<Address[]>('/address'),
  
  // Get address by ID
  getById: (id: string) => api.get<Address>(`/address/${id}`),
  
  // Get default address
  getDefault: () => api.get<Address>('/address/default'),
  
  // Create new address
  create: (address: CreateAddressRequest) => api.post<Address>('/address', address),
  
  // Update existing address
  update: (id: string, address: UpdateAddressRequest) => 
    api.put<Address>(`/address/${id}`, address),
  
  // Delete address (soft delete)
  delete: (id: string) => api.delete(`/address/${id}`),
  
  // Set address as default
  setDefault: (id: string) => api.patch(`/address/${id}/set-default`),
};

// Admin API (Requires Admin Role)
export const adminApi = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // All orders with pagination
  getAllOrders: (page: number = 1, pageSize: number = 20) => 
    api.get(`/admin/orders?page=${page}&pageSize=${pageSize}`),
  
  // Update order status
  updateOrderStatus: (orderId: string, status: number) => 
    api.patch(`/admin/orders/${orderId}/status`, { status }),
  
  // Analytics overview
  getAnalyticsOverview: () => api.get('/admin/analytics/overview'),
  
  // User management
  getAllUsers: (page: number = 1, pageSize: number = 20) => 
    api.get(`/admin/users?page=${page}&pageSize=${pageSize}`),
  
  // Role management
  getAllRoles: () => api.get('/admin/roles'),
  assignRole: (userId: string, roleName: string) => 
    api.post(`/admin/users/${userId}/roles`, { roleName }),
  removeRole: (userId: string, roleName: string) => 
    api.delete(`/admin/users/${userId}/roles/${roleName}`),
  
  // User lock/unlock
  lockUser: (userId: string, lockoutMinutes: number = 0) => 
    api.post(`/admin/users/${userId}/lock`, { lockoutMinutes }),
  unlockUser: (userId: string) => 
    api.post(`/admin/users/${userId}/unlock`),
    
  // Store management
  getPendingStoreApprovals: () => api.get<Store[]>('/admin/stores/pending'),
  getAllStores: () => api.get<{
    stores: Store[];
    totalStores: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  }>('/admin/stores'),
  approveStore: (storeId: string) => api.post(`/admin/stores/${storeId}/approve`),
  rejectStore: (storeId: string, reason: string) => 
    api.post(`/admin/stores/${storeId}/reject`, { reason }),
  suspendStore: (storeId: string, reason: string) => 
    api.post(`/admin/stores/${storeId}/suspend`, { reason }),
  activateStore: (storeId: string) => api.post(`/admin/stores/${storeId}/activate`),
};


// Saved Cards API (Requires Authentication)
export const savedCardsApi = {
  // Get all user saved cards
  getAll: () => api.get<SavedCard[]>('/savedcards'),
  
  // Get saved card by ID
  getById: (id: string) => api.get<SavedCard>(`/savedcards/${id}`),
  
  // Create new saved card
  create: (card: CreateSavedCardRequest) => api.post<SavedCard>('/savedcards', card),
  
  // Update existing saved card
  update: (id: string, card: UpdateSavedCardRequest) => 
    api.put<SavedCard>(`/savedcards/${id}`, card),
  
  // Delete saved card (soft delete)
  delete: (id: string) => api.delete(`/savedcards/${id}`),
  
  // Set saved card as default
  setDefault: (id: string) => api.patch(`/savedcards/${id}/set-default`),
};

// Stores API
export const storesApi = {
  // Public endpoints
  getAll: (page?: number, pageSize?: number) => 
    api.get<Store[]>(`/stores${page ? `?page=${page}&pageSize=${pageSize || 20}` : ''}`),
  getById: (id: string) => api.get<Store>(`/stores/${id}`),
  getApproved: () => api.get<Store[]>('/stores/approved'),
  search: (query: string, page?: number, pageSize?: number) => 
    api.get<Store[]>(`/stores/search?query=${encodeURIComponent(query)}${page ? `&page=${page}&pageSize=${pageSize || 20}` : ''}`),
  
  // Store owner endpoints (requires authentication)
  getMyStores: () => api.get<Store[]>('/stores/my-stores'),
  create: (store: CreateStoreRequest) => api.post<Store>('/stores', store),
  update: (id: string, store: UpdateStoreRequest) => 
    api.put<Store>(`/stores/${id}`, store),
  delete: (id: string) => api.delete(`/stores/${id}`),
  
  // Store statistics (requires authentication)
  getStats: (id: string) => api.get<StoreStats>(`/stores/${id}/stats`),
  
  // Store products
  getProducts: (id: string, page?: number, pageSize?: number) => 
    api.get<Product[]>(`/stores/${id}/products${page ? `?page=${page}&pageSize=${pageSize || 20}` : ''}`),
  
  // Store application (for becoming a store owner)
  applyToBecomeStore: (application: any) => 
    api.post('/stores/apply', application),
};

// Admin Store API (requires admin role)
export const adminStoresApi = {
  // Get all stores (including unapproved)
  getAll: (page?: number, pageSize?: number) => 
    api.get<Store[]>(`/admin/stores${page ? `?page=${page}&pageSize=${pageSize || 20}` : ''}`),
  
  // Get pending store applications
  getPendingApplications: () => api.get<Store[]>('/admin/stores/pending'),
  
  // Approve store
  approve: (id: string) => api.patch(`/admin/stores/${id}/approve`),
  
  // Reject store
  reject: (id: string, reason?: string) => 
    api.patch(`/admin/stores/${id}/reject`, { reason }),
  
  // Suspend store
  suspend: (id: string, reason?: string) => 
    api.patch(`/admin/stores/${id}/suspend`, { reason }),
  
  // Activate store
  activate: (id: string) => api.patch(`/admin/stores/${id}/activate`),
  
  // Delete store permanently
  delete: (id: string) => api.delete(`/admin/stores/${id}`),
  
  // Get store statistics
  getStoreStats: (id: string) => api.get<StoreStats>(`/admin/stores/${id}/stats`),
  
  // Update store metrics manually
  updateMetrics: (id: string) => api.patch(`/admin/stores/${id}/update-metrics`),
};

// Wishlist API (Requires Authentication)
export const wishlistApi = {
  // Get user wishlist
  get: () => api.get<Wishlist>('/wishlist'),
  
  // Add product to wishlist
  addItem: (request: AddToWishlistRequest) => api.post<Wishlist>('/wishlist/items', request),
  
  // Remove product from wishlist
  removeItem: (productId: string) => api.delete(`/wishlist/items/${productId}`),
  
  // Check if product is in wishlist
  isInWishlist: (productId: string) => api.get<{ isInWishlist: boolean }>(`/wishlist/check/${productId}`),
  
  // Clear entire wishlist
  clear: () => api.delete('/wishlist'),
  
  // Get wishlist item count
  getCount: () => api.get<{ count: number }>('/wishlist/count'),
};

// Reviews API (Requires Authentication for create/update/delete)
export const reviewsApi = {
  // Get product reviews (public)
  getProductReviews: (productId: string, page?: number, pageSize?: number) => 
    api.get<Review[]>(`/reviews/product/${productId}${page ? `?page=${page}&pageSize=${pageSize || 10}` : ''}`),
  
  // Get product review stats (public)
  getProductStats: (productId: string) => 
    api.get<ProductReviewStats>(`/reviews/product/${productId}/stats`),
  
  // Get review by ID (public)
  getById: (id: string) => api.get<Review>(`/reviews/${id}`),
  
  // Get user's reviews (requires authentication)
  getUserReviews: (page?: number, pageSize?: number) => 
    api.get<Review[]>(`/reviews/user${page ? `?page=${page}&pageSize=${pageSize || 10}` : ''}`),
  
  // Create review (requires authentication)
  create: (review: CreateReviewRequest) => api.post<Review>('/reviews', review),
  
  // Update review (requires authentication)
  update: (id: string, review: UpdateReviewRequest) => 
    api.put<Review>(`/reviews/${id}`, review),
  
  // Delete review (requires authentication)
  delete: (id: string) => api.delete(`/reviews/${id}`),
  
  // Check if user can review product (requires authentication)
  canReview: (productId: string) => 
    api.get<{ canReview: boolean; hasExistingReview: boolean }>(`/reviews/can-review/${productId}`),
  
  // Get user's review for specific product (requires authentication)
  getUserProductReview: (productId: string) => 
    api.get<Review>(`/reviews/user/product/${productId}`),
};

// Banner API (Public)
export const bannerApi = {
  // Get active banners
  getActive: () => api.get<Banner[]>('/banners/active'),
  
  // Get all banners (admin only)
  getAll: () => api.get<Banner[]>('/banners'),
  
  // Get banner by ID
  getById: (id: string) => api.get<Banner>(`/banners/${id}`),
  
  // Create banner (admin only)
  create: (banner: Omit<Banner, 'id'>) => api.post<Banner>('/banners', banner),
  
  // Update banner (admin only)
  update: (id: string, banner: Partial<Banner>) => api.put<Banner>(`/banners/${id}`, banner),
  
  // Delete banner (admin only)
  delete: (id: string) => api.delete(`/banners/${id}`),
};

// Recently Viewed API (Requires Authentication)
export const recentlyViewedApi = {
  // Get user's recently viewed products
  get: () => api.get<RecentlyViewedItem[]>('/user/recently-viewed'),
  
  // Add product to recently viewed (automatically called when viewing product)
  add: (productId: string) => api.post('/user/recently-viewed', { productId }),
  
  // Clear recently viewed history
  clear: () => api.delete('/user/recently-viewed'),
  
  // Remove specific product from recently viewed
  remove: (productId: string) => api.delete(`/user/recently-viewed/${productId}`),
};

export { api };
export default api;