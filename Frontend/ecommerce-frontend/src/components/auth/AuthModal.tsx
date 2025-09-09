import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NativeLoginForm } from './NativeLoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login' 
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Reset mode to default when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  const handleSuccess = () => {
    onClose();
  };

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {mode === 'login' ? (
            <NativeLoginForm 
              onSwitchToRegister={switchToRegister}
              onSuccess={handleSuccess}
            />
          ) : (
            <RegisterForm 
              onSwitchToLogin={switchToLogin}
              onSuccess={handleSuccess}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};