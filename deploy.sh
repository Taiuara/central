#!/bin/bash
# 🚀 Script de Deploy Automatizado - Central do Provedor

echo "🚀 CENTRAL DO PROVEDOR - DEPLOY VERCEL"
echo "========================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se está na branch main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo -e "${RED}❌ Você deve estar na branch 'main' para fazer deploy${NC}"
    echo "   Branch atual: $current_branch"
    exit 1
fi

echo -e "${BLUE}📋 CHECKLIST PRÉ-DEPLOY${NC}"
echo "========================="
echo ""

# 1. Verificar dependências
echo -e "${YELLOW}🔍 Verificando dependências...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm encontrado${NC}"

# 2. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}📝 Há mudanças não commitadas. Fazendo commit...${NC}"
    echo ""
    echo "Mudanças detectadas:"
    git status --short
    echo ""
    read -p "Deseja fazer commit das mudanças? (s/N): " commit_changes
    if [[ $commit_changes =~ ^[Ss]$ ]]; then
        read -p "Digite a mensagem do commit: " commit_message
        git add .
        git commit -m "$commit_message"
        echo -e "${GREEN}✅ Commit realizado${NC}"
    else
        echo -e "${RED}❌ Deploy cancelado - faça commit das mudanças primeiro${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Nenhuma mudança pendente${NC}"
fi

# 3. Executar testes de build
echo -e "${YELLOW}🔨 Testando build local...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build local bem-sucedido${NC}"
else
    echo -e "${RED}❌ Erro no build local${NC}"
    echo "Execute 'npm run build' para ver os detalhes do erro"
    exit 1
fi

# 4. Verificar lint
echo -e "${YELLOW}🔍 Verificando código (lint)...${NC}"
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Lint passou${NC}"
else
    echo -e "${YELLOW}⚠️  Avisos de lint encontrados (continuando...)${NC}"
fi

# 5. Push para GitHub
echo -e "${YELLOW}📤 Enviando para GitHub...${NC}"
git push origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Push para GitHub realizado${NC}"
else
    echo -e "${RED}❌ Erro no push para GitHub${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 DEPLOY INICIADO COM SUCESSO!${NC}"
echo "==============================="
echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. 🌐 Acesse: https://vercel.com"
echo "2. 🔗 Conecte o repositório: Taiuara/central"
echo "3. ⚙️  Configure as variáveis de ambiente:"
echo ""
echo -e "${YELLOW}   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD8RqsjXByWhRYgRgGEJE19iXpk0J68tgc${NC}"
echo -e "${YELLOW}   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=central-provedor-35ef4.firebaseapp.com${NC}"
echo -e "${YELLOW}   NEXT_PUBLIC_FIREBASE_PROJECT_ID=central-provedor-35ef4${NC}"
echo -e "${YELLOW}   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=central-provedor-35ef4.firebasestorage.app${NC}"
echo -e "${YELLOW}   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=242631943904${NC}"
echo -e "${YELLOW}   NEXT_PUBLIC_FIREBASE_APP_ID=1:242631943904:web:e14e01cac0e1ec83401285${NC}"
echo -e "${YELLOW}   NODE_ENV=production${NC}"
echo ""
echo "4. 🚀 Clique em 'Deploy'"
echo "5. ⏳ Aguarde 2-3 minutos"
echo "6. ✅ Acesse sua aplicação em: https://central-xxx.vercel.app"
echo ""
echo -e "${BLUE}🔐 CREDENCIAIS PADRÃO:${NC}"
echo "   Email: admin@pingdesk.com.br"
echo "   Senha: admin123"
echo ""
echo -e "${GREEN}🎯 FUNCIONALIDADES PRONTAS:${NC}"
echo "   ✅ Sistema de franquia Bkup (200 N1+N2)"
echo "   ✅ Autenticação Firebase"
echo "   ✅ Dashboard com métricas"
echo "   ✅ Gestão de tickets, usuários e provedores"
echo "   ✅ Relatórios e exportação Excel"
echo "   ✅ Períodos fixos e mensais"
echo ""
echo -e "${BLUE}📚 DOCUMENTAÇÃO:${NC}"
echo "   📖 DEPLOY.md - Guia completo de deploy"
echo "   📖 FRANCHISE-RULES.md - Regras da franquia"
echo "   📖 IMPLEMENTATION-SUMMARY.md - Resumo das alterações"
echo ""
echo -e "${GREEN}🎉 SUCESSO! Repositório atualizado e pronto para deploy no Vercel!${NC}"
