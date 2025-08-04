'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Provider, Ticket } from '@/types';
// import { formatCurrency, formatDate } from '@/utils/calculations';

// Funções temporárias inline
function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch {
    return '';
  }
}
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  X 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface TicketFormData {
  providerId: string;
  clientName: string;
  whatsapp: string;
  protocol: string;
  attendanceDate: string;
  level: 'N1' | 'N2' | 'Massivo' | 'Venda' | 'Pré-Venda';
  description: string;
  saleValue?: number;
}

const initialFormData: TicketFormData = {
  providerId: '',
  clientName: '',
  whatsapp: '',
  protocol: '',
  attendanceDate: new Date().toISOString().split('T')[0],
  level: 'N1',
  description: '',
  saleValue: undefined,
};

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<TicketFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [providerFilter, setProviderFilter] = useState<string>('');

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Carregar provedores
      const providersSnap = await getDocs(collection(db, 'providers'));
      const providersData = providersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : new Date(),
      })) as Provider[];
      setProviders(providersData);

      // Carregar chamados baseado no role do usuário
      let ticketsQuery;
      if (user.role === 'admin') {
        ticketsQuery = query(
          collection(db, 'tickets'),
          orderBy('attendanceDate', 'desc')
        );
      } else if (user.role === 'provider') {
        console.log('[DEBUG] Provider user:', user);
        console.log('[DEBUG] Provider ID:', user.providerId);
        
        if (!user.providerId) {
          console.error('[ERROR] Provider user does not have providerId assigned');
          console.log('[ERROR] User object:', user);
          alert('Erro: Usuário provider não tem provedor associado. Entre em contato com o administrador.');
          setTickets([]);
          setLoading(false);
          return;
        }
        
        ticketsQuery = query(
          collection(db, 'tickets'),
          where('providerId', '==', user.providerId),
          orderBy('attendanceDate', 'desc')
        );
      } else {
        ticketsQuery = query(
          collection(db, 'tickets'),
          orderBy('attendanceDate', 'desc')
        );
      }

      const ticketsSnap = await getDocs(ticketsQuery);
      const ticketsData = ticketsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        attendanceDate: doc.data().attendanceDate ? doc.data().attendanceDate.toDate() : null,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : new Date(),
      })) as Ticket[];

      console.log('[DEBUG] Total tickets loaded:', ticketsData.length);
      if (user.role === 'provider') {
        console.log('[DEBUG] Tickets for provider:', ticketsData);
        console.log('[DEBUG] Sample ticket providerId:', ticketsData[0]?.providerId);
      }

      setTickets(ticketsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const provider = providers.find(p => p.id === formData.providerId);
      if (!provider) return;

      const ticketData = {
        providerId: formData.providerId,
        providerName: provider.name,
        clientName: formData.clientName,
        whatsapp: formData.whatsapp,
        protocol: formData.protocol,
        attendanceDate: Timestamp.fromDate(new Date(formData.attendanceDate)),
        level: formData.level,
        description: formData.description,
        saleValue: formData.level === 'Venda' ? formData.saleValue : null,
        createdBy: user.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (modalMode === 'create') {
        await addDoc(collection(db, 'tickets'), ticketData);
      } else if (modalMode === 'edit' && selectedTicket) {
        await updateDoc(doc(db, 'tickets', selectedTicket.id), {
          ...ticketData,
          createdAt: Timestamp.fromDate(selectedTicket.createdAt),
        });
      }

      setShowModal(false);
      setFormData(initialFormData);
      setSelectedTicket(null);
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar chamado:', error);
    }
  };

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      providerId: ticket.providerId,
      clientName: ticket.clientName,
      whatsapp: ticket.whatsapp,
      protocol: ticket.protocol,
      attendanceDate: ticket.attendanceDate.toISOString().split('T')[0],
      level: ticket.level,
      description: ticket.description,
      saleValue: ticket.saleValue || undefined,
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (ticket: Ticket) => {
    if (!confirm('Tem certeza que deseja excluir este chamado?')) return;

    try {
      await deleteDoc(doc(db, 'tickets', ticket.id));
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir chamado:', error);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredTickets.map(ticket => ({
      'Provedor': ticket.providerName,
      'Cliente': ticket.clientName,
      'WhatsApp': ticket.whatsapp,
      'Protocolo': ticket.protocol,
      'Data': formatDate(ticket.attendanceDate),
      'Nível': ticket.level,
      'Descrição': ticket.description,
      'Valor da Venda': ticket.saleValue ? `R$ ${ticket.saleValue.toFixed(2)}` : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chamados');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `chamados_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.whatsapp.includes(searchTerm) ||
      ticket.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = !levelFilter || ticket.level === levelFilter;
    const matchesProvider = !providerFilter || ticket.providerId === providerFilter;

    return matchesSearch && matchesLevel && matchesProvider;
  });

  const canCreateEdit = user?.role === 'admin' || user?.role === 'collaborator';
  const canDelete = user?.role === 'admin';

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-16 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chamados</h1>
          <p className="text-gray-600">Gerencie os chamados de suporte</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Exportar Excel
          </button>
          {canCreateEdit && (
            <button
              onClick={() => {
                setModalMode('create');
                setFormData(initialFormData);
                setSelectedTicket(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Novo Chamado
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cliente, protocolo, WhatsApp..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Todos os níveis</option>
              <option value="N1">N1</option>
              <option value="N2">N2</option>
              <option value="Pré-Venda">Pré-Venda</option>
              <option value="Massivo">Massivo</option>
              <option value="Venda">Venda</option>
            </select>
          </div>

          {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provedor
              </label>
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Todos os provedores</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setLevelFilter('');
                setProviderFilter('');
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Filter size={16} />
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de chamados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Provedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Protocolo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Nível
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ticket.clientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {ticket.providerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {ticket.protocol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {formatDate(ticket.attendanceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ticket.level === 'N1' ? 'bg-blue-100 text-blue-800' :
                      ticket.level === 'N2' ? 'bg-green-100 text-green-800' :
                      ticket.level === 'Pré-Venda' ? 'bg-cyan-100 text-cyan-800' :
                      ticket.level === 'Massivo' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {ticket.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {ticket.whatsapp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleView(ticket)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                      {canCreateEdit && (
                        <button
                          onClick={() => handleEdit(ticket)}
                          className="text-green-600 hover:text-green-800"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(ticket)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-800">Nenhum chamado encontrado</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Novo Chamado' : 
                 modalMode === 'edit' ? 'Editar Chamado' : 'Visualizar Chamado'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {modalMode === 'view' && selectedTicket ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTicket.clientName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provedor</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTicket.providerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTicket.whatsapp}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Protocolo</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTicket.protocol}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTicket.attendanceDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nível</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTicket.level}</p>
                  </div>
                  {selectedTicket.saleValue && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valor da Venda</label>
                      <p className="mt-1 text-sm text-gray-900">R$ {selectedTicket.saleValue.toFixed(2)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.description}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provedor *
                    </label>
                    <select
                      value={formData.providerId}
                      onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                      required
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                    >
                      <option value="">Selecione um provedor</option>
                      {providers.map(provider => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      required
                      disabled={modalMode === 'view'}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protocolo *
                    </label>
                    <input
                      type="text"
                      value={formData.protocol}
                      onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                      required
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data do Atendimento *
                    </label>
                    <input
                      type="date"
                      value={formData.attendanceDate}
                      onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                      required
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível do Atendimento *
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        level: e.target.value as 'N1' | 'N2' | 'Massivo' | 'Venda' | 'Pré-Venda',
                        saleValue: e.target.value !== 'Venda' ? undefined : formData.saleValue
                      })}
                      required
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                    >
                      <option value="N1">N1</option>
                      <option value="N2">N2</option>
                      <option value="Pré-Venda">Pré-Venda</option>
                      <option value="Massivo">Massivo</option>
                      <option value="Venda">Venda</option>
                    </select>
                  </div>

                  {formData.level === 'Venda' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor da Venda (R$) *
                      </label>
                      <input
                        type="number"
                        value={formData.saleValue || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          saleValue: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        required={formData.level === 'Venda'}
                        disabled={modalMode === 'view'}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    disabled={modalMode === 'view'}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                  />
                </div>

                {modalMode !== 'view' && (
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {modalMode === 'create' ? 'Criar Chamado' : 'Salvar Alterações'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
