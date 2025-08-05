# 🚀 Central do Provedor - Guia Completo de Deploy

## Deploy Automático no Vercel via GitHub

### ✅ Status do Projeto
- **Repositório**: https://github.com/Taiuara/central
- **Framework**: Next.js 15.4.5
- **Região**: São Paulo (gru1)
- **Status**: ✅ Pronto para produção

### 📋 Passo a Passo Completo

#### 1️⃣ Acesse o Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**

#### 2️⃣ Importe o Repositório
1. Selecione **"Import Git Repository"**
2. Busque por: `Taiuara/central`
3. Clique em **"Import"**

#### 3️⃣ Configuração Automática
- ✅ Framework: Next.js (detectado automaticamente)
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Root Directory: `./`

#### 4️⃣ Variáveis de Ambiente OBRIGATÓRIAS

⚠️ **IMPORTANTE**: Configure estas variáveis antes do deploy:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD8RqsjXByWhRYgRgGEJE19iXpk0J68tgc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=central-provedor-35ef4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=central-provedor-35ef4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=central-provedor-35ef4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=242631943904
NEXT_PUBLIC_FIREBASE_APP_ID=1:242631943904:web:e14e01cac0e1ec83401285
NODE_ENV=production
```

**Como adicionar no Vercel:**
1. Na tela de configuração, expanda **"Environment Variables"**
2. Adicione cada variável acima (uma por vez)
3. Marque: **Production**, **Preview** e **Development**

#### 5️⃣ Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. ✅ Projeto estará disponível em: `https://central-xxx.vercel.app`
- ✅ Dashboard com métricas
- ✅ Relatórios em Excel
- ✅ Timezone correto (Brasil)
- ✅ Sistema responsivo

### 7. Monitoramento
O sistema inclui logs detalhados para debugging. Monitore o console do navegador em caso de problemas.

### 8. Backup e Recuperação
Todos os dados estão no Firebase Firestore com backup automático ativado.

## 🎯 Sistema Pronto para Produção!
