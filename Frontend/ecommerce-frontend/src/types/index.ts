export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // For showing discounted price
  discountPercentage?: number; // Discount percentage
  stock: number;
  imageUrl: string;
  imageUrls?: string[]; // Multiple product images for gallery
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  storeId?: string;
  storeName?: string;
  averageRating?: number;
  totalReviews?: number;
  isNew?: boolean; // For "NEW" badge
  isFeatured?: boolean; // For "FEATURED" badge
  tags?: string[]; // For custom badges like "HOT", "SALE", etc.
  createdAt?: string; // For sorting by newest
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  productCount: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
  storeId?: string;
  storeName?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: number;
  totalAmount: number;
  status: OrderStatus;
  customerEmail: string;
  customerName: string;
  addressId: string;
  shippingAddress: Address;
  createdAt: string;
  shippedDate?: string;
  deliveredDate?: string;
  items: OrderItem[];
}

export enum OrderStatus {
  Pending = 1,
  Paid = 2,
  Processing = 3,
  Shipped = 4,
  Delivered = 5,
  Cancelled = 6,
  Refunded = 7
}

export enum StoreStatus {
  Pending = 0,
  Active = 1,
  Suspended = 2,
  Rejected = 3,
  Inactive = 4
}

export interface CreateOrderRequest {
  customerEmail: string;
  customerName: string;
  addressId: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

// Address Management Types
export interface Address {
  id: string;
  title: string; // e.g., "Home", "Office", "Work"
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  // Computed properties
  fullName: string;
  fullAddress: string;
}

export interface CreateAddressRequest {
  title: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
}

export interface UpdateAddressRequest {
  title: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
}

// Address form data for React components
export interface AddressFormData {
  title: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
}

// Address validation errors
export interface AddressFormErrors {
  title?: string;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
}

// Saved Card Types
export interface SavedCard {
  id: string;
  userId: string;
  cardHolderName: string;
  cardNumberMasked: string;
  expiryMonth: number;
  expiryYear: number;
  cardType: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSavedCardRequest {
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
}

export interface UpdateSavedCardRequest {
  cardHolderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}


// Store-specific order grouping
export interface StoreOrderGroup {
  storeId: string;
  storeName: string;
  storeLogoUrl?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
}

export interface OrderWithStoreGroups extends Omit<Order, 'items'> {
  storeGroups: StoreOrderGroup[];
  hasMultipleStores: boolean;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl?: string;
  productDescription?: string;
  storeId?: string;
  storeName?: string;
  isAvailable: boolean;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  updatedAt: string;
}

export interface AddToWishlistRequest {
  productId: string;
}

export interface RemoveFromWishlistRequest {
  productId: string;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}

export interface ProductReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

// Search and Filter Types
export interface ProductSearchFilters {
  searchTerm?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  storeId?: string;
  gender?: 'women' | 'men' | 'unisex';
}

export type ProductSortField = 'name' | 'price' | 'created' | 'popularity';
export type ProductSortDirection = 'asc' | 'desc';

export interface ProductSearchRequest extends ProductSearchFilters {
  page?: number;
  pageSize?: number;
  sortBy?: ProductSortField;
  sortDirection?: ProductSortDirection;
}

export interface ProductSearchResponse {
  products: Product[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: {
    categories: Category[];
    priceRange: {
      min: number;
      max: number;
    };
    availableStores: Store[];
  };
}

// Homepage Banner Types
export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
}

// Recently Viewed Types
export interface RecentlyViewedItem {
  productId: string;
  product: Product;
  viewedAt: string;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  businessAddress: string;
  taxNumber: string;
  isActive: boolean;
  isApproved: boolean;
  status: StoreStatus;
  suspensionReason?: string;
  suspendedAt?: string;
  rating: number;
  totalSales: number;
  totalProducts: number;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateStoreRequest {
  name: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  businessAddress: string;
  taxNumber: string;
}

export interface UpdateStoreRequest {
  name?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  businessAddress?: string;
  taxNumber?: string;
}

export interface StoreStats {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
  totalReviews: number;
  newOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface StoreApplicationRequest {
  businessName: string;
  businessAddress: string;
  contactPhone: string;
  contactEmail: string;
  taxNumber: string;
  businessDescription: string;
  website?: string;
}

// Store form data for React components
export interface StoreFormData {
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  businessAddress: string;
  taxNumber: string;
}

// Store validation errors
export interface StoreFormErrors {
  name?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  businessAddress?: string;
  taxNumber?: string;
}
