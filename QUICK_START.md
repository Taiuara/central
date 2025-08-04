# ⚡ Configuração Rápida - Central do Provedor

## 🔥 Para usar imediatamente:

### 1. Configure o Firebase (OBRIGATÓRIO)
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local
```

### 2. Edite o arquivo .env.local com suas credenciais do Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Execute o projeto:
```bash
npm run dev
```

### 4. Acesse: http://localhost:3000

## 🚨 IMPORTANTE:

**SEM as configurações do Firebase, o sistema NÃO funcionará!**

### Como obter as credenciais:

1. Vá para [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative **Authentication** (Email/Password)
4. Ative **Firestore Database**
5. Vá em **Project Settings** > **Your apps** > **Web app**
6. Copie as configurações do SDK

### Usuário Admin Padrão:
- **Email:** admin@pingdesk.com.br
- **UID:** fKy68SaCZwYHV53Jp7Pnv591FY62

**⚠️ Você precisa criar este usuário manualmente no Firebase!**

## 📖 Documentação Completa:
- `FIREBASE_SETUP.md` - Configuração detalhada
- `README.md` - Documentação completa

## 🆘 Problemas?

### "Email ou senha incorretos":
1. ✅ Verifique se configurou o .env.local
2. ✅ Verifique se criou o usuário admin no Firebase
3. ✅ Verifique se o Authentication está ativo

### Logo não aparece:
- ✅ Limpe o cache do navegador (Ctrl+F5)

### Favicon não atualiza:
- ✅ Limpe o cache do navegador
- ✅ Acesse em aba anônima

---
**PingDesk** - Suporte Técnico Especializado 🚀
