# 🏥 Healthcare AI Agent

> An intelligent healthcare companion powered by AI for monitoring glucose levels, tracking meals, analyzing health trends, and providing personalized health insights.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)

## 🌟 Features

### Core Capabilities
- **🔐 Secure Authentication** - PostgreSQL + Better Auth integration with session management
- **📊 Real-time Glucose Monitoring** - Continuous tracking with intelligent alerts and trend analysis
- **🍽️ Smart Meal Tracking** - Log meals with automatic nutritional analysis and glycemic impact
- **📈 Health Analytics** - AI-powered insights identifying patterns and predicting outcomes
- **💬 AI Health Assistant** - 24/7 conversational health support powered by Gemini 2.0 Flash
- **🎯 Personalized Meal Planning** - Custom meal suggestions based on health status
- **� Mood & Wellness Tracking** - Emotional wellness monitoring with stress and energy levels
- **📱 Mobile Responsive** - Optimized UI with collapsible sidebar for all devices

### UI/UX Features
- **📊 Interactive Charts** - Beautiful visualizations using Recharts
- **🔔 Real-time Updates** - Live data synchronization across components
- **♿ Accessible Design** - WCAG compliant with proper contrast ratios

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun**
- **Python** 3.11+
- **Docker** and **Docker Compose**
- **pnpm** (recommended) or npm
- **uv** (Python package manager)

### 1. Clone the Repository

```bash
git clone https://github.com/dina-kar/Healthcare-Agent.git
cd Healthcare-Agent
```

### 2. Start All Services with Docker Compose
Add Gemini API key to docker-compose.yml file:

```bash
# Start PostgreSQL, Backend Agent, and Frontend
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps
```

This will start:
- **PostgreSQL** on port `5432`
- **Backend Agent** on port `8000`
- **Frontend** on port `3000`

