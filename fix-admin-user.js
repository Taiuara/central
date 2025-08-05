const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
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

async function checkAndFixAdminUser() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('🔍 Verificando usuário admin...');

    // 1. Fazer login como admin
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, 'admin@pingdesk.com.br', 'admin123');
      console.log('✅ Login admin realizado com sucesso');
      console.log('👤 UID do admin:', userCredential.user.uid);
    } catch (error) {
      console.log('❌ Erro no login admin:', error.message);
      return;
    }

    // 2. Verificar se o documento do usuário existe no Firestore
    const usersSnap = await getDocs(collection(db, 'users'));
    console.log('📊 Total de usuários no Firestore:', usersSnap.size);
    
    let adminUserDoc = null;
    usersSnap.forEach(doc => {
      const userData = doc.data();
      console.log(`👤 Usuário: ${doc.id} | Email: ${userData.email} | Role: ${userData.role}`);
      
      if (userData.email === 'admin@pingdesk.com.br' || doc.id === userCredential.user.uid) {
        adminUserDoc = { id: doc.id, ...userData };
      }
    });

    // 3. Se não existe, criar o documento
    if (!adminUserDoc) {
      console.log('⚠️ Documento do admin não encontrado no Firestore, criando...');
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: 'Administrador',
        email: 'admin@pingdesk.com.br',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Documento do admin criado no Firestore');
    } else {
      console.log('✅ Documento do admin encontrado no Firestore');
      console.log('📋 Dados:', adminUserDoc);
    }

    // 4. Verificar provedores
    const providersSnap = await getDocs(collection(db, 'providers'));
    console.log('🏢 Total de provedores:', providersSnap.size);
    
    if (providersSnap.size === 0) {
      console.log('⚠️ Nenhum provedor encontrado, você pode criar um no painel admin');
    } else {
      providersSnap.forEach(doc => {
        console.log(`🏢 Provedor: ${doc.data().name} (${doc.id})`);
      });
    }

    console.log('\n🎉 Verificação concluída!');
    console.log('📝 Próximos passos:');
    console.log('1. Recarregue a página de usuários');
    console.log('2. Verifique os logs no console do navegador');
    console.log('3. Se ainda houver problemas, verifique as regras do Firestore');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkAndFixAdminUser();
