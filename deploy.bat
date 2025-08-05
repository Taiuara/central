@echo off
REM 🚀 Script de Deploy - Central do Provedor (Windows)
title Central do Provedor - Deploy Vercel

echo.
echo ===========================================
echo 🚀 CENTRAL DO PROVEDOR - DEPLOY VERCEL
echo ===========================================
echo.

REM Verificar se está na branch main
for /f "tokens=*" %%a in ('git branch --show-current') do set current_branch=%%a
if not "%current_branch%"=="main" (
    echo ❌ Você deve estar na branch 'main' para fazer deploy
    echo    Branch atual: %current_branch%
    pause
    exit /b 1
)

echo 📋 CHECKLIST PRÉ-DEPLOY
echo ========================
echo.

REM Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm não encontrado
    pause
    exit /b 1
)
echo ✅ npm encontrado

REM Verificar mudanças não commitadas
git status --porcelain > temp_status.txt
for /f %%a in (temp_status.txt) do set has_changes=1
del temp_status.txt

if defined has_changes (
    echo.
    echo 📝 Mudanças não commitadas detectadas:
    git status --short
    echo.
    set /p commit_choice="Deseja fazer commit das mudanças? (s/N): "
    if /i "%commit_choice%"=="s" (
        set /p commit_msg="Digite a mensagem do commit: "
        git add .
        git commit -m "!commit_msg!"
        echo ✅ Commit realizado
    ) else (
        echo ❌ Deploy cancelado - faça commit das mudanças primeiro
        pause
        exit /b 1
    )
) else (
    echo ✅ Nenhuma mudança pendente
)

REM Testar build
echo.
echo 🔨 Testando build local...
npm run build >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro no build local
    echo Execute 'npm run build' para ver os detalhes
    pause
    exit /b 1
)
echo ✅ Build local bem-sucedido

REM Push para GitHub
echo.
echo 📤 Enviando para GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ Erro no push para GitHub
    pause
    exit /b 1
)
echo ✅ Push para GitHub realizado

echo.
echo ===========================================
echo 🎉 DEPLOY INICIADO COM SUCESSO!
echo ===========================================
echo.
echo 📋 PRÓXIMOS PASSOS:
echo.
echo 1. 🌐 Acesse: https://vercel.com
echo 2. 🔗 Conecte o repositório: Taiuara/central
echo 3. ⚙️  Configure as variáveis de ambiente:
echo.
echo    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD8RqsjXByWhRYgRgGEJE19iXpk0J68tgc
echo    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=central-provedor-35ef4.firebaseapp.com
echo    NEXT_PUBLIC_FIREBASE_PROJECT_ID=central-provedor-35ef4
echo    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=central-provedor-35ef4.firebasestorage.app
echo    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=242631943904
echo    NEXT_PUBLIC_FIREBASE_APP_ID=1:242631943904:web:e14e01cac0e1ec83401285
echo    NODE_ENV=production
echo.
echo 4. 🚀 Clique em 'Deploy'
echo 5. ⏳ Aguarde 2-3 minutos
echo 6. ✅ Acesse sua aplicação em: https://central-xxx.vercel.app
echo.
echo 🔐 CREDENCIAIS PADRÃO:
echo    Email: admin@pingdesk.com.br
echo    Senha: admin123
echo.
echo 🎯 FUNCIONALIDADES PRONTAS:
echo    ✅ Sistema de franquia Bkup (200 N1+N2)
echo    ✅ Autenticação Firebase
echo    ✅ Dashboard com métricas
echo    ✅ Gestão de tickets, usuários e provedores
echo    ✅ Relatórios e exportação Excel
echo.
echo 🎉 SUCESSO! Repositório atualizado e pronto para deploy!
echo.
pause
