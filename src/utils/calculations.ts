import { Provider, Ticket } from '@/types';

export interface CalculationResult {
  totalTickets: number;
  n1Tickets: number;
  n2Tickets: number;
  massiveTickets: number;
  salesTickets: number;
  preSalesTickets: number;
  fixedValue: number;
  ticketsValue: number;
  salesValue: number;
  massiveValue: number;
  totalValue: number;
}

export function calculateProviderMetrics(provider: Provider, tickets: Ticket[], referenceDate: Date = new Date()): CalculationResult {
  const period = calculatePeriod(provider, referenceDate);
  const periodTickets = filterTicketsByPeriod(tickets, period.startDate, period.endDate);

  const n1Tickets = periodTickets.filter(t => t.level === 'N1').length;
  const n2Tickets = periodTickets.filter(t => t.level === 'N2').length;
  const massiveTickets = periodTickets.filter(t => t.level === 'Massivo').length;
  const salesTickets = periodTickets.filter(t => t.level === 'Venda').length;
  const preSalesTickets = periodTickets.filter(t => t.level === 'Pré-Venda').length;

  const fixedValue = provider.fixedValue || 0;
  
  // Aplicar regra da franquia: apenas contabilizar N1+N2 quando ultrapassar a franquia
  const franchise = provider.franchise || 0;
  const totalN1N2 = n1Tickets + n2Tickets;
  let billableN1Tickets = 0;
  let billableN2Tickets = 0;
  
  if (franchise > 0) {
    // Se há franquia, só contabiliza N1+N2 que excedem a franquia
    const exceededTickets = Math.max(0, totalN1N2 - franchise);
    if (exceededTickets > 0) {
      // Distribuir os tickets excedentes proporcionalmente entre N1 e N2
      const n1Ratio = n1Tickets > 0 ? n1Tickets / totalN1N2 : 0;
      const n2Ratio = n2Tickets > 0 ? n2Tickets / totalN1N2 : 0;
      billableN1Tickets = Math.floor(exceededTickets * n1Ratio);
      billableN2Tickets = Math.floor(exceededTickets * n2Ratio);
    }
  } else {
    // Se não há franquia, contabiliza todos os N1 e N2
    billableN1Tickets = n1Tickets;
    billableN2Tickets = n2Tickets;
  }
  
  // Pré-Venda usa o mesmo valor do N1, Massivos sempre contabilizam
  const ticketsValue = (billableN1Tickets * (provider.valueN1 || 0)) + 
                      (billableN2Tickets * (provider.valueN2 || 0)) + 
                      (preSalesTickets * (provider.valueN1 || 0));
  
  const salesValue = periodTickets
    .filter(t => t.level === 'Venda')
    .reduce((total, ticket) => total + (ticket.saleValue || 0), 0) * (provider.salesCommission || 0) / 100;
  const massiveValue = massiveTickets * (provider.valueMassive || 0);
  const totalValue = fixedValue + ticketsValue + salesValue + massiveValue;

  return {
    totalTickets: periodTickets.length,
    n1Tickets,
    n2Tickets,
    massiveTickets,
    salesTickets,
    preSalesTickets,
    fixedValue,
    ticketsValue,
    salesValue,
    massiveValue,
    totalValue
  };
}

export function calculatePeriod(provider: Provider, referenceDate: Date = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth(); // 0-based
  
  if (provider.periodType === 'fixed') {
    // Período fixo: usar startDay e periodDays
    const startDay = provider.startDay || 1;
    const periodDays = provider.periodDays || 30;
    
    // Calcular a data de início baseada no startDay
    let startDate: Date;
    if (referenceDate.getDate() >= startDay) {
      // Se estamos no período atual
      startDate = new Date(year, month, startDay);
    } else {
      // Se estamos no próximo período
      startDate = new Date(year, month - 1, startDay);
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + periodDays - 1);
    
    return { startDate, endDate };
  } else {
    // Período mensal: 1º ao último dia do mês
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Último dia do mês
    
    return { startDate, endDate };
  }
}

export function filterTicketsByPeriod(tickets: Ticket[], startDate: Date, endDate: Date): Ticket[] {
  return tickets.filter(ticket => {
    const ticketDate = ticket.createdAt;
    return ticketDate >= startDate && ticketDate <= endDate;
  });
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}
