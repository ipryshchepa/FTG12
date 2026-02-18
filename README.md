# Personal Library Application

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

## License

MIT