# Script para fazer deploy do projeto para o GitHub
# Execute este script no PowerShell como Administrador

Write-Host "🚀 Configurando repositório GitHub..." -ForegroundColor Green

# Verificar se estamos no diretório correto
$currentDir = Get-Location
Write-Host "Diretório atual: $currentDir" -ForegroundColor Yellow

# Adicionar o repositório remoto
Write-Host "📡 Adicionando repositório remoto..." -ForegroundColor Green
git remote add origin https://github.com/Taiuara/central.git

# Verificar se há mudanças para commitar
Write-Host "📝 Verificando mudanças..." -ForegroundColor Green
git status

# Adicionar todos os arquivos
Write-Host "➕ Adicionando arquivos..." -ForegroundColor Green
git add .

# Fazer commit das mudanças
Write-Host "💾 Fazendo commit..." -ForegroundColor Green
git commit -m "Initial commit: Central do Provedor - Complete system with authentication, tickets, providers, users, and reports"

# Verificar se o branch main existe
Write-Host "🌿 Configurando branch main..." -ForegroundColor Green
git branch -M main

# Fazer push para o GitHub
Write-Host "🚀 Fazendo push para o GitHub..." -ForegroundColor Green
git push -u origin main

Write-Host "✅ Deploy concluído! Projeto disponível em: https://github.com/Taiuara/central" -ForegroundColor Green
Write-Host "🔗 Clone o repositório com: git clone https://github.com/Taiuara/central.git" -ForegroundColor Cyan
