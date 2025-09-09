import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { QuickStatsCard } from './QuickStatsCard';

// Admin Dashboard Component
export const AdminDashboard: React.FC = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      <QuickStatsCard
        title="System Overview"
        icon="👨‍💼"
        stats={[
          { label: 'Total Users', value: 1247, change: 12 },
          { label: 'Active Stores', value: 89, change: 5 },
          { label: 'System Health', value: '99.9%' },
        ]}
        actionButton={{
          label: 'View Details',
          path: '/admin/dashboard',
          colorScheme: 'red',
        }}
      />
      
      <QuickStatsCard
        title="Platform Analytics"
        icon="📊"
        stats={[
          { label: 'Total Orders', value: 5280, change: 18 },
          { label: 'Revenue (Month)', value: '$47.2K', change: 23 },
          { label: 'Conversion Rate', value: '3.2%', change: -2 },
        ]}
        actionButton={{
          label: 'Analytics Panel',
          path: '/admin/analytics/overview',
          colorScheme: 'blue',
        }}
      />
      
      <QuickStatsCard
        title="Recent Activity"
        icon="📋"
        stats={[
          { label: 'New Registrations', value: 23, change: 8 },
          { label: 'Store Applications', value: 5 },
          { label: 'Support Tickets', value: 12, change: -15 },
        ]}
        actionButton={{
          label: 'Manage Users',
          path: '/admin/roles',
          colorScheme: 'purple',
        }}
      />
    </SimpleGrid>
  );
};

// Store Owner Dashboard Component
export const StoreOwnerDashboard: React.FC = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      <QuickStatsCard
        title="Store Performance"
        icon="🏪"
        stats={[
          { label: 'Orders (This Week)', value: 28, change: 15 },
          { label: 'Revenue (This Week)', value: '$1,247', change: 22 },
          { label: 'Conversion Rate', value: '4.1%', change: 3 },
        ]}
        actionButton={{
          label: 'Store Dashboard',
          path: '/store/dashboard',
          colorScheme: 'blue',
        }}
      />
      
      <QuickStatsCard
        title="Inventory Status"
        icon="📦"
        stats={[
          { label: 'Total Products', value: 156 },
          { label: 'Low Stock Items', value: 8, change: -12 },
          { label: 'Out of Stock', value: 3 },
        ]}
        actionButton={{
          label: 'Manage Products',
          path: '/store/products',
          colorScheme: 'green',
        }}
      />
      
      <QuickStatsCard
        title="Customer Insights"
        icon="👥"
        stats={[
          { label: 'New Customers', value: 12, change: 20 },
          { label: 'Avg. Rating', value: '4.7★' },
          { label: 'Reviews (Week)', value: 18, change: 5 },
        ]}
        actionButton={{
          label: 'View Analytics',
          path: '/store/analytics',
          colorScheme: 'orange',
        }}
      />
    </SimpleGrid>
  );
};

// Customer Dashboard Component
export const CustomerDashboard: React.FC = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      <QuickStatsCard
        title="Order Summary"
        icon="📦"
        stats={[
          { label: 'Recent Orders', value: 8 },
          { label: 'Total Orders', value: 42 },
          { label: 'Last Order', value: '3 days ago' },
        ]}
        actionButton={{
          label: 'View Orders',
          path: '/orders',
          colorScheme: 'blue',
        }}
      />
      
      <QuickStatsCard
        title="Account Activity"
        icon="⭐"
        stats={[
          { label: 'Wishlist Items', value: 15 },
          { label: 'Reviews Written', value: 12 },
          { label: 'Loyalty Points', value: 340 },
        ]}
        actionButton={{
          label: 'View Wishlist',
          path: '/profile/wishlist',
          colorScheme: 'purple',
        }}
      />
    </SimpleGrid>
  );
};