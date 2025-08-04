import { Provider, Ticket } from '@/types';

export interface CalculationResult {
  totalTickets: number;
  nexport function calculateProviderMetrics(provider: Provider, tickets: Ticket[], referenceDate: Date = new Date()) {
  const period = calculatePeriod(provider, referenceDate);
  
  // Debug para provedores específicos
  if (provider.name === 'Bkup' || provider.name === 'Mynet') {
    debugPeriodCalculation(provider, referenceDate);
  }
  
  const periodTickets = filterTicketsByPeriod(tickets, period.startDate, period.endDate);ckets: number;
  n2Tickets: number;
  massiveTickets: number;
  salesTickets: number;
  totalValue: number;
  fixedValue: number;
  ticketsValue: number;
  salesValue: number;
  exceedsFramework: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export function calculatePeriod(provider: Provider, referenceDate: Date = new Date()): { startDate: Date; endDate: Date } {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();
  const currentDay = referenceDate.getDate();
  
  let startDate: Date;
  let endDate: Date;

  // Para provedores que fecham em dias específicos (como dia 28)
  if (provider.startDay === provider.endDay) {
    // Ciclo mensal - do dia X do mês anterior ao dia X do mês atual
    if (currentDay >= provider.startDay) {
      // Estamos no período atual
      startDate = new Date(currentYear, currentMonth, provider.startDay);
      endDate = new Date(currentYear, currentMonth + 1, provider.endDay, 23, 59, 59);
    } else {
      // Estamos antes do período atual
      startDate = new Date(currentYear, currentMonth - 1, provider.startDay);
      endDate = new Date(currentYear, currentMonth, provider.endDay, 23, 59, 59);
    }
  } else if (provider.startDay < provider.endDay) {
    // Período dentro do mesmo mês
    startDate = new Date(currentYear, currentMonth, provider.startDay);
    endDate = new Date(currentYear, currentMonth, provider.endDay, 23, 59, 59);
  } else {
    // Período que cruza meses (startDay > endDay)
    if (currentDay >= provider.startDay) {
      // Período atual (do startDay deste mês ao endDay do próximo mês)
      startDate = new Date(currentYear, currentMonth, provider.startDay);
      
      // Calcular endDate considerando variações de dias do mês
      let nextMonth = currentMonth + 1;
      let nextYear = currentYear;
      
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      
      // Ajustar endDay se o próximo mês não tiver dias suficientes
      const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
      const adjustedEndDay = Math.min(provider.endDay, daysInNextMonth);
      
      endDate = new Date(nextYear, nextMonth, adjustedEndDay, 23, 59, 59);
    } else {
      // Período anterior (do startDay do mês anterior ao endDay deste mês)
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear--;
      }
      
      // Ajustar startDay se o mês anterior não tiver dias suficientes
      const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
      const adjustedStartDay = Math.min(provider.startDay, daysInPrevMonth);
      
      startDate = new Date(prevYear, prevMonth, adjustedStartDay);
      
      // Ajustar endDay se o mês atual não tiver dias suficientes  
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const adjustedEndDay = Math.min(provider.endDay, daysInCurrentMonth);
      
      endDate = new Date(currentYear, currentMonth, adjustedEndDay, 23, 59, 59);
    }
  }

  return { startDate, endDate };
}

// Função de debug para verificar cálculo de período
export function debugPeriodCalculation(provider: Provider, referenceDate: Date = new Date()) {
  const period = calculatePeriod(provider, referenceDate);
  
  console.log('🔍 Debug do cálculo de período:');
  console.log('📅 Data de referência:', referenceDate.toLocaleDateString('pt-BR'));
  console.log('🏢 Provedor:', provider.name);
  console.log('📊 Config:', `startDay: ${provider.startDay}, endDay: ${provider.endDay}`);
  console.log('⏰ Período calculado:');
  console.log('  📅 Início:', period.startDate.toLocaleDateString('pt-BR'));
  console.log('  📅 Fim:', period.endDate.toLocaleDateString('pt-BR'));
  console.log('  📈 Duração (dias):', Math.ceil((period.endDate.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  return period;
}

export function filterTicketsByPeriod(tickets: Ticket[], startDate: Date, endDate: Date): Ticket[] {
  return tickets.filter(ticket => {
    const ticketDate = ticket.attendanceDate;
    return ticketDate >= startDate && ticketDate <= endDate;
  });
}

export function calculateProviderMetrics(provider: Provider, tickets: Ticket[], referenceDate?: Date): CalculationResult {
  const period = calculatePeriod(provider, referenceDate);
  const periodTickets = filterTicketsByPeriod(tickets, period.startDate, period.endDate);

  const n1Tickets = periodTickets.filter(t => t.level === 'N1').length;
  const n2Tickets = periodTickets.filter(t => t.level === 'N2').length;
  const massiveTickets = periodTickets.filter(t => t.level === 'Massivo').length;
  const salesTickets = periodTickets.filter(t => t.level === 'Venda');

  // Cálculo do valor dos atendimentos
  let ticketsValue = 0;
  let exceedsFramework = 0;

  const franchiseTickets = n1Tickets + n2Tickets; // Massivo não entra na franquia
  
  if (provider.franchise > 0) {
    // Tem franquia
    if (franchiseTickets > provider.franchise) {
      exceedsFramework = franchiseTickets - provider.franchise;
      ticketsValue = exceedsFramework * ((n1Tickets > provider.franchise ? provider.valueN1 : 0) + 
                                        (n2Tickets > (provider.franchise - n1Tickets) ? provider.valueN2 : 0));
    }
  } else {
    // Sem franquia - cobra tudo
    ticketsValue = (n1Tickets * provider.valueN1) + (n2Tickets * provider.valueN2);
  }

  // Adiciona atendimentos massivos (sempre cobrados)
  ticketsValue += massiveTickets * provider.valueMassive;

  // Cálculo das vendas
  const salesValue = salesTickets.reduce((total, ticket) => {
    if (ticket.saleValue) {
      return total + (ticket.saleValue * provider.salesCommission / 100);
    }
    return total;
  }, 0);

  const totalValue = provider.fixedValue + ticketsValue + salesValue;

  return {
    totalTickets: periodTickets.length,
    n1Tickets,
    n2Tickets,
    massiveTickets,
    salesTickets: salesTickets.length,
    totalValue,
    fixedValue: provider.fixedValue,
    ticketsValue,
    salesValue,
    exceedsFramework,
    period
  };
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
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
