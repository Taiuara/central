'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'provider', 'collaborator']}>
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
