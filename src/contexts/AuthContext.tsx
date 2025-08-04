'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔐 Auth state changed:', firebaseUser?.email, firebaseUser?.uid);
      
      if (firebaseUser) {
        try {
          // Buscar dados adicionais do usuário no Firestore
          console.log('👤 Buscando dados do usuário no Firestore...');
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('✅ Dados do usuário encontrados:', userData);
            
            setUser({
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || '',
              role: userData.role || 'collaborator',
              providerId: userData.providerId,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            });
          } else {
            // Usuário não encontrado no Firestore - criar documento
            console.log('❌ Usuário não encontrado no Firestore, criando...');
            
            // Definir dados padrão baseado no email
            const isAdmin = firebaseUser.email === 'admin@pingdesk.com.br';
            const userData = {
              name: isAdmin ? 'Administrador' : firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email || '',
              role: isAdmin ? 'admin' : 'collaborator',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            // Criar documento no Firestore
            const { setDoc } = await import('firebase/firestore');
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            console.log('✅ Documento do usuário criado:', userData);
            
            setUser({
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name,
              role: userData.role as 'admin' | 'provider' | 'collaborator',
              providerId: undefined,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            });
          }
        } catch (error) {
          console.error('❌ Erro ao buscar/criar dados do usuário:', error);
          setUser(null);
        }
      } else {
        console.log('👋 Usuário deslogado');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🚀 Tentando fazer login:', email);
      
      // Verificar se o Firebase está configurado
      if (!auth.app.options.apiKey) {
        console.error('❌ Firebase não configurado');
        throw new Error('Firebase não configurado. Verifique o arquivo .env.local');
      }
      
      console.log('✅ Firebase configurado, fazendo login...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login Firebase bem-sucedido:', result.user.uid);
      
      return result.user;
    } catch (error: unknown) {
      console.error('❌ Erro no login:', error);
      
      const firebaseError = error as { code?: string; message?: string };
      
      // Mensagens de erro mais específicas
      if (firebaseError.code === 'auth/user-not-found') {
        throw new Error('Usuário não encontrado');
      } else if (firebaseError.code === 'auth/wrong-password') {
        throw new Error('Senha incorreta');
      } else if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas. Tente novamente mais tarde');
      } else if (firebaseError.message?.includes('Firebase não configurado')) {
        throw new Error('Sistema não configurado. Entre em contato com o suporte');
      } else {
        throw new Error('Erro ao fazer login. Verifique suas credenciais');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
