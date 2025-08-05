# Índices do Firestore - Central do Provedor

## ✅ Status: RESOLVIDO

O índice composto necessário foi criado com sucesso e o sistema está funcionando corretamente.

## Problema Identificado ✅ RESOLVIDO
O Firebase requer índices compostos para queries que combinam filtros `where` com `orderBy` em campos diferentes.

## Índices Necessários

### ✅ 1. Índice para Tickets de Provedor - CRIADO
**Coleção:** tickets
**Campos:**
- providerId (Ascending)
- attendanceDate (Descending)
- __name__ (Descending)

**Status:** ✅ Criado e funcionando

**Link direto para criação:**
```
https://console.firebase.google.com/v1/r/project/central-provedor-35ef4/firestore/indexes?create_composite=ClZwcm9qZWN0cy9jZW50cmFsLXByb3ZlZG9yLTM1ZWY0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy90aWNrZXRzL2luZGV4ZXMvXxABGg4KCnByb3ZpZGVySWQQARoSCg5hdHRlbmRhbmNlRGF0ZRACGgwKCF9fbmFtZV9fEAI
```

## Como Criar os Índices

### Método 1: Link Direto (Recomendado)
1. Clique no link acima (gerado automaticamente pelo Firebase)
2. Faça login no Console do Firebase se necessário
3. Clique em "Create Index"
4. Aguarde a criação (pode demorar alguns minutos)

### Método 2: Manual
1. Acesse o Console do Firebase
2. Vá para Firestore Database
3. Clique em "Indexes"
4. Clique em "Create Index"
5. Configure:
   - Collection ID: tickets
   - Field 1: providerId (Ascending)
   - Field 2: attendanceDate (Descending)
6. Clique em "Create"

## Status da Correção Temporária
✅ **Implementado**: Correção temporária que remove o `orderBy` da query e ordena em memória
- Funciona imediatamente sem precisar esperar o índice
- Performance ligeiramente menor para provedores com muitos tickets
- Será revertido para usar orderBy na query após criação do índice

## Reverter Correção Temporária (Após Índice Criado)
Depois que o índice estiver criado, você pode reverter para a versão otimizada:

```javascript
// Voltar para esta query otimizada:
ticketsQuery = query(
  collection(db, 'tickets'),
  where('providerId', '==', user.providerId),
  orderBy('attendanceDate', 'desc')
);
```

## Verificação
Após criar o índice, teste:
1. Login como provider
2. Verificar se os tickets aparecem
3. Verificar se estão ordenados por data (mais recentes primeiro)
4. Não deve haver erros no console do navegador
