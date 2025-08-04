'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import ProvidersPage from '@/components/ProvidersPage';

export default function Providers() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <ProvidersPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
