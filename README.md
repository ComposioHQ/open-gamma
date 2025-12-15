# Open Gamma

A production-ready AI Chat application featuring **Composio** for tool usage (Google Slides, etc.), **Vercel AI SDK** for chat streaming, and **NextAuth v5** for authentication.

## 🚀 Features

- **AI Chat**: Powered by Vercel AI SDK (supports OpenAI, Anthropic, Google).
- **Tool Integration**: Uses [Composio](https://composio.dev) to connect with external tools like Google Slides.
- **Authentication**: Custom authentication flow linking Composio User IDs with NextAuth sessions.
- **Database**: PostgreSQL with Drizzle ORM.
- **Infrastructure**: Next.js 15 (App Router), Tailwind CSS.
- **Security**: Rate limiting, strict environment validation, and secure auth flows.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: NextAuth.js (Auth.js v5)
- **AI**: Vercel AI SDK + Composio
- **Styling**: Tailwind CSS
- **Validation**: Zod (Env vars & Schema)
- **Linting**: ESLint + Prettier

## ⚡ Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud like Neon/Supabase)

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgres://user:pass@localhost:5432/open_gamma"

# NextAuth
AUTH_SECRET="your_generated_secret" # generate with `npx auth secret` or `openssl rand -base64 32`
AUTH_URL="http://localhost:3000" # Deployment URL

# Composio (Tools & Auth)
COMPOSIO_API_KEY="your_composio_api_key"
AUTH_CONFIG_ID="your_auth_config_id" # From Composio Dashboard

# AI Providers (At least one required)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-..."
```

### 3. Installation

```bash
npm install
```

### 4. Database Setup

Push the schema to your database (for local dev):

```bash
npm run db:push
```

For production migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🏗️ Architecture

### Authentication Flow
1. User clicks "Sign in with Composio".
2. App generates a unique `userId` and calls `composio.connectedAccounts.link()`.
3. User authenticates with the external provider (e.g., Google/GitHub) via Composio.
4. Composio redirects back to `/auth/callback`.
5. App verifies the `userId` and creates a NextAuth session.

### AI & Tools
The chat interface (`app/page.tsx`) uses the Vercel AI SDK `useChat` hook.
Tools are executed via `ComposioToolSet` on the server (`app/api/chat/route.ts`).
Rate limiting is applied per user session.

## 📜 Database Scripts

- `npm run db:push`: Push schema changes directly (prototyping only).
- `npm run db:generate`: Generate SQL migration files (production).
- `npm run db:migrate`: Apply migration files to the DB.
- `npm run db:studio`: Open Drizzle Studio to view data.

## 🚢 Deployment

1. **Build**: `npm run build`
2. **Environment**: Ensure all `.env` variables are set in your provider (Vercel/Railway).
3. **Database**: Run `npm run db:migrate` during the build process or as a post-deploy step.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes (Husky will check formatting).
4. Push to the branch.
5. Open a Pull Request.
