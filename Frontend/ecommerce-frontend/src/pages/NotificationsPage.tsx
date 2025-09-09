import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ProfileLayout } from '../components/ProfileLayout';
import { NotificationCenter } from '../components/NotificationCenter';

const NotificationsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <ProfileLayout>
        <NotificationCenter />
      </ProfileLayout>
    </ProtectedRoute>
  );
};

export default NotificationsPage;