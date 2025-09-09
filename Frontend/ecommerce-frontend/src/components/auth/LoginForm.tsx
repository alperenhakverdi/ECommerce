import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Checkbox,
  Link,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginRequest } from '../../types/auth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await login(formData);
      
      if (response.success) {
        toast({
          title: t('auth.login.success'),
          description: t('auth.welcomeBack'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Role-based redirection
        if (response.user?.roles.includes('StoreOwner')) {
          navigate('/store/dashboard');
        } else {
          navigate('/'); // Redirect customers to homepage instead of profile
        }
        
        onSuccess?.();
      } else {
        setErrors(response.errors);
      }
    } catch (error) {
      setErrors([t('auth.login.error')]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" p={6}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={4}>
          {t('auth.login.title')}
        </Text>

        {errors.length > 0 && (
          <Alert status="error">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              {errors.map((error, index) => (
                <Text key={index} fontSize="sm">
                  {error}
                </Text>
              ))}
            </VStack>
          </Alert>
        )}

        <form onSubmit={handleSubmit} autoComplete="on" method="post" action="/login">
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>{t('auth.login.email')}</FormLabel>
              <Input
                type="email"
                name="username"
                id="username"
                autoComplete="username"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={t('auth.login.emailPlaceholder')}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t('auth.login.password')}</FormLabel>
              <Input
                type="password"
                name="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={t('auth.login.passwordPlaceholder')}
              />
            </FormControl>

            <FormControl>
              <Checkbox
                name="rememberMe"
                isChecked={formData.rememberMe}
                onChange={handleInputChange}
              >
                {t('auth.login.rememberMe')}
              </Checkbox>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isSubmitting}
              loadingText={t('auth.login.signingIn')}
            >
              {t('auth.login.submit')}
            </Button>
          </VStack>
        </form>

        <Divider />

        <Text textAlign="center" fontSize="sm">
          {t('auth.login.noAccount')}{' '}
          <Link color="blue.500" onClick={onSwitchToRegister} cursor="pointer">
            {t('auth.login.signUp')}
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};