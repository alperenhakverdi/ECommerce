import React, { useRef } from 'react';
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

interface NativeLoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export const NativeLoginForm: React.FC<NativeLoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const { login } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const email = formData.get('username') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    try {
      const response = await login({ email, password, rememberMe });
      
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
          navigate('/');
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

        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          autoComplete="on" 
          method="post"
        >
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>{t('auth.login.email')}</FormLabel>
              <Input
                type="email"
                name="username"
                id="username"
                autoComplete="username"
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
                placeholder={t('auth.login.passwordPlaceholder')}
              />
            </FormControl>

            <FormControl>
              <Checkbox name="rememberMe">
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