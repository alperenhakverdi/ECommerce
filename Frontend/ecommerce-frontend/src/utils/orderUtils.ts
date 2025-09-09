import { Order, OrderItem, StoreOrderGroup, OrderWithStoreGroups, OrderStatus } from '../types';

/**
 * Groups order items by store
 */
export const groupOrderByStores = (order: Order): OrderWithStoreGroups => {
  if (!order.items || order.items.length === 0) {
    return {
      ...order,
      storeGroups: [],
      hasMultipleStores: false,
    };
  }

  // Group items by store
  const storeMap = new Map<string, OrderItem[]>();
  
  order.items.forEach((item) => {
    const storeKey = item.storeId || 'no-store';
    if (!storeMap.has(storeKey)) {
      storeMap.set(storeKey, []);
    }
    storeMap.get(storeKey)!.push(item);
  });

  // Convert to StoreOrderGroup array
  const storeGroups: StoreOrderGroup[] = Array.from(storeMap.entries()).map(([storeId, items]) => {
    const totalAmount = items.reduce((sum, item) => sum + item.subTotal, 0);
    const firstItem = items[0];
    
    return {
      storeId: storeId === 'no-store' ? '' : storeId,
      storeName: firstItem.storeName || 'Direct Sale',
      storeLogoUrl: undefined, // Will be populated when needed
      items,
      totalAmount,
      status: order.status, // All items in order have same status initially
    };
  });

  return {
    ...order,
    storeGroups,
    hasMultipleStores: storeGroups.length > 1,
  };
};

/**
 * Calculates store-specific totals from order items
 */
export const calculateStoreTotals = (items: OrderItem[]): { [storeId: string]: number } => {
  const totals: { [storeId: string]: number } = {};
  
  items.forEach((item) => {
    const storeKey = item.storeId || 'no-store';
    if (!totals[storeKey]) {
      totals[storeKey] = 0;
    }
    totals[storeKey] += item.subTotal;
  });
  
  return totals;
};

/**
 * Gets unique stores from order items
 */
export const getUniqueStoresFromOrder = (order: Order): { storeId: string; storeName: string }[] => {
  const storeMap = new Map<string, string>();
  
  order.items.forEach((item) => {
    const storeId = item.storeId || '';
    const storeName = item.storeName || 'Direct Sale';
    if (!storeMap.has(storeId)) {
      storeMap.set(storeId, storeName);
    }
  });
  
  return Array.from(storeMap.entries()).map(([storeId, storeName]) => ({
    storeId,
    storeName,
  }));
};

/**
 * Filters order items by store
 */
export const filterOrderItemsByStore = (items: OrderItem[], storeId: string): OrderItem[] => {
  if (!storeId) {
    return items.filter(item => !item.storeId);
  }
  return items.filter(item => item.storeId === storeId);
};

/**
 * Gets order status color scheme for UI
 */
export const getOrderStatusColorScheme = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending:
      return 'yellow';
    case OrderStatus.Paid:
      return 'blue';
    case OrderStatus.Processing:
      return 'orange';
    case OrderStatus.Shipped:
      return 'purple';
    case OrderStatus.Delivered:
      return 'green';
    case OrderStatus.Cancelled:
      return 'red';
    case OrderStatus.Refunded:
      return 'gray';
    default:
      return 'gray';
  }
};

/**
 * Gets order status display text
 */
export const getOrderStatusText = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.Pending:
      return 'Pending';
    case OrderStatus.Paid:
      return 'Paid';
    case OrderStatus.Processing:
      return 'Processing';
    case OrderStatus.Shipped:
      return 'Shipped';
    case OrderStatus.Delivered:
      return 'Delivered';
    case OrderStatus.Cancelled:
      return 'Cancelled';
    case OrderStatus.Refunded:
      return 'Refunded';
    default:
      return 'Unknown';
  }
};