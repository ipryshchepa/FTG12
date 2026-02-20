# Docker Setup Guide

Quick guide for running Personal Library with Docker.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v3.8+
- At least 4GB RAM available for Docker

## Quick Start

Start all services:
```bash
docker-compose up --build -d
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5274/scalar/v1
- **Health Check**: http://localhost:5274/api/health

Stop services:
```bash
docker-compose down
```

## Common Commands

**View logs:**
```bash
docker-compose logs -f          # All services
docker-compose logs -f api      # API only
docker-compose logs -f frontend # Frontend only
```

**Check service status:**
```bash
docker-compose ps
```

**Restart services:**
```bash
docker-compose restart api      # Restart API
docker-compose restart          # Restart all
```

**Rebuild after code changes:**
```bash
docker-compose up --build -d api      # Rebuild API
docker-compose up --build -d          # Rebuild all
```

**Clean up (removes all data):**
```bash
docker-compose down -v
```

## Services

- **Database**: SQL Server 2022 on port 1433
- **API**: ASP.NET Core 10 on port 5274
- **Frontend**: React 19 + Nginx on port 5173

Database data persists in Docker volume `sqlserver_data`.

## Troubleshooting

**Check if services are healthy:**
```bash
docker-compose ps
```

**View detailed logs:**
```bash
docker-compose logs <service-name>
```

**Port already in use:**
Edit `docker-compose.yml` to change port mappings.

**Database connection errors:**
Wait 30-40 seconds after startup for SQL Server to initialize.
