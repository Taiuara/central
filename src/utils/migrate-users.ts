import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function migrateProviderUsers() {
  try {
    console.log('🔄 Iniciando migração de usuários...');
    
    // Buscar todos os usuários
    const usersSnap = await getDocs(collection(db, 'users'));
    
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      
      // Se o usuário tem role 'provider' mas foi criado com ID aleatório
      if (userData.role === 'provider' && userData.id && userData.id !== userDoc.id) {
        console.log(`📝 Migrando usuário: ${userData.email}`);
        
        try {
          // Criar novo documento com o UID correto como ID
          await setDoc(doc(db, 'users', userData.id), {
            email: userData.email,
            name: userData.name,
            role: userData.role,
            providerId: userData.providerId,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
          });
          
          // Deletar o documento antigo (se for diferente)
          if (userDoc.id !== userData.id) {
            await deleteDoc(doc(db, 'users', userDoc.id));
          }
          
          console.log(`✅ Usuário ${userData.email} migrado com sucesso`);
        } catch (error) {
          console.error(`❌ Erro ao migrar usuário ${userData.email}:`, error);
        }
      }
    }
    
    console.log('✅ Migração concluída!');
    return true;
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return false;
  }
}
