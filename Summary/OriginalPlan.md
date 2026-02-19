Plan: Personal Library App Development
Building a full-stack Personal Library application with ASP.NET Core 10 backend, React 19 frontend, and MS SQL database. The app manages books with ratings, reading status, and loan tracking. Each book has one current rating and one reading status (updateable). Full stack will be containerized (DB, API, Frontend in separate Docker containers). Testing infrastructure with 80% coverage requirement enforced before builds.

Steps

Phase 1: Infrastructure & Database Setup
Create Docker Compose configuration - Add docker-compose.yml at repo root with services for: SQL Server 2022, Backend API, Frontend. Include environment variables, port mappings, and volume mounts for database persistence.

Add Dockerfile for Backend API - Create Backend/PersonalLibrary.API/Dockerfile for multi-stage .NET 10 build and runtime. Include health checks and proper user permissions.

Add Dockerfile for Frontend - Create Frontend/Dockerfile for multi-stage Node build (Vite) with nginx serving production build.

Configure connection string - Update appsettings.json and appsettings.Development.json with SQL Server connection string. Use environment variable substitution for Docker.

Add .dockerignore files - Create .dockerignore in Backend and Frontend directories to exclude node_modules, bin, obj folders.

Phase 2: Backend Data Layer
Create project structure - Add folders to PersonalLibrary.API: Models/, Data/, DTOs/, Services/, Validators/, Extensions/.

Create entity models - In Models/, create: Book.cs (with all properties from data model), Rating.cs, Loan.cs, ReadingStatus.cs. Define enums: OwnershipStatus (WantToBuy, Own, SoldOrGaveAway), ReadingStatusEnum (Backlog, Completed, Abandoned). Configure relationships and constraints.

Create DbContext - Create Data/LibraryDbContext.cs extending DbContext. Configure entity relationships (Book 1:0-1 Rating, Book 1:0-1 ReadingStatus, Book 1:N Loans). Add unique constraints on Rating.BookId and ReadingStatus.BookId. Configure value conversions for enums, max lengths, required fields.

Create initial migration - Generate and verify EF Core migration with dotnet ef migrations add InitialCreate. Review migration file for correctness.

Create DTOs - In DTOs/, create: BookDto, BookDetailDto, CreateBookDto, UpdateBookDto, RatingDto, LoanDto, ReadingStatusDto, BookGridRowDto (flattened for grid display with Score, ReadingStatus, Loanee).

Create validators - In Validators/, create FluentValidation validators for each create/update DTO. Validate max lengths, required fields, score range (1-10), year ranges, URL format.

Phase 3: Backend Service Layer
Create repository interfaces - In Data/, create IBookRepository.cs, IRatingRepository.cs, ILoanRepository.cs, IReadingStatusRepository.cs with CRUD and query methods.

Implement repositories - In Data/, create repository implementations with async methods using EF Core. Include methods like GetBooksForGridAsync() (with joins for grid display), GetLoanedBooksAsync().

Create service interfaces - In Services/, create IBookService.cs, IRatingService.cs, ILoanService.cs, IReadingStatusService.cs with business logic methods.

Implement services - In Services/, create service implementations containing business logic: validation, entity mapping, orchestrating repository calls. For rating/status updates: check if exists by BookId and update, or create new.

Add error handling middleware - In Extensions/, create ExceptionMiddleware.cs for global exception handling. Return problem details JSON with appropriate status codes, sanitized error messages.

Phase 4: Backend API Endpoints
Update Program.cs for DI and middleware - In Program.cs, register: DbContext with SQL Server, repositories, services, validators, automapper/mapping config. Add exception middleware, validation middleware.

Create Books API endpoints - In Extensions/BookEndpoints.cs, define minimal API endpoints:

