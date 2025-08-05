# Sistema de Franquia - Provedor Bkup

## Regra de Contabilização

### Para o Provedor Bkup:
- **Franquia**: 200 atendimentos N1 + N2 inclusos no valor fixo
- **Valor Fixo**: R$ 1.100,00 (inclui até 200 atendimentos N1+N2)
- **Período**: 28 do mês atual até 28 do mês seguinte

### Como Funciona:

#### 1. Atendimentos N1 e N2:
- **Até 200 atendimentos (N1 + N2)**: Inclusos no valor fixo, não geram cobrança adicional
- **Acima de 200 atendimentos**: Cada atendimento adicional é cobrado
  - N1: R$ 3,50 por atendimento
  - N2: R$ 4,50 por atendimento

#### 2. Atendimentos Massivos:
- **Sempre contabilizados**: R$ 1,50 por atendimento
- **Não contam para a franquia**: Massivos são cobrados independentemente do limite de 200

#### 3. Vendas:
- **Comissão**: 50% sobre o valor da venda
- **Não contam para a franquia**

### Exemplos:

#### Exemplo 1: Dentro da franquia
- N1: 150 atendimentos
- N2: 30 atendimentos
- Massivos: 20 atendimentos
- **Total N1+N2**: 180 (dentro da franquia de 200)
- **Cobrança**: R$ 1.100,00 (fixo) + R$ 30,00 (20 massivos × R$ 1,50) = **R$ 1.130,00**

#### Exemplo 2: Ultrapassando a franquia
- N1: 180 atendimentos
- N2: 50 atendimentos
- Massivos: 15 atendimentos
- **Total N1+N2**: 230 (30 atendimentos acima da franquia)
- **N1 excedente**: 23 atendimentos (180/230 × 30)
- **N2 excedente**: 7 atendimentos (50/230 × 30)
- **Cobrança**: 
  - Fixo: R$ 1.100,00
  - N1 excedente: 23 × R$ 3,50 = R$ 80,50
  - N2 excedente: 7 × R$ 4,50 = R$ 31,50
  - Massivos: 15 × R$ 1,50 = R$ 22,50
  - **Total**: R$ 1.234,50

### Implementação no Sistema:

```javascript
// Lógica aplicada no cálculo
const franchise = provider.franchise || 0; // 200 para Bkup
const totalN1N2 = n1Tickets + n2Tickets;
let billableN1Tickets = 0;
let billableN2Tickets = 0;

if (franchise > 0) {
  const exceededTickets = Math.max(0, totalN1N2 - franchise);
  if (exceededTickets > 0) {
    // Distribuir proporcionalmente
    billableN1Tickets = Math.floor(exceededTickets * (n1Tickets / totalN1N2));
    billableN2Tickets = Math.floor(exceededTickets * (n2Tickets / totalN1N2));
  }
} else {
  // Sem franquia, contabiliza todos
  billableN1Tickets = n1Tickets;
  billableN2Tickets = n2Tickets;
}

// Massivos sempre contabilizam
const massiveValue = massiveTickets * (provider.valueMassive || 0);
```

### Configuração do Provedor:

Para configurar um provedor com franquia:
1. Definir `franchise: 200` (ou outro valor)
2. Definir `periodType: 'fixed'` para período fixo
3. Definir `startDay: 28` para período do dia 28
4. O sistema automaticamente aplicará a regra da franquia nos cálculos
