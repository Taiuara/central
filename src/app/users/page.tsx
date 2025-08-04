'use client';

import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import UsersPage from '@/components/UsersPage';

export default function Users() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthContext redirects to login
  }

  return (
    <DashboardLayout>
      <UsersPage />
    </DashboardLayout>
  );
}
