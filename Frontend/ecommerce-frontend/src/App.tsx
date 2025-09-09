import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n';
import theme from './theme';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Layout/Navbar';
import { ScrollToTop } from './components/Layout/ScrollToTop';
import EnhancedFooter from './components/Layout/EnhancedFooter';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserProfilePage from './pages/UserProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import PaymentConfirmationPage from './pages/PaymentConfirmationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminRolesPage from './pages/AdminRolesPage';
import AdminStoresPage from './pages/AdminStoresPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import SavedCardsPage from './pages/SavedCardsPage';
import StorePage from './pages/StorePage';
import StoreDashboardPage from './pages/StoreDashboardPage';
import ProductFormPage from './pages/ProductFormPage';
import NotificationsPage from './pages/NotificationsPage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WishlistPage from './pages/WishlistPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
            <Router>
            <ScrollToTop />
            <Box minH="100vh" display="flex" flexDirection="column">
              <Navbar />
              
              <Box flex="1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route path="/hesabim" element={<UserProfilePage />} />
                  <Route path="/profile/notifications" element={<NotificationsPage />} />
                  <Route path="/profile/security" element={<SecuritySettingsPage />} />
                  <Route path="/saved-cards" element={<SavedCardsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailsPage />} />
                  <Route path="/payment/confirmation" element={<PaymentConfirmationPage />} />
                  <Route path="/store/dashboard" element={<StoreDashboardPage />} />
                  <Route path="/store/products" element={<StoreDashboardPage />} />
                  <Route path="/store/products/new" element={<ProductFormPage />} />
                  <Route path="/store/orders" element={<StoreDashboardPage />} />
                  <Route path="/store/settings" element={<StoreDashboardPage />} />
                  <Route path="/store/:id" element={<StorePage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/roles" element={<AdminRolesPage />} />
                  <Route path="/admin/stores" element={<AdminStoresPage />} />
                  <Route path="/admin/analytics/overview" element={<AdminAnalyticsPage />} />
                </Routes>
              </Box>
              
              <EnhancedFooter />
            </Box>
            </Router>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}

export default App;
