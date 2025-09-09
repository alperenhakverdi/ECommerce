import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Switch,
  Badge,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecurityActivity {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'email_change' | 'failed_login';
  description: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
}

export const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const { isOpen: is2FAOpen, onOpen: on2FAOpen, onClose: on2FAClose } = useDisclosure();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Mock data for login sessions
  const [loginSessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Istanbul, Turkey',
      ipAddress: '192.168.1.1',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Istanbul, Turkey',
      ipAddress: '192.168.1.2',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'Chrome on Android',
      location: 'Ankara, Turkey',
      ipAddress: '192.168.1.3',
      lastActive: '1 day ago',
      isCurrent: false,
    },
  ]);

  // Mock data for security activities
  const [securityActivities] = useState<SecurityActivity[]>([
    {
      id: '1',
      type: 'login',
      description: 'Successful login',
      timestamp: '2 hours ago',
      ipAddress: '192.168.1.1',
      location: 'Istanbul, Turkey',
      device: 'Chrome on Windows',
    },
    {
      id: '2',
      type: 'password_change',
      description: 'Password changed successfully',
      timestamp: '3 days ago',
      ipAddress: '192.168.1.1',
      location: 'Istanbul, Turkey',
      device: 'Chrome on Windows',
    },
    {
      id: '3',
      type: 'failed_login',
      description: 'Failed login attempt',
      timestamp: '1 week ago',
      ipAddress: '192.168.1.4',
      location: 'Unknown',
      device: 'Unknown Browser',
    },
  ]);

  // Simulate loading
  React.useEffect(() => {
    setTimeout(() => {
      setSessionsLoading(false);
      setActivitiesLoading(false);
    }, 1500);
  }, []);

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

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'New password must be at least 8 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsPasswordLoading(true);
      
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Password changed successfully',
        description: 'Your password has been updated. Please login again.',
        status: 'success',
        duration: 5000,
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

  const handleTerminateSession = (sessionId: string) => {
    toast({
      title: 'Session terminated',
      description: 'The selected session has been terminated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleTerminateAllSessions = () => {
    toast({
      title: 'All sessions terminated',
      description: 'All other sessions have been terminated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getActivityIcon = (type: SecurityActivity['type']) => {
    const icons = {
      login: '✅',
      logout: '🚪',
      password_change: '🔐',
      email_change: '📧',
      failed_login: '❌',
    };
    return icons[type];
  };

  const getActivityColor = (type: SecurityActivity['type']) => {
    const colors = {
      login: 'green',
      logout: 'blue',
      password_change: 'orange',
      email_change: 'purple',
      failed_login: 'red',
    };
    return colors[type];
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Page Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Security Settings
        </Text>
        <Text color="gray.600">
          Manage your account security and privacy settings
        </Text>
      </Box>

      {/* Security Overview */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Security Overview
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Your account security is strong. Keep up the good practices!
            </Alert>
            
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">Password Strength</Text>
                <Text fontSize="sm" color="gray.600">Last changed 3 days ago</Text>
              </VStack>
              <Badge colorScheme="green">Strong</Badge>
            </HStack>
            
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">Two-Factor Authentication</Text>
                <Text fontSize="sm" color="gray.600">Add an extra layer of security</Text>
              </VStack>
              <Badge colorScheme={twoFactorEnabled ? 'green' : 'orange'}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Password & Authentication */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Password & Authentication
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">Password</Text>
                <Text fontSize="sm" color="gray.600">Change your account password</Text>
              </VStack>
              <Button size="sm" variant="outline" onClick={onPasswordOpen}>
                Change Password
              </Button>
            </HStack>
            
            <Divider />
            
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">Two-Factor Authentication</Text>
                <Text fontSize="sm" color="gray.600">Secure your account with 2FA</Text>
              </VStack>
              <HStack spacing={2}>
                <Switch
                  isChecked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                />
                <Button size="sm" variant="outline" onClick={on2FAOpen}>
                  Setup
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Security Notifications
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">Email Notifications</Text>
                <Text fontSize="sm" color="gray.600">Get notified about important security events</Text>
              </VStack>
              <Switch
                isChecked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            </HStack>
            
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">Login Alerts</Text>
                <Text fontSize="sm" color="gray.600">Get alerted when someone logs into your account</Text>
              </VStack>
              <Switch
                isChecked={loginAlerts}
                onChange={(e) => setLoginAlerts(e.target.checked)}
              />
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Active Sessions */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Active Sessions
            </Text>
            <Button size="sm" variant="outline" colorScheme="red" onClick={handleTerminateAllSessions}>
              Terminate All Others
            </Button>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          {sessionsLoading ? (
            <VStack py={4}>
              <Spinner />
              <Text fontSize="sm" color="gray.500">Loading sessions...</Text>
            </VStack>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Device</Th>
                  <Th>Location</Th>
                  <Th>Last Active</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loginSessions.map((session) => (
                  <Tr key={session.id}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {session.device}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {session.ipAddress}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{session.location}</Text>
                    </Td>
                    <Td>
                      <HStack>
                        <Text fontSize="sm">{session.lastActive}</Text>
                        {session.isCurrent && (
                          <Badge colorScheme="green" size="sm">Current</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      {!session.isCurrent && (
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="red"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          Terminate
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Security Activity */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="semibold">
            Recent Security Activity
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          {activitiesLoading ? (
            <VStack py={4}>
              <Spinner />
              <Text fontSize="sm" color="gray.500">Loading activities...</Text>
            </VStack>
          ) : (
            <VStack spacing={3} align="stretch">
              {securityActivities.map((activity) => (
                <HStack key={activity.id} justify="space-between" p={3} borderRadius="md" bg="gray.50">
                  <HStack spacing={3}>
                    <Text fontSize="lg">{getActivityIcon(activity.type)}</Text>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="medium">
                        {activity.description}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {activity.device} • {activity.location}
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={0}>
                    <Text fontSize="sm">{activity.timestamp}</Text>
                    <Badge size="sm" colorScheme={getActivityColor(activity.type)}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

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
                  placeholder="Enter new password (min 8 characters)"
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

      {/* 2FA Setup Modal */}
      <Modal isOpen={is2FAOpen} onClose={on2FAClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Two-Factor Authentication</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                Two-factor authentication setup will be available soon.
              </Alert>
              <Text fontSize="sm" color="gray.600">
                This feature is currently under development and will provide an extra layer of security using authenticator apps or SMS codes.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={on2FAClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};