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
  Container,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SavedCredential {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const { login } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [savedCredentials, setSavedCredentials] = React.useState<SavedCredential[]>([]);

  // Load saved credentials on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('savedCredentials');
    if (saved) {
      try {
        setSavedCredentials(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved credentials:', error);
      }
    }
  }, []);

  const saveCredential = (email: string, password: string) => {
    const existing = savedCredentials.find(cred => cred.email === email);
    if (!existing) {
      const newCredentials = [...savedCredentials, { email, password }];
      setSavedCredentials(newCredentials);
      localStorage.setItem('savedCredentials', JSON.stringify(newCredentials));
    }
  };

  const selectCredential = (credential: SavedCredential) => {
    setEmail(credential.email);
    setPassword(credential.password);
    setShowDropdown(false);
  };

  const deleteCredential = (credentialToDelete: SavedCredential) => {
    const newCredentials = savedCredentials.filter(cred => 
      cred.email !== credentialToDelete.email
    );
    setSavedCredentials(newCredentials);
    localStorage.setItem('savedCredentials', JSON.stringify(newCredentials));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('LoginPage: handleSubmit called');
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);
    
    console.log('LoginPage: Form data:', { email, password, rememberMe });

    try {
      console.log('LoginPage: Calling login function...');
      const response = await login({ email, password, rememberMe });
      
      if (response.success) {
        // Debug: Log user and roles
        console.log('Login response:', response);
        console.log('User:', response.user);
        console.log('User roles:', response.user?.roles);
        console.log('Has StoreOwner role:', response.user?.roles?.includes('StoreOwner'));

        // Save credentials if remember me is checked
        if (rememberMe) {
          saveCredential(email, password);
        }

        toast({
          title: t('auth.login.success'),
          description: t('auth.welcomeBack'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Role-based redirection
        console.log('Login success - User roles:', response.user?.roles);
        if (response.user?.roles?.includes('Admin')) {
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard');
        } else if (response.user?.roles?.includes('StoreOwner')) {
          console.log('Redirecting to store dashboard');
          navigate('/store/dashboard');
        } else {
          console.log('Redirecting to homepage');
          navigate('/');
        }
        
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
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <Text fontSize="3xl" fontWeight="bold" textAlign="center">
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

        <Box bg="white" p={8} borderRadius="lg" boxShadow="lg">
          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            autoComplete="on" 
            method="post"
            action="javascript:void(0);"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ position: 'relative' }}>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                  {t('auth.login.email')}
                </label>
                <input
                  type="email"
                  name="username"
                  id="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setShowDropdown(savedCredentials.length > 0)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Enter your email address"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
                
                {/* Custom Dropdown */}
                {showDropdown && savedCredentials.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '2px solid #E2E8F0',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {savedCredentials.map((credential, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderBottom: index < savedCredentials.length - 1 ? '1px solid #E2E8F0' : 'none',
                          fontSize: '16px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F7FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <div 
                          onClick={() => selectCredential(credential)}
                          style={{ 
                            flex: 1, 
                            cursor: 'pointer' 
                          }}
                        >
                          <div style={{ fontWeight: 'bold', color: '#2D3748' }}>
                            {credential.email}
                          </div>
                          <div style={{ fontSize: '14px', color: '#718096' }}>
                            {'•'.repeat(credential.password.length)}
                          </div>
                        </div>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCredential(credential);
                          }}
                          style={{
                            padding: '4px 8px',
                            fontSize: '14px',
                            color: '#E53E3E',
                            backgroundColor: 'transparent',
                            border: '1px solid #E53E3E',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginLeft: '8px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FED7D7';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Delete saved credential"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                  {t('auth.login.password')}
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    border: '2px solid #E2E8F0',
                    borderRadius: '8px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                  <input 
                    type="checkbox" 
                    name="rememberMe" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {t('auth.login.rememberMe')}
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  console.log('LoginPage: Button clicked');
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: isSubmitting ? '#A0AEC0' : '#3182CE',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? t('auth.login.signingIn') : t('auth.login.submit')}
              </button>
            </div>
          </form>

          <VStack spacing={4} mt={6}>
            <Text textAlign="center" fontSize="sm">
              {t('auth.login.noAccount')}{' '}
              <Link color="blue.500" onClick={() => navigate('/register')} cursor="pointer">
                {t('auth.login.signUp')}
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default LoginPage;