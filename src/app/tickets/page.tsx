'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import TicketsPage from '@/components/TicketsPage';

export default function Tickets() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'provider', 'collaborator']}>
      <DashboardLayout>
        <TicketsPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