GET /api/books - return all books for grid
GET /api/books/{id} - return detailed book info
POST /api/books - create book with validation
PUT /api/books/{id} - update book details
DELETE /api/books/{id} - soft delete or hard delete book
Create Ratings API endpoints - In Extensions/RatingEndpoints.cs:
POST /api/books/{id}/rating - create or update rating
DELETE /api/books/{id}/rating - delete rating
Create Loans API endpoints - In Extensions/LoanEndpoints.cs:
GET /api/loans - return loaned books
POST /api/books/{id}/loan - create loan
DELETE /api/books/{id}/loan - return book (delete loan)
Create ReadingStatus API endpoints - In Extensions/ReadingStatusEndpoints.cs:
PUT /api/books/{id}/reading-status - create or update reading status
DELETE /api/books/{id}/reading-status - clear reading status
Update .http file - Replace PersonalLibrary.API.http with test requests for all endpoints with sample payloads.
Phase 5: Backend Testing
Create test project - Add Backend/PersonalLibrary.API.Tests/PersonalLibrary.API.Tests.csproj with xUnit, Moq, FluentAssertions, EF InMemory database, Microsoft.AspNetCore.Mvc.Testing packages.

Create unit tests for repositories - In Tests/Data/, create test classes for each repository testing CRUD operations, queries, edge cases with InMemory database.

Create unit tests for services - In Tests/Services/, create test classes mocking repositories, testing business logic, validation, error scenarios.

Create integration tests for API - In Tests/Integration/, create WebApplicationFactory and test classes for each endpoint group testing: successful requests, validation errors, not found scenarios, database state changes.

Add code coverage configuration - Add coverlet.collector to test project. Create Directory.Build.props or update .csproj to generate coverage reports. Target 80% minimum.

Configure test execution in build - Update PersonalLibrary.API.csproj to run tests before build with dotnet test as pre-build event or through build target.

Phase 6: Frontend Infrastructure
Install frontend dependencies - Add to package.json: react-router-dom v7+, vitest v3+, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, coverage reporters.

Configure Vitest - Update vite.config.js with test configuration: jsdom environment, globals, setupFiles. Create src/setupTests.js for test utilities.

Add test scripts - Update package.json with scripts: test, test:ui, test:coverage, test:watch. Configure coverage thresholds (80% branches, functions, lines, statements).

Configure environment variables - Create Frontend/.env.development and Frontend/.env.production with VITE_API_URL for backend endpoint. Create .env.example template.

Add React Router - Create src/router/index.jsx with createBrowserRouter defining routes: / (Dashboard), /loans (Loaned Books). Wrap <RouterProvider> in main.jsx.

Configure build for tests - Update package.json build script to run tests first: "build": "npm test && vite build".

Phase 7: Frontend Components & Services
Create API service layer - In src/services/, create api.js (base fetch wrapper with error handling), bookService.js (books CRUD), ratingService.js, loanService.js, readingStatusService.js.

Create shared components - In src/components/shared/, create:

Modal.jsx - reusable modal wrapper using Materialize
Button.jsx - standardized button component
FormInput.jsx - input with validation display
LoadingSpinner.jsx
ErrorMessage.jsx
Create book components - In src/components/books/, create:
BookGrid.jsx - table displaying books with action buttons
BookDetailsModal.jsx - editable form for book details
AddBookModal.jsx - form for creating books
RateBookModal.jsx - 10-star rating input with notes
LoanBookModal.jsx - borrower name input
UpdateReadingStatusModal.jsx - status dropdown
DeleteBookConfirmation.jsx - confirmation dialog
Create navigation component - In src/components/, create Navigation.jsx with links to Dashboard and Loaned Books pages using <Link> from react-router-dom.

Create Dashboard page - In src/pages/, create Dashboard.jsx orchestrating: fetching books, rendering BookGrid, handling "Add Book" button, managing modal states, refreshing grid after actions.

Create Loaned Books page - In src/pages/, create LoanedBooks.jsx with: fetching loaned books, rendering grid with Title/Author/Loanee columns, "Return" action button, refreshing after returns.

Update App component - Refactor App.jsx to render Navigation and Outlet for routed pages. Move landing page content to separate Home.jsx or remove if Dashboard is home.

Add custom hooks - In src/hooks/, create:

