const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

async function createAdminUser() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('🚀 Criando usuário admin...');

    // Criar usuário no Firebase Auth
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, 'admin@pingdesk.com.br', 'admin123');
      console.log('✅ Usuário criado no Firebase Auth:', userCredential.user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️ Usuário já existe no Firebase Auth');
        // Definir UID conhecido do usuário admin
        const adminUID = 'fKy68SaCZwYHV53Jp7Pnv591FY62';
        userCredential = { user: { uid: adminUID } };
      } else {
        throw error;
      }
    }

    // Criar documento do usuário no Firestore
    const userDoc = {
      name: 'Administrador',
      email: 'admin@pingdesk.com.br',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);
    console.log('✅ Documento do usuário criado no Firestore');

    console.log('\n🎉 Usuário admin configurado com sucesso!');
    console.log('Email: admin@pingdesk.com.br');
    console.log('Senha: admin123');
    console.log('UID:', userCredential.user.uid);

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}

createAdminUser();
