const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, collection, getDocs, addDoc } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function setupInitialData() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('🚀 Verificando dados iniciais...');

    // 1. Fazer login como admin para ter permissões
    console.log('🔐 Fazendo login como admin...');
    try {
      await signInWithEmailAndPassword(auth, 'admin@pingdesk.com.br', 'admin123');
      console.log('✅ Login admin realizado com sucesso');
    } catch (error) {
      console.log('❌ Erro no login admin:', error.message);
      console.log('💡 Certifique-se de que o usuário admin existe');
      return;
    }

    // 2. Verificar se há provedores
    console.log('📋 Verificando provedores...');
    const providersSnap = await getDocs(collection(db, 'providers'));
    
    if (providersSnap.empty) {
      console.log('🆕 Criando provedor de exemplo...');
      const providerDoc = await addDoc(collection(db, 'providers'), {
        name: 'Provedor Teste',
        fixedValue: 1000,
        valueN1: 15,
        valueN2: 25,
        valueMassive: 100,
        periodType: 'fixed',
        startDay: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Provedor criado:', providerDoc.id);
    } else {
      console.log('✅ Provedores encontrados:', providersSnap.size);
    }

    // 3. Verificar usuários
    console.log('👥 Verificando usuários...');
    const usersSnap = await getDocs(collection(db, 'users'));
    console.log('✅ Usuários encontrados:', usersSnap.size);

    // 4. Criar usuário provider se não existir
    const firstProvider = providersSnap.empty ? 
      (await getDocs(collection(db, 'providers'))).docs[0] : 
      providersSnap.docs[0];

    if (firstProvider) {
      const providerData = firstProvider.data();
      const providerEmail = 'provider@teste.com';
      
      console.log('🆕 Criando usuário provider...');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, providerEmail, 'provider123');
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: 'Usuário Provider Teste',
          email: providerEmail,
          role: 'provider',
          providerId: firstProvider.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('✅ Usuário provider criado:');
        console.log('  📧 Email:', providerEmail);
        console.log('  🔑 Senha: provider123');
        console.log('  👤 UID:', userCredential.user.uid);
        console.log('  🏢 Provedor:', providerData.name);
        console.log('  🆔 Provider ID:', firstProvider.id);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('⚠️ Usuário provider já existe');
        } else {
          console.log('❌ Erro ao criar provider:', error.message);
        }
      }
    }

    // 5. Verificar tickets
    console.log('🎫 Verificando tickets...');
    const ticketsSnap = await getDocs(collection(db, 'tickets'));
    console.log('✅ Tickets encontrados:', ticketsSnap.size);

    if (ticketsSnap.size === 0 && firstProvider) {
      console.log('🆕 Criando ticket de exemplo...');
      await addDoc(collection(db, 'tickets'), {
        providerId: firstProvider.id,
        providerName: firstProvider.data().name,
        clientName: 'Cliente Teste',
        whatsapp: '11999999999',
        protocol: 'TESTE001',
        attendanceDate: new Date(),
        level: 'N1',
        description: 'Ticket de teste para validar sistema',
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Ticket de exemplo criado');
    }

    console.log('\n🎉 Setup inicial concluído!');
    console.log('\n📝 Para testar:');
    console.log('1. Faça login como provider@teste.com / provider123');
    console.log('2. Verifique se os tickets aparecem na aba Chamados');

  } catch (error) {
    console.error('❌ Erro no setup:', error);
  }
}

setupInitialData();
