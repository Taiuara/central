const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Configuração do Firebase (usando as variáveis diretamente)
const firebaseConfig = {
  apiKey: "AIzaSyCrMUZnB-Yk2dCw7H-E2yTGmgSKRJGEzLI",
  authDomain: "central-provedor-35ef4.firebaseapp.com",
  projectId: "central-provedor-35ef4",
  storageBucket: "central-provedor-35ef4.firebasestorage.app",
  messagingSenderId: "764851749797",
  appId: "1:764851749797:web:1f8d3c3e2c8c9b9e9f9f9f"
};

async function checkAdminUser() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const adminUID = 'fKy68SaCZwYHV53Jp7Pnv591FY62';
    
    console.log('🔍 Verificando usuário admin no Firestore...');
    console.log('UID do admin:', adminUID);
    
    const userDoc = await getDoc(doc(db, 'users', adminUID));
    
    if (userDoc.exists()) {
      console.log('✅ Usuário admin encontrado no Firestore:');
      console.log(JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log('❌ Usuário admin NÃO encontrado no Firestore');
      console.log('Criando documento do usuário...');
      
      const userData = {
        name: 'Administrador',
        email: 'admin@pingdesk.com.br',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', adminUID), userData);
      console.log('✅ Documento do usuário criado!');
      console.log('Dados criados:', JSON.stringify(userData, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuário:', error);
  }
}

checkAdminUser();
