# Healthcare AI Agent

An intelligent healthcare companion powered by AI for monitoring glucose levels, tracking meals, analyzing health trends, and providing personalized health insights.

## ✨ Features

- **🔐 Secure Authentication** - PostgreSQL + Better Auth integration
- **📊 Real-time Monitoring** - Continuous glucose level tracking
- **🍽️ Meal Tracking** - Log meals and understand their impact
- **📈 Health Analytics** - AI-powered trend analysis and insights
- **💬 AI Health Assistant** - 24/7 conversational health support
- **🛡️ Privacy & Security** - Enterprise-grade data protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Docker and Docker Compose (for PostgreSQL)
- pnpm (recommended) or npm

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Healthcare-Agent
```

### 2. Start PostgreSQL Database

```bash
# Start PostgreSQL using Docker Compose
docker-compose up -d

# Verify PostgreSQL is running
docker-compose ps
```

### 3. Install Dependencies

```bash
cd frontend
pnpm install
```

### 4. Configure Environment Variables

Update `.env.local` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db"
BETTER_AUTH_SECRET="your-secret-key-here-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
```

**Important:** Generate a secure secret for production:
```bash
openssl rand -base64 32
```

### 5. Run Database Migrations

```bash
cd frontend
npx @better-auth/cli@latest migrate
```

### 6. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui
- **Icons:** Lucide React
- **Charts:** Recharts
- **AI Integration:** CopilotKit

### Backend & Authentication
- **Database:** PostgreSQL 16
- **Authentication:** Better Auth
- **ORM/Client:** pg (node-postgres)
- **API:** Next.js API Routes

### AI/ML
- **Agent Framework:** Python-based agents (see `/agents` directory)
- **Data Generation:** Custom healthcare data generator

## 📁 Project Structure

```
Healthcare-Agent/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Authentication pages
│   │   │   │   ├── signin/
│   │   │   │   └── signup/
│   │   │   ├── (dashboard)/      # Protected dashboard
│   │   │   │   ├── dashboard/  
│   │   │   │   ├── chat/
│   │   │   │   └── settings/
│   │   │   ├── api/
│   │   │   │   ├── auth/         # Better Auth routes
│   │   │   │   └── copilotkit/   # AI integration
│   │   │   └── page.tsx          # Landing page
│   │   ├── components/
│   │   │   ├── auth/             # Auth components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── auth.ts           # Server auth config
│   │   │   ├── auth-client.ts    # Client auth config
│   │   │   └── utils.ts
│   │   └── middleware.ts         # Route protection
│   ├── package.json
│   └── .env.local
├── agents/                        # Python backend
│   ├── agent.py
│   ├── services.py
│   └── data/
├── docker-compose.yml            # PostgreSQL setup
├── SETUP.md                      # Detailed setup guide
└── README.md                     # This file
```

## 🔑 Authentication System

This project uses **Better Auth** - a modern, secure authentication library for TypeScript.

### Features Implemented:
- ✅ Email/Password Authentication
- ✅ PostgreSQL Database Storage
- ✅ Session Management
- ✅ Protected Routes with Middleware
- ✅ Server-Side Session Validation
- ✅ Client-Side React Hooks

### Key Files:
- `/frontend/src/lib/auth.ts` - Server configuration
- `/frontend/src/lib/auth-client.ts` - Client configuration
- `/frontend/src/app/api/auth/[...all]/route.ts` - API routes
- `/frontend/src/middleware.ts` - Route protection

### Adding OAuth Providers:

Uncomment and configure in `/frontend/src/lib/auth.ts`:

```typescript
socialProviders: {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }
}
```

## 🗄️ Database Management

### View Database

```bash
# Connect to PostgreSQL
docker exec -it healthcare-postgres psql -U user -d healthcare_db

# List tables
\dt

# View users
SELECT * FROM user;

# Exit
\q
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
cd frontend && npx @better-auth/cli@latest migrate
```

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup and troubleshooting guide
- [Better Auth Docs](https://www.better-auth.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)

## 🎨 UI Components

Built with **shadcn/ui** - a collection of re-usable components built with Radix UI and Tailwind CSS.

### Installed Components:
- Avatar
- Badge
- Button
- Calendar
- Card
- Chart
- Dialog
- Form
- Input
- Label
- Navigation Menu
- Progress
- Select
- Separator
- Tabs
- Textarea

### Add More Components:

```bash
npx shadcn@latest add [component-name]
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start

# Lint
pnpm lint

# Format
pnpm format
```

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Optional: OAuth Providers
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## 🚢 Deployment

### Database Options:
- AWS RDS
- Supabase
- PlanetScale
- Neon
- Vercel Postgres

### Hosting Options:
- Vercel (recommended for Next.js)
- AWS
- Google Cloud
- Digital Ocean

### Pre-deployment Checklist:
- [ ] Set production `DATABASE_URL`
- [ ] Generate secure `BETTER_AUTH_SECRET`
- [ ] Configure OAuth providers (if using)
- [ ] Enable email verification
- [ ] Set up proper CORS
- [ ] Configure SSL/TLS

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check [SETUP.md](./SETUP.md) for troubleshooting
- Review [Better Auth Documentation](https://www.better-auth.com/)
- Open an issue on GitHub

---

Built with ❤️ using Next.js, Better Auth, and shadcn/ui
