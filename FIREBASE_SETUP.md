# Configuração do Firebase - Central do Provedor

## 1. Criando o Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `central-provedor` (ou nome de sua escolha)
4. Aceite os termos e crie o projeto

## 2. Configurando Authentication

1. No console do Firebase, vá para **Authentication**
2. Clique em **Get started**
3. Na aba **Sign-in method**, ative **Email/Password**
4. Salve as configurações

## 3. Criando o Usuário Administrador

1. Na aba **Users** do Authentication, clique em **Add user**
2. Email: `admin@pingdesk.com.br`
3. Password: crie uma senha segura
4. **Importante**: Anote o UID do usuário criado

## 4. Configurando Firestore Database

1. No console do Firebase, vá para **Firestore Database**
2. Clique em **Create database**
3. Escolha **Start in test mode** (configuraremos as regras depois)
4. Selecione uma localização (recomendado: southamerica-east1)

## 5. Criando as Coleções Iniciais

### Criar documento do usuário admin:
1. Vá para **Firestore Database**
2. Clique em **Start collection**
3. Collection ID: `users`
4. Document ID: `fKy68SaCZwYHV53Jp7Pnv591FY62`
5. Adicione os campos:
   ```
   id: fKy68SaCZwYHV53Jp7Pnv591FY62
   email: admin@pingdesk.com.br
   name: Administrador
   role: admin
   createdAt: [timestamp atual]
   updatedAt: [timestamp atual]
   ```

## 6. Regras de Segurança do Firestore

Substitua as regras padrão por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Regras para provedores
    match /providers/{providerId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.providerId == providerId;
    }
    
    // Regras para chamados
    match /tickets/{ticketId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'provider' &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.providerId == resource.data.providerId);
      
      allow create, update: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'collaborator']);
    }
  }
}
```

## 7. Configurando as Variáveis de Ambiente

1. No console do Firebase, vá para **Project settings** (ícone de engrenagem)
2. Na seção **Your apps**, clique em **Web app** (ícone </>)
3. Registre o app com o nome `central-provedor`
4. Copie as configurações do SDK
5. Cole no arquivo `.env.local` do projeto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id_aqui
```

## 8. Testando a Configuração

1. Execute `npm run dev`
2. Acesse `http://localhost:3000`
3. Faça login com:
   - Email: `admin@pingdesk.com.br`
   - Senha: a senha que você definiu

## 9. Próximos Passos

Após configurar o Firebase e fazer login como admin:

1. **Criar Provedores**: Use a interface para criar os primeiros provedores
2. **Criar Usuários**: Adicione colaboradores e usuários dos provedores
3. **Configurar Regras**: Ajuste as regras de segurança conforme necessário
4. **Backup**: Configure backups automáticos do Firestore
5. **Monitoramento**: Configure alertas no Firebase Console

## 🚨 Importantes Considerações de Segurança

- **Nunca commite o arquivo `.env.local`** no Git
- **Use senhas fortes** para todos os usuários
- **Revise regularmente** as regras de segurança
- **Monitore** os logs de acesso no Firebase Console
- **Configure billing alerts** para evitar custos inesperados

## 📞 Suporte

Se encontrar problemas na configuração:
1. Verifique se todas as etapas foram seguidas
2. Confira os logs do browser (F12 > Console)
3. Verifique os logs do Firebase Console
4. Entre em contato com o suporte técnico

---

**Desenvolvido pela PingDesk** 🚀
