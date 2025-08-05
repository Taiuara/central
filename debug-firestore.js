const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function debugFirestore() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔍 Verificando dados no Firestore...\n');

    // 1. Listar todos os provedores
    console.log('📋 PROVEDORES:');
    const providersSnap = await getDocs(collection(db, 'providers'));
    if (providersSnap.empty) {
      console.log('❌ Nenhum provedor encontrado');
    } else {
      providersSnap.forEach(doc => {
        console.log(`✅ ID: ${doc.id} | Nome: ${doc.data().name}`);
      });
    }

    // 2. Listar todos os usuários
    console.log('\n👥 USUÁRIOS:');
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      console.log('❌ Nenhum usuário encontrado');
    } else {
      usersSnap.forEach(doc => {
        const user = doc.data();
        console.log(`✅ UID: ${doc.id} | Email: ${user.email} | Role: ${user.role} | ProviderId: ${user.providerId || 'N/A'}`);
      });
    }

    // 3. Listar todos os tickets
    console.log('\n🎫 TICKETS:');
    const ticketsSnap = await getDocs(collection(db, 'tickets'));
    if (ticketsSnap.empty) {
      console.log('❌ Nenhum ticket encontrado');
    } else {
      ticketsSnap.forEach(doc => {
        const ticket = doc.data();
        console.log(`✅ ID: ${doc.id} | ProviderId: ${ticket.providerId} | Cliente: ${ticket.clientName} | Level: ${ticket.level}`);
      });
    }

    // 4. Testar filtro específico para provider
    if (!providersSnap.empty && !usersSnap.empty) {
      const firstProvider = providersSnap.docs[0];
      const providerUser = usersSnap.docs.find(doc => doc.data().role === 'provider');
      
      if (providerUser) {
        console.log(`\n🔍 TESTE DE FILTRO para provider: ${providerUser.data().email}`);
        console.log(`Provider ID esperado: ${providerUser.data().providerId}`);
        
        const filteredQuery = query(
          collection(db, 'tickets'),
          where('providerId', '==', providerUser.data().providerId)
        );
        
        const filteredSnap = await getDocs(filteredQuery);
        console.log(`📊 Tickets encontrados com filtro: ${filteredSnap.size}`);
        
        filteredSnap.forEach(doc => {
          const ticket = doc.data();
          console.log(`  ✅ ${ticket.clientName} (${ticket.level}) - Provider: ${ticket.providerId}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugFirestore();
