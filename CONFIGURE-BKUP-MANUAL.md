# 🔧 Configuração Manual do Bkup no Firebase Console

## 📋 Como configurar via Firebase Console:

### 1. Acesse o Firebase Console
1. Vá para: https://console.firebase.google.com
2. Selecione projeto: **central-provedor-35ef4**
3. Clique em **Firestore Database**

### 2. Encontre o Provedor Bkup
1. Vá na coleção **providers**
2. Encontre o documento do provedor Bkup
3. Clique para editar

### 3. Configure os Campos Exatos:

```json
{
  "name": "Bkup",
  "franchise": 200,
  "valueN1": 3.5,
  "valueN2": 4.5,
  "valueMassive": 1.5,
  "fixedValue": 1100,
  "salesCommission": 50,
  "periodType": "fixed",
  "startDay": 28,
  "endDay": 28,
  "periodDays": 30,
  "updatedAt": "[Timestamp atual]"
}
```

### 4. Campos CRÍTICOS para a Franquia:

⚠️ **IMPORTANTE**: Estes campos devem estar EXATAMENTE assim:

- **franchise**: `200` (número, não string)
- **periodType**: `"fixed"` 
- **startDay**: `28`
- **valueN1**: `3.5`
- **valueN2**: `4.5`

### 5. Depois de Salvar:
1. **Refresh** na aplicação
2. **Verifique** se o cálculo mudou
3. **Teste**: 25 N1 + 5 N2 = R$ 0,00 (dentro da franquia)

---

## 🎯 Resultado Esperado:

### Com 25 N1 + 5 N2 + 0 Massivos:
```
Total N1+N2: 30 atendimentos
Franquia: 200 atendimentos
Status: DENTRO DA FRANQUIA

Cálculo:
- Valor fixo: R$ 1.100,00
- N1 cobráveis: 0 (dentro da franquia)
- N2 cobráveis: 0 (dentro da franquia)  
- Massivos: 0 × R$ 1,50 = R$ 0,00
- TOTAL: R$ 1.100,00
```

## 🚨 Se ainda não funcionar:

### Opção 1: Script Automático
```bash
node configure-bkup-firebase.js
```

### Opção 2: Console do Navegador
1. Abra **console do navegador** (F12)
2. Execute:
```javascript
// Verificar se a franquia está sendo lida
console.log('Provider data:', providers);
```

### Opção 3: Recriar Provedor
1. **Delete** o provedor atual no Firestore
2. **Crie** novo com configuração exata acima
3. **Refresh** aplicação

---

## ✅ Checklist de Verificação:

- [ ] Campo `franchise` = 200 (número)
- [ ] Campo `periodType` = "fixed" 
- [ ] Campo `startDay` = 28
- [ ] Valores N1/N2 corretos
- [ ] Aplicação refreshed
- [ ] Cálculo mostrando R$ 1.100,00 para 30 N1+N2
