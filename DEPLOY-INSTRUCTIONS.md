# 📋 Instruções para Deploy no GitHub

## Passos Manuais

Execute os comandos abaixo no terminal/PowerShell dentro da pasta do projeto:

### 1. Navegue para o diretório do projeto
```bash
cd "c:\Users\Taai\Desktop\central-provedor"
```

### 2. Adicione o repositório remoto
```bash
git remote add origin https://github.com/Taiuara/central.git
```

### 3. Verifique o status
```bash
git status
```

### 4. Adicione todos os arquivos
```bash
git add .
```

### 5. Faça commit das mudanças
```bash
git commit -m "Initial commit: Central do Provedor - Complete system"
```

### 6. Configure a branch main
```bash
git branch -M main
```

### 7. Faça push para o GitHub
```bash
git push -u origin main
```

## 🚨 Antes do Deploy

Certifique-se de que:

1. ✅ O arquivo `.env.local` não está sendo enviado (verificar `.gitignore`)
2. ✅ Todas as dependências estão no `package.json`
3. ✅ O projeto compila sem erros: `npm run build`
4. ✅ Você tem acesso ao repositório GitHub: https://github.com/Taiuara/central

## 📦 Arquivos Incluídos

- ✅ Código fonte completo
- ✅ Configurações do Next.js
- ✅ Configurações do Firebase
- ✅ Documentação (README.md)
- ✅ Scripts de deploy
- ✅ Configurações do TypeScript/ESLint

## 🚫 Arquivos Excluídos (.gitignore)

- ❌ `.env.local` (credenciais)
- ❌ `node_modules/` (dependências)
- ❌ `.next/` (build cache)
- ❌ Logs e arquivos temporários

## 🔗 Resultado Final

Após o deploy, o projeto estará disponível em:
**https://github.com/Taiuara/central**

Para clonar em outro local:
```bash
git clone https://github.com/Taiuara/central.git
```
