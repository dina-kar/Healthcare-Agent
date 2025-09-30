# Healthcare Application - Docker Setup

This guide explains how to run the entire Healthcare Application using Docker Compose with optimized, minimal Alpine-based images.

## 🚀 Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd healthcare-agent
   ```

2. **Start all services:**
   ```bash
   ./docker-start.sh
   ```

   Or manually with docker-compose:
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **Database:** postgresql://user:password@localhost:5432/healthcare_db

4. **Login credentials:**
   - Email: `alice@example.com`
   - Password: `Demo1234!`

## 🏗️ Architecture

The application consists of four main services:

### Services Overview

| Service | Technology | Port | Purpose |
|---------|------------|------|---------|
| **postgres** | PostgreSQL 16 | 5432 | Database with health data |
| **db-seed** | Node.js + Drizzle | - | Database migrations & seeding |
| **backend** | Python + FastAPI | 8000 | AI healthcare agent API |
| **frontend** | Next.js + React | 3000 | Web application |

### Service Dependencies

```mermaid
graph TD
    A[postgres] --> B[db-seed]
    B --> C[backend]
    B --> D[frontend]
```

- **postgres**: Must be healthy before seeding
- **db-seed**: Runs once after postgres, then exits
- **backend/frontend**: Start after successful seeding

## 🔧 Configuration

### Environment Variables

Copy the environment template and customize:

```bash
cp frontend/env.template .env.local
# Edit .env.local with your API keys and secrets
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `BETTER_AUTH_SECRET`: Better Auth secret
- `GOOGLE_GENAI_API_KEY`: For AI features (optional)
- `OPENAI_API_KEY`: For AI features (optional)

### Database Seeding

The `db-seed` service automatically:
1. Runs database migrations (`drizzle-kit push`)
2. Seeds sample data (`scripts/seed.ts`)
3. Creates 3 demo users with health data

## 🛠️ Development

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs postgres
docker-compose logs backend
docker-compose logs frontend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop Everything

```bash
docker-compose down
```

### Clean Restart

```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Start fresh
./docker-start.sh
```

## 🔍 Troubleshooting

### Service Won't Start

1. **Check logs:**
   ```bash
   docker-compose logs <service-name>
   ```

2. **Common issues:**
   - Port conflicts: Change ports in `docker-compose.yml`
   - Database connection: Ensure postgres is healthy first
   - Environment variables: Check `.env.local` file

### Database Issues

```bash
# Connect to database directly
docker-compose exec postgres psql -U user -d healthcare_db

# Reset database (WARNING: destroys data)
docker-compose down -v
docker volume rm healthcare-agent_postgres_data
./docker-start.sh
```

### Build Issues

```bash
# Rebuild specific service
docker-compose build --no-cache backend

# Clean all images and rebuild
docker-compose down --rmi all
docker-compose build
```

## 📊 Performance & Optimization

### Minimal Images
- **Python**: `python:3.11-alpine` (~50MB)
- **Node.js**: `node:20-alpine` (~150MB base)
- **PostgreSQL**: `postgres:16-alpine` (~200MB)

### Layer Caching
- Dependencies installed before source code
- Multi-stage builds for smaller final images
- Proper `.dockerignore` files

### Health Checks
- All services have health endpoints
- Automatic restart policies
- Service dependency management

## 🔒 Security

### Non-root Users
- All containers run as non-root users
- Proper file permissions set during build

### Secrets Management
- Use Docker secrets for production
- Environment variables for development
- Never commit secrets to version control

## 🚀 Production Deployment

For production deployment:

1. **Use Docker secrets:**
   ```yaml
   secrets:
     db_password:
       external: true
   ```

2. **Add SSL/TLS:**
   ```yaml
   services:
     frontend:
       environment:
         NEXTAUTH_URL: https://yourdomain.com
   ```

3. **Scale services:**
   ```bash
   docker-compose up -d --scale frontend=3
   ```

4. **Monitoring:**
   - Add Prometheus/Grafana
   - Set up log aggregation
   - Monitor resource usage

## 📚 Additional Commands

```bash
# Execute commands in running containers
docker-compose exec backend python -c "print('Hello')"
docker-compose exec frontend npm run db:studio

# View resource usage
docker-compose top

# Scale services
docker-compose up -d --scale frontend=2

# Update specific service
docker-compose build backend && docker-compose up -d backend
```

## 🤝 Contributing

When making changes:

1. Update `Dockerfile` if dependencies change
2. Test with `./docker-start.sh`
3. Ensure health checks pass
4. Update this documentation

---

**Happy coding!** 🎉
