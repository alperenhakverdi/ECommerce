import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ProfileLayout } from '../components/ProfileLayout';
import { UserProfile } from '../components/UserProfile';

const UserProfilePage: React.FC = () => {
  return (
    <ProtectedRoute>
      <ProfileLayout>
        <UserProfile />
      </ProfileLayout>
    </ProtectedRoute>
  );
};

export default UserProfilePage;