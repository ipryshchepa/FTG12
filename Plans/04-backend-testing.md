## Subplan 4: Backend Testing Infrastructure

**Status:** 🔄 Updated to reflect actual implementation from Subplans 2 & 3

**Context:** Implement comprehensive backend testing infrastructure with xUnit, Moq, and EF InMemory database to achieve minimum 80% code coverage for the Personal Library API. Tests must pass before builds succeed (enforced in build pipeline).

**Testing Requirements:**
- Minimum 80% code coverage for all layers
- Unit tests for repositories, services, validators
- Integration tests for API endpoints
- Mock external dependencies
- Use InMemory database for repository tests
- Use WebApplicationFactory for integration tests
- Use FluentAssertions for readable assertions
- Use async test methods, proper disposal
- Use "Author McAuthorface" for test data
- Use HttpClient from factory, deserialize JSON responses with System.Text.Json

**Current State:**
- Backend implementation complete from Subplan 3 (Services & API Endpoints)
  - 4 Controllers: BooksController, RatingsController, LoansController, ReadingStatusController
  - 8 Repositories: IBookRepository, IRatingRepository, ILoanRepository, IReadingStatusRepository (with implementations)
  - 8 Services: IBookService, IRatingService, ILoanService, IReadingStatusService (with implementations)
  - 5 Validators: CreateBookValidator, UpdateBookValidator, RatingDtoValidator, LoanDtoValidator, ReadingStatusDtoValidator
  - Exception handling: NotFoundException, BadRequestException, BusinessRuleException, GlobalExceptionFilter
  - HTTP test file created: PersonalLibrary.API.http
- No test project exists
- No test infrastructure configured

**Instruction Files to Review:**
- csharp.instructions.md
- personallibrary.instructions.md

**Test Coverage Summary:**

The following components require testing to achieve 80% coverage:

**Repositories (4 implementations):**
- BookRepository: GetAllAsync, GetByIdAsync, CreateAsync, UpdateAsync, DeleteAsync
- RatingRepository: GetByBookIdAsync, CreateAsync, UpdateAsync, DeleteByBookIdAsync
- LoanRepository: GetActiveLoanByBookIdAsync, GetAllActiveLoansAsync, GetLoanHistoryByBookIdAsync, CreateAsync, ReturnLoanAsync
- ReadingStatusRepository: GetByBookIdAsync, CreateAsync, UpdateAsync, DeleteByBookIdAsync

**Services (4 implementations):**
- BookService: GetAllBooksAsync, GetBookByIdAsync, CreateBookAsync, UpdateBookAsync, DeleteBookAsync
- RatingService: CreateOrUpdateRatingAsync, DeleteRatingAsync
- LoanService: CreateLoanAsync, GetLoanHistoryAsync, ReturnBookAsync, GetActiveLoanedBooksAsync
- ReadingStatusService: CreateOrUpdateStatusAsync, DeleteStatusAsync

**Validators (5 implementations):**
- CreateBookValidator, UpdateBookValidator, RatingDtoValidator, LoanDtoValidator, ReadingStatusDtoValidator

**Filters (1 implementation):**
- GlobalExceptionFilter: Exception mapping and ProblemDetails formatting

**Controllers (4 implementations):**
- BooksController: GET all, GET by id, POST, PUT, DELETE (5 endpoints)
- RatingsController: POST, DELETE (2 endpoints)
- LoansController: GET all active, GET history, POST, DELETE (4 endpoints)
- ReadingStatusController: PUT, DELETE (2 endpoints)

**Total:** 13 API endpoints, 21 repository methods, 5 service methods per business entity, 5 validators, 1 filter

**Tasks:**

1. Create test project:
   - Create `Backend/PersonalLibrary.API.Tests/PersonalLibrary.API.Tests.csproj`
   - Target framework: net10.0
   - Reference PersonalLibrary.API project
   - Enable nullable reference types
   - Note: Program.cs must be accessible to tests (make Program class public or use InternalsVisibleTo)

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
   - Test GetAllAsync: verify LEFT JOINs with Ratings, ReadingStatuses, and Loans, null handling, DTO mapping to BookDetailsDto
   - Test GetByIdAsync: verify found and not found scenarios, returns BookDetailsDto
   - Test CreateAsync: verify book created with correct data (Guid Id generated)
   - Test UpdateAsync: verify book updated (all properties)
   - Test DeleteAsync: verify book deleted and cascade behavior (ratings, loans, reading status)

