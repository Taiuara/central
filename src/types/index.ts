export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'provider' | 'collaborator';
  providerId?: string; // Para usuários do tipo provider
  createdAt: Date;
  updatedAt: Date;
}

export interface Provider {
  id: string;
  name: string;
  cnpj: string;
  franchise: number; // franquia de atendimentos
  valueN1: number; // valor do atendimento N1
  valueN2: number; // valor do atendimento N2
  valueMassive: number; // valor do atendimento massivo
  salesCommission: number; // porcentagem da comissão de vendas
  fixedValue: number; // valor fixo
  startDay: number; // dia de início da contabilização (1-31)
  endDay: number; // dia final da contabilização (1-31)
  periodDays: number; // quantidade de dias do período (ex: 30)
  periodType: 'fixed' | 'monthly'; // 'fixed' para períodos fixos (ex: 28 a 28), 'monthly' para mensal (1 ao último dia)
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  providerId: string;
  providerName: string;
  clientName: string;
  whatsapp: string;
  protocol: string;
  attendanceDate: Date;
  level: 'N1' | 'N2' | 'Massivo' | 'Venda' | 'Pré-Venda';
  description: string;
  saleValue?: number; // valor da venda (apenas para level === 'Venda')
  createdBy: string; // ID do usuário que criou
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetrics {
  totalTickets: number;
  n1Tickets: number;
  n2Tickets: number;
  massiveTickets: number;
  salesTickets: number;
  preSalesTickets: number;
  totalValue: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface AuthUser extends User {
  uid: string;
}
