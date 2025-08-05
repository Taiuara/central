'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Provider, Ticket } from '@/types';
import { safeToDate, safeToAttendanceDate } from '@/utils/dateUtils';
import { FORCE_REBUILD } from '@/constants/deploy';
import { BUILD_VERSION } from '@/build';
// import { calculateProviderMetrics, formatCurrency, formatDate } from '@/utils/calculations';

// Funções temporárias inline
function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch {
    return '';
  }
}

function calculateProviderMetrics(provider: Provider, tickets: Ticket[], referenceDate: Date = new Date()) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  console.log('🚀 DEPLOY VERSION:', FORCE_REBUILD, 'BUILD:', BUILD_VERSION);
  const periodDays = provider.periodDays || 30;
  const startDay = provider.startDay || 1;
  const periodType = provider.periodType || 'monthly';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refDate = referenceDate;
  
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  
  if (periodType === 'monthly') {
    // Período mensal: do dia 1 ao último dia do mês
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    startDate = new Date(currentYear, currentMonth, 1);
    endDate = new Date(currentYear, currentMonth + 1, 0); // último dia do mês
  } else {
    // Período fixo: sempre do startDay de um mês ao startDay do mês seguinte
    // Ex: Bkup dia 28/07 a 28/08, não 27/08
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Determinar o mês correto para o período atual
    let periodMonth = currentMonth;
    let periodYear = currentYear;
    
    // Se estamos antes do dia de início do mês atual, o período atual começou no mês anterior
    if (now.getDate() < startDay) {
      periodMonth = currentMonth - 1;
      if (periodMonth < 0) {
        periodMonth = 11; // dezembro do ano anterior
        periodYear = currentYear - 1;
      }
    }
    
    // Data de início: startDay do mês determinado
    startDate = new Date(periodYear, periodMonth, startDay);
    
    // Data final: startDay do próximo mês (não startDay - 1)
    // Para Bkup: 28/07 a 28/08
    let endMonth = periodMonth + 1;
    let endYear = periodYear;
    if (endMonth > 11) {
      endMonth = 0; // janeiro do próximo ano
      endYear = periodYear + 1;
    }
    endDate = new Date(endYear, endMonth, startDay);
  }
  
  // Filtrar tickets dentro do período calculado
  const periodTickets = tickets.filter(ticket => {
    const ticketDate = ticket.attendanceDate instanceof Date ? ticket.attendanceDate : new Date(ticket.attendanceDate);
    // Para período fixo: startDate <= ticket < endDate (endDate é exclusive)
    // Para período mensal: startDate <= ticket <= endDate (endDate é inclusive)
    if (periodType === 'fixed') {
      return ticketDate >= startDate && ticketDate < endDate;
    } else {
      return ticketDate >= startDate && ticketDate <= endDate;
    }
  });
  
  // Calcular métricas baseadas nos tickets filtrados
  const n1Tickets = periodTickets.filter(t => t.level === 'N1').length;
  const n2Tickets = periodTickets.filter(t => t.level === 'N2').length;
  const massiveTickets = periodTickets.filter(t => t.level === 'Massivo').length;
  const salesTickets = periodTickets.filter(t => t.level === 'Venda');
  const preSalesTickets = periodTickets.filter(t => t.level === 'Pré-Venda').length;
  
  const totalTickets = periodTickets.length;
  const fixedValue = provider.fixedValue || 0;
  
  // Aplicar regra da franquia: apenas contabilizar N1+N2 quando ultrapassar a franquia
  const franchise = provider.franchise || 0;
  const totalN1N2 = n1Tickets + n2Tickets;
  let billableN1Tickets = 0;
  let billableN2Tickets = 0;
  
  // Debug logs para Bkup
  console.log('=== PROVIDER DEBUG ===', provider.name, provider.franchise);
  console.log('🚀 FRANCHISE SYSTEM ACTIVE - v1.0.1');
  if (provider.name && provider.name.toLowerCase().includes('bkup')) {
    console.log('🔍 [BKUP DEBUG] Dados do provedor:', {
      name: provider.name,
      franchise: provider.franchise,
      periodType: provider.periodType,
      startDay: provider.startDay,
      valueN1: provider.valueN1,
      valueN2: provider.valueN2
    });
    console.log('🔍 [BKUP DEBUG] Tickets:', {
      n1Tickets,
      n2Tickets,
      totalN1N2,
      massiveTickets,
      franchise
    });
  }
  
  if (franchise > 0) {
    // Se há franquia, só contabiliza N1+N2 que excedem a franquia
    const exceededTickets = Math.max(0, totalN1N2 - franchise);
    if (provider.name && provider.name.toLowerCase().includes('bkup')) {
      console.log('🔍 [BKUP DEBUG] Franquia aplicada:', {
        franchise,
        totalN1N2,
        exceededTickets,
        withinFranchise: exceededTickets === 0
      });
    }
    
    if (exceededTickets > 0) {
      // Distribuir os tickets excedentes proporcionalmente entre N1 e N2
      const n1Ratio = n1Tickets > 0 ? n1Tickets / totalN1N2 : 0;
      const n2Ratio = n2Tickets > 0 ? n2Tickets / totalN1N2 : 0;
      billableN1Tickets = Math.floor(exceededTickets * n1Ratio);
      billableN2Tickets = Math.floor(exceededTickets * n2Ratio);
      
      if (provider.name && provider.name.toLowerCase().includes('bkup')) {
        console.log('🔍 [BKUP DEBUG] Tickets cobráveis:', {
          billableN1Tickets,
          billableN2Tickets,
          n1Ratio,
          n2Ratio
        });
      }
    } else if (provider.name && provider.name.toLowerCase().includes('bkup')) {
      console.log('✅ [BKUP DEBUG] Dentro da franquia - N1 e N2 não cobráveis');
    }
  } else {
    // Se não há franquia, contabiliza todos os N1 e N2
    billableN1Tickets = n1Tickets;
    billableN2Tickets = n2Tickets;
    
    if (provider.name && provider.name.toLowerCase().includes('bkup')) {
      console.log('⚠️ [BKUP DEBUG] Sem franquia configurada - cobrando todos os tickets');
    }
  }
  
  // Massivos sempre contabilizam (antes e depois dos 200)
  const ticketsValue = (billableN1Tickets * (provider.valueN1 || 0)) + 
                      (billableN2Tickets * (provider.valueN2 || 0)) + 
                      (preSalesTickets * (provider.valueN1 || 0)) + 
                      (massiveTickets * (provider.valueMassive || 0));
  
  const salesValue = salesTickets.reduce((total: number, ticket: Ticket) => total + (ticket.saleValue || 0), 0) * (provider.salesCommission || 0) / 100;
  const exceedsFramework = massiveTickets * (provider.valueMassive || 0);
  const totalValue = fixedValue + ticketsValue + salesValue;
  
  // Debug final para Bkup
  if (provider.name && provider.name.toLowerCase().includes('bkup')) {
    console.log('🔍 [BKUP DEBUG] Cálculo final:', {
      fixedValue,
      billableN1Value: billableN1Tickets * (provider.valueN1 || 0),
      billableN2Value: billableN2Tickets * (provider.valueN2 || 0),
      massiveValue: massiveTickets * (provider.valueMassive || 0),
      ticketsValue,
      salesValue,
      totalValue
    });
    console.log('✅ [BKUP DEBUG] Resultado esperado para 30 N1+N2: R$ 1.100,00 (apenas fixo)');
  }
  
  return {
    totalTickets,
    n1Tickets,
    n2Tickets,
    massiveTickets,
    salesTickets: salesTickets.length,
    preSalesTickets,
    totalValue,
    fixedValue,
    ticketsValue,
    salesValue,
    exceedsFramework,
    period: {
      startDate,
      endDate
    }
  };
}
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Ticket as TicketIcon,
  Building2 
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
}

