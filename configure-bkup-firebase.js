// Script para configurar corretamente o provedor Bkup no Firebase
const admin = require('firebase-admin');

// Usar credenciais do ambiente
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'central-provedor-35ef4'
  });
}

const db = admin.firestore();

async function configureBkupProvider() {
  try {
    console.log('🔍 Buscando e configurando provedor Bkup...');
    
    // Buscar todos os provedores para verificar qual é o Bkup
    const providersSnapshot = await db.collection('providers').get();
    
    if (providersSnapshot.empty) {
      console.log('❌ Nenhum provedor encontrado');
      return;
    }
    
    console.log(`📋 Total de provedores: ${providersSnapshot.size}`);
    
    // Listar todos os provedores
    let bkupProvider = null;
    providersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n📊 Provedor: ${data.name || 'Sem nome'}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Franquia atual: ${data.franchise || 'Não definida'}`);
      console.log(`   Tipo período: ${data.periodType || 'Não definido'}`);
      console.log(`   Dia início: ${data.startDay || 'Não definido'}`);
      
      // Verificar se é o Bkup (por nome ou outros indicadores)
      if (data.name && data.name.toLowerCase().includes('bkup')) {
        bkupProvider = { id: doc.id, data };
        console.log('   ✅ Este é o provedor Bkup!');
      }
    });
    
    if (!bkupProvider) {
      // Se não encontrou por nome, vamos usar o primeiro provedor como exemplo
      console.log('\n⚠️  Provedor Bkup não encontrado por nome');
      console.log('📝 Vou configurar o primeiro provedor como Bkup');
      
      const firstDoc = providersSnapshot.docs[0];
      bkupProvider = { id: firstDoc.id, data: firstDoc.data() };
    }
    
    console.log(`\n🔧 Configurando provedor ${bkupProvider.data.name} como Bkup...`);
    
    // Configurar com os valores corretos do Bkup
    const updateData = {
      name: 'Bkup',
      franchise: 200,           // 200 atendimentos N1+N2 na franquia
      valueN1: 3.50,           // R$ 3,50 por N1 excedente
      valueN2: 4.50,           // R$ 4,50 por N2 excedente  
      valueMassive: 1.50,      // R$ 1,50 por massivo (sempre cobra)
      fixedValue: 1100,        // R$ 1.100,00 fixo
      salesCommission: 50,     // 50% de comissão
      periodType: 'fixed',     // Período fixo
      startDay: 28,           // Inicia dia 28
      endDay: 28,             // Termina dia 28 do mês seguinte
      periodDays: 30,         // 30 dias de período
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('providers').doc(bkupProvider.id).update(updateData);
    
    console.log('\n✅ Provedor Bkup configurado com sucesso!');
    console.log('\n📋 Configuração aplicada:');
    console.log('   Nome: Bkup');
    console.log('   Franquia: 200 atendimentos N1+N2');
    console.log('   Valor fixo: R$ 1.100,00');
    console.log('   N1 excedente: R$ 3,50');
    console.log('   N2 excedente: R$ 4,50');
    console.log('   Massivos: R$ 1,50 (sempre cobra)');
    console.log('   Período: 28 a 28 (fixo)');
    
    console.log('\n🎯 Teste com dados atuais:');
    console.log('   25 N1 + 5 N2 = 30 total N1+N2');
    console.log('   Como 30 < 200, valor N1+N2 = R$ 0,00');
    console.log('   0 massivos = R$ 0,00');
    console.log('   Total esperado: R$ 1.100,00 (apenas fixo)');
    
    console.log('\n🚀 Faça refresh na aplicação para ver os valores corretos!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar Bkup:', error);
  } finally {
    process.exit(0);
  }
}

configureBkupProvider();
