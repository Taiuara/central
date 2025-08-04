'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  console.log('🏠 Estado da página principal:', { 
    user: user ? `${user.email} (${user.role})` : 'null', 
    loading 
  });

  if (loading) {
    console.log('⏳ Mostrando tela de loading');
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('👤 Usuário não autenticado - mostrando login');
    return <LoginForm />;
  }

  console.log('✅ Usuário autenticado - mostrando dashboard');
  return (
    <DashboardLayout>
      <Dashboard />
    </DashboardLayout>
  );
}
