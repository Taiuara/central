# Central do Provedor - PingDesk

Sistema de gestão de suporte técnico e vendas para provedores de internet, desenvolvido pela PingDesk.

## 🚀 Funcionalidades

### Usuário Administrador
- **Dashboard completo** com métricas de todos os provedores
- **Gestão de chamados**: visualizar, editar e excluir todos os chamados
- **Gestão de provedores**: criar, editar e excluir provedores
- **Gestão de usuários**: criar e gerenciar usuários do sistema
- **Exportação**: planilhas XLSX dos chamados
- **Relatórios financeiros** detalhados

### Usuário Provedor
- **Dashboard personalizado** com suas métricas específicas
- **Visualização de chamados** da sua empresa
- **Cálculos automáticos** baseados no modelo de negócio configurado
- **Exportação** de planilhas dos seus chamados

### Usuário Colaborador
- **Abertura de chamados** para os provedores
- **Dashboard básico** com estatísticas gerais
- **Histórico** dos chamados registrados

## 🎯 Modelos de Negócio Suportados

O sistema suporta diferentes configurações de cobrança:

### Exemplo 1: Valor fixo sem franquia
- Período: 1º ao último dia do mês
- R$ 500,00 fixo
- R$ 3,50 por atendimento N1
- R$ 4,50 por atendimento N2
- R$ 1,50 por atendimento Massivo
- 30% de comissão sobre vendas

### Exemplo 2: Valor fixo com franquia
- Período: 28 a 28 do mês seguinte
- R$ 1.100,00 fixo
- 200 atendimentos N1+N2 inclusos na franquia
- Valores extras: R$ 3,50 (N1), R$ 4,50 (N2), R$ 1,50 (Massivo)
- 50% de comissão sobre vendas

### Exemplo 3: Sem fixo, sem franquia
- Período: 15 a 15 do mês seguinte
- Sem valor fixo
- R$ 5,50 por atendimento N1
- R$ 6,50 por atendimento N2
- R$ 3,50 por atendimento Massivo
- 80% de comissão sobre vendas

## 🛠️ Tecnologias

- **Next.js 14+** com App Router
- **TypeScript** para tipagem estática
- **Tailwind CSS** para estilização
- **Firebase** (Authentication + Firestore)
- **Lucide React** para ícones
- **XLSX** para exportação de planilhas

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Firebase

## 🚀 Instalação

1. **Clone o repositório**
\`\`\`bash
git clone <repository-url>
cd central-provedor
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
\`\`\`

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication (Email/Password)
   - Ative Firestore Database
   - Copie as configurações do projeto

4. **Configure as variáveis de ambiente**
   Crie um arquivo \`.env.local\` na raiz do projeto:
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`
   
   **📖 Para configuração detalhada do Firebase, consulte: `FIREBASE_SETUP.md`**

5. **Execute o projeto**
\`\`\`bash
npm run dev
\`\`\`

## 👤 Usuário Administrador Padrão

**Email:** admin@pingdesk.com.br  
**Firebase UID:** fKy68SaCZwYHV53Jp7Pnv591FY62

*Nota: Você precisará criar este usuário manualmente no Firebase Authentication e adicionar um documento na coleção 'users' com role 'admin'.*

## 📊 Estrutura do Banco de Dados

### Coleções Firestore

#### users
\`\`\`typescript
{
  id: string,
  email: string,
  name: string,
  role: 'admin' | 'provider' | 'collaborator',
  providerId?: string, // apenas para role 'provider'
  createdAt: Timestamp,
  updatedAt: Timestamp
}
\`\`\`

#### providers
\`\`\`typescript
{
  name: string,
  cnpj: string,
  franchise: number,
  valueN1: number,
  valueN2: number,
  valueMassive: number,
  salesCommission: number,
  fixedValue: number,
  startDay: number,
  endDay: number,
  email: string,
  password: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
\`\`\`

#### tickets
\`\`\`typescript
{
  providerId: string,
  providerName: string,
  clientName: string,
  whatsapp: string,
  protocol: string,
  attendanceDate: Timestamp,
  level: 'N1' | 'N2' | 'Massivo' | 'Venda',
  description: string,
  saleValue?: number,
  createdBy: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
\`\`\`

## 🔒 Regras de Segurança

Configure as regras do Firestore para garantir que:
- Admins tenham acesso total
- Provedores vejam apenas seus dados
- Colaboradores possam criar chamados e ver estatísticas gerais

## 📦 Deploy

### Vercel (Recomendado)

1. **Conecte seu repositório ao Vercel**
2. **Configure as variáveis de ambiente** no painel da Vercel
3. **Deploy automático** a cada push na branch main

### Outras plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Digital Ocean App Platform

## 📝 Scripts Disponíveis

\`\`\`bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia o servidor de produção
npm run lint         # Executa o linter
\`\`\`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da **PingDesk** - Todos os direitos reservados.

## 📞 Suporte

Para suporte e dúvidas, entre em contato:
- **Email:** admin@pingdesk.com.br
- **Website:** [PingDesk](https://pingdesk.com.br)

---

Desenvolvido com ❤️ pela equipe **PingDesk**
