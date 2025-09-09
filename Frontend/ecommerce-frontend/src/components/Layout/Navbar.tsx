import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  Badge,
  useColorModeValue,
  Container,
  Link as ChakraLink,
  HStack,
  VStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiShoppingCart, FiUser, FiHeart, FiSearch } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { storesApi } from '../../services/api';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { cart } = useCart();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [hasStore, setHasStore] = React.useState(false);
  const [storeLoading, setStoreLoading] = React.useState(true);

  const totalItems = cart?.totalItems || 0;
  const isStoreOwner = user?.roles?.includes('StoreOwner');
  const isAdmin = user?.roles?.includes('Admin');

  // Check if store owner has an approved store
  React.useEffect(() => {
    const checkStoreStatus = async () => {
      if (isStoreOwner && isAuthenticated) {
        try {
          setStoreLoading(true);
          const response = await storesApi.getMyStores();
          setHasStore(response.data.length > 0);
        } catch (error) {
          console.error('Failed to check store status:', error);
          setHasStore(false);
        } finally {
          setStoreLoading(false);
        }
      } else {
        setHasStore(false);
        setStoreLoading(false);
      }
    };

    checkStoreStatus();
  }, [isStoreOwner, isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top="0"
      zIndex="100"
      boxShadow="sm"
    >
      <Container maxW="container.xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          <ChakraLink
            as={RouterLink}
            to={isAdmin ? "/admin/dashboard" : isStoreOwner ? "/store/dashboard" : "/"}
            fontSize="xl"
            fontWeight="bold"
            color="brand.500"
            _hover={{ textDecoration: 'none', color: 'brand.600' }}
          >
            E-Commerce
          </ChakraLink>

          {/* Enhanced Amazon-style Search Bar - Only for customers */}
          {!isStoreOwner && !isAdmin && (
            <Box flex="1" maxW={{ base: '300px', md: '600px', lg: '750px', xl: '900px' }} mx={{ base: 3, md: 5, lg: 7 }} display={{ base: 'block', xs: 'block' }}>
            <form onSubmit={handleSearchSubmit}>
              <HStack spacing={0} bg="white" borderRadius="lg" border="2px solid" borderColor="blue.400" boxShadow="md" transition="all 0.3s ease" _hover={{ borderColor: 'blue.500', shadow: 'lg' }}>
                <Select
                  placeholder="Tüm Kategoriler"
                  maxW={{ base: '120px', md: '160px', lg: '200px' }}
                  border="none"
                  borderRadius="lg"
                  bg="gray.100"
                  color="gray.800"
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight="500"
                  _focus={{ boxShadow: 'none', bg: 'gray.200' }}
                  _hover={{ bg: 'gray.150' }}
                  display={{ base: 'none', md: 'block' }}
                >
                  <option value="electronics">Elektronik</option>
                  <option value="clothing">Moda & Giyim</option>
                  <option value="books">Kitap</option>
                  <option value="home">Ev & Yaşam</option>
                  <option value="sports">Spor</option>
                  <option value="beauty">Kozmetik</option>
                  <option value="toys">Oyuncak</option>
                  <option value="automotive">Otomotiv</option>
                </Select>
                <Box w="2px" h={{ base: '35px', md: '45px' }} bg="gray.300" display={{ base: 'none', md: 'block' }} />
                <InputGroup flex="1">
                  <Input
                    placeholder="Marka, ürün veya kategori ara..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    border="none"
                    borderRadius="0"
                    bg="white"
                    fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                    py={{ base: 3, md: 4 }}
                    px={{ base: 3, md: 4 }}
                    _focus={{ 
                      boxShadow: 'none',
                      outline: 'none'
                    }}
                    _placeholder={{ color: 'gray.600' }}
                    fontWeight="400"
                  />
                </InputGroup>
                <Button
                  type="submit"
                  bg="blue.500"
                  color="white"
                  borderRadius="0 lg lg 0"
                  px={{ base: 3, md: 4, lg: 6 }}
                  py={{ base: 2, md: 3 }}
                  minH={{ base: '45px', md: '52px' }}
                  _hover={{ bg: 'blue.600', transform: 'scale(1.02)' }}
                  _active={{ bg: 'blue.700', transform: 'scale(0.98)' }}
                  transition="all 0.2s ease"
                  fontWeight="600"
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  <FiSearch size={18} />
                  <Text ml={2} display={{ base: 'none', sm: 'block' }}>
                    Ara
                  </Text>
                </Button>
              </HStack>
            </form>
            </Box>
          )}

          <HStack spacing={{ base: 2, md: 3, lg: 4 }}>
            {/* Show skeleton loading while authentication is loading */}
            {authLoading || (isStoreOwner && storeLoading) ? (
              <>
                <Skeleton height="20px" width="80px" display={{ base: 'none', lg: 'block' }} />
                <Skeleton height="20px" width="100px" display={{ base: 'none', lg: 'block' }} />
                <Skeleton height="20px" width="70px" display={{ base: 'none', lg: 'block' }} />
              </>
            ) : isStoreOwner ? (
              // Store Owner Professional Navigation
              <>
                <ChakraLink
                  as={RouterLink}
                  to="/store/dashboard"
                  _hover={{ textDecoration: 'none', color: 'blue.600' }}
                  display={{ base: 'none', xl: 'block' }}
                  fontWeight="600"
                  color="gray.700"
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg="gray.50"
                  transition="all 0.2s"
                  _active={{ bg: 'blue.50' }}
                >
                  📊 Dashboard
                </ChakraLink>
                {/* Store Management Links - Only for approved stores */}
                {hasStore && (
                  <>
                    <ChakraLink
                      as={RouterLink}
                      to="/store/products"
                      _hover={{ textDecoration: 'none', color: 'green.600', bg: 'green.50' }}
                      display={{ base: 'none', xl: 'block' }}
                      fontWeight="500"
                      color="gray.600"
                      px={3}
                      py={2}
                      borderRadius="md"
                      transition="all 0.2s"
                    >
                      📦 Products
                    </ChakraLink>
                    <ChakraLink
                      as={RouterLink}
                      to="/store/orders"
                      _hover={{ textDecoration: 'none', color: 'purple.600', bg: 'purple.50' }}
                      display={{ base: 'none', xl: 'block' }}
                      fontWeight="500"
                      color="gray.600"
                      px={3}
                      py={2}
                      borderRadius="md"
                      transition="all 0.2s"
                    >
                      📋 Orders
                    </ChakraLink>
                    <ChakraLink
                      as={RouterLink}
                      to="/store/analytics"
                      _hover={{ textDecoration: 'none', color: 'orange.600', bg: 'orange.50' }}
                      display={{ base: 'none', xl: 'block' }}
                      fontWeight="500"
                      color="gray.600"
                      px={3}
                      py={2}
                      borderRadius="md"
                      transition="all 0.2s"
                    >
                      📈 Analytics
                    </ChakraLink>
                  </>
                )}
              </>
            ) : isAdmin ? (
              // Admin Professional Navigation - Modern Clean Design
              <>
                <ChakraLink
                  as={RouterLink}
                  to="/admin/dashboard"
                  _hover={{ textDecoration: 'none', color: 'red.600', bg: 'red.50' }}
                  display={{ base: 'none', xl: 'block' }}
                  fontWeight="600"
                  color="gray.700"
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg="gray.50"
                  transition="all 0.2s"
                  _active={{ bg: 'red.50' }}
                >
                  👨‍💼 Dashboard
                </ChakraLink>
                <ChakraLink
                  as={RouterLink}
                  to="/admin/stores"
                  _hover={{ textDecoration: 'none', color: 'blue.600', bg: 'blue.50' }}
                  display={{ base: 'none', xl: 'block' }}
                  fontWeight="500"
                  color="gray.600"
                  px={3}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                >
                  🏪 Store Management
                </ChakraLink>
                <ChakraLink
                  as={RouterLink}
                  to="/admin/roles"
                  _hover={{ textDecoration: 'none', color: 'purple.600', bg: 'purple.50' }}
                  display={{ base: 'none', xl: 'block' }}
                  fontWeight="500"
                  color="gray.600"
                  px={3}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                >
                  👥 User Management
                </ChakraLink>
                <ChakraLink
                  as={RouterLink}
                  to="/admin/products"
                  _hover={{ textDecoration: 'none', color: 'green.600', bg: 'green.50' }}
                  display={{ base: 'none', xl: 'block' }}
                  fontWeight="500"
                  color="gray.600"
                  px={3}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                >
                  📦 Products
                </ChakraLink>
                <ChakraLink
                  as={RouterLink}
                  to="/admin/analytics/overview"
                  _hover={{ textDecoration: 'none', color: 'orange.600', bg: 'orange.50' }}
                  display={{ base: 'none', xl: 'block' }}
                  fontWeight="500"
                  color="gray.600"
                  px={3}
                  py={2}
                  borderRadius="md"
                  transition="all 0.2s"
                >
                  📊 Analytics
                </ChakraLink>
              </>
            ) : null}
            
            {/* Prominent Seller Button */}
            {!authLoading && !isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                display={{ base: 'flex', md: 'flex' }}
                colorScheme="orange"
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight="600"
                borderWidth="2px"
                px={{ base: 3, md: 4 }}
                _hover={{
                  bg: 'orange.50',
                  borderColor: 'orange.500',
                  transform: 'translateY(-1px)'
                }}
                _active={{
                  transform: 'translateY(0px)'
                }}
                transition="all 0.2s ease"
                shadow="sm"
              >
                Satıcı Ol
              </Button>
            )}
            
            {/* Mobile Search Icon - Only for customers */}
            {!authLoading && !isStoreOwner && !isAdmin && (
              <IconButton
                aria-label="Search products"
                icon={<FiSearch />}
                variant="ghost"
                onClick={() => navigate('/search')}
                display={{ base: 'flex', md: 'none' }}
              />
            )}

            {/* Store Owner Mobile Menu Button */}
            {!authLoading && isStoreOwner && (
              <Menu>
                <MenuButton as={IconButton} 
                  icon={<Text fontSize="lg">🏪</Text>}
                  variant="ghost"
                  display={{ base: 'flex', xl: 'none' }}
                  _hover={{ bg: 'blue.50' }}
                  aria-label="Store Menu"
                />
                <MenuList>
                  <MenuItem onClick={() => navigate('/store/dashboard')}>
                    📊 Dashboard
                  </MenuItem>
                  {hasStore && (
                    <>
                      <MenuItem onClick={() => navigate('/store/products')}>
                        📦 Products
                      </MenuItem>
                      <MenuItem onClick={() => navigate('/store/orders')}>
                        📋 Orders
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={() => navigate('/store/products/new')} color="green.600">
                        ➕ Add Product
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </Menu>
            )}

            {/* Admin Mobile Menu Button */}
            {!authLoading && isAdmin && (
              <Menu>
                <MenuButton as={IconButton} 
                  icon={<Text fontSize="lg">👨‍💼</Text>}
                  variant="ghost"
                  display={{ base: 'flex', xl: 'none' }}
                  _hover={{ bg: 'red.50' }}
                  aria-label="Admin Menu"
                />
                <MenuList>
                  <MenuItem onClick={() => navigate('/admin/dashboard')}>
                    👨‍💼 Admin Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/admin/stores')}>
                    🏪 Store Management
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/admin/roles')}>
                    👥 User Management
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => navigate('/admin/products')}>
                    📦 Products
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/admin/analytics/overview')} color="purple.600">
                    📊 Analytics
                  </MenuItem>
                </MenuList>
              </Menu>
            )}

            {/* Loading skeletons for mobile/cart/wishlist buttons */}
            {authLoading && (
              <>
                <Skeleton height="32px" width="32px" borderRadius="md" display={{ base: 'flex', md: 'none' }} />
                <Skeleton height="32px" width="80px" borderRadius="md" />
                <Skeleton height="32px" width="60px" borderRadius="md" />
              </>
            )}

            {/* Wishlist - Only for authenticated customers */}
            {!authLoading && isAuthenticated && !isStoreOwner && !isAdmin && (
              <IconButton
                aria-label="Wishlist"
                icon={<FiHeart />}
                variant="ghost"
                onClick={() => navigate('/wishlist')}
                position="relative"
                size="lg"
                display={{ base: 'none', md: 'flex' }}
              >
                {wishlistCount > 0 && (
                  <Badge
                    colorScheme="pink"
                    position="absolute"
                    top="-1"
                    right="-1"
                    fontSize="xs"
                    borderRadius="full"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </IconButton>
            )}

            {/* Cart - Only for customers */}
            {!authLoading && !isStoreOwner && !isAdmin && (
              <IconButton
                aria-label={t('nav.cart')}
                icon={<FiShoppingCart />}
                variant="ghost"
                onClick={() => navigate('/cart')}
                position="relative"
                size="lg"
              >
                {totalItems > 0 && (
                  <Badge
                    colorScheme="blue"
                    position="absolute"
                    top="-1"
                    right="-1"
                    fontSize="xs"
                    borderRadius="full"
                  >
                    {totalItems}
                  </Badge>
                )}
              </IconButton>
            )}

            {/* User Menu */}
            {authLoading ? (
              <Skeleton height="32px" width="80px" borderRadius="md" />
            ) : isAuthenticated && user ? (
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost" _hover={{ bg: 'gray.100' }}>
                  <HStack spacing={2}>
                    <Avatar size="sm" name={`${user.firstName} ${user.lastName}`} />
                    <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                      <Text fontSize="sm" fontWeight="600" color="gray.800">
                        {user.firstName} {user.lastName}
                      </Text>
                      {isAdmin ? (
                        <Text fontSize="xs" color="red.600" fontWeight="500">
                          👨‍💼 System Administrator
                        </Text>
                      ) : isStoreOwner && (
                        <Text fontSize="xs" color="blue.600" fontWeight="500">
                          {hasStore ? '🏪 Store Owner' : '📋 Setup Pending'}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                </MenuButton>
                <MenuList>
                  {isAdmin ? (
                    // Admin Personal Menu - Clean & Focused
                    <>
                      <MenuItem 
                        icon={<FiUser />} 
                        onClick={() => navigate('/profile')}
                        fontWeight="500"
                        color="gray.700"
                        _hover={{ bg: 'gray.50' }}
                      >
                        👤 My Profile
                      </MenuItem>
                      <MenuDivider />
                      
                      {/* Role Badge - Non-clickable */}
                      <Box px={3} py={2}>
                        <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                          Role
                        </Text>
                        <Text fontSize="sm" fontWeight="500" color="red.600" mt={1}>
                          👨‍💼 System Administrator
                        </Text>
                      </Box>
                      
                      <MenuDivider />
                      <MenuItem onClick={() => navigate('/profile')} color="gray.700" fontWeight="500" _hover={{ bg: 'gray.50' }}>
                        ⚙️ Account Settings
                      </MenuItem>
                      <MenuItem onClick={() => navigate('/profile')} color="gray.700" fontWeight="500" _hover={{ bg: 'gray.50' }}>
                        🔔 Notifications
                      </MenuItem>
                      
                      <MenuDivider />
                      <MenuItem onClick={handleLogout} color="red.500" fontWeight="500" _hover={{ bg: 'red.50' }}>
                        🚪 Sign Out
                      </MenuItem>
                    </>
                  ) : isStoreOwner ? (
                    // Store Owner Personal Menu - Clean & Focused
                    <>
                      <MenuItem 
                        icon={<FiUser />} 
                        onClick={() => navigate('/profile')}
                        fontWeight="500"
                        color="gray.700"
                        _hover={{ bg: 'gray.50' }}
                      >
                        👤 My Profile
                      </MenuItem>
                      <MenuDivider />
                      
                      {/* Role Badge - Non-clickable */}
                      <Box px={3} py={2}>
                        <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">
                          Role
                        </Text>
                        <Text fontSize="sm" fontWeight="500" color="blue.600" mt={1}>
                          {hasStore ? '🏪 Store Owner' : '📋 Setup Pending'}
                        </Text>
                      </Box>
                      
                      <MenuDivider />
                      <MenuItem onClick={() => navigate('/profile')} color="gray.700" fontWeight="500" _hover={{ bg: 'gray.50' }}>
                        ⚙️ Account Settings
                      </MenuItem>
                      <MenuItem onClick={() => navigate('/profile')} color="gray.700" fontWeight="500" _hover={{ bg: 'gray.50' }}>
                        🔔 Notifications
                      </MenuItem>
                      
                      {/* Quick Action - Add Product (if store exists) */}
                      {hasStore && (
                        <>
                          <MenuDivider />
                          <MenuItem onClick={() => navigate('/store/products/new')} color="green.600" fontWeight="500" _hover={{ bg: 'green.50' }}>
                            ➕ Add New Product
                          </MenuItem>
                        </>
                      )}
                      
                      <MenuDivider />
                      <MenuItem onClick={handleLogout} color="red.500" fontWeight="500" _hover={{ bg: 'red.50' }}>
                        🚪 Sign Out
                      </MenuItem>
                    </>
                  ) : (
                    // Customer Menu - Clean & Consistent
                    <>
                      <MenuItem 
                        icon={<FiUser />} 
                        onClick={() => navigate('/profile')}
                        fontWeight="500"
                        color="gray.700"
                        _hover={{ bg: 'gray.50' }}
                      >
                        👤 {t('nav.profile')}
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={() => navigate('/orders')} color="gray.700" fontWeight="500" _hover={{ bg: 'gray.50' }}>
                        📦 {t('orders.title')}
                      </MenuItem>
                      <MenuItem onClick={() => navigate('/saved-cards')} color="gray.700" fontWeight="500" _hover={{ bg: 'gray.50' }}>
                        💳 {t('nav.savedCards')}
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={handleLogout} color="red.500" fontWeight="500" _hover={{ bg: 'red.50' }}>
                        🚪 {t('nav.logout')}
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </Menu>
            ) : !authLoading && (
              <Button 
                bg="orange.400" 
                color="white"
                onClick={() => navigate('/login')}
                _hover={{
                  bg: "orange.500",
                  transform: 'translateY(-1px)',
                }}
                _active={{
                  bg: "orange.600",
                }}
                transition="all 0.2s ease"
              >
                {t('nav.login')}
              </Button>
            )}

            <HStack spacing={{ base: 1, md: 2 }} display={{ base: 'none', sm: 'flex' }}>
              <LanguageSwitcher />
              <ThemeToggle variant="dropdown" />
            </HStack>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;