// Script para atualizar o provedor Bkup com a franquia de 200 atendimentos
const admin = require('firebase-admin');

// Usar as credenciais do ambiente (você deve configurar no Firebase)
// Este script deve ser executado apenas uma vez para configurar o Bkup

if (!admin.apps.length) {
  // Inicializar com as credenciais padrão do projeto
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'central-provedor-35ef4'
  });
}

const db = admin.firestore();

async function updateBkupProvider() {
  try {
    console.log('Buscando provedor Bkup...');
    
    // Buscar o provedor Bkup
    const providersSnapshot = await db.collection('providers')
      .where('name', '==', 'Bkup')
      .get();
    
    if (providersSnapshot.empty) {
      console.log('Provedor Bkup não encontrado. Criando...');
      
      // Criar o provedor Bkup com a configuração correta
      const bkupData = {
        name: 'Bkup',
        cnpj: '00.000.000/0001-00',
        franchise: 200, // 200 atendimentos N1+N2 na franquia
        valueN1: 3.50,
        valueN2: 4.50,
        valueMassive: 1.50,
        salesCommission: 50,
        fixedValue: 1100,
        startDay: 28,
        endDay: 28,
        periodDays: 30,
        periodType: 'fixed',
        email: 'contato@bkup.com.br',
        password: 'bkup123',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      await db.collection('providers').add(bkupData);
      console.log('✅ Provedor Bkup criado com sucesso!');
      console.log('Configuração:');
      console.log('- Franquia: 200 atendimentos N1+N2');
      console.log('- Valor fixo: R$ 1.100,00');
      console.log('- Período: 28 a 28 do mês seguinte');
      console.log('- Massivos: R$ 1,50 (contabilizam antes e depois dos 200)');
      
    } else {
      // Atualizar o provedor existente
      const bkupDoc = providersSnapshot.docs[0];
      const currentData = bkupDoc.data();
      
      console.log('Provedor Bkup encontrado. Dados atuais:');
      console.log('- Franquia:', currentData.franchise || 'Não configurada');
      console.log('- Período:', currentData.periodType || 'Não configurado');
      console.log('- Start Day:', currentData.startDay || 'Não configurado');
      
      // Atualizar com a configuração correta
      const updateData = {
        franchise: 200, // 200 atendimentos N1+N2 na franquia
        periodType: 'fixed',
        startDay: 28,
        endDay: 28,
        periodDays: 30,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      // Verificar se precisa atualizar valores
      if (!currentData.valueN1) updateData.valueN1 = 3.50;
      if (!currentData.valueN2) updateData.valueN2 = 4.50;
      if (!currentData.valueMassive) updateData.valueMassive = 1.50;
      if (!currentData.salesCommission) updateData.salesCommission = 50;
      if (!currentData.fixedValue) updateData.fixedValue = 1100;
      
      await bkupDoc.ref.update(updateData);
      
      console.log('✅ Provedor Bkup atualizado com sucesso!');
      console.log('Nova configuração:');
      console.log('- Franquia: 200 atendimentos N1+N2');
      console.log('- Período: fixo (28 a 28)');
      console.log('- Massivos: contabilizam antes e depois dos 200');
    }
    
    console.log('\n🔧 Regra implementada:');
    console.log('✅ N1 + N2: Só contabilizam depois de ultrapassar 200 atendimentos');
    console.log('✅ Massivos: Sempre contabilizam (antes e depois dos 200)');
    console.log('✅ Valor fixo: R$ 1.100,00 incluindo até 200 N1+N2');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar provedor Bkup:', error);
  } finally {
    process.exit(0);
  }
}

// Executar o script
updateBkupProvider();
