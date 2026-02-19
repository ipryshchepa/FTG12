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

---

## Subplan 2: Backend Data Layer

**Context:** Create Entity Framework Core data layer for Personal Library application including entity models, DbContext, relationships, and initial migration. Backend uses ASP.NET Core 10 with EF Core 10 and SQL Server.

**Data Model Requirements:**

**Book:**
- Id (guid, required, primary key)
- Title (string(100), required)
- Author (string(100), required)
- Description (string(500), optional)
- Notes (string(1000), optional)
- ISBN (string(20), optional)
- PublishedYear (int, optional)
- PageCount (int, optional)
- OwnershipStatus (required, enum: Want to buy, Own, Sold/Gave away)

**Rating:**
- Id (guid, required, primary key)
- BookId (guid, required, foreign key to Book, UNIQUE)
- Score (int, required, range 1-10)
- Notes (string(1000), optional)

**Loan:**
- Id (guid, required, primary key)
- BookId (guid, required, foreign key to Book)
- BorrowedTo (string(100), required)
- LoanDate (DateTime, required)
- IsReturned (bool, required, default false)
- ReturnedDate (DateTime, optional)

**ReadingStatus:**
- Id (guid, required, primary key)
- BookId (guid, required, foreign key to Book, UNIQUE)
- Status (required, enum: Backlog, Completed, Abandoned)

**Relationships:**
- Book 1:0..1 Rating (one book can have zero or one rating)
- Book 1:0..1 ReadingStatus (one book can have zero or one reading status)
- Book 1:N Loan (one book can have multiple loans over time, but only one active)

**Current State:**
- PersonalLibrary.API has basic API setup
- EF Core packages already installed in PersonalLibrary.API.csproj
- No data layer exists yet
- Connection string configured in previous subplan

**Instruction Files to Review:**
- csharp.instructions.md
- personallibrary.instructions.md

**Tasks:**

1. Create folder structure in PersonalLibrary.API:
   - `Models/` - entity classes
   - `Data/` - DbContext and repositories
   - `DTOs/` - data transfer objects
   - `Validators/` - input validation
   - `Extensions/` - extension methods

2. Create `Models/OwnershipStatus.cs`:
   - Enum with values: Want to buy, Own, Sold/Gave away
   - Use appropriate naming (PascalCase for enum members)

3. Create `Models/ReadingStatusEnum.cs`:
   - Enum with values: Backlog, Completed, Abandoned

4. Create `Models/Book.cs`:
   - All properties from data model with proper types
   - Navigation properties: `Rating?`, `ReadingStatus?`, `ICollection<Loan>`
   - Constructor initializing Id with new Guid and Loans collection

5. Create `Models/Rating.cs`:
   - All properties from data model
   - Navigation property: `Book`
   - Constructor initializing Id

6. Create `Models/ReadingStatus.cs`:
   - All properties from data model
   - Navigation property: `Book`
   - Constructor initializing Id

7. Create `Models/Loan.cs`:
   - All properties from data model (including IsReturned and ReturnedDate)
   - Navigation property: `Book`
   - Constructor initializing Id, IsReturned = false

8. Create `Data/LibraryDbContext.cs`:
   - Inherit from `DbContext`
   - DbSet properties for: Books, Ratings, ReadingStatuses, Loans
   - Override `OnModelCreating` to configure:
     - Book: required fields, max lengths, default OwnershipStatus
     - Rating: required fields, unique index on BookId, check constraint for Score (1-10)
     - ReadingStatus: required fields, unique index on BookId
     - Loan: required fields, index on IsReturned for querying active loans
     - Relationships: configure foreign keys, cascade delete behaviors
     - Enum conversions: store as strings for readability

9. Create `DTOs/BookDto.cs`:
   - Lightweight DTO for list/grid display
   - Properties: Id, Title, Author, OwnershipStatus

10. Create `DTOs/BookDetailDto.cs`:
    - Complete book information including all fields
    - Includes nested Rating, ReadingStatus, active Loan data

11. Create `DTOs/CreateBookDto.cs`:
    - All book fields except Id (auto-generated)
    - For validation

12. Create `DTOs/UpdateBookDto.cs`:
    - All book fields except Id
    - For validation

13. Create `DTOs/RatingDto.cs`:
    - Score, Notes
    - For creating/updating ratings

14. Create `DTOs/ReadingStatusDto.cs`:
    - Status enum value
    - For updating reading status

15. Create `DTOs/LoanDto.cs`:
    - BorrowedTo
    - For creating loans

16. Create `DTOs/BookGridRowDto.cs`:
    - Flattened DTO for dashboard grid
    - Properties: Id, Title, Author, Score (int?), OwnershipStatus, ReadingStatus (enum?), Loanee (string?)
    - Combines data from Book, Rating, ReadingStatus, active Loan

17. Add FluentValidation NuGet package:
    - Install `FluentValidation.AspNetCore` version 11+

18. Create `Validators/CreateBookDtoValidator.cs`:
    - Validate Title: required, max 100 chars
    - Validate Author: required, max 100 chars
    - Validate Description: max 500 chars if provided
    - Validate Notes: max 1000 chars if provided
    - Validate ISBN: max 20 chars if provided, format validation optional
    - Validate PublishedYear: range (e.g., 1000-2100) if provided
    - Validate PageCount: positive integer if provided
    - Validate CoverImageUrl: valid URI format if provided
    - Validate OwnershipStatus: must be valid enum value

19. Create `Validators/UpdateBookDtoValidator.cs`:
    - Same validation rules as CreateBookDtoValidator

20. Create `Validators/RatingDtoValidator.cs`:
    - Validate Score: required, range 1-10
    - Validate Notes: max 1000 chars if provided

21. Create `Validators/LoanDtoValidator.cs`:
    - Validate BorrowedTo: required, max 100 chars

22. Create `Validators/ReadingStatusDtoValidator.cs`:
    - Validate Status: must be valid enum value

23. Register DbContext and validators in Program.cs:
    - Add DbContext with SQL Server connection string from configuration
    - Register FluentValidation validators
    - Enable automatic validation

24. Create EF Core migration:
    - Run: `dotnet ef migrations add InitialCreate` from PersonalLibrary.API directory
    - Review generated migration file for correctness

25. Apply migration (for local development):
    - Run: `dotnet ef database update`
    - Or configure automatic migration on startup in Program.cs for development

**Verification:**
- Build project: `dotnet build` - should succeed with no errors
- Check migration files created in `Migrations/` folder
- Start application and verify database created
- Check SQL Server database has all tables with proper schema
- Verify foreign keys and indexes created correctly
- Verify enum columns use string storage, not integers
- Test validation by attempting to create invalid DTOs (can test in next subplan)

**Dependencies:** Subplan 1 (Docker setup) - needs database running

---

## Subplan 3: Backend Services & API Endpoints

**Context:** Implement repository pattern, business logic services, and RESTful API endpoints using ASP.NET Core Minimal APIs for the Personal Library application. This includes all CRUD operations and specialized operations for ratings, loans, and reading status management.

**Prerequisites from Previous Subplans:**
- Data layer complete with entities, DbContext, DTOs, validators
- Database schema created via EF migrations

**API Requirements:**

**Books:**
- GET /api/books - List all books for grid (with joined rating/status/loan data)
- GET /api/books/{id} - Get detailed book information
- POST /api/books - Create new book
- PUT /api/books/{id} - Update book details
- DELETE /api/books/{id} - Delete book (cascade delete related data)

**Ratings (one per book - create or update):**
- POST /api/books/{id}/rating - Create or update rating
- DELETE /api/books/{id}/rating - Delete rating

**Loans:**
- GET /api/loans - Get all currently loaned books
- POST /api/books/{id}/loan - Create loan (check no active loan exists)
- DELETE /api/books/{id}/loan - Return book (mark active loan as returned)

**ReadingStatus (one per book - create or update):**
- PUT /api/books/{id}/reading-status - Create or update reading status
- DELETE /api/books/{id}/reading-status - Clear reading status

**Business Rules:**
- One book can have only one active rating (update if exists)
- One book can have only one reading status (update if exists)
- One book can have only one active loan at a time
- When creating loan, verify no active loan exists for that book
- When returning loan, mark most recent active loan as returned

**Current State:**
- Data layer complete from Subplan 2
- Program.cs has basic setup with CORS and health check

