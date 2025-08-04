// Teste da lógica de período para verificar se está funcionando corretamente

function testPeriodLogic() {
  // Simular dados do Bkup
  const provider = {
    name: 'Bkup',
    startDay: 28,
    periodType: 'fixed',
    periodDays: 30
  };
  
  // Data atual: 04/08/2025
  const now = new Date(2025, 7, 4); // Mês 7 = agosto (0-indexed)
  
  console.log(`Data atual: ${now.toLocaleDateString('pt-BR')}`);
  console.log(`Provider: ${provider.name}, StartDay: ${provider.startDay}, Type: ${provider.periodType}`);
  
  const startDay = provider.startDay;
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Determinar o mês correto para o período atual
  let periodMonth = currentMonth;
  let periodYear = currentYear;
  
  console.log(`now.getDate(): ${now.getDate()}, startDay: ${startDay}`);
  
  // Se estamos antes do dia de início do mês atual, o período atual começou no mês anterior
  if (now.getDate() < startDay) {
    periodMonth = currentMonth - 1;
    if (periodMonth < 0) {
      periodMonth = 11; // dezembro do ano anterior
      periodYear = currentYear - 1;
    }
    console.log(`Usando mês anterior: ${periodMonth + 1}/${periodYear}`);
  }
  
  // Data de início: startDay do mês determinado
  const startDate = new Date(periodYear, periodMonth, startDay);
  
  // Data final: dia anterior ao startDay do próximo mês
  let endMonth = periodMonth + 1;
  let endYear = periodYear;
  if (endMonth > 11) {
    endMonth = 0; // janeiro do próximo ano
    endYear = periodYear + 1;
  }
  const endDate = new Date(endYear, endMonth, startDay - 1);
  
  console.log(`Período calculado: ${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`);
  console.log(`Esperado: 28/07/2025 - 27/08/2025`);
}

testPeriodLogic();