function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-sm text-green-600 font-medium">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metrics, setMetrics] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [providers, setProviders] = useState<Provider[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Função para garantir que valores não sejam undefined
  const safeValue = (value: number | undefined | null, fallback: number = 0) => {
    return value !== undefined && value !== null ? value : fallback;
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (user.role === 'admin') {
        // Admin vê todos os dados
        const [providersSnap, ticketsSnap] = await Promise.all([
          getDocs(collection(db, 'providers')),
          getDocs(collection(db, 'tickets'))
        ]);

        const providersData = providersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: safeToDate(doc.data().createdAt),
          updatedAt: safeToDate(doc.data().updatedAt),
        })) as Provider[];

        const ticketsData = ticketsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          attendanceDate: safeToAttendanceDate(doc.data().attendanceDate),
          createdAt: safeToDate(doc.data().createdAt),
          updatedAt: safeToDate(doc.data().updatedAt),
        })) as Ticket[];

        setProviders(providersData);
        setTickets(ticketsData);

        // Calcular métricas gerais para admin
        let totalTickets = 0;
        const totalProviders = providersData.length;
        let totalValue = 0;

        const providerMetrics = providersData.map(provider => {
          const providerTickets = ticketsData.filter(ticket => ticket.providerId === provider.id);
          const metrics = calculateProviderMetrics(provider, providerTickets);
          totalValue += metrics.totalValue;
          totalTickets += metrics.totalTickets; // Somar tickets do período calculado
          return { provider, metrics };
        });

        setMetrics({
          totalTickets,
          totalProviders,
          totalValue,
          providerMetrics,
          n1Tickets: providerMetrics.reduce((sum, pm) => sum + pm.metrics.n1Tickets, 0),
          n2Tickets: providerMetrics.reduce((sum, pm) => sum + pm.metrics.n2Tickets, 0),
          massiveTickets: providerMetrics.reduce((sum, pm) => sum + pm.metrics.massiveTickets, 0),
          salesTickets: providerMetrics.reduce((sum, pm) => sum + pm.metrics.salesTickets, 0),
          preSalesTickets: providerMetrics.reduce((sum, pm) => sum + pm.metrics.preSalesTickets, 0),
        });

      } else if (user.role === 'provider') {
        // Provider vê apenas seus dados
        const providerDoc = await getDoc(doc(db, 'providers', user.providerId!));
        if (!providerDoc.exists()) return;

        const providerData = {
          id: providerDoc.id,
          ...providerDoc.data(),
          createdAt: safeToDate(providerDoc.data()!.createdAt),
          updatedAt: safeToDate(providerDoc.data()!.updatedAt),
        } as Provider;

        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('providerId', '==', user.providerId)
        );
        const ticketsSnap = await getDocs(ticketsQuery);
        
        const ticketsData = ticketsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          attendanceDate: safeToAttendanceDate(doc.data().attendanceDate),
          createdAt: safeToDate(doc.data().createdAt),
          updatedAt: safeToDate(doc.data().updatedAt),
        })) as Ticket[];

        setTickets(ticketsData);

        const providerMetrics = calculateProviderMetrics(providerData, ticketsData);
        
        setMetrics({
          ...providerMetrics,
          provider: providerData
        });

      } else if (user.role === 'collaborator') {
        // Colaborador vê estatísticas básicas
        const ticketsSnap = await getDocs(collection(db, 'tickets'));
        const ticketsData = ticketsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          attendanceDate: safeToAttendanceDate(doc.data().attendanceDate),
          createdAt: safeToDate(doc.data().createdAt),
          updatedAt: safeToDate(doc.data().updatedAt),
        })) as Ticket[];

        setTickets(ticketsData);
        
        const totalTickets = ticketsData.length;
        const todayTickets = ticketsData.filter(ticket => {
          const today = new Date();
          const ticketDate = ticket.attendanceDate;
          // Verificar se ticketDate existe e é uma data válida
          if (!ticketDate || !(ticketDate instanceof Date)) {
            return false;
          }
          return ticketDate.toDateString() === today.toDateString();
        }).length;

        setMetrics({
          totalTickets,
          todayTickets,
          n1Tickets: ticketsData.filter(t => t.level === 'N1').length,
          n2Tickets: ticketsData.filter(t => t.level === 'N2').length,
          massiveTickets: ticketsData.filter(t => t.level === 'Massivo').length,
          salesTickets: ticketsData.filter(t => t.level === 'Venda').length,
          preSalesTickets: ticketsData.filter(t => t.level === 'Pré-Venda').length,
        });
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total de Chamados"
          value={safeValue(metrics?.totalTickets, 0).toString()}
          icon={TicketIcon}
          color="bg-blue-500"
        />
        <MetricCard
          title="Provedores Ativos"
          value={safeValue(metrics?.totalProviders, 0).toString()}
          icon={Building2}
          color="bg-green-500"
        />
        <MetricCard
          title="Valor Total"
          value={formatCurrency(safeValue(metrics?.totalValue, 0))}
          icon={DollarSign}
          color="bg-purple-500"
        />
        <MetricCard
          title="Chamados Total"
          value={safeValue(metrics?.totalTickets, 0).toString()}
          icon={BarChart3}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Nível</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">N1</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.n1Tickets, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">N2</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.n2Tickets, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pré-Venda</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.preSalesTickets, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Massivo</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.massiveTickets, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vendas</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.salesTickets, 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Provedores</h3>
          <div className="space-y-3">
            {metrics?.providerMetrics?.slice(0, 5).map(({ provider, metrics: providerMetrics }: { provider: Provider; metrics: typeof metrics }) => (
              <div key={provider.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate">{provider.name}</span>
                <span className="font-medium text-gray-900">{formatCurrency(safeValue(providerMetrics?.totalValue, 0))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderProviderDashboard = () => (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900">Período Atual</h3>
        <p className="text-sm text-blue-700">
          {formatDate(metrics.period.startDate)} - {formatDate(metrics.period.endDate)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total de Chamados"
          value={metrics.totalTickets.toString()}
          icon={TicketIcon}
          color="bg-blue-500"
        />
        <MetricCard
          title="Valor Total"
          value={formatCurrency(metrics.totalValue)}
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          title="Valor Fixo"
          value={formatCurrency(metrics.fixedValue)}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <MetricCard
          title="Valor Chamados"
          value={formatCurrency(metrics.ticketsValue)}
          icon={BarChart3}
          color="bg-orange-500"
        />
        <MetricCard
          title="Valor Vendas"
          value={formatCurrency(metrics.salesValue)}
          icon={DollarSign}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhamento</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chamados N1</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.n1Tickets, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chamados N2</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.n2Tickets, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chamados Massivo</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.massiveTickets, 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vendas</span>
              <span className="font-medium text-gray-900">{safeValue(metrics?.salesTickets, 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Valores</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor Fixo</span>
              <span className="font-medium text-gray-900">{formatCurrency(safeValue(metrics?.fixedValue, 0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor Chamados</span>
              <span className="font-medium text-gray-900">{formatCurrency(safeValue(metrics?.ticketsValue, 0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor Vendas</span>
              <span className="font-medium text-gray-900">{formatCurrency(safeValue(metrics?.salesValue, 0))}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">{formatCurrency(safeValue(metrics?.totalValue, 0))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderCollaboratorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total de Chamados"
          value={metrics.totalTickets.toString()}
          icon={TicketIcon}
          color="bg-blue-500"
        />
        <MetricCard
          title="Chamados Hoje"
          value={metrics.todayTickets.toString()}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <MetricCard
          title="Chamados N1"
          value={metrics.n1Tickets.toString()}
          icon={BarChart3}
          color="bg-purple-500"
        />
        <MetricCard
          title="Chamados N2"
          value={metrics.n2Tickets.toString()}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Nível</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{safeValue(metrics?.n1Tickets, 0)}</div>
            <div className="text-sm text-gray-600">N1</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{safeValue(metrics?.n2Tickets, 0)}</div>
            <div className="text-sm text-gray-600">N2</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">{safeValue(metrics?.preSalesTickets, 0)}</div>
            <div className="text-sm text-gray-600">Pré-Venda</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{safeValue(metrics?.massiveTickets, 0)}</div>
            <div className="text-sm text-gray-600">Massivo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{safeValue(metrics?.salesTickets, 0)}</div>
            <div className="text-sm text-gray-600">Vendas</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo, {user?.name}! Aqui está o resumo das suas informações.
        </p>
      </div>

      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'provider' && renderProviderDashboard()}
      {user?.role === 'collaborator' && renderCollaboratorDashboard()}
    </div>
  );
}
