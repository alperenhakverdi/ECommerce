import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ProfileLayout } from '../components/ProfileLayout';
import { SecuritySettings } from '../components/SecuritySettings';

const SecuritySettingsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <ProfileLayout>
        <SecuritySettings />
      </ProfileLayout>
    </ProtectedRoute>
  );
};

export default SecuritySettingsPage;