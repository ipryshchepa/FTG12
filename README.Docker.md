# Personal Library - Docker Setup Guide

This guide covers the Docker containerization setup for the Personal Library application.

## Architecture

The application consists of three containerized services:

- **Database (db)**: SQL Server 2022 with persistent storage
- **API (api)**: ASP.NET Core 10 backend with health checks
- **Frontend (frontend)**: React 19 application served via nginx

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v3.8+
- At least 4GB RAM available for Docker

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file if needed. Default values work for local development:

```env
SA_PASSWORD=YourStrong@Passw0rd
DB_HOST=db
VITE_API_URL=http://localhost:5274
```

### 2. Build and Start All Services

Build and start all containers in detached mode:

```bash
docker-compose up --build -d
```

This command will:
- Build the API and frontend Docker images
- Pull the SQL Server 2022 image
- Create a Docker network for inter-container communication
- Create a persistent volume for database data
- Start all three services with health checks

### 3. Verify Services

Check that all containers are running and healthy:

```bash
docker-compose ps
```

Expected output:
```
NAME                      STATUS              PORTS
personallibrary-api       Up (healthy)        0.0.0.0:5274->8080/tcp
personallibrary-db        Up (healthy)        0.0.0.0:1433->1433/tcp
personallibrary-frontend  Up                  0.0.0.0:5173->80/tcp
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API**: http://localhost:5274
- **API Health Check**: http://localhost:5274/api/health
- **Database**: localhost:1433 (connect using SA account)

## Common Commands

### View Logs

View logs for all services:
```bash
docker-compose logs
```

View logs for a specific service:
```bash
docker-compose logs api
docker-compose logs db
docker-compose logs frontend
```

Follow logs in real-time:
```bash
docker-compose logs -f api
```

### Stop Services

Stop all containers (keeps volumes):
```bash
docker-compose down
```

Stop and remove volumes (deletes database data):
```bash
docker-compose down -v
```

### Restart Services

Restart a specific service:
```bash
docker-compose restart api
```

Restart all services:
```bash
docker-compose restart
```

### Rebuild After Code Changes

Rebuild and restart specific service:
```bash
docker-compose up --build -d api
```

Rebuild and restart all services:
```bash
docker-compose up --build -d
```

## Health Checks

All services include health checks:

### Database Health Check
- Runs every 10 seconds
- Uses SQL Server command-line tool
- 30-second startup grace period

### API Health Check
- Endpoint: `GET /api/health`
- Runs every 10 seconds
- 40-second startup grace period
- Depends on database being healthy

### Frontend
- Basic HTTP check
- Verifies nginx is serving content

## Data Persistence

Database data is stored in a Docker volume named `sqlserver_data`. This ensures:
- Data persists across container restarts
- Database state is maintained when updating application code
- Data survives `docker-compose down` (but not `docker-compose down -v`)

To inspect the volume:
```bash
docker volume inspect ftg12_sqlserver_data
```

## Networking

All containers communicate through a dedicated bridge network:
- Network name: `personallibrary-network`
- Containers can reference each other by service name (e.g., `db`, `api`)
- Frontend connects to API at `http://api:8080` internally
- External access uses published ports

## Troubleshooting

### Container Won't Start

Check detailed logs:
```bash
docker-compose logs <service-name>
```

### Database Connection Errors

1. Verify database container is healthy:
```bash
docker-compose ps
```

2. Check database logs:
```bash
docker-compose logs db
```

3. Verify environment variables:
```bash
docker-compose config
```

### API Not Responding

1. Check API health endpoint:
```bash
curl http://localhost:5274/api/health
```

2. Verify API logs for errors:
```bash
docker-compose logs api
```

3. Ensure database is healthy (API depends on it)

### Frontend Not Loading

1. Check nginx logs:
```bash
docker-compose logs frontend
```

2. Verify frontend was built correctly:
```bash
docker-compose exec frontend ls -la /usr/share/nginx/html
```

### Port Conflicts

If ports 5173, 5274, or 1433 are already in use, edit `docker-compose.yml` to use different host ports:

```yaml
ports:
  - "15173:80"  # Frontend (changed from 5173)
  - "15274:8080"  # API (changed from 5274)
  - "11433:1433"  # Database (changed from 1433)
```

Don't forget to update `.env` file with new API URL.

## Development Workflow

### Making Backend Changes

1. Edit code in `Backend/PersonalLibrary.API/`
2. Rebuild API container:
```bash
docker-compose up --build -d api
```
3. Check logs for errors:
```bash
docker-compose logs -f api
```

### Making Frontend Changes

1. Edit code in `Frontend/src/`
2. Rebuild frontend container:
```bash
docker-compose up --build -d frontend
```
3. Clear browser cache and refresh

### Database Migrations

When you add Entity Framework migrations:

1. Create migration (run from host):
```bash
cd Backend/PersonalLibrary.API
dotnet ef migrations add MigrationName
```

2. Apply to containerized database:
```bash
docker-compose restart api
```

Or manually apply:
```bash
docker-compose exec api dotnet ef database update
```

## Production Considerations

Before deploying to production:

1. **Change default passwords** in `.env`
2. **Use HTTPS** for API and frontend
3. **Configure CORS** for production domain in API
4. **Enable SQL Server encryption**
5. **Use Docker secrets** instead of environment variables
6. **Set up proper logging and monitoring**
7. **Configure backup strategy** for database volume
8. **Review security headers** in nginx configuration
9. **Scan images** for vulnerabilities

## Cleaning Up

Remove all containers, networks, and volumes:
```bash
docker-compose down -v
```

Remove unused Docker resources:
```bash
docker system prune -a
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [ASP.NET Core Docker Documentation](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)
- [SQL Server Docker Documentation](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
