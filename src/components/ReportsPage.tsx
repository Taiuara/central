'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where, getDoc, doc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Provider, Ticket } from '@/types';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  TrendingUp,
  DollarSign,
  Ticket as TicketIcon,
  Building2
} from 'lucide-react';

export default function ReportsPage() {
  const { user: currentUser } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let providersSnap: QuerySnapshot<DocumentData> | { docs: { id: string; data: () => DocumentData }[] };
      let ticketsSnap: QuerySnapshot<DocumentData>;

      // Se for provedor, filtrar apenas seus dados
      if (currentUser?.role === 'provider' && currentUser.providerId) {
        console.log('[DEBUG] Fetching data for provider ID:', currentUser.providerId);
        // Buscar o documento do provedor diretamente pelo ID
        const providerDoc = await getDoc(doc(db, 'providers', currentUser.providerId));
        console.log('[DEBUG] Provider document exists:', providerDoc.exists());
        console.log('[DEBUG] Provider document data:', providerDoc.data());
        const ticketsQuery = query(collection(db, 'tickets'), where('providerId', '==', currentUser.providerId));
        
        const [ticketsSnap_] = await Promise.all([
          getDocs(ticketsQuery)
        ]);
        
        ticketsSnap = ticketsSnap_;
        
        // Criar um objeto que simula a estrutura do getDocs
        if (providerDoc.exists()) {
          providersSnap = {
            docs: [{
              id: providerDoc.id,
              data: () => providerDoc.data()
            }]
          };
        } else {
          providersSnap = { docs: [] };
        }
      } else {
        [providersSnap, ticketsSnap] = await Promise.all([
          getDocs(collection(db, 'providers')),
          getDocs(collection(db, 'tickets'))
        ]);
      }

      const providersData = providersSnap.docs.map((docSnap: { id: string; data: () => DocumentData }) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      })) as Provider[];

      console.log('[DEBUG] Final providers data:', providersData);
      
      const ticketsData = ticketsSnap.docs.map((docSnap: { id: string; data: () => DocumentData }) => ({
        id: docSnap.id,
        ...docSnap.data(),
        attendanceDate: docSnap.data().attendanceDate ? docSnap.data().attendanceDate.toDate() : null,
        createdAt: docSnap.data().createdAt ? docSnap.data().createdAt.toDate() : new Date(),
        updatedAt: docSnap.data().updatedAt ? docSnap.data().updatedAt.toDate() : new Date(),
      })) as Ticket[];

      setProviders(providersData);
      setTickets(ticketsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, fetchData]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getFilteredTickets = () => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // Final do dia

    return tickets.filter(ticket => {
      const ticketDate = ticket.createdAt;
      const dateInRange = ticketDate >= startDate && ticketDate <= endDate;
      const providerMatch = selectedProvider === 'all' || ticket.providerId === selectedProvider;
      return dateInRange && providerMatch;
    });
  };

  const getReportData = () => {
    const filteredTickets = getFilteredTickets();
    const selectedProviders = selectedProvider === 'all' 
      ? providers 
      : providers.filter(p => p.id === selectedProvider);

    console.log('[DEBUG] Selected providers:', selectedProviders);
    console.log('[DEBUG] Current user role:', currentUser?.role);
    console.log('[DEBUG] Current user providerId:', currentUser?.providerId);

    const reportData = selectedProviders.map(provider => {
      console.log('[DEBUG] Processing provider:', provider);
      const providerTickets = filteredTickets.filter(t => t.providerId === provider.id);
      
      const n1Tickets = providerTickets.filter(t => t.level === 'N1').length;
      const n2Tickets = providerTickets.filter(t => t.level === 'N2').length;
      const massiveTickets = providerTickets.filter(t => t.level === 'Massivo').length;
      const salesTickets = providerTickets.filter(t => t.level === 'Venda');
      
      const fixedValue = provider.fixedValue || 0;
      console.log('[DEBUG] Provider fixed value:', fixedValue);
      const ticketsValue = (n1Tickets * (provider.valueN1 || 0)) + (n2Tickets * (provider.valueN2 || 0));
      const salesValue = salesTickets.reduce((total, ticket) => total + (ticket.saleValue || 0), 0) * (provider.salesCommission || 0) / 100;
      const massiveValue = massiveTickets * (provider.valueMassive || 0);
      const totalValue = fixedValue + ticketsValue + salesValue + massiveValue;
      
      return {
        provider,
        tickets: providerTickets,
        metrics: {
          totalTickets: providerTickets.length,
          n1Tickets,
          n2Tickets,
          massiveTickets,
          salesTickets: salesTickets.length,
          fixedValue,
          ticketsValue,
          salesValue,
          massiveValue,
          totalValue
        }
      };
    });

    return reportData;
  };

  const exportToExcel = () => {
    const reportData = getReportData();
    const filteredTickets = getFilteredTickets();

    // Planilha 1: Resumo por Provedor
    const summaryData = reportData.map(item => ({
      'Provedor': item.provider.name,
      'Total de Chamados': item.metrics.totalTickets,
      'Chamados N1': item.metrics.n1Tickets,
      'Chamados N2': item.metrics.n2Tickets,
      'Chamados Massivos': item.metrics.massiveTickets,
      'Vendas': item.metrics.salesTickets,
      'Valor Fixo': item.metrics.fixedValue,
      'Valor dos Chamados': item.metrics.ticketsValue,
      'Valor das Vendas': item.metrics.salesValue,
      'Valor Massivo': item.metrics.massiveValue,
      'Valor Total': item.metrics.totalValue
    }));

    // Planilha 2: Detalhamento dos Chamados
    const ticketsData = filteredTickets.map(ticket => ({
      'Data': formatDate(ticket.createdAt),
      'Provedor': ticket.providerName,
      'Cliente': ticket.clientName,
      'WhatsApp': ticket.whatsapp,
      'Protocolo': ticket.protocol,
      'Nível': ticket.level,
      'Descrição': ticket.description,
      'Valor da Venda': ticket.saleValue || 0,
    }));

    // Criar workbook
    const wb = XLSX.utils.book_new();
    
    // Adicionar planilhas
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    const ticketsWs = XLSX.utils.json_to_sheet(ticketsData);
    
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo por Provedor');
    XLSX.utils.book_append_sheet(wb, ticketsWs, 'Detalhamento dos Chamados');

    // Baixar arquivo
    const fileName = `relatorio_${dateRange.startDate}_${dateRange.endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const reportData = getReportData();
  const totalMetrics = reportData.reduce((acc, item) => ({
    totalTickets: acc.totalTickets + item.metrics.totalTickets,
    n1Tickets: acc.n1Tickets + item.metrics.n1Tickets,
    n2Tickets: acc.n2Tickets + item.metrics.n2Tickets,
    massiveTickets: acc.massiveTickets + item.metrics.massiveTickets,
    salesTickets: acc.salesTickets + item.metrics.salesTickets,
    totalValue: acc.totalValue + item.metrics.totalValue,
  }), {
    totalTickets: 0,
    n1Tickets: 0,
    n2Tickets: 0,
    massiveTickets: 0,
    salesTickets: 0,
    totalValue: 0,
  });

  if (!currentUser || !['admin', 'provider'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Acesso negado.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada de chamados e receitas</p>
        </div>
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {currentUser.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provedor
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Todos os Provedores</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total de Chamados</p>
              <p className="text-2xl font-bold text-gray-900">{totalMetrics.totalTickets}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TicketIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Vendas</p>
              <p className="text-2xl font-bold text-gray-900">{totalMetrics.salesTickets}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMetrics.totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                {currentUser.role === 'admin' ? 'Provedores' : 'Valor Fixo'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {currentUser.role === 'admin' 
                  ? reportData.length 
                  : (() => {
                      console.log('[DEBUG] Provider data:', reportData[0]?.provider);
                      console.log('[DEBUG] Fixed value:', reportData[0]?.provider?.fixedValue);
                      return formatCurrency(reportData[0]?.provider?.fixedValue || 0);
                    })()
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              {currentUser.role === 'admin' ? (
                <Building2 className="w-6 h-6 text-purple-600" />
              ) : (
                <DollarSign className="w-6 h-6 text-purple-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Relatório Detalhado por Provedor */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detalhamento por Provedor</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Provedor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Chamados</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">N1</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">N2</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Massivo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vendas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.map((item) => (
                <tr key={item.provider.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{item.provider.name}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{item.metrics.totalTickets}</td>
                  <td className="py-3 px-4 text-gray-700">{item.metrics.n1Tickets}</td>
                  <td className="py-3 px-4 text-gray-700">{item.metrics.n2Tickets}</td>
                  <td className="py-3 px-4 text-gray-700">{item.metrics.massiveTickets}</td>
                  <td className="py-3 px-4 text-gray-700">{item.metrics.salesTickets}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(item.metrics.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum dado encontrado para o período selecionado</p>
          </div>
        )}
      </div>

      {/* Breakdown de Valores */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Breakdown de Valores</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Provedor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Fixo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Chamados</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Vendas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Massivo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.map((item) => (
                  <tr key={item.provider.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{item.provider.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{formatCurrency(item.metrics.fixedValue)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatCurrency(item.metrics.ticketsValue)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatCurrency(item.metrics.salesValue)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatCurrency(item.metrics.massiveValue)}</td>
                    <td className="py-3 px-4 font-bold text-green-600">{formatCurrency(item.metrics.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
