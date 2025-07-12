# StackIt - Q&A Platform

## Overview

StackIt is a minimal question-and-answer platform designed for collaborative learning and structured knowledge sharing. The application is built as a full-stack web application with a React frontend and Express.js backend, featuring real-time interactions, rich text editing, and a comprehensive voting system.

## ## User Preferences

- **Communication style**: Simple, everyday language
- **Design preference**: Reddit-style interface over Stack Overflow-style
- **Color scheme**: Orange accent colors (#FF5722) for branding and CTAs

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme configuration
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Rich Text Editing**: TipTap editor with StarterKit for question/answer content

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Project Structure
```
├── client/           # Frontend React application
├── server/           # Backend Express.js application
├── shared/           # Shared TypeScript schemas and types
└── migrations/       # Database migration files
```

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/updates on authentication
- **Authorization**: Route-level protection with middleware

### Database Schema
- **Users**: Profile information with Replit Auth integration
- **Questions**: Title, content, author, timestamps, and vote tracking
- **Answers**: Content, author, timestamps, acceptance status, and vote tracking
- **Tags**: Categorization system with many-to-many relationship to questions
- **Votes**: Separate tracking for question and answer votes
- **Sessions**: Authentication session persistence

### API Design
- **RESTful endpoints** for CRUD operations
- **Authentication middleware** for protected routes
- **Error handling** with standardized JSON responses
- **Request logging** for API monitoring

### Frontend Features
- **Reddit-style layout** with card-based feed design
- **Orange accent theme** (#FF5722) with dark background
- **Responsive design** with mobile-first approach
- **Rich text editor** for formatting questions and answers
- **Real-time voting** with Reddit-style up/down arrows
- **Search functionality** across questions
- **Tag-based filtering** and organization
- **Modal-based interactions** for creating content
- **Community sidebar** with stats and popular tags

## Data Flow

1. **Authentication Flow**:
   - Users authenticate via Replit Auth
   - Sessions stored in PostgreSQL
   - User profiles automatically synced

2. **Question Creation**:
   - Rich text content with TipTap editor
   - Tag selection and creation
   - Automatic author assignment

3. **Answer System**:
   - Threaded responses to questions
   - Author can accept best answers
   - Community voting on all content

4. **Voting Mechanism**:
   - Upvote/downvote system for questions and answers
   - Vote tracking prevents duplicate votes
   - Real-time score updates

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for data persistence
- **Connection**: WebSocket-based connection pooling

### Authentication
- **Replit Auth**: OpenID Connect provider for user authentication
- **Session Storage**: PostgreSQL-backed session management

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Icon library for UI elements
- **TipTap**: Rich text editor framework

### Development Tools
- **Vite**: Development server and build tool
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across the application

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite dev server with Express API proxy
- **Database Migrations**: Drizzle Kit for schema changes
- **Environment Variables**: Required for database URL and auth configuration

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles Express server for Node.js deployment
- **Database**: Automatic schema synchronization with Drizzle push

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit)

## Recent Changes

**July 12, 2025**: 
- ✓ Fixed question posting functionality - resolved database errors and form submission issues
- ✓ Redesigned interface from Stack Overflow-style to Reddit-style layout
- ✓ Updated color scheme to orange accent theme (#FF5722) 
- ✓ Implemented Reddit-style voting arrows and card layout
- ✓ Added community sidebar with member stats and popular tags
- ✓ Updated all UI components to use new Reddit-style classes and colors

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling efficient development and deployment workflows.