Visit [http://localhost:3000](http://localhost:3000) 🎉

### 3. Manual Setup (Alternative)

#### a) Start PostgreSQL

```bash
docker-compose up -d postgres
```

#### b) Setup Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
pnpm migrate

# Start development server
pnpm dev
```

Frontend will be available at [http://localhost:3000](http://localhost:3000)

#### c) Setup Backend Agent

```bash
cd agents

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Add your GOOGLE_API_KEY

# Start agent
./run_agent.sh
```

Agent will be available at [http://localhost:8000](http://localhost:8000)

## 🏗️ Tech Stack

### Frontend (Hosted on Vercel)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1 | React framework with App Router |
| **React** | 19 | UI library with Server Components |
| **TypeScript** | 5.3+ | Type-safe development |
| **Tailwind CSS** | 4.0 | Utility-first styling with OKLCH colors |
| **shadcn/ui** | Latest | Accessible component library |
| **Lucide React** | Latest | Icon library |
| **Recharts** | Latest | Data visualization |
| **CopilotKit** | Latest | AI chat integration |
| **Better Auth** | Latest | Modern authentication |

### Backend (Hosted on Render)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Agent runtime |
| **Agno** | 2.0.11+ | Multi-agent framework |
| **FastAPI** | 0.117+ | API server |
| **asyncpg** | 0.29+ | Async PostgreSQL driver |
| **Google Gemini** | 1.39+ | LLM for agent intelligence |
| **Pydantic** | 2.10+ | Data validation |
| **uvicorn** | Latest | ASGI server |

### Database (Neon Serverless PostgreSQL)
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16 | Primary database |
| **Neon** | Latest | Serverless PostgreSQL hosting |
| **pg** | Latest | Node.js PostgreSQL client |

### DevOps & Tools
- **Docker** & **Docker Compose** - Containerization
- **pnpm** - Fast package manager
- **uv** - Python package manager
- **Biome** - Linter and formatter

## 📁 Project Structure

```
Healthcare-Agent/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Authentication pages
│   │   │   │   ├── signin/
│   │   │   │   └── signup/
│   │   │   ├── (main)/           # Main pages of app
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
├── docker-compose.yml            # PostgreSQL setup
├── SETUP.md                      # Detailed setup guide
└── README.md                     # This file
```
### Sequence Diagrams

#### User Authentication Flow
![alt text](images/auth.png)


#### Health Data Logging Flow
![alt text](images/glucose.png)

#### Health Insights Flow
![alt text](images/pattern.png)

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

## 🎨 Design Decisions

### Architecture

#### **Single Agent System**
- **Why:** Originally used multi-agent team, but encountered CopilotKit event ordering issues
- **Solution:** Consolidated to single comprehensive agent with all tools
- **Benefits:** Simplified architecture, no event conflicts, faster responses

#### **Direct Database Operations**
- **Why:** Bypass API layer for agent-to-database communication
- **How:** AsyncPG for async PostgreSQL operations
- **Benefits:** Lower latency, simpler architecture, better transaction control

#### **Serverless Database (Neon)**
- **Why:** Production-ready PostgreSQL without infrastructure management
- **Features:** Auto-scaling, branching, connection pooling
- **Benefits:** Cost-effective, globally distributed, built-in backups


### AI Agent Design

#### **Tool-Based Architecture**
```
User Input → LLM → Tool Selection → Execution → Response
```

**Available Tools:**
1. `store_glucose_data` - Glucose monitoring
2. `store_mood_data` - Emotional wellness
3. `store_meal_data` - Nutrition tracking
4. `get_health_insights` - Analytics
5. `get_meal_plan_suggestions` - Personalized planning

#### **Generative UI**
- **Why:** Rich, interactive responses beyond text
- **Implementation:** CopilotKit with custom React components
- **Benefits:** Better user experience, visual data representation

## � Agent Specifications

### JSON Schemas

#### Glucose Data
```json
{
  "tool": "store_glucose_data",
  "parameters": {
    "glucose_value": {
      "type": "number",
      "minimum": 60,
      "maximum": 400,
      "description": "Blood glucose reading in mg/dL"
    }
  }
}
```

#### Mood Data
```json
{
  "tool": "store_mood_data",
  "parameters": {
    "mood": {
      "type": "string",
      "enum": ["great", "good", "okay", "poor", "terrible"]
    },
    "energy": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10
    },
    "stress": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10
    },
    "notes": {
      "type": "string",
      "optional": true
    }
  }
}
```

#### Meal Data
```json
{
  "tool": "store_meal_data",
  "parameters": {
    "meal_type": {
      "type": "string",
      "enum": ["breakfast", "lunch", "dinner", "snack"]
    },
    "meal_name": {
      "type": "string"
    },
    "calories": {
      "type": "integer",
      "minimum": 0
    },
    "carbs": {
      "type": "number",
      "minimum": 0
    },
    "protein": {
      "type": "number",
      "minimum": 0
    },
    "fat": {
      "type": "number",
      "minimum": 0
    },
    "fiber": {
      "type": "number",
      "minimum": 0
    },
    "glycemic_impact": {
      "type": "string",
      "enum": ["low", "medium", "high"]
    }
  }
}
```

## 🐳 Docker Setup

### Docker Compose Services

The project includes a complete `docker-compose.yml` that orchestrates all services:

```yaml
services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: healthcare_db
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Python Backend Agent
  backend:
    build: ./agents
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/healthcare_db
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy

  # Next.js Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/healthcare_db
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      AGENT_BACKEND_URL: http://backend:8000/agui
    depends_on:
      - postgres
      - backend
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres

# View logs
docker-compose logs -f
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild services
docker-compose up -d --build

# Check service health
docker-compose ps

# Execute command in container
docker-compose exec postgres psql -U user -d healthcare_db
docker-compose exec backend python -c "import asyncpg; print('OK')"

# View resource usage
docker stats
```

### Individual Dockerfiles

#### Frontend Dockerfile (`frontend/Dockerfile.setup`)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

#### Backend Dockerfile (`agents/Dockerfile`)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync
COPY . .
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "agent:app", "--host", "0.0.0.0", "--port", "8000"]
```

## ⚙️ Environment Configuration

### Frontend (.env.local)

```env
# Database - Neon Serverless PostgreSQL (Production)
DATABASE_URL="postgresql://user:password@your-neon-db.neon.tech/healthcare_db?sslmode=require"

# Or Local Development
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db"

# Better Auth (Generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"

# Agent Backend
AGENT_BACKEND_URL="http://localhost:8000/agui"

# Optional: OAuth Providers
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@your-neon-db.neon.tech/healthcare_db?sslmode=require"

# Google Gemini API (Get from: https://ai.google.dev/)
GOOGLE_API_KEY="your-google-api-key-here"

# Server Configuration
HOST="0.0.0.0"
PORT="8000"
LOG_LEVEL="info"
```

