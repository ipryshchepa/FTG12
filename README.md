# Personal Library Application

![CI Pipeline](https://github.com/{owner}/{repo}/workflows/CI%20Pipeline/badge.svg)
![CodeQL](https://github.com/{owner}/{repo}/workflows/CodeQL%20Security%20Scan/badge.svg)

A full-stack personal library management application built with modern technologies.

## Tech Stack

- **Backend**: .NET 10 Web API
- **Database**: MS SQL Server
- **Frontend**: React (Vite)
- **Styling**: Materialize CSS

## Project Structure

```
FTG12/
├── Backend/
│   └── PersonalLibrary.API/    # .NET 10 Web API project
├── Frontend/                    # React application with Vite
├── PersonalLibrary.sln         # Main solution file
└── README.md
```

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (for production use)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend/PersonalLibrary.API
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the API:
   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:5001` (or check console output for the exact port).

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/books` - Get sample books (to be expanded)

## Features (Planned)

- Browse and search book collection
- Add new books with details (title, author, ISBN, etc.)
- Track reading progress
- View library statistics
- Organize books by categories/genres

## Development

### Building the Backend

```bash
cd Backend/PersonalLibrary.API
dotnet build
```

### Building the Frontend

```bash
cd Frontend
npm run build
```

## Database Configuration

The application uses Entity Framework Core with SQL Server. Connection strings can be configured in `appsettings.json`.

To create/update the database:

```bash
cd Backend/PersonalLibrary.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Testing

### Backend Tests
```bash
cd Backend/PersonalLibrary.API.Tests
dotnet test
```

Current status: 143/143 tests passing

### Frontend Tests
```bash
cd Frontend
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

Current status: 414/414 tests passing with 96%+ coverage

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

- **CI Pipeline** (`ci.yml`): Runs on every push and pull request
  - Backend tests (143 tests) with coverage enforcement (≥80%)
  - Frontend tests (414 tests) with linting and coverage enforcement (≥80%)
  - Docker image builds
  - Automated coverage reports as downloadable artifacts
  - PR comments showing coverage results

- **CodeQL Security Scan** (`codeql.yml`): Weekly security analysis for C# and JavaScript code

- **Dependabot**: Automated dependency updates for npm, NuGet, and GitHub Actions

### Coverage Reports

Coverage reports are automatically generated and available:
- **HTML Reports**: Download from workflow artifacts for detailed line-by-line coverage
- **PR Comments**: Coverage percentage automatically commented on pull requests
- **Threshold Enforcement**: CI fails if coverage drops below 80%

No external services or secrets required - everything runs natively in GitHub Actions!

### Branch Protection

Recommended branch protection rules for `main` branch:
- Require pull request reviews before merging
- Require status checks to pass: `backend-test`, `frontend-test`, `docker-build`
- Require branches to be up to date before merging
- Include administrators in restrictions (optional)

## License

MIT