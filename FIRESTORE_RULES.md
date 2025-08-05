# Regras de Segurança do Firestore

## Problema Atual
Os usuários provedores não estão conseguindo ver seus chamados, possivelmente devido a regras de segurança muito restritivas.

## Regras Recomendadas para Desenvolvimento

No Console do Firebase, vá para Firestore Database > Rules e aplique estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regras para provedores - apenas admins podem criar/editar
    match /providers/{providerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regras para tickets
    match /tickets/{ticketId} {
      allow read, write: if request.auth != null && (
        // Admin pode tudo
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        // Provider pode ver apenas seus próprios tickets
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'provider' && 
         resource.data.providerId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.providerId) ||
        // Colaborador pode criar e editar
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'collaborator'
      );
      allow create: if request.auth != null;
    }
  }
}
```

## Regras Temporárias para Debug (APENAS PARA DESENVOLVIMENTO)

Se as regras acima ainda não funcionarem, use temporariamente estas regras mais permissivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **IMPORTANTE**: As regras temporárias são apenas para desenvolvimento. Volte para as regras restritivas em produção.

## Como Aplicar

1. Acesse o Console do Firebase
2. Vá para Firestore Database
3. Clique em "Rules"
4. Cole as regras recomendadas
5. Clique em "Publish"

## Verificação

Após aplicar as regras, teste:
1. Login como admin - deve ver todos os tickets
2. Login como provider - deve ver apenas seus tickets
3. Criar novo ticket - deve funcionar para todos os roles