4. Create `Tests/Data/RatingRepositoryTests.cs`:
   - Test GetByBookIdAsync: found and not found (returns Rating entity)
   - Test CreateAsync: verify rating created with Score 1-10 and Notes
   - Test UpdateAsync: verify rating updated (score and notes)
   - Test DeleteByBookIdAsync: verify rating deleted (cascade from book delete)

5. Create `Tests/Data/LoanRepositoryTests.cs`:
   - Test GetActiveLoanByBookIdAsync: verify returns only active loan (IsReturned = false)
   - Test GetAllActiveLoansAsync: verify returns only non-returned loans with book details
   - Test GetLoanHistoryByBookIdAsync: verify returns all loans for a book
   - Test CreateAsync: verify loan created with BorrowedTo, LoanDate, IsReturned = false
   - Test ReturnLoanAsync: verify IsReturned flag set to true, ReturnedDate populated

6. Create `Tests/Data/ReadingStatusRepositoryTests.cs`:
   - Test GetByBookIdAsync: found and not found (returns ReadingStatus entity)
   - Test CreateAsync: verify reading status created with Status enum (Backlog, Completed, Abandoned)
   - Test UpdateAsync: verify reading status updated
   - Test DeleteByBookIdAsync: verify reading status deleted

7. Create `Tests/Services/BookServiceTests.cs`:
   - Mock IBookRepository using Moq
   - Test GetAllBooksAsync: verify repository.GetAllAsync called, returns List<BookDetailsDto>
   - Test GetBookByIdAsync: verify found returns BookDetailsDto, not found throws NotFoundException
   - Test CreateBookAsync: verify Id is null validation, DTO mapped to Book entity, repository.CreateAsync called
   - Test UpdateBookAsync: verify book exists check, Id match validation, update called
   - Test DeleteBookAsync: verify book exists check, deletion called

8. Create `Tests/Services/RatingServiceTests.cs`:
   - Mock IRatingRepository and IBookRepository
   - Test CreateOrUpdateRatingAsync: verify checks for existing rating via GetByBookIdAsync
   - Test CreateOrUpdateRatingAsync when rating exists: verify UpdateAsync called with new score and notes
   - Test CreateOrUpdateRatingAsync when rating doesn't exist: verify CreateAsync called
   - Test CreateOrUpdateRatingAsync with non-existent book: verify throws NotFoundException
   - Test DeleteRatingAsync: verify rating exists check, DeleteByBookIdAsync called
   - Test DeleteRatingAsync with non-existent rating: verify throws NotFoundException

9. Create `Tests/Services/LoanServiceTests.cs`:
   - Mock ILoanRepository and IBookRepository
   - Test CreateLoanAsync: verify book exists check, no active loan check via GetActiveLoanByBookIdAsync
   - Test CreateLoanAsync when book already loaned: verify throws BusinessRuleException (409 Conflict)
   - Test CreateLoanAsync with non-existent book: verify throws NotFoundException
   - Test GetLoanHistoryAsync: verify returns all loans for book via repository
   - Test ReturnBookAsync: verify active loan exists, marks loan as returned via ReturnLoanAsync
   - Test ReturnBookAsync when no active loan: verify throws NotFoundException
   - Test GetActiveLoanedBooksAsync: verify returns only active loans via GetAllActiveLoansAsync

10. Create `Tests/Services/ReadingStatusServiceTests.cs`:
    - Mock IReadingStatusRepository and IBookRepository
    - Test CreateOrUpdateStatusAsync: verify book exists, checks for existing status via GetByBookIdAsync
    - Test CreateOrUpdateStatusAsync when status exists: verify UpdateAsync called
    - Test CreateOrUpdateStatusAsync when status doesn't exist: verify CreateAsync called
    - Test CreateOrUpdateStatusAsync with non-existent book: verify throws NotFoundException
    - Test DeleteStatusAsync: verify status exists check, DeleteByBookIdAsync called
    - Test DeleteStatusAsync with non-existent status: verify throws NotFoundException