**Instruction Files to Review:**
- csharp.instructions.md
- personallibrary.instructions.md

**Tasks:**

1. Create `Data/IBookRepository.cs`:
   - Interface methods: GetAllForGridAsync(), GetByIdAsync(Guid), GetDetailsByIdfAsync(Guid), CreateAsync(Book), UpdateAsync(Book), DeleteAsync(Guid), ExistsAsync(Guid)

2. Create `Data/BookRepository.cs`:
   - Implement IBookRepository using LibraryDbContext
   - GetAllForGridAsync: join with Rating, ReadingStatus, active Loan to return BookGridRowDto list
   - GetDetailsByIdAsync: include all related entities, map to BookDetailDto
   - Use async/await with EF Core, proper null handling

3. Create `Data/IRatingRepository.cs`:
   - Interface methods: GetByBookIdAsync(Guid), CreateAsync(Rating), UpdateAsync(Rating), DeleteByBookIdAsync(Guid)

4. Create `Data/RatingRepository.cs`:
   - Implement IRatingRepository
   - GetByBookIdAsync: find existing rating for book
   - DeleteByBookIdAsync: find and remove rating

5. Create `Data/ILoanRepository.cs`:
   - Interface methods: GetActiveLoanByBookIdAsync(Guid), GetAllActiveLaonsAsync(), CreateAsync(Loan), ReturnLoanAsync(Guid bookId)

6. Create `Data/LoanRepository.cs`:
   - Implement ILoanRepository
   - GetActiveLoanByBookIdAsync: find loan where IsReturned = false
   - GetAllActiveLoansAsync: return all active loans with book details
   - ReturnLoanAsync: find active loan, set IsReturned = true, set ReturnedDate = DateTime.UtcNow

7. Create `Data/IReadingStatusRepository.cs`:
   - Interface methods: GetByBookIdAsync(Guid), CreateAsync(ReadingStatus), UpdateAsync(ReadingStatus), DeleteByBookIdAsync(Guid)

8. Create `Data/ReadingStatusRepository.cs`:
   - Implement IReadingStatusRepository similar to RatingRepository pattern

9. Create `Services/IBookService.cs`:
   - Interface methods corresponding to business operations:
   - GetAllBooksForGridAsync(), GetBookDetailsAsync(Guid), CreateBookAsync(CreateBookDto), UpdateBookAsync(Guid, UpdateBookDto), DeleteBookAsync(Guid)

10. Create `Services/BookService.cs`:
    - Implement IBookService
    - Inject IBookRepository
    - Map DTOs to entities and vice versa
    - Throw appropriate exceptions for not found scenarios (NotFoundException)
    - Use async/await patterns

11. Create `Services/IRatingService.cs`:
    - Interface methods: CreateOrUpdateRatingAsync(Guid bookId, RatingDto), DeleteRatingAsync(Guid bookId)

12. Create `Services/RatingService.cs`:
    - Implement IRatingService
    - Inject IRatingRepository, IBookRepository
    - CreateOrUpdateRatingAsync: check if rating exists by BookId, update if exists, create if not
    - Validate book exists before creating rating

13. Create `Services/ILoanService.cs`:
    - Interface methods: GetActiveLoanedBooksAsync(), CreateLoanAsync(Guid bookId, LoanDto), ReturnBookAsync(Guid bookId)

14. Create `Services/LoanService.cs`:
    - Implement ILoanService
    - Inject ILoanRepository, IBookRepository
    - CreateLoanAsync: verify no active loan exists for book, throw exception if already loaned
    - ReturnBookAsync: verify active loan exists, throw exception if not loaned

15. Create `Services/IReadingStatusService.cs`:
    - Interface methods: CreateOrUpdateReadingStatusAsync(Guid bookId, ReadingStatusDto), DeleteReadingStatusAsync(Guid bookId)

16. Create `Services/ReadingStatusService.cs`:
    - Implement IReadingStatusService similar to RatingService pattern

