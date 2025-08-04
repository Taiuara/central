@echo off
echo 🚀 Configurando repositório GitHub...
echo.

cd /d "c:\Users\Taai\Desktop\central-provedor"

echo 📡 Adicionando repositório remoto...
git remote add origin https://github.com/Taiuara/central.git

echo.
echo 📝 Verificando status...
git status

echo.
echo ➕ Adicionando arquivos...
git add .

echo.
echo 💾 Fazendo commit...
git commit -m "Initial commit: Central do Provedor - Complete system with authentication, tickets, providers, users, and reports"

echo.
echo 🌿 Configurando branch main...
git branch -M main

echo.
echo 🚀 Fazendo push para o GitHub...
git push -u origin main

echo.
echo ✅ Deploy concluído! Projeto disponível em: https://github.com/Taiuara/central
echo 🔗 Clone o repositório com: git clone https://github.com/Taiuara/central.git
echo.
pause
