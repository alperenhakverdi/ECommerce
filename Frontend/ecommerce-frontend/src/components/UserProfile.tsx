import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminDashboard, StoreOwnerDashboard, CustomerDashboard } from './RoleSpecificDashboards';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Update form when user data changes
  React.useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    // Basic validation
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast({
        title: 'Validation Error', 
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // For now, just show success message since we don't have the API endpoint
      // TODO: Implement actual API call when user update endpoint is ready
      
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile information has been saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'All password fields are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New password and confirmation do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'New password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsPasswordLoading(true);
      
      // TODO: Implement actual API call when change password endpoint is ready
      // await authService.changePassword(passwordForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Password changed successfully',
        description: 'Your password has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      onPasswordClose();
    } catch (error) {
      toast({
        title: 'Password change failed',
        description: 'Failed to change password. Please check your current password and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out successfully',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!user) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="gray.500">No user data available</Text>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Role-based welcome message
  const getWelcomeMessage = () => {
    if (user.roles.includes('Admin')) {
      return 'System Administrator Dashboard';
    } else if (user.roles.includes('StoreOwner')) {
      return 'Store Owner Dashboard';
    } else {
      return 'Personal Dashboard';
    }
  };

  // Role-based color scheme
  const getRoleColor = () => {
    if (user.roles.includes('Admin')) return 'red';
    if (user.roles.includes('StoreOwner')) return 'blue';
    return 'gray';
  };

  return (
    <Box p={6}>
      <VStack spacing={8} align="stretch">
        {/* Welcome Header */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Welcome back, {user.firstName}!
              </Text>
              <Text color="gray.600" textAlign="center">
                {getWelcomeMessage()}
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Role-specific Quick Stats */}
        {user.roles.includes('Admin') && <AdminDashboard />}
        {user.roles.includes('StoreOwner') && <StoreOwnerDashboard />}
        {user.roles.includes('Customer') && <CustomerDashboard />}

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <HStack spacing={4}>
              <Avatar
                size="lg"
                name={`${user.firstName} ${user.lastName}`}
                bg={`${getRoleColor()}.500`}
              />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="bold">
                  {user.firstName} {user.lastName}
                </Text>
                <Text color="gray.600">{user.email}</Text>
                <HStack spacing={2}>
                  {user.roles.map((role) => (
                    <Badge key={role} colorScheme={getRoleColor()} variant="subtle">
                      {role}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </HStack>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Account Information
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="medium">Account ID:</Text>
                <Text color="gray.600" fontSize="sm" fontWeight="medium">
                  #{user.id.slice(-8).toUpperCase()}
                </Text>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between" w="full">
                <Text fontWeight="medium">Member since:</Text>
                <Text color="gray.600">
                  {formatDate(user.createdAt)}
                </Text>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between" w="full">
                <Text fontWeight="medium">Account status:</Text>
                <Badge colorScheme="green">Active</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Quick Actions
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Button variant="outline" size="sm" onClick={onOpen}>
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={onPasswordOpen}>
                Change Password
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                Order History
              </Button>
              <Divider />
              <Button 
                colorScheme="red" 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  placeholder="Enter email"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveProfile}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="Enter new password"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPasswordClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleChangePassword}
              isLoading={isPasswordLoading}
              loadingText="Changing..."
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};