useBooks.js - fetching and managing books state
useModal.js - modal open/close state management
useToast.js - Materialize toast notifications
Style consistency - Update App.css and index.css with consistent Materialize theme customization, grid styling, modal styling, responsive breakpoints.
Phase 8: Frontend Testing
Create component unit tests - In src/components/**/*.test.jsx, create tests for all components: rendering, user interactions, prop variations, accessibility.

Create service tests - In src/services/**/*.test.js, create tests mocking fetch API, testing request construction, response parsing, error handling.

Create hook tests - In src/hooks/**/*.test.js, create tests using @testing-library/react-hooks or component wrappers.

Create page integration tests - In src/pages/**/*.test.jsx, create tests mocking API services, testing full user flows: adding books, rating, loaning, deleting.

Add E2E test setup - Install Playwright or Cypress. Create E2E tests in Frontend/e2e/ testing complete user journeys with real API calls.

Phase 9: CI/CD Pipeline
Create GitHub Actions workflow - Create .github/workflows/ci.yml with jobs:
Backend: restore, build, test, coverage report
Frontend: install, test with coverage, build
Docker: build all images
Quality gates: fail if coverage < 80%, fail if tests fail
Add branch protection rules - Configure main branch: require PR reviews, require status checks (CI passing), require up-to-date branches.

Create deployment workflow - Create .github/workflows/deploy.yml (if deployment target identified) for pushing images to container registry, deploying to hosting platform.

Add code quality tools - Add SonarCloud or CodeQL for security scanning, Dependabot for dependency updates.

Phase 10: Documentation & Polish
Update README - Update README.md with: complete setup instructions, Docker commands, environment variables, API documentation link, testing commands, contribution guidelines.

Add API documentation - Ensure Swagger/OpenAPI at /swagger is complete with descriptions, examples, response schemas.

Add database seeding - Create Data/DbInitializer.cs to seed sample data for development (disabled in production).

Add logging - Configure Serilog or structured logging in Program.cs with file and console sinks.

Security hardening - Review CORS configuration, add rate limiting, add request size limits, enable HTTPS redirect for production, add security headers middleware.

Performance optimization - Add response caching for GET endpoints, enable gzip compression, optimize EF queries with includes/projections, add database indexes.

Verification

Run complete stack:

Backend verification:

Navigate to http://localhost:5274/swagger - verify all endpoints documented
Run dotnet test --collect:"XPlat Code Coverage" from Backend directory - verify >80% coverage
Test all endpoints via Swagger or .http file
Frontend verification:

Navigate to http://localhost:5173 - verify app loads
Run npm test -- --coverage from Frontend directory - verify >80% coverage
Test all user flows: add book, rate, loan, update status, delete
Integration verification:

Create book via UI, verify in database
Loan book, verify in Loaned Books page
Return book, verify removed from Loaned Books
Delete book, verify removed from Dashboard
CI/CD verification:

Create PR, verify all checks pass
Verify coverage reports generated
Verify Docker images build successfully
Decisions

Data model: Keep separate tables (Rating, ReadingStatus, Loan) as specified with unique constraints on BookId for Rating and ReadingStatus to enforce one-per-book. Loans can be multiple per book over time but only one active loan (add IsReturned or ReturnedDate column).
Architecture: Minimal APIs with repository pattern, no MediatR/CQRS for simplicity while maintaining testability.
Frontend state: React Query not added initially - use custom hooks with useState/useEffect, can refactor later if needed.
Grid library: Use Materialize tables/collections - native and sufficient for requirements, avoid heavy grid libraries.
Validation: Use FluentValidation on backend, native HTML5 + custom validation on frontend.
Error handling: Global exception middleware on backend, error boundaries for React components.
Testing: Focus on unit tests for logic, integration tests for endpoints, E2E tests for critical paths to achieve coverage targets.
This plan should take approximately 60-80 hours of development time distributed across 10 phases. Each task is atomic and can be implemented independently within its phase. The plan enforces all requirements from the instruction files including 80% coverage, security practices, and quality gates.