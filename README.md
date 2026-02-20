# Personal Library

A full-stack web application for managing personal book collections with reading status tracking, ratings, and loan management.

## Tech Stack

- **Backend**: ASP.NET Core 10 (Minimal APIs)
- **Frontend**: React 19 + Vite, Materialize CSS
- **Database**: SQL Server 2022
- **Testing**: xUnit (backend), Vitest + React Testing Library (frontend)

## Quick Start (Docker)

The easiest way to run the application:

```bash
docker-compose up --build
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5274/scalar/v1
- **OpenAPI Spec**: http://localhost:5274/openapi/v1.json

Stop the application:
```bash
docker-compose down
```

## Local Development

### Prerequisites
- .NET 10 SDK
- Node.js 18+
- SQL Server (Express, Developer, or LocalDB)

### Backend
```bash
cd Backend/PersonalLibrary.API
dotnet restore
dotnet ef database update  # Apply migrations
dotnet run                 # API at http://localhost:5274
```

### Frontend
```bash
cd Frontend
npm install
npm run dev                # App at http://localhost:5173
```

## Features

- **Book Management**: Add, view, edit, and delete books with full details (title, author, ISBN, pages, etc.)
- **Reading Status**: Track books as Backlog, Completed, Abandoned
- **Ratings**: Rate books on a 1-10 star scale
- **Loan Tracking**: Record book loans with borrower name and dates
- **Loan History**: View complete lending history for each book
- **Ownership Tracking**: Differentiate between owned and wishlist books
- **Responsive UI**: Mobile-friendly interface with Materialize CSS

## Testing

```bash
# Backend (143 tests, 99%+ coverage)
cd Backend/PersonalLibrary.API.Tests
dotnet test

# Frontend (414 tests, 96%+ coverage)
cd Frontend
npm test
```

## Project Structure

```
FTG12/
├── Backend/
│   ├── PersonalLibrary.API/        # Web API
│   └── PersonalLibrary.API.Tests/  # Backend tests
├── Frontend/                        # React application
├── docker-compose.yml              # Docker deployment
└── PersonalLibrary.slnx            # Solution file
```

## Development Journey

See [Summary/Summary.md](Summary/Summary.md) for a detailed chronicle of the development process, including:
- Key takeaways and lessons learned
- Prompts and results from each implementation phase
- Best practices for working with AI-assisted development
- Challenges encountered and how they were resolved

## License

MIT