11. Create `Tests/Validators/CreateBookValidatorTests.cs`:
    - Test Id validation: must be null for create operations
    - Test Title validation: required, max length 100
    - Test Author validation: required, max length 100
    - Test optional fields: Description (max 500), Notes (max 1000), ISBN (max 20)
    - Test numeric validations: PublishedYear range 1000-2100 (when provided), PageCount positive (when provided)
    - Test enum validation for OwnershipStatus (WantToBuy, Own, SoldOrGaveAway)

11b. Create `Tests/Validators/UpdateBookValidatorTests.cs`:
    - Test Id validation: must NOT be null for update operations
    - Test Title validation: required, max length 100
    - Test Author validation: required, max length 100
    - Test optional fields: Description (max 500), Notes (max 1000), ISBN (max 20)
    - Test numeric validations: PublishedYear range 1000-2100, PageCount positive
    - Test enum validation for OwnershipStatus

12. Create `Tests/Validators/RatingDtoValidatorTests.cs`:
    - Test Score range: minimum 1, maximum 10, required
    - Test Notes max length 1000 (optional field)

13. Create `Tests/Validators/LoanDtoValidatorTests.cs`:
    - Test BorrowedTo: required, max length 100
    - Test valid LoanDto creation

14. Create `Tests/Validators/ReadingStatusDtoValidatorTests.cs`:
    - Test Status: must be valid ReadingStatusEnum value (Backlog, Completed, Abandoned)
    - Test invalid enum values

15. Create `Tests/Integration/ApiTestFixture.cs`:
   - Create custom WebApplicationFactory<Program>
   - Override ConfigureWebHost to use InMemory database instead of SQL Server
   - Replace DbContext registration with InMemory provider for isolated test database
   - Provide methods for seeding test data
   - Implement IDisposable for cleanup
   - Ensure GlobalExceptionFilter is included (already registered in Program.cs)
   - Configure JSON options to match production (camelCase, enum as string)

16. Create `Tests/Integration/BookEndpointsTests.cs`:
   - Use WebApplicationFactory<Program>
   - Test GET /api/books: verify returns 200 OK, List<BookDetailsDto> with flattened structure
   - Test GET /api/books/{id}: verify 200 for existing book, 404 for non-existent
   - Test POST /api/books: verify 201 Created with Location header, Id generated, database updated
   - Test POST /api/books with invalid data (Id not null): verify 400 BadRequest with validation errors
   - Test POST /api/books with missing required fields: verify 400 BadRequest
   - Test PUT /api/books/{id}: verify 204 NoContent, all properties updated in database
   - Test PUT with non-existent id: verify 404 NotFound
   - Test PUT with Id mismatch (route vs body): verify 400 BadRequest
   - Test DELETE /api/books/{id}: verify 204 NoContent, book and related entities removed (cascade)
   - Test DELETE with non-existent id: verify 404 NotFound

17. Create `Tests/Integration/RatingEndpointsTests.cs`:
    - Test POST /api/books/{bookId}/rating: verify creates rating (200 OK with RatingDto)
    - Test POST again to same book: verify updates existing rating (returns updated RatingDto)
    - Test POST with invalid score (<1 or >10): verify 400 BadRequest with validation errors
    - Test POST with non-existent book: verify 404 NotFound
    - Test DELETE /api/books/{bookId}/rating: verify removes rating (204 NoContent)
    - Test DELETE with non-existent rating: verify 404 NotFound

18. Create `Tests/Integration/LoanEndpointsTests.cs`:
    - Test GET /api/loans: verify returns only active loans (200 OK with List<Loan>)
    - Test GET /api/books/{bookId}/loans: verify returns loan history (200 OK with List<Loan>)
    - Test POST /api/books/{bookId}/loan: verify creates loan (201 Created with Location header)
    - Test POST when book already loaned: verify 409 Conflict with BusinessRuleException message
    - Test POST with non-existent book: verify 404 NotFound
    - Test DELETE /api/books/{bookId}/loan: verify marks as returned (204 NoContent), no longer in active loans
    - Test DELETE when not loaned: verify 404 NotFound

