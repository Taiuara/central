# Copilot Instructions - Central do Provedor

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a provider support center platform called "Central do Provedor" for PingDesk company. The platform manages technical support tickets and sales for internet providers.

## Admin User
- Email: admin@pingdesk.com.br
- UID: fKy68SaCZwYHV53Jp7Pnv591FY62

## Key Features
- Firebase authentication with different user roles (Admin, Provider, Collaborator)
- Dashboard with metrics and financial calculations
- Ticket management system (CRUD operations)
- Provider management
- Excel export functionality
- Real-time calculations based on different pricing models

## User Roles
1. **Admin**: Full access, can manage all tickets, providers, and users
2. **Provider**: Can view only their own tickets and dashboard
3. **Collaborator**: Can create and manage tickets

## Tech Stack
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Firebase (Authentication & Firestore)
- XLSX export functionality

## Coding Guidelines
- Use TypeScript strict mode
- Follow Next.js 14+ App Router patterns
- Use Tailwind CSS for styling
- Implement proper error handling
- Use Firebase security rules
- Follow React best practices
- Implement responsive design