17. Create `Extensions/ExceptionMiddleware.cs`:
    - Global exception handling middleware
    - Catch exceptions: NotFoundException (404), ValidationException (400), DbUpdateException (409), generic Exception (500)
    - Return ProblemDetails JSON with appropriate status codes
    - Log exceptions sanitize error messages for production (don't expose stack traces)

18. Create custom exception classes in `Exceptions/` folder:
    - `NotFoundException.cs`
    - `BusinessRuleException.cs` - for business logic violations (e.g., book already loaned)

19. Update Program.cs - Dependency Injection:
    - Register DbContext (if not already registered)
    - Register all repositories with scoped lifetime
    - Register all services with scoped lifetime
    - Register validators from FluentValidation
    - Add exception middleware early in pipeline

20. Create `Extensions/BookEndpoints.cs`:
    - Static class with `MapBookEndpoints(this WebApplication app)` method
    - Define all book-related minimal API endpoints
    - GET /api/books - return BookGridRowDto list
    - GET /api/books/{id} - return BookDetailDto, 404 if not found
    - POST /api/books - validate CreateBookDto, return 201 Created with location header
    - PUT /api/books/{id} - validate UpdateBookDto, 404 if not found, return 204 NoContent
    - DELETE /api/books/{id} - 404 if not found, return 204 NoContent
    - Add OpenAPI metadata (tags, summaries, responses)

21. Create `Extensions/RatingEndpoints.cs`:
    - Static class with `MapRatingEndpoints(this WebApplication app)` method
    - POST /api/books/{id}/rating - validate RatingDto, return 200 OK or 201 Created
    - DELETE /api/books/{id}/rating - return 204 NoContent, 404 if book not found

22. Create `Extensions/LoanEndpoints.cs`:
    - Static class with `MapLoanEndpoints(this WebApplication app)` method
    - GET /api/loans - return list of loaned books with borrower info
    - POST /api/books/{id}/loan - validate LoanDto, check for existing active loan, return 201 Created or 409 Conflict
    - DELETE /api/books/{id}/loan - mark loan as returned, 404 if no active loan

23. Create `Extensions/ReadingStatusEndpoints.cs`:
    - Static class with `MapReadingStatusEndpoints(this WebApplication app)` method
    - PUT /api/books/{id}/reading-status - validate ReadingStatusDto, return 200 OK or 201 Created
    - DELETE /api/books/{id}/reading-status - return 204 NoContent

24. Update Program.cs - Register endpoints:
    - Call `app.MapBookEndpoints()`
    - Call `app.MapRatingEndpoints()`
    - Call `app.MapLoanEndpoints()`
    - Call `app.MapReadingStatusEndpoints()`
    - Ensure endpoints registered after middleware but before `app.Run()`

25. Create or update PersonalLibrary.API.http:
    - Replace existing content
    - Add sample HTTP requests for all endpoints
    - Include example request bodies with valid JSON
    - Add comments explaining each request
    - Group by resource (Books, Ratings, Loans, ReadingStatus)

26. Configure model validation in Program.cs:
    - Add automatic model validation response filter
    - Return 400 BadRequest with validation errors in consistent format

27. Add AutoMapper (optional but recommended):
    - Install NuGet package `AutoMapper.Extensions.Microsoft.DependencyInjection`
    - Create `MappingProfile.cs` with entity-DTO mappings
    - Register in Program.cs
    - Update services to use AutoMapper instead of manual mapping

**Verification:**
- Build project: `dotnet build` - should succeed
- Run application: `dotnet run`
- Access Swagger UI: `http://localhost:5274/swagger`
- Verify all endpoints documented
- Test using PersonalLibrary.API.http:
  - Create a book - should return 201
  - Get all books - should return created book
  - Update book - should return 204
  - Get book details - should return updated data
  - Rate book - should succeed
  - Rate same book again - should update existing rating
  - Loan book - should succeed
  - Try to loan same book again - should return 409 Conflict
  - Get loaned books - should return loaned book
  - Return book - should succeed
  - Update reading status - should succeed
  - Delete book - should succeed and cascade delete related data
- Verify validation errors return 400 with clear messages
- Verify 404 returned for non-existent resources
- Check database tables populated correctly after operations

**Dependencies:** Subplan 2 (Data Layer)

---

## Subplan 4: Backend Testing Infrastructure

**Context:** Implement comprehensive backend testing infrastructure with xUnit, Moq, and EF InMemory database to achieve minimum 80% code coverage for the Personal Library API. Tests must pass before builds succeed (enforced in build pipeline).

**Testing Requirements:**
- Minimum 80% code coverage for all layers
- Unit tests for repositories, services
- Integration tests for API endpoints
- Mock external dependencies
- Use InMemory database for repository tests
- Use WebApplicationFactory for integration tests

**Current State:**
- Backend implementation complete from Subplan 3
- No test project exists
- No test infrastructure configured

**Instruction Files to Review:**
- csharp.instructions.md
- personallibrary.instructions.md

**Tasks:**

1. Create test project:
   - Create `Backend/PersonalLibrary.API.Tests/PersonalLibrary.API.Tests.csproj`
   - Target framework: net10.0
   - Reference PersonalLibrary.API project

2. Add NuGet packages to test project:
   - `xUnit` version 2.9+
   - `xUnit.runner.visualstudio` version 2.8+
   - `Microsoft.NET.Test.Sdk` version 17.12+
   - `Moq` version 4.20+
   - `FluentAssertions` version 7.0+
   - `Microsoft.EntityFrameworkCore.InMemory` version 10.0+
   - `Microsoft.AspNetCore.Mvc.Testing` version 10.0+
   - `coverlet.collector` version 6.0+

3. Create `Tests/Data/BookRepositoryTests.cs`:
   - Test class for BookRepository
   - Setup: create InMemory database, seed test data
   - Test GetAllForGridAsync: verify joins, null handling, DTO mapping
   - Test GetByIdAsync: verify found and not found scenarios
   - Test GetDetailsByIdAsync: verify includes related entities
   - Test CreateAsync: verify book created with correct data
   - Test UpdateAsync: verify book updated
   - Test DeleteAsync: verify book deleted and cascade behavior
   - Test ExistsAsync: verify true/false scenarios
   - Use async test methods, proper disposal

4. Create `Tests/Data/RatingRepositoryTests.cs`:
   - Test GetByBookIdAsync: found and not found
   - Test CreateAsync: verify rating created
   - Test UpdateAsync: verify rating updated
   - Test DeleteByBookIdAsync: verify rating deleted

5. Create `Tests/Data/LoanRepositoryTests.cs`:
   - Test GetActiveLoanByBookIdAsync: verify returns only active loan
   - Test GetAllActiveLoansAsync: verify returns only non-returned loans
   - Test CreateAsync: verify loan created with correct defaults
   - Test ReturnLoanAsync: verify IsReturned flag set, ReturnedDate populated

6. Create `Tests/Data/ReadingStatusRepositoryTests.cs`:
   - Similar tests to RatingRepositoryTests

7. Create `Tests/Services/BookServiceTests.cs`:
   - Mock IBookRepository using Moq
   - Test GetAllBooksForGridAsync: verify repository called
   - Test GetBookDetailsAsync: verify not found throws exception
   - Test CreateBookAsync: verify DTO mapped correctly, repository called
   - Test UpdateBookAsync: verify book exists check, update called
   - Test DeleteBookAsync: verify deletion
   - Use FluentAssertions for readable assertions

8. Create `Tests/Services/RatingServiceTests.cs`:
   - Mock IRatingRepository and IBookRepository
   - Test CreateOrUpdateRatingAsync: verify checks for existing rating
   - Test CreateOrUpdateRatingAsync when rating exists: verify update called
   - Test CreateOrUpdateRatingAsync when rating doesn't exist: verify create called
   - Test CreateOrUpdateRatingAsync with non-existent book: verify exception
   - Test DeleteRatingAsync: verify deletion

9. Create `Tests/Services/LoanServiceTests.cs`:
   - Mock ILoanRepository and IBookRepository
   - Test CreateLoanAsync: verify no active loan check
   - Test CreateLoanAsync when book already loaned: verify throws BusinessRuleException
   - Test CreateLoanAsync with non-existent book: verify throws NotFoundException
   - Test ReturnBookAsync: verify marks loan as returned
   - Test ReturnBookAsync when no active loan: verify throws exception
   - Test GetActiveLoanedBooksAsync: verify returns correct data

10. Create `Tests/Services/ReadingStatusServiceTests.cs`:
    - Similar pattern to RatingServiceTests

11. Create `Tests/Validators/CreateBookDtoValidatorTests.cs`:
    - Test Title validation: required, max length
    - Test Author validation: required, max length
    - Test optional fields: Description, Notes, ISBN max lengths
    - Test numeric validations: PublishedYear range, PageCount positive
    - Test URL validation for CoverImageUrl
    - Test enum validation for OwnershipStatus

12. Create `Tests/Validators/RatingDtoValidatorTests.cs`:
    - Test Score range: minimum 1, maximum 10, required
    - Test Notes max length

13. Create `Tests/Validators/LoanDtoValidatorTests.cs`:
    - Test BorrowedTo: required, max length

14. Create `Tests/Integration/ApiTestFixture.cs`:
    - Create custom WebApplicationFactory<Program>
    - Override database configuration to use InMemory or test database
    - Provide methods for seeding test data
    - Implement IDisposable for cleanup

15. Create `Tests/Integration/BookEndpointsTests.cs`:
    - Use WebApplicationFactory
    - Test GET /api/books: verify returns 200, correct JSON structure
    - Test GET /api/books/{id}: verify 200 for existing, 404 for non-existent
    - Test POST /api/books: verify 201 Created, location header, database updated
    - Test POST /api/books with invalid data: verify 400 BadRequest, validation errors
    - Test PUT /api/books/{id}: verify 204 NoContent, updates applied
    - Test PUT with non-existent id: verify 404
    - Test DELETE /api/books/{id}: verify 204, book removed from database
    - Test DELETE with non-existent id: verify 404
    - Use HttpClient from factory, deserialize JSON responses

16. Create `Tests/Integration/RatingEndpointsTests.cs`:
    - Test POST /api/books/{id}/rating: verify creates rating
    - Test POST again to same book: verify updates existing
    - Test POST with invalid score: verify 400
    - Test POST with non-existent book: verify 404
    - Test DELETE /api/books/{id}/rating: verify removes rating

17. Create `Tests/Integration/LoanEndpointsTests.cs`:
    - Test GET /api/loans: verify returns only active loans
    - Test POST /api/books/{id}/loan: verify creates loan
    - Test POST when book already loaned: verify 409 Conflict
    - Test DELETE /api/books/{id}/loan: verify marks as returned, no longer in active loans
    - Test DELETE when not loaned: verify 404 or appropriate error

18. Create `Tests/Integration/ReadingStatusEndpointsTests.cs`:
    - Test PUT /api/books/{id}/reading-status: verify creates/updates status
    - Test DELETE /api/books/{id}/reading-status: verify removes status

19. Configure code coverage collection:
    - Add to test project .csproj: `<CoverletOutputFormat>cobertura</CoverletOutputFormat>`
    - Configure coverage thresholds in .csproj or coverlet.runsettings
    - Set minimum: 80% line coverage, 80% branch coverage

20. Create `Backend/coverlet.runsettings`:
    - Configure coverage settings
    - Exclude: Program.cs (startup), migration files, DTOs (data classes)
    - Include: all other code

21. Add test execution scripts:
    - Create script file or update solution/project to run tests before build
    - Configure to fail build if tests fail or coverage below threshold

22. Configure test output and reporting:
    - Configure test logger for readable output
    - Generate HTML coverage report (optional - use ReportGenerator tool)

**Verification:**
- Run all tests: `dotnet test` from Backend directory - all should pass
- Run with coverage: `dotnet test --collect:"XPlat Code Coverage"` - verify >80%
- Check coverage report in `TestResults/` folder
- Verify test execution time reasonable (under 30 seconds for all tests)
- Run specific test class: `dotnet test --filter BookServiceTests` - verify filtering works
- Intentionally break a test - verify test run fails
- Verify build fails if tests fail (if pre-build event configured)
- Review coverage report - identify any gaps under 80% and add tests if needed

**Dependencies:** Subplan 3 (Services & API Endpoints)

---

## Subplan 5: Frontend Infrastructure & Setup

**Context:** Configure React frontend infrastructure including routing, testing framework, API integration layer, and development utilities for the Personal Library application. Setup enables component development and testing in subsequent phases.

**Technology Stack:**
- React 19.2.0 with Vite 7.3.1
- React Router DOM v7+
- Vitest + React Testing Library
- Materialize CSS (already configured)

**Current State:**
- Basic React app exists at Frontend with single-page App component
- Materialize CSS configured in main.jsx
- No routing library
- No testing framework
- No API integration layer

**Instruction Files to Review:**
- reactjs.instructions.md
- personallibrary.instructions.md

**Tasks:**

1. Install frontend dependencies:
   - Run from Frontend directory: `npm install react-router-dom@^7.0.0`
   - Install testing: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
   - Install coverage: `npm install -D @vitest/coverage-v8`

2. Update vite.config.js:
   - Import vitest from 'vitest/config'
   - Add test configuration object
   - Configure: environment as 'jsdom', globals: true, setupFiles: './src/setupTests.js'
   - Configure coverage: provider 'v8', reporter ['text', 'html', 'json'], thresholds (lines: 80, functions: 80, branches: 80, statements: 80)

3. Create `Frontend/src/setupTests.js`:
   - Import '@testing-library/jest-dom'
   - Add custom matchers or global test configuration
   - Setup Materialize mocks if needed (Materialize initializes on DOM)

4. Update package.json scripts:
   - Add: `"test": "vitest run"`
   - Add: `"test:watch": "vitest"`
   - Add: `"test:ui": "vitest --ui"`
   - Add: `"test:coverage": "vitest run --coverage"`
   - Update build script: `"build": "npm test && vite build"` - enforces tests pass before build

5. Create environment configuration files:
   - Create `Frontend/.env.development` with: `VITE_API_URL=http://localhost:5274`
   - Create `Frontend/.env.production` with: `VITE_API_URL=http://localhost:5274` (update for actual production URL later)
   - Create `Frontend/.env.example` as template with: `VITE_API_URL=your_api_url_here`

6. Update .gitignore:
   - Add: `.env.local`, `.env.*.local`, `coverage/`, `/dist`

7. Create `Frontend/src/config/index.js`:
   - Export configuration object with: `API_URL: import.meta.env.VITE_API_URL`
   - Add other config constants as needed

8. Create `Frontend/src/services/api.js`:
   - Create base fetch wrapper function
   - Handle: setting base URL from config, adding headers (Content-Type: application/json)
   - Handle response: parse JSON, check for error status codes, throw errors with messages
   - Export functions: `get(endpoint)`, `post(endpoint, data)`, `put(endpoint, data)`, `del(endpoint)`
   - Use async/await patterns

9. Create `Frontend/src/services/bookService.js`:
   - Import api wrapper
   - Export functions for all book operations:
     - `getAllBooks()` - GET /api/books
     - `getBookDetails(id)` - GET /api/books/{id}
     - `createBook(bookData)` - POST /api/books
     - `updateBook(id, bookData)` - PUT /api/books/{id}
     - `deleteBook(id)` - DELETE /api/books/{id}

10. Create `Frontend/src/services/ratingService.js`:
    - Export: `createOrUpdateRating(bookId, ratingData)` - POST /api/books/{id}/rating
    - Export: `deleteRating(bookId)` - DELETE /api/books/{id}/rating

11. Create `Frontend/src/services/loanService.js`:
    - Export: `getActiveLoanedBooks()` - GET /api/loans
    - Export: `createLoan(bookId, loanData)` - POST /api/books/{id}/loan
    - Export: `returnBook(bookId)` - DELETE /api/books/{id}/loan

12. Create `Frontend/src/services/readingStatusService.js`:
    - Export: `updateReadingStatus(bookId, statusData)` - PUT /api/books/{id}/reading-status
    - Export: `deleteReadingStatus(bookId)` - DELETE /api/books/{id}/reading-status

13. Create routing structure `Frontend/src/router/index.jsx`:
    - Import `createBrowserRouter`, `RouterProvider` from react-router-dom
    - Define routes array:
      - Path: '/', element: Dashboard component (create placeholder)
      - Path: '/loans', element: LoanedBooks component (create placeholder)
    - Create and export router with `createBrowserRouter(routes)`

14. Create placeholder page `Frontend/src/pages/Dashboard.jsx`:
    - Simple functional component
    - Return div with heading "Books Dashboard"
    - Export default

15. Create placeholder page `Frontend/src/pages/LoanedBooks.jsx`:
    - Simple functional component
    - Return div with heading "Loaned Books"
    - Export default

16. Update main.jsx:
    - Import router from './router'
    - Replace `<App />` with `<RouterProvider router={router} />`
    - Keep Materialize CSS initialization
    - Keep StrictMode wrapper

17. Create `Frontend/src/components/Navigation.jsx`:
    - Import Link from react-router-dom
    - Create Materialize navbar structure
    - Add navigation links: Dashboard (/), Loaned Books (/loans)
    - Use Materialize nav classes for styling
    - Include mobile hamburger menu if desired

18. Create `Frontend/src/components/Layout.jsx`:
    - Functional component accepting children
    - Render Navigation component
    - Render main content area with children
    - Include Outlet from react-router-dom for nested routes

19. Update routing to use Layout:
    - Modify router structure to have Layout as parent route
    - Dashboard and LoanedBooks as child routes

20. Create custom hooks folder structure:
    - Create `Frontend/src/hooks/` folder
    - Create placeholder files for future hooks: `useBooks.js`, `useModal.js`, `useToast.js`

21. Create shared components folder:
    - Create `Frontend/src/components/shared/` folder
    - Will be populated in next subplan

22. Update App.jsx or remove if no longer needed:
    - If keeping: refactor to remove landing page content (move to separate Home component if needed)
    - If Layout handles everything: App.jsx may no longer be needed

23. Add PropTypes or TypeScript interfaces (optional):
    - If using PropTypes: `npm install prop-types`
    - Add prop validation to all components

24. Create test utilities `Frontend/src/test-utils/index.jsx`:
    - Create custom render function wrapping components with providers (Router, etc.)
    - Export test utils for use in component tests

**Verification:**
- Run `npm install` - verify all dependencies install
- Run `npm run dev` - verify app starts on port 5173
- Open browser to `http://localhost:5173` - verify app loads
- Navigate between Dashboard and Loaned Books - verify routing works
- Check navigation highlights active route
- Run `npm test` - verify test infrastructure works (may have no tests yet, should not error)
- Run `npm run test:ui` - verify Vitest UI opens
- Create simple test file `src/services/api.test.js` with dummy test - verify passes
- Verify environment variables accessible: console.log config in component - check API_URL
- Check browser console - no errors
- Verify build: `npm run build` - should succeed (after tests pass)

**Dependencies:** Subplan 1 (Docker for backend API to be available)

---

## Subplan 6: Frontend Components & Features  

**Context:** Implement all React components, pages, and user interaction features for the Personal Library application including book dashboard, modals for CRUD operations, loaned books page, and data management.

**Application Features:**

**Dashboard Page:**
- Grid displaying: Title, Author, Score, Ownership Status, Reading Status, Loanee
- Row actions: Details, Loan, Rate, Update Reading Status, Delete
- Add Book button
- All actions open modals
- Grid refreshes after operations

**Loaned Books Page:**
- Grid displaying: Title, Author, Loanee
- Row action: Return
- Grid refreshes after return

**Modals:**
- Book Details (editable form)
- Add Book (creation form)
- Rate Book (1-10 stars + notes)
- Loan Book (borrower name input)
- Update Reading Status (status dropdown)
- Delete Confirmation

**Current State:**
- Frontend infrastructure complete from Subplan 5
- Placeholder Dashboard and LoanedBooks pages exist
- Navigation and routing configured
- API services ready
- Materialize CSS available

**Data Types (from backend DTOs):**
- BookGridRowDto: Id, Title, Author, Score?, OwnershipStatus, ReadingStatus?, Loanee?
- BookDetailDto: All book fields + rating + reading status + active loan
- OwnershipStatus enum: WantToBuy, Own, SoldOrGaveAway
- ReadingStatus enum: Backlog, Completed, Abandoned

**Instruction Files to Review:**
- reactjs.instructions.md
- personallibrary.instructions.md

**Tasks:**

1. Create `Frontend/src/hooks/useBooks.js`:
   - Custom hook for managing books data
   - State: books array, loading boolean, error string
   - Function: fetchBooks() calling bookService.getAllBooks()
   - Function: refreshBooks() for manual refresh
   - Return: books, loading, error, fetchBooks, refreshBooks
   - Use useEffect to fetch on mount

2. Create `Frontend/src/hooks/useModal.js`:
   - Custom hook for modal state management
   - State: isOpen boolean, data object (for passing data to modal)
   - Functions: openModal(data?), closeModal(), toggle()
   - Return: isOpen, data, openModal, closeModal, toggle

3. Create `Frontend/src/hooks/useToast.js`:
   - Custom hook for Materialize toast notifications
   - Function: showToast(message, type) where type: 'success', 'error', 'info'
   - Use Materialize M.toast() method
   - Return: showToast function

4. Create `Frontend/src/components/shared/Modal.jsx`:
   - Reusable modal component using Materialize modal structure
   - Props: isOpen, onClose, title, children, maxWidth
   - Initialize Materialize modal on mount with useEffect
   - Handle open/close with Materialize modal instance
   - Include close button (X) in header
   - Export default

5. Create `Frontend/src/components/shared/Button.jsx`:
   - Reusable button component with Materialize classes
   - Props: children, onClick, variant ('primary', 'secondary', 'danger'), disabled, type
   - Apply appropriate Materialize button classes based on variant
   - Export default

6. Create `Frontend/src/components/shared/FormInput.jsx`:
   - Reusable form input with Materialize styling
   - Props: label, name, value, onChange, type, required, maxLength, error
   - Display validation error message if error prop provided
   - Use Materialize input field structure
   - Export default

7. Create `Frontend/src/components/shared/FormSelect.jsx`:
   - Reusable select dropdown with Materialize
   - Props: label, name, value, onChange, options (array of {value, label}), required, error
   - Initialize Materialize select on mount
   - Export default

8. Create `Frontend/src/components/shared/FormTextarea.jsx`:
   - Reusable textarea with Materialize styling
   - Props: label, name, value, onChange, maxLength, error, rows
   - Display character count
   - Export default

9. Create `Frontend/src/components/shared/LoadingSpinner.jsx`:
   - Loading indicator component using Materialize preloader
   - Props: message (optional loading message)
   - Center spinner on page or in container
   - Export default

10. Create `Frontend/src/components/shared/ErrorMessage.jsx`:
    - Error display component with Materialize card/alert styling
    - Props: message, onRetry (optional retry button)
    - Red color scheme
    - Export default

11. Create `Frontend/src/components/books/BookGrid.jsx`:
    - Table component displaying books
    - Props: books array, onDetails, onLoan, onRate, onUpdateStatus, onDelete, loading
    - Render Materialize responsive table
    - Columns: Title, Author, Score (display as stars or number), Ownership Status, Reading Status, Loanee
    - Each row has action buttons: Details, Loan (disabled if loaned), Rate, Update Status, Delete
    - Handle empty state (no books)
    - Handle loading state
    - Convert enum values to readable text (WantToBuy → "Want to Buy")
    - Export default

12. Create `Frontend/src/components/books/AddBookModal.jsx`:
    - Modal for creating new book
    - Props: isOpen, onClose, onSuccess
    - State: form data object, errors object, submitting boolean
    - Form fields: Title, Author, Description, Notes, ISBN, Published Year, Page Count, Cover Image URL, Ownership Status (dropdown)
    - Implement client-side validation matching backend rules
    - Submit handler: call bookService.createBook(), show toast, call onSuccess, close modal
    - Handle API errors, display in toast or form
    - Use shared form components
    - Export default

13. Create `Frontend/src/components/books/BookDetailsModal.jsx`:
    - Modal for viewing and editing book details
    - Props: isOpen, onClose, bookId, onSuccess
    - Fetch book details on mount using bookService.getBookDetails(bookId)
    - State: form data, original data, editing boolean, loading, errors, submitting
    - Display all book fields (initially read-only)
    - Edit button toggles editing mode
    - Save button: call bookService.updateBook(), show toast, call onSuccess
    - Cancel button: revert to original data, exit edit mode
    - Use shared form components
    - Export default

14. Create `Frontend/src/components/books/RateBookModal.jsx`:
    - Modal for rating book with 10-star system
    - Props: isOpen, onClose, bookId, existingRating (score, notes), onSuccess
    - State: score (1-10), notes, submitting, error
    - Render star rating input (10 clickable stars, highlight on hover, show selected)
    - Notes textarea (optional, max 1000 chars)
    - Submit handler: call ratingService.createOrUpdateRating(), show toast, call onSuccess
    - Handle error scenarios
    - Export default

15. Create `Frontend/src/components/books/LoanBookModal.jsx`:
    - Modal for loaning book
    - Props: isOpen, onClose, bookId, onSuccess
    - State: borrowedTo (string), submitting, error
    - Single input: Borrower Name (required, max 100 chars)
    - Submit handler: call loanService.createLoan(), show toast, call onSuccess
    - Handle error (e.g., book already loaned - display error message)
    - Export default

16. Create `Frontend/src/components/books/UpdateReadingStatusModal.jsx`:
    - Modal for updating reading status
    - Props: isOpen, onClose, bookId, currentStatus, onSuccess
    - State: status (enum), submitting, error
    - Dropdown: Backlog, Completed, Abandoned
    - Submit handler: call readingStatusService.updateReadingStatus(), show toast, call onSuccess
    - Export default

17. Create `Frontend/src/components/books/DeleteBookConfirmation.jsx`:
    - Confirmation modal for deleting book
    - Props: isOpen, onClose, bookId, bookTitle, onSuccess
    - Display warning message with book title
    - Confirm and Cancel buttons
    - Confirm handler: call bookService.deleteBook(), show toast, call onSuccess
    - Use danger styling for confirm button
    - Export default

18. Update `Frontend/src/pages/Dashboard.jsx`:
    - Import all book components and hooks
    - Use useBooks hook to fetch and manage books
    - Use useModal hooks for each modal type
    - Use useToast for notifications
    - State: selectedBookId, selectedBook for passing to modals
    - Render: page header with "Books Dashboard" title
    - Render: "Add Book" button (top right or above grid)
    - Render: BookGrid with all books, pass action handlers
    - Render: All modals (AddBook, Details, Rate, Loan, UpdateStatus, Delete)
    - Action handlers: open appropriate modal, set selected book, handle success callback (refresh grid, show toast)
    - Handle loading and error states
    - Export default

19. Create `Frontend/src/pages/LoanedBooks.jsx` (full implementation):
    - Import components and hooks
    - State: loanedBooks array, loading, error
    - Fetch loaned books on mount using loanService.getActiveLoanedBooks()
    - Render: page header "Loaned Books"
    - Render: Table with columns: Title, Author, Loanee, Actions
    - Action: Return button for each row
    - Return handler: call loanService.returnBook(bookId), show toast, refresh grid
    - Handle loading and error states
    - Handle empty state (no loaned books)
    - Export default

20. Add utility functions `Frontend/src/utils/formatters.js`:
    - Function: formatOwnershipStatus(status) - convert enum to readable ("WantToBuy" → "Want to Buy")
    - Function: formatReadingStatus(status) - convert enum to readable
    - Function: formatStarRating(score) - return stars display (★★★★★☆☆☆☆☆)
    - Export all functions

21. Add utility functions `Frontend/src/utils/validators.js`:
    - Function: validateTitle(title) - check required, max 100
    - Function: validateAuthor(author) - check required, max 100
    - Function: validateUrl(url) - check valid URL format
    - Function: validateYear(year) - check range
    - Function: validateScore(score) - check 1-10 range
    - Return: error message string or null if valid
    - Export all functions

22. Update styling App.css:
    - Add styles for star rating component (clickable stars, hover effects)
    - Add styles for grid action buttons (icon buttons, tooltips)
    - Add styles for modal content layout
    - Add responsive styles for mobile
    - Ensure consistency with Materialize theme

23. Update styling index.css:
    - Add global styles for error messages
    - Add loading overlay styles
    - Add empty state styles
    - Ensure proper spacing and alignment

24. Add constants `Frontend/src/constants/index.js`:
    - Export: OWNERSHIP_STATUS enum mirror: { WANT_TO_BUY: 'WantToBuy', OWN: 'Own', SOLD_OR_GAVE_AWAY: 'SoldOrGaveAway' }
    - Export: READING_STATUS enum mirror: { BACKLOG: 'Backlog', COMPLETED: 'Completed', ABANDONED: 'Abandoned' }
    - Export: OWNERSHIP_STATUS_OPTIONS array for select dropdown
    - Export: READING_STATUS_OPTIONS array for select dropdown
    - Export: MAX_LENGTHS object with field constraints

25. Initialize Materialize components:
    - In relevant component useEffect hooks, initialize Materialize JS components (modals, selects, tooltips)
    - Ensure proper cleanup on unmount
    - Handle Materialize auto-init if using

**Verification:**
- Run `npm run dev` - application starts
- Navigate to Dashboard - books load and display in grid
- Click "Add Book" - modal opens with form
- Fill form and submit - book created, grid refreshes, toast shown
- Click "Details" on book - modal opens with book details
- Edit book details and save - changes applied, toast shown
- Click "Rate" on book - rate modal opens
- Select rating and submit - rating saved, grid shows score
- Click "Loan" on book - loan modal opens
- Enter borrower and submit - book marked as loaned, Loanee column shows name
- Try to loan same book again - Loan button disabled or error shown
- Click "Update Status" - status modal opens, select status, save
- Navigate to Loaned Books page - see loaned book
- Click "Return" - book returned, removed from loaned books list
- Go back to Dashboard - Loanee column empty for returned book
- Click "Delete" on book - confirmation modal appears
- Confirm delete - book removed, toast shown
- Test validation - try submitting forms with invalid data, verify errors shown
- Test responsive design - resize browser, verify works on mobile
- Check browser console - no errors
- Verify all Materialize components styled correctly

**Dependencies:** Subplan 5 (Frontend Infrastructure)

---

## Subplan 7: Frontend Testing

**Context:** Implement comprehensive frontend testing using Vitest and React Testing Library to achieve minimum 80% code coverage. Tests must pass before builds succeed - enforced in build script.

**Testing Requirements:**
- Minimum 80% code coverage (lines, branches, functions, statements)
- Unit tests for all components
- Unit tests for services and hooks
- Integration tests for page workflows
- Mock API calls
- Test user interactions

**Current State:**
- All frontend components implemented from Subplan 6
- Vitest configured from Subplan 5
- No tests written yet
- Coverage thresholds configured in vite.config.js

**Instruction Files to Review:**
- reactjs.instructions.md
- personallibrary.instructions.md

**Tasks:**

1. Update `Frontend/src/test-utils/index.jsx`:
   - Create custom render function wrapping with MemoryRouter for components using routing
   - Create mock router helper
   - Export custom render and other test utilities
   - Add mock data generators (mockBook, mockRating, etc.)

2. Create `Frontend/src/services/__mocks__/api.js`:
   - Mock implementation of api service
   - Export mocked get, post, put, del functions using vi.fn()
   - Will be used to mock API calls in service tests

3. Create `Frontend/src/services/api.test.js`:
   - Mock global fetch
   - Test get() function: verify fetch called with correct URL and method
   - Test post() function: verify body serialized to JSON, Content-Type header set
   - Test put() function: similar to post
   - Test del() function: verify DELETE method used
   - Test error handling: mock failed responses, verify errors thrown with messages
   - Test response parsing: verify JSON parsed correctly

4. Create `Frontend/src/services/bookService.test.js`:
   - Mock api module using vi.mock()
   - Test getAllBooks(): verify api.get called with '/api/books'
   - Test getBookDetails(id): verify correct endpoint with id
   - Test createBook(data): verify api.post called with data
   - Test updateBook(id, data): verify api.put called
   - Test deleteBook(id): verify api.del called
   - Test error propagation from API layer

5. Create `Frontend/src/services/ratingService.test.js`:
   - Mock api module
   - Test createOrUpdateRating(): verify correct endpoint and payload
   - Test deleteRating(): verify delete call

6. Create `Frontend/src/services/loanService.test.js`:
   - Mock api module
   - Test all loan service functions
   - Verify correct endpoints and payloads

7. Create `Frontend/src/services/readingStatusService.test.js`:
   - Similar pattern to other service tests

8. Create `Frontend/src/hooks/useBooks.test.js`:
   - Use @testing-library/react-hooks or renderHook from RTL
   - Mock bookService
   - Test initial state: loading true, books empty
   - Test successful fetch: verify books populated, loading false
   - Test fetch error: verify error state set
   - Test refreshBooks: verify re-fetches data

9. Create `Frontend/src/hooks/useModal.test.js`:
   - Test initial state: isOpen false
   - Test openModal(): verify isOpen becomes true
   - Test closeModal(): verify isOpen becomes false
   - Test data passing: verify data stored correctly

10. Create `Frontend/src/hooks/useToast.test.js`:
    - Mock Materialize M.toast
    - Test showToast(): verify M.toast called with correct parameters
    - Test different toast types

11. Create `Frontend/src/components/shared/Modal.test.jsx`:
    - Mock Materialize modal initialization
    - Test renders with children when isOpen true
    - Test doesn't render when isOpen false
    - Test onClose called when close button clicked
    - Test title displayed correctly

12. Create `Frontend/src/components/shared/Button.test.jsx`:
    - Test renders children
    - Test onClick handler called
    - Test disabled state prevents clicks
    - Test variant classes applied correctly

13. Create `Frontend/src/components/shared/FormInput.test.jsx`:
    - Test renders label and input
    - Test value controlled by value prop
    - Test onChange handler called on input
    - Test error message displayed when error prop provided
    - Test required attribute applied

14. Create `Frontend/src/components/shared/FormSelect.test.jsx`:
    - Mock Materialize select initialization
    - Test options rendered
    - Test selection change
    - Test error display

15. Create `Frontend/src/components/shared/FormTextarea.test.jsx`:
    - Test character count displayed
    - Test maxLength enforced
    - Test value and onChange work correctly

16. Create `Frontend/src/components/shared/LoadingSpinner.test.jsx`:
    - Test spinner renders
    - Test message displayed if provided

17. Create `Frontend/src/components/shared/ErrorMessage.test.jsx`:
    - Test message displayed
    - Test retry button renders and calls onRetry if provided

18. Create `Frontend/src/components/books/BookGrid.test.jsx`:
    - Test renders table with books
    - Test empty state displayed when no books
    - Test loading state displayed
    - Test action buttons rendered for each row
    - Test action handlers called with correct book id when buttons clicked
    - Test Loan button disabled when book already loaned
    - Test ownership and reading status formatted correctly
    - Test score displayed as stars or number

19. Create `Frontend/src/components/books/AddBookModal.test.jsx`:
    - Mock bookService.createBook
    - Test modal renders when open
    - Test form fields present
    - Test can type into all fields
    - Test client-side validation (required fields, max lengths)
    - Test form submission calls createBook with form data
    - Test success callback and close called on successful submit
    - Test error handling on API failure
    - Test toast shown on success

20. Create `Frontend/src/components/books/BookDetailsModal.test.jsx`:
    - Mock bookService.getBookDetails and updateBook
    - Test fetches book details on mount
    - Test displays book details in read-only mode initially
    - Test edit button enables editing
    - Test can modify fields in edit mode
    - Test save calls updateBook with changed data
    - Test cancel reverts changes
    - Test loading state while fetching

21. Create `Frontend/src/components/books/RateBookModal.test.jsx`:
    - Mock ratingService
    - Test star rating input renders
    - Test clicking star sets score
    - Test notes textarea works
    - Test submit calls createOrUpdateRating with score and notes
    - Test validation (score required 1-10)
    - Test existing rating pre-fills form

22. Create `Frontend/src/components/books/LoanBookModal.test.jsx`:
    - Mock loanService
    - Test borrower input renders
    - Test submit calls createLoan
    - Test validation (borrower required, max length)
    - Test error handling (book already loaned)

23. Create `Frontend/src/components/books/UpdateReadingStatusModal.test.jsx`:
    - Mock readingStatusService
    - Test status dropdown renders
    - Test options present (Backlog, Completed, Abandoned)
    - Test submit calls updateReadingStatus
    - Test current status pre-selected

24. Create `Frontend/src/components/books/DeleteBookConfirmation.test.jsx`:
    - Mock bookService.deleteBook
    - Test displays book title in warning
    - Test cancel button closes modal without deleting
    - Test confirm button calls deleteBook
    - Test success callback called after deletion

25. Create `Frontend/src/pages/Dashboard.test.jsx`:
    - Mock all services
    - Mock hooks (or use real hooks with mocked services)
    - Test page renders with loading spinner initially
    - Test books displayed after loading
    - Test error message shown on fetch failure
    - Test Add Book button opens AddBookModal
    - Test grid action buttons open appropriate modals
    - Test successful book creation refreshes grid
    - Test Delete Book confirmation opens on delete button click
    - Integration test: full flow of adding, rating, loaning, deleting book

26. Create `Frontend/src/pages/LoanedBooks.test.jsx`:
    - Mock loanService
    - Test page renders loaned books
    - Test empty state when no loaned books
    - Test Return button calls returnBook service
    - Test grid refreshes after return
    - Test success toast shown

27. Create `Frontend/src/utils/formatters.test.js`:
    - Test formatOwnershipStatus: verify all enum values formatted correctly
    - Test formatReadingStatus: verify all enum values formatted correctly
    - Test formatStarRating: verify correct number of stars for scores 1-10

28. Create `Frontend/src/utils/validators.test.js`:
    - Test each validator function with valid and invalid inputs
    - Test validateTitle: empty string, too long, valid
    - Test validateAuthor: same cases
    - Test validateUrl: invalid format, valid URLs
    - Test validateYear: out of range, valid
    - Test validateScore: below 1, above 10, valid

29. Run coverage report and identify gaps:
    - Run `npm run test:coverage`
    - Review HTML coverage report in coverage/ folder
    - Identify any files or branches below 80%
    - Add additional tests for uncovered code paths

30. Add integration/E2E tests (optional but recommended):
    - Install Playwright: `npm install -D @playwright/test`
    - Create `Frontend/e2e/` folder
    - Create test spec: `bookManagement.spec.js`
    - Test: navigate to dashboard, add book, verify in grid
    - Test: rate book, verify score updated
    - Test: loan book, verify in loaned books page
    - Test: return book, verify removed from loaned books
    - Test: delete book, verify removed from dashboard
    - Configure Playwright in package.json scripts

**Verification:**
- Run `npm test` - all tests pass
- Run `npm run test:coverage` - verify >80% coverage for all categories
- Check coverage report HTML - verify no critical files missing
- Run `npm run test:ui` - open Vitest UI, browse tests, verify all green
- Run individual test file: `npm test -- BookGrid.test.jsx` - verify passes
- Intentionally break a component - verify test fails
- Fix component - verify test passes again
- Run `npm run build` - verify tests run before build, build fails if tests fail
- Run E2E tests if implemented: `npx playwright test` - verify full workflows pass
- Check test execution time - should complete in reasonable time (under 60 seconds)

**Dependencies:** Subplan 6 (Frontend Components)

---

## Subplan 8: CI/CD Pipeline

**Context:** Implement GitHub Actions CI/CD pipeline with quality gates, automated testing, code coverage enforcement, and Docker image building for the Personal Library application. Pipeline must enforce 80% coverage requirement and ensure all tests pass before allowing merges.

**CI/CD Requirements:**
- Run on pull requests and pushes to main branch
- Build and test backend (ASP.NET Core)
- Build and test frontend (React)
- Enforce 80% code coverage minimum
- Build Docker images
- Report test results and coverage
- Configure branch protection rules

**Current State:**
- Backend and frontend complete with tests
- Tests pass locally with >80% coverage
- Docker configuration complete
- No CI/CD pipeline exists

**Instruction Files to Review:**
- personallibrary.instructions.md

**Tasks:**

1. Create `.github/workflows/` folder at repository root

2. Create `.github/workflows/ci.yml`:
   - Name: "CI Pipeline"
   - Trigger: on push to main, on pull_request to main
   - Jobs: backend-test, frontend-test, docker-build

3. Configure backend-test job in ci.yml:
   - Run on: ubuntu-latest
   - Steps:
     - Checkout code (actions/checkout@v4)
     - Setup .NET 10 SDK (actions/setup-dotnet@v4, dotnet-version: '10.0.x')
     - Restore dependencies: `dotnet restore Backend/PersonalLibrary.API/PersonalLibrary.API.csproj`
     - Build: `dotnet build PersonalLibrary.API.csproj --no-restore`
     - Run tests with coverage: `dotnet test Backend/PersonalLibrary.API.Tests/PersonalLibrary.API.Tests.csproj --no-build --collect:"XPlat Code Coverage" --logger trx --results-directory coverage`
     - Generate coverage report (optional - use ReportGenerator action)
     - Upload coverage to Codecov or similar (actions/codecov-action@v4)
     - Upload test results as artifact
     - Fail job if coverage < 80%

4. Configure frontend-test job in ci.yml:
   - Run on: ubuntu-latest
   - Steps:
     - Checkout code
     - Setup Node.js (actions/setup-node@v4, node-version: '20')
     - Install dependencies: `npm ci` in Frontend directory
     - Run lint: `npm run lint` (if configured)
     - Run tests with coverage: `npm run test:coverage`
     - Upload coverage to Codecov
     - Upload coverage report as artifact
     - Check coverage meets threshold (job fails if <80%)

5. Configure docker-build job in ci.yml:
   - Run on: ubuntu-latest
   - Depends on: backend-test, frontend-test (runs only if tests pass)
   - Steps:
     - Checkout code
     - Set up Docker Buildx (docker/setup-buildx-action@v3)
     - Build backend image: `docker build -f Backend/PersonalLibrary.API/Dockerfile -t personal-library-api:test .`
     - Build frontend image: `docker build -f Frontend/Dockerfile -t personal-library-frontend:test .`
     - Optionally: push images to container registry (Docker Hub, GitHub Container Registry)
     - Test images can start (health checks)

6. Add environment variables and secrets configuration:
   - Document required secrets in README
   - For container registry push: DOCKER_USERNAME, DOCKER_PASSWORD (add to repository secrets)
   - For Codecov: CODECOV_TOKEN (add to repository secrets)

7. Create `.github/workflows/codeql.yml` for security scanning:
   - Name: "CodeQL Security Scan"
   - Trigger: on push to main, on pull_request, on schedule (weekly)
   - Use actions/codeql-action for C# and JavaScript analysis
   - Report security vulnerabilities

8. Create status badge configuration:
   - Add CI status badge to README.md
   - Add coverage badge to README.md
   - Format: `![CI](https://github.com/{user}/{repo}/workflows/CI%20Pipeline/badge.svg)`

9. Configure Dependabot (optional but recommended):
   - Create `.github/dependabot.yml`
   - Configure automatic dependency updates for:
     - npm packages (Frontend)
     - NuGet packages (Backend)
     - GitHub Actions
   - Set update frequency (weekly)

10. Create branch protection rules (document instructions, actual config in GitHub settings):
    - Protect main branch
    - Require pull request reviews (minimum 1)
    - Require status checks to pass before merging:
      - backend-test
      - frontend-test
      - docker-build
    - Require branches to be up to date before merging
    - Do not allow force pushes
    - Include administrators in restrictions (optional)

11. Create pull request template:
    - Create `.github/PULL_REQUEST_TEMPLATE.md`
    - Checklist: tests added/updated, tests pass, code reviewed, documentation updated
    - Sections: Description, Changes, Testing, Screenshots (if UI changes)

12. Create issue templates:
    - Create `.github/ISSUE_TEMPLATE/bug_report.md`
    - Create `.github/ISSUE_TEMPLATE/feature_request.md`
    - Include relevant sections and labels

13. Configure code coverage reporting:
    - Create `codecov.yml` at repository root
    - Configure coverage thresholds: patch: 80%, project: 80%
    - Configure status checks: fail if coverage drops

14. Add pre-commit hooks (optional):
    - Install husky: `npm install -D husky` in Frontend
    - Configure pre-commit hook to run tests
    - Configure pre-push hook to run full test suite

15. Create deployment workflow (if deployment target identified):
    - Create `.github/workflows/deploy.yml`
    - Trigger: on push to main (after CI passes)
    - Steps: build images, push to registry, deploy to hosting platform
    - Environment variables for production configuration

**Verification:**
- Push code to new branch
- Open pull request to main
- Verify CI workflow triggers automatically
- Check workflow runs in GitHub Actions tab
- Verify backend-test job runs and passes
- Verify frontend-test job runs and passes
- Verify docker-build job runs and passes
- Check test results and coverage reports uploaded as artifacts
- Attempt to merge PR before CI passes - should be blocked (if branch protection enabled)
- Verify status checks displayed in PR
- After CI passes, verify can merge PR
- Check main branch - verify CI runs on push to main
- Intentionally break a test - verify CI fails
- Fix test - verify CI passes again
- Check coverage badges in README display correctly
- Verify Dependabot creates PRs for dependency updates (if configured)
- Verify CodeQL security scan runs (if configured)

**Dependencies:** Subplan 4 (Backend Testing), Subplan 7 (Frontend Testing)

---

## Subplan 9: Documentation & Production Readiness

**Context:** Complete project documentation, add production-ready features including logging, security hardening, performance optimization, database seeding, and final polish for the Personal Library application.

**Production Requirements:**
- Comprehensive README with setup instructions
- API documentation (Swagger)
- Security hardening (CORS, HTTPS, headers)
- Structured logging
- Performance optimization
- Database seeding for development
- Error handling improvements

**Current State:**
- Full application implemented and tested
- Docker configuration complete
- CI/CD pipeline configured
- Basic README exists
- Swagger configured but minimal documentation

**Instruction Files to Review:**
- All instruction files for final compliance check
- personallibrary.instructions.md
- csharp.instructions.md
- reactjs.instructions.md

**Tasks:**

1. Update README.md with comprehensive documentation:
   - Project overview and features
   - Technology stack
   - Architecture diagram (optional)
   - Prerequisites (Docker, .NET 10, Node 20)
   - Setup instructions (clone, configure environment variables)
   - Running with Docker: `docker-compose up --build`
   - Running locally without Docker (backend and frontend separately)
   - Testing instructions (backend and frontend)
   - API documentation link
   - Contributing guidelines
   - License information
   - Project structure overview

2. Create `CONTRIBUTING.md`:
   - Development setup
   - Coding standards (reference instruction files)
   - Testing requirements (80% coverage)
   - Pull request process
   - Code review checklist from instruction files

3. Create `LICENSE` file (if not exists):
   - Choose appropriate license (MIT, Apache, etc.)

4. Enhance Swagger/OpenAPI documentation in backend:
   - Add XML documentation comments to endpoint methods
   - Add descriptions for request/response models
   - Add example values for DTOs
   - Group endpoints by tags (Books, Ratings, Loans, ReadingStatus)
   - Add response type annotations (Produces, ProducesResponseType)
   - Update Program.cs to include XML comments in Swagger

5. Enable XML documentation generation:
   - Update PersonalLibrary.API.csproj: Add `<GenerateDocumentationFile>true</GenerateDocumentationFile>`
   - Configure Swagger to read XML file in Program.cs

6. Implement structured logging with Serilog:
   - Install NuGet: `Serilog.AspNetCore`, `Serilog.Sinks.Console`, `Serilog.Sinks.File`
   - Configure Serilog in Program.cs
   - Add file sink: logs/app-.log with rolling date
   - Add console sink with structured output
   - Remove default logging, use Serilog
   - Log important operations: API requests, errors, database operations

7. Add request logging middleware:
   - Configure Serilog request logging in Program.cs
   - Log: HTTP method, path, status code, response time
   - Exclude health check endpoint from logs (reduce noise)

8. Implement security hardening:
   - Add security headers middleware (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
   - Configure HTTPS redirection for production
   - Update CORS policy: ensure only specific origins allowed (not wildcard in production)
   - Add request size limits
   - Configure rate limiting (optional - use AspNetCoreRateLimit package)

9. Add database seeding for development:
   - Create `Data/DbInitializer.cs` static class
   - Method: SeedAsync(LibraryDbContext context)
   - Check if database empty, if yes, seed sample books with ratings, loans, statuses
   - Create 10-15 sample books covering all scenarios (owned, loaned, rated, different statuses)
   - Call seeder from Program.cs only in Development environment

10. Add database migration on startup for Docker:
    - In Program.cs, add code to apply pending migrations on startup
    - Only for Development environment
    - Use: `context.Database.Migrate()` after app builds services

11. Implement performance optimizations:
    - Add response caching for GET endpoints (short cache duration, e.g., 30 seconds)
    - Enable response compression (Gzip, Brotli)
    - Add indexes to database via migration:
      - Index on Book.Title for search
      - Index on Loan.IsReturned for filtering active loans
      - Index on Rating.BookId (already unique, but verify)

12. Create performance optimization migration:
    - Generate new migration: `dotnet ef migrations add AddIndexes`
    - Review migration adds indexes correctly

13. Implement graceful error pages for frontend:
    - Create error boundary component wrapping app
    - Handle uncaught errors, display friendly message
    - Log errors to console in development

14. Add loading states improvements:
    - Ensure all async operations show loading indicators
    - Add skeleton screens for grid loading (optional)
    - Disable buttons during submission to prevent double-clicks

15. Implement form validation improvements:
    - Add real-time validation feedback (validate on blur)
    - Show character limits on text inputs
    - Add input masks for ISBN if using proper format

16. Add accessibility improvements:
    - Ensure all buttons have aria-labels
    - Ensure modals have proper aria attributes
    - Test keyboard navigation (tab order, enter to submit, escape to close)
    - Ensure sufficient color contrast
    - Add focus indicators

17. Add user feedback improvements:
    - Ensure all operations show toast notifications
    - Use appropriate colors (green for success, red for error, blue for info)
    - Add confirmation for destructive actions (already have delete confirmation)

18. Create environment-specific configurations:
    - Update appsettings.json for production defaults
    - Ensure sensitive data not in appsettings (use environment variables)
    - Document required environment variables in README

19. Add health checks improvements:
    - Current: basic health check exists
    - Add database health check (verify can connect)
    - Update health check endpoint to return detailed status
    - Configure health check timeout

20. Create database backup script (optional):
    - Add script to backup SQL Server database
    - Document in README

21. Create production deployment guide:
    - Create `docs/DEPLOYMENT.md`
    - Steps for deploying to cloud platform (Azure, AWS, etc.)
    - Environment variable configuration
    - SSL certificate setup
    - Database connection string configuration
    - Monitoring and logging setup

22. Add monitoring and observability (optional):
    - Configure Application Insights or similar
    - Add custom metrics
    - Add health check endpoints monitoring

23. Final security review:
    - Review all instruction file security requirements
    - Verify input validation on all endpoints
    - Verify parameterized queries (EF Core handles)
    - Verify no secrets in code
    - Verify error messages don't expose sensitive info
    - Verify CORS configured correctly
    - Verify HTTPS enforced in production

24. Final testing checklist:
    - Run full test suite: backend and frontend
    - Verify coverage >80%
    - Test Docker compose full stack
    - Test all endpoints via Swagger
    - Test all UI workflows manually
    - Test on different browsers (Chrome, Firefox, Edge)
    - Test responsive design on mobile
    - Test with database initially empty (seeding works)
    - Test error scenarios (backend down, network errors)

25. Create release notes template:
    - Create `docs/RELEASE_NOTES.md`
    - Document initial release v1.0.0
    - List features implemented
    - Known issues or limitations

26. Add future enhancements documentation:
    - Create `docs/FUTURE_ENHANCEMENTS.md`
    - Ideas: book search/filter, categories/tags, book cover upload, export to CSV, statistics dashboard, user authentication, batch operations

**Verification:**
- Read through entire README - verify setup instructions work from scratch
- Follow setup instructions on clean machine (or fresh Docker environment)
- Verify application starts and all features work
- Review Swagger documentation - verify comprehensive and accurate
- Check logs directory - verify logs created and formatted correctly
- Test security headers - use browser dev tools or SecurityHeaders.com
- Test performance - check response times, verify caching works
- Test with seeded data - verify sample books appear
- Run all tests one final time - verify all pass with >80% coverage
- Review all code against instruction files - verify compliance
- Test accessibility - use screen reader or Firefox accessibility inspector
- Build production Docker images - verify work correctly
- Review all documentation for completeness
- Check all hyperlinks in documentation work
- Verify no TODO comments or debug code left in codebase

**Dependencies:** All previous subplans (1-8)

---

This completes the breakdown of the development plan into 9 independent, self-contained subplans. Each can be executed by a developer or AI assistant with all necessary context provided.