19. Create `Tests/Integration/ReadingStatusEndpointsTests.cs`:
    - Test PUT /api/books/{bookId}/reading-status: verify creates/updates status (200 OK with ReadingStatusDto)
    - Test PUT with invalid enum value: verify 400 BadRequest
    - Test PUT with non-existent book: verify 404 NotFound
    - Test DELETE /api/books/{bookId}/reading-status: verify removes status (204 NoContent)
    - Test DELETE with non-existent status: verify 404 NotFound

20. Configure code coverage collection:
    - Add to test project .csproj: `<CoverletOutputFormat>cobertura</CoverletOutputFormat>`
    - Configure coverage thresholds in .csproj or coverlet.runsettings
    - Set minimum: 80% line coverage, 80% branch coverage

21. Create `Backend/coverlet.runsettings`:
    - Configure coverage settings
    - Exclude from coverage:
      - Program.cs (startup/configuration code)
      - Migration files (20260219013944_InitialCreate.cs, etc.)
      - DTOs (BookDto.cs, BookDetailsDto.cs, RatingDto.cs, LoanDto.cs, ReadingStatusDto.cs)
      - Models (Book.cs, Rating.cs, Loan.cs, ReadingStatus.cs - data classes with minimal logic)
      - Exception classes (NotFoundException.cs, BadRequestException.cs, BusinessRuleException.cs)
    - Include all other code (Repositories, Services, Controllers, Validators, Filters)

22. Add test execution to build pipeline:
    - Consider pre-build event in .csproj or CI/CD configuration
    - Configure to fail build if tests fail or coverage below threshold
    - Example: Add target in test project to enforce coverage minimums

23. Configure test output and reporting:
    - Configure test logger for readable output
    - Generate HTML coverage report (optional - use ReportGenerator tool)
    - Install ReportGenerator: `dotnet tool install -g dotnet-reportgenerator-globaltool`
    - Generate report: `reportgenerator -reports:**/coverage.cobertura.xml -targetdir:coveragereport -reporttypes:Html`

24. Update solution file to include test project:
    - Add PersonalLibrary.API.Tests to PersonalLibrary.slnx
    - Verify solution builds and tests run from solution level

**Verification:**
- Run all tests: `dotnet test` from Backend directory - all should pass
- Run with coverage: `dotnet test --collect:"XPlat Code Coverage"` - verify >80%
- Check coverage report in `TestResults/` folder
- Verify test execution time reasonable (under 30 seconds for all tests)
- Run specific test class: `dotnet test --filter BookServiceTests` - verify filtering works
- Run specific test method: `dotnet test --filter "FullyQualifiedName~CreateBookAsync"` - verify works
- Intentionally break a test - verify test run fails and build can be configured to fail
- Review coverage report - identify any gaps under 80% and add tests if needed
- Compare integration tests with `PersonalLibrary.API.http` manual tests for consistency
- Verify all API endpoints from Subplan 3 result have corresponding integration tests:
  - GET /api/books → BookEndpointsTests
  - GET /api/books/{id} → BookEndpointsTests
  - POST /api/books → BookEndpointsTests
  - PUT /api/books/{id} → BookEndpointsTests
  - DELETE /api/books/{id} → BookEndpointsTests
  - POST /api/books/{bookId}/rating → RatingEndpointsTests
  - DELETE /api/books/{bookId}/rating → RatingEndpointsTests
  - GET /api/loans → LoanEndpointsTests
  - GET /api/books/{bookId}/loans → LoanEndpointsTests
  - POST /api/books/{bookId}/loan → LoanEndpointsTests
  - DELETE /api/books/{bookId}/loan → LoanEndpointsTests
  - PUT /api/books/{bookId}/reading-status → ReadingStatusEndpointsTests
  - DELETE /api/books/{bookId}/reading-status → ReadingStatusEndpointsTests

**Dependencies:** 
- ✅ Subplan 2 (Data Layer) - Complete
- ✅ Subplan 3 (Services & API Endpoints) - Complete
