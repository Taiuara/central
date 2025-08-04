# Central do Provedor 🚀

Sistema de gestão para provedores de internet da PingDesk, oferecendo controle completo de tickets de suporte, vendas e métricas financeiras.

## 📋 Funcionalidades

### 🔐 Autenticação e Controle de Acesso
- **Admin**: Acesso completo ao sistema
- **Provider**: Visualização de dados próprios
- **Collaborator**: Criação e gerenciamento de tickets

### 🎯 Gestão de Tickets
- CRUD completo de tickets de suporte
- Níveis de atendimento (N1, N2, Massivo, Venda)
- Controle de status e datas de atendimento
- Valores de venda para tickets comerciais

### 🏢 Gestão de Provedores
- Cadastro e edição de provedores
- Configuração de valores por nível de atendimento
- Sistema flexível de períodos (fixo vs mensal)
- Dias contantes configuráveis
- Comissão de vendas personalizável

### 👥 Gestão de Usuários
- Criação e edição de usuários
- Associação de usuários aos provedores
- Controle de roles e permissões

### 📊 Dashboard e Relatórios
- Métricas em tempo real
- Cálculos financeiros automáticos
- Filtros por período personalizáveis
- Exportação para Excel
- Gráficos e visualizações

## 🛠️ Tecnologias

- **Frontend**: Next.js 14+ com App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Icons**: Lucide React
- **Export**: XLSX

## 🚀 Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/Taiuara/central.git
cd central
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure o Firebase**:
```bash
cp .env.example .env.local
```
Edite o arquivo `.env.local` com suas credenciais do Firebase.

4. **Execute o projeto**:
```bash
npm run dev
```

5. **Acesse**: http://localhost:3000

## ⚙️ Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication (Email/Password)
3. Ative Firestore Database
4. Configure as regras de segurança (veja `FIREBASE_SETUP.md`)
5. Adicione as credenciais no `.env.local`

## 👤 Usuário Admin Padrão

- **Email**: admin@pingdesk.com.br
- **UID**: fKy68SaCZwYHV53Jp7Pnv591FY62

## 📁 Estrutura do Projeto

```
src/
├── app/                 # App Router (Next.js 14+)
├── components/          # Componentes React
├── contexts/           # Context API (Auth)
├── lib/                # Configurações (Firebase)
├── types/              # Definições TypeScript
└── utils/              # Utilitários e helpers
```

## 🔒 Segurança

- Autenticação obrigatória para todas as páginas
- Controle de acesso baseado em roles
- Regras de segurança do Firestore
- Validação de dados no frontend e backend

## 📈 Períodos de Cobrança

O sistema suporta dois tipos de períodos:

- **Fixo**: Período específico (ex: 28/07 a 28/08)
- **Mensal**: Mês calendário (ex: 01/08 a 31/08)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade da PingDesk.

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento da PingDesk.

---

Desenvolvido com ❤️ pela equipe PingDesk
