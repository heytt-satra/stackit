# StackIt Forum

A modern Stack Overflow-like forum built with React, Express, Neon DB, and Clerk authentication.

## Features

- 🔐 **Clerk Authentication** - Secure user authentication and management
- 💾 **Neon Database** - PostgreSQL database with Drizzle ORM
- ⚡ **Real-time** - WebSocket support for live updates
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and Radix UI
- 📱 **Responsive** - Works on desktop and mobile devices
- 🔍 **Search** - Advanced search functionality
- ⬆️ **Voting System** - Upvote/downvote questions and answers
- 🏷️ **Tags** - Organize content with tags
- ✨ **Rich Text Editor** - TipTap-powered editor for questions and answers

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Real-time**: WebSocket
- **Rich Text**: TipTap

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon Database account
- Clerk account

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd StackItForum
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. Add it to your environment variables

### 4. Set up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Get your publishable key and secret key
4. Add them to your environment variables

### 5. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 6. Database Setup

Push the database schema:

```bash
npm run db:push
```

### 7. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility libraries
│   │   ├── pages/        # Page components
│   │   └── App.tsx       # Main app component
│   └── index.html
├── server/                # Backend Express application
│   ├── clerkAuth.ts      # Clerk authentication middleware
│   ├── db.ts             # Database configuration
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── vite.ts           # Vite development setup
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema
└── package.json
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy

### Manual Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Start the server: `npm run start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 