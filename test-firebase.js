// Teste básico do Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Configuração do Firebase:');
console.log('API Key:', firebaseConfig.apiKey ? '✅ Configurada' : '❌ Não configurada');
console.log('Auth Domain:', firebaseConfig.authDomain ? '✅ Configurado' : '❌ Não configurado');
console.log('Project ID:', firebaseConfig.projectId ? '✅ Configurado' : '❌ Não configurado');
console.log('Storage Bucket:', firebaseConfig.storageBucket ? '✅ Configurado' : '❌ Não configurado');
console.log('Messaging Sender ID:', firebaseConfig.messagingSenderId ? '✅ Configurado' : '❌ Não configurado');
console.log('App ID:', firebaseConfig.appId ? '✅ Configurado' : '❌ Não configurado');

try {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  console.log('\n✅ Firebase inicializado com sucesso!');
  console.log('Auth:', auth ? '✅ OK' : '❌ Erro');
  console.log('Firestore:', db ? '✅ OK' : '❌ Erro');
  console.log('Project ID no app:', app.options.projectId);
  
} catch (error) {
  console.error('\n❌ Erro ao inicializar Firebase:', error);
}
