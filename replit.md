# e-Proc - B2B E-Procurement Platform

## Overview

e-Proc is a comprehensive B2B e-procurement platform designed for Química Anastácio. The system automates the complete procurement cycle from supplier registration to payment (Procure-to-Pay). It manages suppliers, creates RFCIs (Request for Commercial Information), handles quotations, and provides comparative analysis tools for procurement decisions.

The platform supports two main user types: internal buyers/managers and external suppliers through a dedicated portal. Key business goals include reducing procurement lead time by 40%, reducing operational costs by 25%, and achieving 100% process digitalization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Design System**: Carbon Design System principles (IBM) - optimized for data-intensive enterprise applications
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript throughout
- **API Style**: REST API endpoints under `/api/*`
- **Build Tool**: Vite for frontend, esbuild for server bundling

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions and types
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Current State**: Uses in-memory storage for demo purposes, ready for PostgreSQL migration

### Authentication
- **Strategy**: JWT-based authentication with demo mode support
- **Context**: React Context API for auth state management
- **Role-Based Access**: Supports ADMIN, BUYER, BUYER_MANAGER, and SUPPLIER roles
- **User Switching**: Demo feature to switch between buyer and supplier views

### Key Design Patterns
- **Monorepo Structure**: Shared types between client and server in `shared/` directory
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **Component Architecture**: shadcn/ui components in `client/src/components/ui/`
- **Theme Support**: Dark/light mode with CSS variables

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured in drizzle.config.ts)
- **Environment Variable**: `DATABASE_URL` required for database connection

### UI Component Libraries
- **Radix UI**: Primitive components (dialog, dropdown, popover, tabs, etc.)
- **shadcn/ui**: Pre-built component collection using Radix primitives
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool with HMR
- **Drizzle Kit**: Database migration tooling (`npm run db:push`)
- **TypeScript**: Full type safety across the stack

### Fonts
- **IBM Plex Sans**: Primary font (Google Fonts CDN)
- **IBM Plex Mono**: Monospace font for codes and IDs
- **DM Sans, Geist Mono, Fira Code**: Additional typography options

### Future Integrations (Planned)
- **Protheus ERP**: REST API integration for 7 modules
- **Fluig BPM**: REST API for workflow management
- **ElasticSearch**: Product catalog search (planned)
- **Redis**: Caching layer (planned)