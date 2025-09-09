import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Text,
  useColorModeValue,
  Card,
  CardBody,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiShield, 
  FiLock,
  FiUnlock,
  FiMoreVertical,
  FiUserPlus,
  FiUserMinus,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  emailConfirmed: boolean;
  lockoutEnd: string | null;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
}

const AdminRolesPage: React.FC = () => {
  const { user } = useAuth();
  const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onClose: onRoleModalClose } = useDisclosure();
  const { isOpen: isLockModalOpen, onOpen: onLockModalOpen, onClose: onLockModalClose } = useDisclosure();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleAction, setRoleAction] = useState<'assign' | 'remove'>('assign');
  const [selectedRole, setSelectedRole] = useState('');
  const [lockoutMinutes, setLockoutMinutes] = useState(60);
  const [actionToConfirm, setActionToConfirm] = useState<{ type: 'remove-role'; userId: string; roleName: string } | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalUsers: 0
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (user && user.roles.includes('Admin')) {
      fetchUsers();
      fetchRoles();
    }
  }, [user, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers(pagination.currentPage, pagination.pageSize);
      setUsers(response.data.users);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalUsers: response.data.totalUsers
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await adminApi.getAllRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleRoleAction = (user: AdminUser, action: 'assign' | 'remove') => {
    setSelectedUser(user);
    setRoleAction(action);
    setSelectedRole('');
    onRoleModalOpen();
  };

  const handleLockUser = (user: AdminUser) => {
    setSelectedUser(user);
    setLockoutMinutes(60);
    onLockModalOpen();
  };


  const executeRoleAction = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setSubmitting(true);
      
      if (roleAction === 'assign') {
        await adminApi.assignRole(selectedUser.id, selectedRole);
        toast({
          title: 'Success',
          description: `Role "${selectedRole}" assigned to ${selectedUser.email}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await adminApi.removeRole(selectedUser.id, selectedRole);
        toast({
          title: 'Success',
          description: `Role "${selectedRole}" removed from ${selectedUser.email}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      await fetchUsers();
      onRoleModalClose();
    } catch (error: any) {
      console.error('Error managing role:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${roleAction} role`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const executeLockAction = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      
      if (isUserLocked(selectedUser)) {
        await adminApi.unlockUser(selectedUser.id);
        toast({
          title: 'Success',
          description: `User ${selectedUser.email} has been unlocked`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await adminApi.lockUser(selectedUser.id, lockoutMinutes);
        const lockDuration = lockoutMinutes > 0 ? `for ${lockoutMinutes} minutes` : 'permanently';
        toast({
          title: 'Success',
          description: `User ${selectedUser.email} has been locked ${lockDuration}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      await fetchUsers();
      onLockModalClose();
    } catch (error: any) {
      console.error('Error managing user lock:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user lock status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const executeConfirmedAction = async () => {
    if (!actionToConfirm) return;

    try {
      setSubmitting(true);
      
      if (actionToConfirm.type === 'remove-role') {
        await adminApi.removeRole(actionToConfirm.userId, actionToConfirm.roleName);
        toast({
          title: 'Success',
          description: `Role "${actionToConfirm.roleName}" removed successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await fetchUsers();
      }

      onDeleteAlertClose();
      setActionToConfirm(null);
    } catch (error: any) {
      console.error('Error executing action:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to execute action',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isUserLocked = (user: AdminUser) => {
    return user.lockoutEnd && new Date(user.lockoutEnd) > new Date();
  };

  const isCurrentUser = (userId: string) => {
    return user?.id === userId;
  };

  const getAvailableRolesToAssign = (userRoles: string[]) => {
    return roles.filter(role => !userRoles.includes(role.name));
  };

  if (!user || !user.roles.includes('Admin')) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <VStack spacing={4} justify="center" minH="60vh">
            <Spinner size="xl" color="blue.500" />
            <Text>Loading users and roles...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>Role Management</Heading>
            <Text color="gray.600">Manage user roles and permissions</Text>
          </Box>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <HStack>
                  <Box p={2} bg="blue.100" borderRadius="md">
                    <FiUsers color="blue" size={20} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Total Users</Text>
                    <Text fontSize="2xl" fontWeight="bold">{pagination.totalUsers}</Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <HStack>
                  <Box p={2} bg="purple.100" borderRadius="md">
                    <FiShield color="purple" size={20} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Admin Users</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {users.filter(u => u.roles.includes('Admin')).length}
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardBody>
                <HStack>
                  <Box p={2} bg="red.100" borderRadius="md">
                    <FiLock color="red" size={20} />
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Locked Users</Text>
                    <Text fontSize="2xl" fontWeight="bold">
                      {users.filter(u => isUserLocked(u)).length}
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Users Table */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Users</Heading>

                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>User</Th>
                        <Th>Email</Th>
                        <Th>Roles</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map((adminUser) => (
                        <Tr key={adminUser.id} bg={isCurrentUser(adminUser.id) ? 'blue.50' : 'transparent'}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize="sm">
                                {adminUser.firstName} {adminUser.lastName}
                                {isCurrentUser(adminUser.id) && (
                                  <Badge ml={2} size="xs" colorScheme="blue">You</Badge>
                                )}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                ID: {adminUser.id.slice(-8)}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Text fontSize="sm">{adminUser.email}</Text>
                              {!adminUser.emailConfirmed && (
                                <Badge size="xs" colorScheme="yellow">Unverified</Badge>
                              )}
                            </HStack>
                          </Td>
                          <Td>
                            <HStack spacing={1} wrap="wrap">
                              {adminUser.roles.map((role) => (
                                <Badge 
                                  key={role} 
                                  size="sm" 
                                  colorScheme={role === 'Admin' ? 'red' : 'blue'}
                                >
                                  {role}
                                </Badge>
                              ))}
                              {adminUser.roles.length === 0 && (
                                <Badge size="sm" colorScheme="gray">No Roles</Badge>
                              )}
                            </HStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              {isUserLocked(adminUser) ? (
                                <Badge colorScheme="red" size="sm">
                                  <FiLock style={{ marginRight: '4px' }} />
                                  Locked
                                </Badge>
                              ) : (
                                <Badge colorScheme="green" size="sm">
                                  <FiUnlock style={{ marginRight: '4px' }} />
                                  Active
                                </Badge>
                              )}
                              {isUserLocked(adminUser) && (
                                <Text fontSize="xs" color="gray.500">
                                  Until: {new Date(adminUser.lockoutEnd!).toLocaleDateString()}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                size="sm"
                                variant="ghost"
                                isDisabled={isCurrentUser(adminUser.id)}
                              />
                              <MenuList>
                                <MenuItem 
                                  icon={<FiUserPlus />} 
                                  onClick={() => handleRoleAction(adminUser, 'assign')}
                                >
                                  Assign Role
                                </MenuItem>
                                <MenuItem 
                                  icon={<FiUserMinus />} 
                                  onClick={() => handleRoleAction(adminUser, 'remove')}
                                  isDisabled={adminUser.roles.length === 0}
                                >
                                  Remove Role
                                </MenuItem>
                                <MenuItem 
                                  icon={isUserLocked(adminUser) ? <FiUnlock /> : <FiLock />} 
                                  onClick={() => handleLockUser(adminUser)}
                                  isDisabled={adminUser.roles.includes('Admin')}
                                >
                                  {isUserLocked(adminUser) ? 'Unlock User' : 'Lock User'}
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <HStack justify="center" spacing={4}>
                    <Button
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      isDisabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Text fontSize="sm">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      isDisabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </HStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Role Assignment/Removal Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {roleAction === 'assign' ? 'Assign Role' : 'Remove Role'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <Text>
                  {roleAction === 'assign' ? 'Assign a role to' : 'Remove a role from'}: <strong>{selectedUser.email}</strong>
                </Text>
                
                <FormControl>
                  <FormLabel>Select Role</FormLabel>
                  <Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    placeholder="Choose a role"
                  >
                    {roleAction === 'assign' 
                      ? getAvailableRolesToAssign(selectedUser.roles).map((role) => (
                          <option key={role.id} value={role.name}>{role.name}</option>
                        ))
                      : selectedUser.roles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))
                    }
                  </Select>
                </FormControl>

                {roleAction === 'remove' && selectedRole === 'Admin' && (
                  <Alert status="warning" size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Warning: You are about to remove Admin privileges. This action cannot be undone.
                    </Text>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRoleModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme={roleAction === 'assign' ? 'blue' : 'red'}
              onClick={executeRoleAction}
              isDisabled={!selectedRole}
              isLoading={submitting}
            >
              {roleAction === 'assign' ? 'Assign Role' : 'Remove Role'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* User Lock/Unlock Modal */}
      <Modal isOpen={isLockModalOpen} onClose={onLockModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser && isUserLocked(selectedUser) ? 'Unlock User' : 'Lock User'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <Text>
                  {isUserLocked(selectedUser) 
                    ? `Unlock user: ${selectedUser.email}` 
                    : `Lock user: ${selectedUser.email}`
                  }
                </Text>
                
                {!isUserLocked(selectedUser) && (
                  <FormControl>
                    <FormLabel>Lock Duration (minutes)</FormLabel>
                    <NumberInput
                      value={lockoutMinutes}
                      onChange={(_, value) => setLockoutMinutes(value || 0)}
                      min={0}
                    >
                      <NumberInputField placeholder="60" />
                    </NumberInput>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Set to 0 for permanent lock
                    </Text>
                  </FormControl>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onLockModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme={selectedUser && isUserLocked(selectedUser) ? 'green' : 'red'}
              onClick={executeLockAction}
              isLoading={submitting}
            >
              {selectedUser && isUserLocked(selectedUser) ? 'Unlock User' : 'Lock User'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Role Removal
            </AlertDialogHeader>

            <AlertDialogBody>
              {actionToConfirm?.type === 'remove-role' && (
                <Text>
                  Are you sure you want to remove the <strong>{actionToConfirm.roleName}</strong> role? 
                  This action cannot be undone.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={executeConfirmedAction} 
                ml={3}
                isLoading={submitting}
              >
                Remove Role
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminRolesPage;