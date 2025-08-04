const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, collection, getDocs } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function createProviderUser() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('🚀 Buscando primeiro provedor disponível...');

    // Buscar o primeiro provedor na coleção
    const providersSnap = await getDocs(collection(db, 'providers'));
    
    if (providersSnap.empty) {
      console.log('❌ Nenhum provedor encontrado! Crie um provedor primeiro.');
      console.log('💡 Use o painel admin para criar um provedor antes de executar este script.');
      return;
    }

    const firstProvider = providersSnap.docs[0];
    const providerData = firstProvider.data();
    
    console.log('✅ Provedor encontrado:', providerData.name);
    console.log('📋 ID do Provedor:', firstProvider.id);

    const providerEmail = `provider@${providerData.name.toLowerCase().replace(/\s+/g, '')}.com`;
    
    console.log('🚀 Criando usuário provider...');
    console.log('📧 Email:', providerEmail);

    // Criar usuário no Firebase Auth
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, providerEmail, 'provider123');
      console.log('✅ Usuário criado no Firebase Auth:', userCredential.user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️ Usuário já existe no Firebase Auth');
        console.log('💡 Use o painel admin para associar o usuário existente ao provedor');
        return;
      } else {
        throw error;
      }
    }

    // Criar documento do usuário no Firestore
    const userDoc = {
      name: `Usuário ${providerData.name}`,
      email: providerEmail,
      role: 'provider',
      providerId: firstProvider.id, // IMPORTANTE: associar ao provedor
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
    console.log('✅ Documento do usuário criado no Firestore');
    console.log('🔗 Usuário associado ao provedor:', providerData.name);

    console.log('\n🎉 Usuário provider configurado com sucesso!');
    console.log('📧 Email:', providerEmail);
    console.log('🔑 Senha: provider123');
    console.log('👤 UID:', userCredential.user.uid);
    console.log('🏢 Provedor:', providerData.name);
    console.log('🆔 Provider ID:', firstProvider.id);

    console.log('\n📝 Agora você pode:');
    console.log('1. Fazer login com as credenciais acima');
    console.log('2. Criar chamados associados ao provedor');
    console.log('3. Verificar se os chamados aparecem no perfil do provedor');

  } catch (error) {
    console.error('❌ Erro ao criar usuário provider:', error);
  }
}

createProviderUser();
