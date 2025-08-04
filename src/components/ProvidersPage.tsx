'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc,
  Timestamp 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Provider } from '@/types';
// import { formatCurrency, formatDate } from '@/utils/calculations';

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
  } catch (error) {
    return '';
  }
}
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  X,
  Building2 
} from 'lucide-react';

interface ProviderFormData {
  name: string;
  cnpj: string;
  franchise: number;
  valueN1: number;
  valueN2: number;
  valueMassive: number;
  salesCommission: number;
  fixedValue: number;
  startDay: number;
  endDay: number;
  periodDays: number;
  periodType: 'fixed' | 'monthly';
  email: string;
  password: string;
}

const initialFormData: ProviderFormData = {
  name: '',
  cnpj: '',
  franchise: 0,
  valueN1: 0,
  valueN2: 0,
  valueMassive: 0,
  salesCommission: 0,
  fixedValue: 0,
  startDay: 1,
  endDay: 30,
  periodDays: 30,
  periodType: 'monthly',
  email: '',
  password: '',
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<ProviderFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const providersSnap = await getDocs(collection(db, 'providers'));
      const providersData = providersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
        updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : new Date(),
      })) as Provider[];
      setProviders(providersData);
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const providerData = {
        name: formData.name,
        cnpj: formData.cnpj,
        franchise: formData.franchise,
        valueN1: formData.valueN1,
        valueN2: formData.valueN2,
        valueMassive: formData.valueMassive,
        salesCommission: formData.salesCommission,
        fixedValue: formData.fixedValue,
        startDay: formData.startDay,
        endDay: formData.endDay,
        periodDays: formData.periodDays,
        periodType: formData.periodType,
        email: formData.email,
        password: formData.password,
        createdAt: modalMode === 'create' ? Timestamp.now() : selectedProvider?.createdAt,
        updatedAt: Timestamp.now(),
      };

      if (modalMode === 'create') {
        // Criar usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const userId = userCredential.user.uid;

        // Criar documento do provedor
        const providerDocRef = await addDoc(collection(db, 'providers'), providerData);

        // Criar documento do usuário usando o UID como ID do documento
        await setDoc(doc(db, 'users', userId), {
          email: formData.email,
          name: formData.name,
          role: 'provider',
          providerId: providerDocRef.id,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

      } else if (modalMode === 'edit' && selectedProvider) {
        await updateDoc(doc(db, 'providers', selectedProvider.id), providerData);
      }

      setShowModal(false);
      setFormData(initialFormData);
      setSelectedProvider(null);
      await loadProviders();
    } catch (error) {
      console.error('Erro ao salvar provedor:', error);
      alert('Erro ao salvar provedor. Verifique se o email não está em uso.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setFormData({
      name: provider.name,
      cnpj: provider.cnpj,
      franchise: provider.franchise,
      valueN1: provider.valueN1,
      valueN2: provider.valueN2,
      valueMassive: provider.valueMassive,
      salesCommission: provider.salesCommission,
      fixedValue: provider.fixedValue,
      startDay: provider.startDay,
      endDay: provider.endDay,
      periodDays: provider.periodDays || 30,
      periodType: provider.periodType || 'monthly',
      email: provider.email,
      password: provider.password,
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (provider: Provider) => {
    setSelectedProvider(provider);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (provider: Provider) => {
    if (!confirm(`Tem certeza que deseja excluir o provedor "${provider.name}"? Esta ação não pode ser desfeita.`)) return;

    try {
      await deleteDoc(doc(db, 'providers', provider.id));
      await loadProviders();
    } catch (error) {
      console.error('Erro ao excluir provedor:', error);
    }
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.cnpj.includes(searchTerm) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-20 rounded" />
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
          <h1 className="text-2xl font-bold text-gray-900">Provedores</h1>
          <p className="text-gray-600">Gerencie os provedores parceiros</p>
        </div>
        <button
          onClick={() => {
            setModalMode('create');
            setFormData(initialFormData);
            setSelectedProvider(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Provedor
        </button>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CNPJ ou email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
          />
        </div>
      </div>

      {/* Lista de provedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <div key={provider.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-800">{provider.cnpj}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleView(provider)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Visualizar"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(provider)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(provider)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Valor Fixo:</span>
                <span className="font-medium text-gray-900">{formatCurrency(provider.fixedValue || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Franquia:</span>
                <span className="font-medium text-gray-900">{provider.franchise || 'Sem franquia'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">N1:</span>
                <span className="font-medium text-gray-900">{formatCurrency(provider.valueN1 || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">N2:</span>
                <span className="font-medium text-gray-900">{formatCurrency(provider.valueN2 || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Comissão Vendas:</span>
                <span className="font-medium text-gray-900">{provider.salesCommission || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Período:</span>
                <span className="font-medium text-gray-900">
                  {provider.periodType === 'monthly' ? 'Mensal' : 'Fixo'} - 
                  {provider.startDay || 1} a {provider.endDay || 30} ({provider.periodDays || 30} dias)
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-700">
                Criado em {formatDate(provider.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-800">Nenhum provedor encontrado</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Novo Provedor' : 
                 modalMode === 'edit' ? 'Editar Provedor' : 'Visualizar Provedor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {modalMode === 'view' && selectedProvider ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Informações Básicas</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProvider.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProvider.cnpj}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProvider.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Configurações Financeiras</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Fixo</label>
                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedProvider.fixedValue)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Franquia</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProvider.franchise || 'Sem franquia'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Comissão de Vendas</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProvider.salesCommission}%</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Valores de Atendimento</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valor N1</label>
                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedProvider.valueN1)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valor N2</label>
                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedProvider.valueN2)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Massivo</label>
                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedProvider.valueMassive)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Período de Contabilização</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dia de Início</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProvider.startDay}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dia Final</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProvider.endDay}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Período</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedProvider.periodType === 'monthly' ? 'Mensal (1º ao último dia)' : 'Período Fixo'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dias Contantes</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProvider.periodDays || 30} dias</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Informações Básicas</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Provedor *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CNPJ *
                        </label>
                        <input
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                          required
                          placeholder="00.000.000/0000-00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          disabled={modalMode === 'edit'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 bg-white"
                        />
                      </div>

                      {modalMode === 'create' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Senha *
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Configurações Financeiras</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor Fixo (R$)
                        </label>
                        <input
                          type="number"
                          value={formData.fixedValue}
                          onChange={(e) => setFormData({ ...formData, fixedValue: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Franquia (quantidade de atendimentos N1+N2)
                        </label>
                        <input
                          type="number"
                          value={formData.franchise}
                          onChange={(e) => setFormData({ ...formData, franchise: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comissão de Vendas (%)
                        </label>
                        <input
                          type="number"
                          value={formData.salesCommission}
                          onChange={(e) => setFormData({ ...formData, salesCommission: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Valores de Atendimento</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor N1 (R$)
                        </label>
                        <input
                          type="number"
                          value={formData.valueN1}
                          onChange={(e) => setFormData({ ...formData, valueN1: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor N2 (R$)
                        </label>
                        <input
                          type="number"
                          value={formData.valueN2}
                          onChange={(e) => setFormData({ ...formData, valueN2: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor Massivo (R$)
                        </label>
                        <input
                          type="number"
                          value={formData.valueMassive}
                          onChange={(e) => setFormData({ ...formData, valueMassive: parseFloat(e.target.value) || 0 })}
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Período de Contabilização</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dia de Início (1-31)
                        </label>
                        <input
                          type="number"
                          value={formData.startDay}
                          onChange={(e) => setFormData({ ...formData, startDay: parseInt(e.target.value) || 1 })}
                          min="1"
                          max="31"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dia Final (1-31)
                        </label>
                        <input
                          type="number"
                          value={formData.endDay}
                          onChange={(e) => setFormData({ ...formData, endDay: parseInt(e.target.value) || 30 })}
                          min="1"
                          max="31"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Período
                        </label>
                        <select
                          value={formData.periodType}
                          onChange={(e) => setFormData({ ...formData, periodType: e.target.value as 'fixed' | 'monthly' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="monthly">Mensal (1º ao último dia do mês)</option>
                          <option value="fixed">Período Fixo (ex: dia 28 a 28)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dias Contantes (Período de Cálculo)
                        </label>
                        <select
                          value={formData.periodDays}
                          onChange={(e) => setFormData({ ...formData, periodDays: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={15}>15 dias</option>
                          <option value={30}>30 dias</option>
                          <option value={45}>45 dias</option>
                          <option value={60}>60 dias</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Salvando...' : modalMode === 'create' ? 'Criar Provedor' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
