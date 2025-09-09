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
  Link,
  Container,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const { register } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [wantsToBecomeStoreOwner, setWantsToBecomeStoreOwner] = React.useState(false);
  const [storeData, setStoreData] = React.useState({
    storeName: '',
    storeDescription: '',
    businessCategory: '',
    contactPhone: '',
    businessAddress: '',
    taxNumber: '',
    businessType: '',
    website: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    console.log('RegisterPage: Form data:', {
      firstName,
      lastName,
      email,
      wantsToBecomeStoreOwner,
      storeData: wantsToBecomeStoreOwner ? storeData : undefined
    });

    if (password !== confirmPassword) {
      setErrors(['Passwords do not match']);
      setIsSubmitting(false);
      return;
    }

    // Validate store data if user wants to become store owner
    if (wantsToBecomeStoreOwner) {
      const storeErrors = [];
      
      if (!storeData.storeName.trim()) {
        storeErrors.push('Store name is required');
      }
      if (!storeData.storeDescription.trim()) {
        storeErrors.push('Store description is required');
      }
      if (!storeData.businessCategory) {
        storeErrors.push('Business category is required');
      }
      if (!storeData.contactPhone.trim()) {
        storeErrors.push('Contact phone is required');
      }
      if (!storeData.businessAddress.trim()) {
        storeErrors.push('Business address is required');
      }
      if (!storeData.taxNumber.trim()) {
        storeErrors.push('Tax number is required');
      } else if (storeData.taxNumber.length < 8) {
        storeErrors.push('Tax number must be at least 8 characters');
      }
      if (!storeData.businessType) {
        storeErrors.push('Business type is required');
      }
      
      // Website is optional - only validate if provided
      if (storeData.website && storeData.website.trim() !== '') {
        const urlPattern = /^https?:\/\/.+\..+/;
        if (!urlPattern.test(storeData.website)) {
          storeErrors.push('Please enter a valid website URL (including http:// or https://)');
        }
      }

      if (storeErrors.length > 0) {
        setErrors(storeErrors);
        setIsSubmitting(false);
        return;
      }
    }

    const registerData = {
      firstName, 
      lastName, 
      email, 
      password, 
      confirmPassword,
      wantsToBecomeStoreOwner,
      storeData: wantsToBecomeStoreOwner ? storeData : undefined
    };

    console.log('RegisterPage: Sending registration data:', registerData);

    try {
      const response = await register(registerData);
      
      if (response.success) {
        toast({
          title: t('auth.register.success'),
          description: t('auth.register.successMessage'),
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect based on user type
        if (wantsToBecomeStoreOwner) {
          navigate('/store/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setErrors(response.errors);
      }
    } catch (error) {
      setErrors([t('auth.register.error')]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <Text fontSize="3xl" fontWeight="bold" textAlign="center">
          {t('auth.register.title')}
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
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="firstName" style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    {t('auth.register.firstName')}
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    autoComplete="given-name"
                    placeholder="Enter your first name"
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
                
                <div style={{ flex: 1 }}>
                  <label htmlFor="lastName" style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                    {t('auth.register.lastName')}
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    autoComplete="family-name"
                    placeholder="Enter your last name"
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
              </div>

              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                  {t('auth.register.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
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
              </div>

              <div>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                  {t('auth.register.password')}
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create a password (min. 6 characters)"
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
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                  {t('auth.register.confirmPassword')}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
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

              {/* Account Type Selection */}
              <div style={{ padding: '20px', border: '2px solid #E2E8F0', borderRadius: '12px', backgroundColor: '#F7FAFC' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#2D3748' }}>
                  Choose Your Account Type
                </div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  {/* Customer Account */}
                  <label style={{ 
                    flex: 1, 
                    padding: '16px', 
                    border: wantsToBecomeStoreOwner ? '2px solid #E2E8F0' : '2px solid #3182CE', 
                    borderRadius: '8px', 
                    backgroundColor: wantsToBecomeStoreOwner ? 'white' : '#EBF8FF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="radio" 
                      name="accountType"
                      checked={!wantsToBecomeStoreOwner}
                      onChange={() => setWantsToBecomeStoreOwner(false)}
                      style={{ marginBottom: '8px' }}
                    />
                    <div style={{ fontWeight: 'bold', color: '#3182CE', fontSize: '16px' }}>
                      🛍️ Customer Account
                    </div>
                    <div style={{ fontSize: '14px', color: '#4A5568', marginTop: '4px' }}>
                      Shop and purchase products from various stores
                    </div>
                  </label>
                  
                  {/* Store Owner Account */}
                  <label style={{ 
                    flex: 1, 
                    padding: '16px', 
                    border: wantsToBecomeStoreOwner ? '2px solid #D69E2E' : '2px solid #E2E8F0', 
                    borderRadius: '8px', 
                    backgroundColor: wantsToBecomeStoreOwner ? '#FFFBEB' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input 
                      type="radio" 
                      name="accountType"
                      checked={wantsToBecomeStoreOwner}
                      onChange={() => setWantsToBecomeStoreOwner(true)}
                      style={{ marginBottom: '8px' }}
                    />
                    <div style={{ fontWeight: 'bold', color: '#D69E2E', fontSize: '16px' }}>
                      🏪 Store Owner Account
                    </div>
                    <div style={{ fontSize: '14px', color: '#4A5568', marginTop: '4px' }}>
                      Create your store and sell products on our platform
                    </div>
                  </label>
                </div>
              </div>

              {/* Store Information - Only show when store owner is selected */}
              {wantsToBecomeStoreOwner && (
                <div style={{ 
                  padding: '20px', 
                  border: '2px solid #D69E2E', 
                  borderRadius: '12px', 
                  backgroundColor: '#FFFBEB',
                  marginTop: '16px'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#D69E2E' }}>
                    🏪 Store Information
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Store Name */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                        Store Name *
                      </label>
                      <input
                        type="text"
                        value={storeData.storeName}
                        onChange={(e) => setStoreData({...storeData, storeName: e.target.value})}
                        placeholder="Enter your store name"
                        required={wantsToBecomeStoreOwner}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #E2E8F0',
                          borderRadius: '8px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Store Description */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                        Store Description *
                      </label>
                      <textarea
                        value={storeData.storeDescription}
                        onChange={(e) => setStoreData({...storeData, storeDescription: e.target.value})}
                        placeholder="Describe your store and what you sell"
                        required={wantsToBecomeStoreOwner}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #E2E8F0',
                          borderRadius: '8px',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Business Category & Type */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                          Business Category *
                        </label>
                        <select
                          value={storeData.businessCategory}
                          onChange={(e) => setStoreData({...storeData, businessCategory: e.target.value})}
                          required={wantsToBecomeStoreOwner}
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #E2E8F0',
                            borderRadius: '8px',
                            outline: 'none',
                          }}
                        >
                          <option value="">Select Category</option>
                          <option value="electronics">Electronics & Technology</option>
                          <option value="fashion">Fashion & Clothing</option>
                          <option value="home-garden">Home & Garden</option>
                          <option value="health-beauty">Health & Beauty</option>
                          <option value="sports-outdoors">Sports & Outdoors</option>
                          <option value="books-media">Books & Media</option>
                          <option value="toys-games">Toys & Games</option>
                          <option value="food-beverages">Food & Beverages</option>
                          <option value="automotive">Automotive</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                          Business Type *
                        </label>
                        <select
                          value={storeData.businessType}
                          onChange={(e) => setStoreData({...storeData, businessType: e.target.value})}
                          required={wantsToBecomeStoreOwner}
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #E2E8F0',
                            borderRadius: '8px',
                            outline: 'none',
                          }}
                        >
                          <option value="">Select Type</option>
                          <option value="individual">Individual Seller</option>
                          <option value="small-business">Small Business</option>
                          <option value="corporation">Corporation</option>
                          <option value="manufacturer">Manufacturer</option>
                          <option value="wholesaler">Wholesaler</option>
                          <option value="retailer">Retailer</option>
                        </select>
                      </div>
                    </div>

                    {/* Contact Phone & Business Address */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                          Contact Phone *
                        </label>
                        <input
                          type="tel"
                          value={storeData.contactPhone}
                          onChange={(e) => setStoreData({...storeData, contactPhone: e.target.value})}
                          placeholder="+90 555 123 4567"
                          required={wantsToBecomeStoreOwner}
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #E2E8F0',
                            borderRadius: '8px',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                          Tax Number *
                        </label>
                        <input
                          type="text"
                          value={storeData.taxNumber}
                          onChange={(e) => setStoreData({...storeData, taxNumber: e.target.value})}
                          placeholder="Tax identification number"
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: '2px solid #E2E8F0',
                            borderRadius: '8px',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    {/* Business Address */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                        Business Address *
                      </label>
                      <textarea
                        value={storeData.businessAddress}
                        onChange={(e) => setStoreData({...storeData, businessAddress: e.target.value})}
                        placeholder="Enter your complete business address"
                        required={wantsToBecomeStoreOwner}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #E2E8F0',
                          borderRadius: '8px',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Website (Optional) */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                        Website (Optional)
                      </label>
                      <input
                        type="url"
                        value={storeData.website || ''}
                        onChange={(e) => setStoreData({...storeData, website: e.target.value})}
                        placeholder="https://your-website.com (optional)"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #E2E8F0',
                          borderRadius: '8px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
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
                {isSubmitting ? t('auth.register.registering') : t('auth.register.submit')}
              </button>
            </div>
          </form>

          <VStack spacing={4} mt={6}>
            <Text textAlign="center" fontSize="sm">
              {t('auth.register.hasAccount')}{' '}
              <Link color="blue.500" onClick={() => navigate('/login')} cursor="pointer">
                {t('auth.register.signIn')}
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default RegisterPage;