## Subplan 1: Infrastructure & Docker Setup

**Context:** Setting up containerized development environment for Personal Library application. The application consists of ASP.NET Core 10 backend, React 19 frontend, and MS SQL Server database, all running in separate Docker containers.

**Current State:**
- Backend exists at PersonalLibrary.API with basic Minimal API setup
- Frontend exists at Frontend with React + Vite + Materialize CSS
- No Docker configuration exists
- Connection string not configured for SQL Server

**Requirements:**
- Full stack containerization (database, API, frontend in separate containers)
- SQL Server 2022 for database
- Persistent volume for database data
- Environment variable configuration for connection strings
- Health checks for all services

**Instruction Files to Review:**
- personallibrary.instructions.md
- csharp.instructions.md

**Tasks:**

1. Create `docker-compose.yml` at repository root with three services:
   - **db**: SQL Server 2022 container with environment variables (SA_PASSWORD, ACCEPT_EULA), port mapping (1433:1433), named volume for data persistence, health check
   - **api**: .NET backend container depending on db, environment variable for connection string, port mapping (5274:8080), health check on `/api/health`
   - **frontend**: React frontend container depending on api, environment variable for API URL, port mapping (5173:80)

2. Create `Backend/PersonalLibrary.API/Dockerfile`:
   - Multi-stage build: SDK stage for build, runtime stage for running
   - Use `mcr.microsoft.com/dotnet/sdk:10.0` for build stage
   - Use `mcr.microsoft.com/dotnet/aspnet:10.0` for runtime stage
   - Copy project file, restore dependencies, copy source, build with Release configuration
   - Set appropriate non-root user, expose port 8080
   - Configure HEALTHCHECK instruction

3. Create `Frontend/Dockerfile`:
   - Multi-stage build: Node stage for building, nginx stage for serving
   - Use `node:20-alpine` for build stage
   - Use `nginx:alpine` for runtime stage
   - Copy package files, install dependencies, copy source, run `npm run build`
   - Copy build output to nginx html directory
   - Create nginx configuration for SPA routing (redirect all routes to index.html)
   - Expose port 80

4. Create `Backend/PersonalLibrary.API/.dockerignore`:
   - Exclude: bin/, obj/, .vs/, *.user, *.suo, appsettings.Development.json

5. Create `Frontend/.dockerignore`:
   - Exclude: node_modules/, dist/, .env.local, coverage/

6. Update appsettings.json:
   - Add `ConnectionStrings` section with `DefaultConnection` using SQL Server format
   - Use environment variable placeholder: `Server=${DB_HOST};Database=PersonalLibrary;User Id=sa;Password=${DB_PASSWORD};TrustServerCertificate=True;`

7. Update appsettings.Development.json:
   - Add `ConnectionStrings` section with localhost SQL Server connection for local development outside Docker

8. Create `.env.example` at repository root:
   - Template file with: SA_PASSWORD, DB_HOST, DB_PASSWORD, VITE_API_URL placeholders and descriptions

9. Create `.env` at repository root (gitignored):
   - Actual values for local development

10. Update .gitignore (create if doesn't exist):
    - Add: .env, *.log, .env.local

**Verification:**
- Run `docker-compose up --build` from repository root
- Verify all three containers start successfully
- Verify database container is healthy: `docker-compose ps`
- Verify backend health endpoint responds: `curl http://localhost:5274/api/health`
- Verify frontend loads: Open `http://localhost:5173` in browser
- Verify logs show no connection errors: `docker-compose logs api`
- Stop containers: `docker-compose down`
- Verify persistence: Start again, database data should persist

**Dependencies:** None - this is the first subplan