### Generate Secrets

```bash
# Generate Better Auth secret
openssl rand -base64 32

# Generate random password
openssl rand -hex 16
```

## �📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup and troubleshooting guide
- [agents/README.md](./agents/README.md) - Agent system documentation
- [Better Auth Docs](https://www.better-auth.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Agno Docs](https://docs.agno.com/)
- [CopilotKit Docs](https://copilotkit.ai/docs)

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

## � Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "New Project" → Import your GitHub repository
   - Select `frontend` as the root directory

2. **Configure Build Settings**
   ```bash
   Framework Preset: Next.js
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   Root Directory: frontend
   ```

3. **Environment Variables**
   Add these in Vercel dashboard → Settings → Environment Variables:
   ```env
   DATABASE_URL=<your-neon-connection-string>
   BETTER_AUTH_SECRET=<generate-new-secret>
   BETTER_AUTH_URL=https://your-app.vercel.app
   AGENT_BACKEND_URL=https://your-render-backend.onrender.com/agui
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically deploys on every push to main branch
   - Get preview deployments for pull requests

### Backend Deployment (Render)

1. **Create Web Service**
   - Visit [render.com](https://render.com) and sign in
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `agents` directory

2. **Configure Service**
   ```yaml
   Name: healthcare-backend
   Runtime: Python 3.11
   Build Command: pip install uv && uv sync
   Start Command: uv run uvicorn agent:app --host 0.0.0.0 --port $PORT
   Instance Type: Free or Starter ($7/mo)
   ```

3. **Environment Variables**
   Add in Render dashboard → Environment:
   ```env
   DATABASE_URL=<your-neon-connection-string>
   GOOGLE_API_KEY=<your-gemini-api-key>
   PYTHON_VERSION=3.11
   ```

4. **Auto-Deploy**
   - Enable "Auto-Deploy" for main branch
   - Service redeploys automatically on git push

### Database Setup (Neon)

1. **Create Project**
   - Visit [neon.tech](https://neon.tech) and sign in
   - Click "Create Project"
   - Choose a project name: `healthcare-db`
   - Select region closest to your users (e.g., US East, EU West)

2. **Get Connection String**
   - Copy the connection string from dashboard
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/healthcare_db?sslmode=require`
   - Use this for both frontend and backend

3. **Run Migrations**
   ```bash
   # From your local machine
   cd frontend
   DATABASE_URL="<neon-connection-string>" pnpm migrate
   
   # Or use Neon SQL Editor in the dashboard
   ```

4. **Configure Production Settings**
   - Enable automatic backups (recommended)
   - Set compute size (default: 0.25 CU is sufficient for starter)
   - Configure connection pooling
   - Set up monitoring alerts

### Deployment Checklist

#### Pre-Deployment
- [ ] Generate new `BETTER_AUTH_SECRET` for production
- [ ] Get Google Gemini API key
- [ ] Create Neon database
- [ ] Update all environment variables
- [ ] Test locally with production environment variables
- [ ] Run database migrations
- [ ] Review and update CORS settings

#### Post-Deployment
- [ ] Verify frontend loads correctly
- [ ] Test authentication flow>
- [ ] Test AI agent responses
- [ ] Check database connections
- [ ] Monitor error logs
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure custom domain (optional)
- [ ] Enable SSL/HTTPS (automatic on Vercel/Render)

### Production URLs

After deployment, you'll have:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://healthcare-backend.onrender.com`
- **Database:** Neon connection string

Update `AGENT_BACKEND_URL` in frontend env and `BETTER_AUTH_URL` to match your actual URLs.

### Monitoring & Logs

#### Vercel
```bash
# View logs
vercel logs <deployment-url>

# View real-time logs
vercel logs <deployment-url> --follow
```

#### Render
- View logs in dashboard → Your Service → Logs
- Set up log persistence (paid plan)
- Configure alerts for errors

#### Neon
- Monitor database performance in dashboard
- View query analytics
- Set up connection pooling alerts

## �🔧 Development

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



## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

