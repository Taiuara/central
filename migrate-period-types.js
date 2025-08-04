// Script para migrar provedores existentes e adicionar o campo periodType
const admin = require('firebase-admin');

// Inicializar Firebase Admin (usando as credenciais do projeto)
const serviceAccount = {
  "type": "service_account",
  "project_id": "central-provedor-35ef4",
  "private_key_id": "your_private_key_id",
  "private_key": "your_private_key",
  "client_email": "firebase-adminsdk-xyz@central-provedor-35ef4.iam.gserviceaccount.com",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your_cert_url"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function migrateProviders() {
  try {
    console.log('Iniciando migração de provedores...');
    
    const providersSnapshot = await db.collection('providers').get();
    
    if (providersSnapshot.empty) {
      console.log('Nenhum provedor encontrado.');
      return;
    }
    
    const batch = db.batch();
    let updateCount = 0;
    
    providersSnapshot.forEach(doc => {
      const providerData = doc.data();
      console.log(`Verificando provedor: ${providerData.name}`);
      
      // Se não tem periodType, adicionar baseado no nome ou configuração
      if (!providerData.periodType) {
        let periodType = 'monthly'; // padrão
        
        // Se o nome contém "bkup" ou startDay é 28, usar período fixo
        if (providerData.name?.toLowerCase().includes('bkup') || providerData.startDay === 28) {
          periodType = 'fixed';
          console.log(`  -> Configurando ${providerData.name} como período FIXO`);
        } else {
          console.log(`  -> Configurando ${providerData.name} como período MENSAL`);
        }
        
        const providerRef = db.collection('providers').doc(doc.id);
        batch.update(providerRef, { 
          periodType: periodType,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        updateCount++;
      } else {
        console.log(`  -> ${providerData.name} já tem periodType: ${providerData.periodType}`);
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Migração concluída! ${updateCount} provedores atualizados.`);
    } else {
      console.log('✅ Todos os provedores já estão atualizados.');
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Executar migração
migrateProviders().then(() => {
  console.log('Script finalizado.');
  process.exit(0);
});
