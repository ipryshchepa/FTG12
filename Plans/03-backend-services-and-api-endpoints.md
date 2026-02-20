## Subplan 3: Backend Services & API Endpoints

**Context:** Implement repository pattern, business logic services, and RESTful API endpoints using ASP.NET Core ApiController classes for the Personal Library application. This includes all CRUD operations and specialized operations for ratings, loans, and reading status management.

**Prerequisites from Previous Subplans:**
- Data layer complete with entities, DbContext, DTOs, validators
- Database schema created via EF migrations

**DTO Strategy (from Subplan 2):**
- **BookDto**: Write operations (POST/PUT) - has nullable Id (null for create, populated for update)
- **BookDetailsDto**: Read operations (GET) - flat structure with all book properties plus flattened related entities (Score, RatingNotes, ReadingStatus, Loanee, LoanDate)
- Same BookDetailsDto used for both grid list and individual book details
- Related entity DTOs: RatingDto, ReadingStatusDto, LoanDto for their respective endpoints

**API Requirements:**

**Books:**
- GET /api/books - List all books (returns BookDetailsDto with flattened related data)
- GET /api/books/{id} - Get detailed book information (returns BookDetailsDto - same structure as list)
- POST /api/books - Create new book (accepts BookDto with Id=null)
- PUT /api/books/{id} - Update book details (accepts BookDto with Id matching route)
- DELETE /api/books/{id} - Delete book (cascade delete related data)

**Ratings (one per book - create or update):**
- POST /api/books/{id}/rating - Create or update rating
- DELETE /api/books/{id}/rating - Delete rating

**Loans:**
- GET /api/loans - Get all currently loaned books
- GET /api/books/{id}/loans - Get loan history for a specific book (all loans, active and returned)
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
- Data layer complete from Subplan 2:
  - Entity models: Book, Rating, ReadingStatus, Loan with proper relationships
  - Enums: OwnershipStatus, ReadingStatusEnum
  - DTOs: BookDto (write), BookDetailsDto (read - flat structure), RatingDto, ReadingStatusDto, LoanDto
  - Validators: CreateBookValidator, UpdateBookValidator, RatingDtoValidator, LoanDtoValidator, ReadingStatusDtoValidator
  - DbContext configured with indexes, constraints, and cascade deletes
  - Initial migration created and applied
- FluentValidation registered in Program.cs
- DbContext registered with SQL Server connection
- Program.cs has CORS, OpenAPI, and health check configured

**Instruction Files to Review:**
- csharp.instructions.md
- personallibrary.instructions.md

**Tasks:**

1. Create `Data/IBookRepository.cs`:
   - Interface methods: GetAllAsync(), GetByIdAsync(Guid), CreateAsync(Book), UpdateAsync(Book), DeleteAsync(Guid)

2. Create `Data/BookRepository.cs`:
   - Implement IBookRepository using LibraryDbContext
   - GetAllAsync: join with Rating, ReadingStatus, active Loan to return List<BookDetailsDto> (flat structure)
   - GetByIdAsync: include all related entities, map to BookDetailsDto, return null if not found
   - CreateAsync: add book to context, save changes, return created book
   - UpdateAsync: update book in context, save changes
   - DeleteAsync: remove book from context (cascade deletes handled by EF), save changes
   - Use async/await with EF Core, proper null handling
   - Both grid and detail views use same BookDetailsDto

3. Create `Data/IRatingRepository.cs`:
   - Interface methods: GetByBookIdAsync(Guid), CreateAsync(Rating), UpdateAsync(Rating), DeleteByBookIdAsync(Guid)

4. Create `Data/RatingRepository.cs`:
   - Implement IRatingRepository
   - GetByBookIdAsync: find existing rating for book
   - DeleteByBookIdAsync: find and remove rating

5. Create `Data/ILoanRepository.cs`:
   - Interface methods: GetActiveLoanByBookIdAsync(Guid), GetAllActiveLoansAsync(), GetLoanHistoryByBookIdAsync(Guid), CreateAsync(Loan), ReturnLoanAsync(Guid bookId)

6. Create `Data/LoanRepository.cs`:
   - Implement ILoanRepository
   - GetActiveLoanByBookIdAsync: find loan where IsReturned = false, return null if not found
   - GetAllActiveLoansAsync: return List<Loan> with all active loans including book details
   - GetLoanHistoryByBookIdAsync: return List<Loan> for a book (both active and returned), ordered by LoanDate descending
   - CreateAsync: add loan to context, save changes
   - ReturnLoanAsync: find active loan, set IsReturned = true, set ReturnedDate = DateTime.UtcNow, save changes

7. Create `Data/IReadingStatusRepository.cs`:
   - Interface methods: GetByBookIdAsync(Guid), CreateAsync(ReadingStatus), UpdateAsync(ReadingStatus), DeleteByBookIdAsync(Guid)

8. Create `Data/ReadingStatusRepository.cs`:
   - Implement IReadingStatusRepository similar to RatingRepository pattern

9. Create `Services/IBookService.cs`:
   - Interface methods corresponding to business operations:
   - Task<List<BookDetailsDto>> GetAllBooksAsync()
   - Task<BookDetailsDto?> GetBookByIdAsync(Guid id)
   - Task<BookDetailsDto> CreateBookAsync(BookDto bookDto)
   - Task UpdateBookAsync(Guid id, BookDto bookDto)
   - Task DeleteBookAsync(Guid id)

10. Create `Services/BookService.cs`:
    - Implement IBookService
    - Inject IBookRepository
    - Map BookDto to Book entity and Book/related entities to BookDetailsDto
    - CreateBookAsync: verify BookDto.Id is null (throw BadRequestException if not), map to Book entity, call repository CreateAsync, return BookDetailsDto
    - UpdateBookAsync: verify BookDto.Id matches route id and book exists (throw NotFoundException if not), map to Book entity, call repository UpdateAsync
    - DeleteBookAsync: verify book exists (throw NotFoundException if not), call repository DeleteAsync
    - GetBookByIdAsync: call repository, throw NotFoundException if null
    - GetAllBooksAsync: call repository, return list
    - Use async/await patterns
    - Note: FluentValidation validators will be triggered automatically by ApiController, not called manually in service

11. Create `Services/IRatingService.cs`:
    - Interface methods: CreateOrUpdateRatingAsync(Guid bookId, RatingDto), DeleteRatingAsync(Guid bookId)

12. Create `Services/RatingService.cs`:
    - Implement IRatingService
    - Inject IRatingRepository, IBookRepository
    - CreateOrUpdateRatingAsync: check if rating exists by BookId, update if exists, create if not
    - Validate book exists before creating rating

13. Create `Services/ILoanService.cs`:
    - Interface methods: 
    - Task<List<Loan>> GetActiveLoanedBooksAsync()
    - Task<List<Loan>> GetLoanHistoryAsync(Guid bookId)
    - Task CreateLoanAsync(Guid bookId, LoanDto loanDto)
    - Task ReturnBookAsync(Guid bookId)

14. Create `Services/LoanService.cs`:
    - Implement ILoanService
    - Inject ILoanRepository, IBookRepository
    - GetActiveLoanedBooksAsync: return list from repository
    - GetLoanHistoryAsync: verify book exists (throw NotFoundException if not), return List<Loan> from repository
    - CreateLoanAsync: verify book exists, verify no active loan exists for book (throw BusinessRuleException if already loaned), create Loan entity, call repository CreateAsync
    - ReturnBookAsync: verify active loan exists (throw NotFoundException if not), call repository ReturnLoanAsync

15. Create `Services/IReadingStatusService.cs`:
    - Interface methods: CreateOrUpdateReadingStatusAsync(Guid bookId, ReadingStatusDto), DeleteReadingStatusAsync(Guid bookId)

16. Create `Services/ReadingStatusService.cs`:
    - Implement IReadingStatusService similar to RatingService pattern

17. Create `Filters/GlobalExceptionFilter.cs`:
    - Global exception handling filter inheriting from IExceptionFilter
    - Catch exceptions: NotFoundException (404), ValidationException (400), DbUpdateException (409), generic Exception (500)
    - Return ProblemDetails JSON with appropriate status codes
    - Log exceptions, sanitize error messages for production (don't expose stack traces)

18. Create custom exception classes in `Exceptions/` folder:
    - `NotFoundException.cs` - inherits from Exception, for 404 scenarios
    - `BusinessRuleException.cs` - inherits from Exception, for business logic violations (e.g., book already loaned)
    - `BadRequestException.cs` - inherits from Exception, for invalid requests (e.g., Id mismatch)

19. Update Program.cs - Dependency Injection:
    - Register DbContext (already registered from Subplan 2)
    - Register all repositories with scoped lifetime: AddScoped<IBookRepository, BookRepository>(), etc.
    - Register all services with scoped lifetime: AddScoped<IBookService, BookService>(), etc.
    - FluentValidation already registered from Subplan 2
    - Add controllers: builder.Services.AddControllers(options => { options.Filters.Add<GlobalExceptionFilter>(); })
    - Configure JSON options for enum string conversion and camelCase
    - After app.Build(): app.MapControllers()

20. Create `Controllers/BooksController.cs`:
    - ApiController class with [ApiController] and [Route("api/books")] attributes (lowercase for consistency)
    - Inherit from ControllerBase
    - Inject IBookService via constructor
    - [HttpGet] GetAll() - return ActionResult<List<BookDetailsDto>>, call service.GetAllBooksAsync()
    - [HttpGet("{id}")] GetById(Guid id) - return ActionResult<BookDetailsDto>, call service.GetBookByIdAsync(id)
    - [HttpPost] Create([FromBody] BookDto bookDto) - call service.CreateBookAsync(), return CreatedAtAction(nameof(GetById), new { id = result.Id }, result)
    - [HttpPut("{id}")] Update(Guid id, [FromBody] BookDto bookDto) - ensure bookDto.Id = id before calling service, return NoContent()
    - [HttpDelete("{id}")] Delete(Guid id) - call service.DeleteBookAsync(id), return NoContent()
    - Add XML documentation comments for Swagger (/// <summary>...)
    - Use [ProducesResponseType] attributes: [ProducesResponseType(200)], [ProducesResponseType(404)], etc.

21. Create `Controllers/RatingsController.cs`:
    - ApiController class with [ApiController] and [Route("api/books/{bookId}/rating")] attributes  
    - Inherit from ControllerBase
    - Inject IRatingService via constructor
    - [HttpPost] CreateOrUpdate(Guid bookId, [FromBody] RatingDto ratingDto) - call service.CreateOrUpdateRatingAsync(bookId, ratingDto), return Ok()
    - [HttpDelete] Delete(Guid bookId) - call service.DeleteRatingAsync(bookId), return NoContent()
    - Add XML documentation (/// <summary>...) and [ProducesResponseType] attributes

22. Create `Controllers/LoansController.cs`:
    - ApiController class with [ApiController] attribute (no controller-level Route, use method-level routes)
    - Inherit from ControllerBase
    - Inject ILoanService via constructor
    - [HttpGet("api/loans")] GetActiveLoans() - return ActionResult<List<Loan>>, call service.GetActiveLoanedBooksAsync()
    - [HttpGet("api/books/{bookId}/loans")] GetLoanHistory(Guid bookId) - return ActionResult<List<Loan>>, call service.GetLoanHistoryAsync(bookId)
    - [HttpPost("api/books/{bookId}/loan")] CreateLoan(Guid bookId, [FromBody] LoanDto loanDto) - call service.CreateLoanAsync(), return Created()
    - [HttpDelete("api/books/{bookId}/loan")] ReturnBook(Guid bookId) - call service.ReturnBookAsync(bookId), return NoContent()
    - Add XML documentation (/// <summary>...) and [ProducesResponseType] attributes

23. Create `Controllers/ReadingStatusController.cs`:
    - ApiController class with [ApiController] and [Route("api/books/{bookId}/reading-status")] attributes
    - Inherit from ControllerBase
    - Inject IReadingStatusService via constructor
    - [HttpPut] Update(Guid bookId, [FromBody] ReadingStatusDto statusDto) - call service.CreateOrUpdateReadingStatusAsync(bookId, statusDto), return Ok()
    - [HttpDelete] Delete(Guid bookId) - call service.DeleteReadingStatusAsync(bookId), return NoContent()
    - Add XML documentation (/// <summary>...) and [ProducesResponseType] attributes

24. Verify Program.cs - Controller registration:
    - Ensure `builder.Services.AddControllers()` is called (added in task 19)
    - Ensure `app.MapControllers()` is called (added in task 19)
    - Controllers automatically discovered and registered
    - Ensure CORS configured before MapControllers()

25. Create or update PersonalLibrary.API.http:
    - Replace existing content
    - Add sample HTTP requests for all endpoints
    - Include example request bodies with valid JSON
    - Add comments explaining each request
    - Group by resource (Books, Ratings, Loans, ReadingStatus)

26. Configure model validation:
    - FluentValidation already registered from Subplan 2 with assembly scanning
    - ApiController attribute provides automatic model state validation
    - Ensure FluentValidation configured to validate automatically: builder.Services.AddFluentValidationAutoValidation() (if not already done in Subplan 2)
    - Validators (CreateBookValidator for POST, UpdateBookValidator for PUT) will be triggered automatically based on validator rules
    - ApiController automatically returns 400 BadRequest with validation errors in ProblemDetails format
    - No manual validation needed in controllers or services

27. Add AutoMapper (optional but recommended):
    - Install NuGet package `AutoMapper.Extensions.Microsoft.DependencyInjection`
    - Create `Mappings/MappingProfile.cs` with mappings:
      - BookDto → Book (for create/update)
      - Book → BookDetailsDto (with flattened Rating, ReadingStatus, active Loan)
    - Register in Program.cs with `builder.Services.AddAutoMapper(typeof(Program))`
    - Update services and repositories to use AutoMapper instead of manual mapping

**Verification:**
- Build project: `dotnet build` - should succeed with no errors
- Run application: `dotnet run` - should start successfully
- Access Swagger UI: `http://localhost:5274/swagger` - verify all endpoints documented with correct routes and response types

**Test using PersonalLibrary.API.http - BooksController:**

1. **GET /api/books** - Get all books
   - Expected: 200 OK with List<BookDetailsDto> (may be empty initially)
   
2. **POST /api/books** - Create book (valid)
   - Body: BookDto with Id=null, valid Title, Author, OwnershipStatus
   - Expected: 201 Created with Location header, returns BookDetailsDto with generated Id
   
3. **POST /api/books** - Create book (invalid - Id provided)
   - Body: BookDto with Id=<some-guid>
   - Expected: 400 BadRequest with validation error "Id must be null for creation"
   
4. **POST /api/books** - Create book (invalid - missing Title)
   - Body: BookDto with Id=null, Title="", Author=valid
   - Expected: 400 BadRequest with validation error "Title is required"
   
5. **POST /api/books** - Create book (invalid - Title too long)
   - Body: BookDto with Title > 100 chars
   - Expected: 400 BadRequest with validation error "Title max length 100"
   
6. **GET /api/books** - Get all books (after creation)
   - Expected: 200 OK with List<BookDetailsDto> containing created book with flattened related data
   
7. **GET /api/books/{id}** - Get book by id (valid)
   - Use Id from created book
   - Expected: 200 OK with BookDetailsDto (same structure as list item)
   
8. **GET /api/books/{id}** - Get book by id (not found)
   - Use non-existent Guid
   - Expected: 404 Not Found with ProblemDetails
   
9. **PUT /api/books/{id}** - Update book (valid)
   - Body: BookDto with Id matching route, updated Title/Author
   - Expected: 204 No Content
   
10. **PUT /api/books/{id}** - Update book (invalid - Id null)
    - Body: BookDto with Id=null
    - Expected: 400 BadRequest with validation error "Id is required for update"
    
11. **PUT /api/books/{id}** - Update book (invalid - Id mismatch)
    - Body: BookDto with Id different from route parameter
    - Expected: 400 BadRequest or service validation error
    
12. **PUT /api/books/{id}** - Update book (not found)
    - Use non-existent Guid in route
    - Expected: 404 Not Found
    
13. **GET /api/books/{id}** - Verify update applied
    - Use updated book Id
    - Expected: 200 OK with updated data visible

**Test RatingsController:**

14. **POST /api/books/{bookId}/rating** - Create rating (valid)
    - Body: RatingDto with Score=8, Notes="Great book"
    - Expected: 200 OK or 201 Created
    
15. **POST /api/books/{bookId}/rating** - Create rating (invalid - Score out of range)
    - Body: RatingDto with Score=11
    - Expected: 400 BadRequest with validation error "Score must be between 1-10"
    
16. **POST /api/books/{bookId}/rating** - Create rating (book not found)
    - Use non-existent bookId
    - Expected: 404 Not Found
    
17. **GET /api/books/{id}** - Verify rating added
    - Expected: 200 OK with BookDetailsDto showing Score and RatingNotes fields populated
    
18. **POST /api/books/{bookId}/rating** - Update existing rating
    - Body: RatingDto with Score=10, Notes="Updated - excellent!"
    - Expected: 200 OK (rating updated, not created again)
    
19. **GET /api/books/{id}** - Verify rating updated (not duplicated)
    - Expected: 200 OK with updated Score=10 and new RatingNotes
    
20. **DELETE /api/books/{bookId}/rating** - Delete rating
    - Expected: 204 No Content
    
21. **DELETE /api/books/{bookId}/rating** - Delete rating (book not found)
    - Use non-existent bookId
    - Expected: 404 Not Found
    
22. **GET /api/books/{id}** - Verify rating removed
    - Expected: 200 OK with Score=null, RatingNotes=null

**Test LoansController:**

23. **GET /api/loans** - Get active loans (initially empty)
    - Expected: 200 OK with empty List<Loan>
    
24. **POST /api/books/{bookId}/loan** - Create loan (valid)
    - Body: LoanDto with BorrowedTo="Alice Smith"
    - Expected: 201 Created
    
25. **POST /api/books/{bookId}/loan** - Create loan (invalid - BorrowedTo empty)
    - Body: LoanDto with BorrowedTo=""
    - Expected: 400 BadRequest with validation error
    
26. **POST /api/books/{bookId}/loan** - Create loan (book not found)
    - Use non-existent bookId
    - Expected: 404 Not Found
    
27. **GET /api/books/{id}** - Verify loan added
    - Expected: 200 OK with Loanee="Alice Smith" and LoanDate populated
    
28. **GET /api/loans** - Get active loans (after creation)
    - Expected: 200 OK with List<Loan> containing loaned book
    
29. **POST /api/books/{bookId}/loan** - Create loan (already loaned)
    - Try to loan same book again
    - Expected: 409 Conflict with BusinessRuleException message
    
30. **GET /api/books/{bookId}/loans** - Get loan history
    - Expected: 200 OK with List<Loan> containing current active loan
    
31. **GET /api/books/{bookId}/loans** - Get loan history (book not found)
    - Use non-existent bookId
    - Expected: 404 Not Found
    
32. **DELETE /api/books/{bookId}/loan** - Return book
    - Expected: 204 No Content
    
33. **DELETE /api/books/{bookId}/loan** - Return book (no active loan)
    - Try to return same book again
    - Expected: 404 Not Found or appropriate error
    
34. **GET /api/books/{id}** - Verify loan returned
    - Expected: 200 OK with Loanee=null, LoanDate=null
    
35. **GET /api/loans** - Get active loans (after return)
    - Expected: 200 OK with empty list (book no longer loaned)
    
36. **GET /api/books/{bookId}/loans** - Get loan history (after return)
    - Expected: 200 OK with List<Loan> containing returned loan (IsReturned=true, ReturnedDate populated)

**Test ReadingStatusController:**

37. **PUT /api/books/{bookId}/reading-status** - Set reading status (valid)
    - Body: ReadingStatusDto with Status=Completed
    - Expected: 200 OK or 201 Created
    
38. **PUT /api/books/{bookId}/reading-status** - Set status (invalid - invalid enum)
    - Body: invalid status value
    - Expected: 400 BadRequest with validation error
    
39. **PUT /api/books/{bookId}/reading-status** - Set status (book not found)
    - Use non-existent bookId
    - Expected: 404 Not Found
    
40. **GET /api/books/{id}** - Verify reading status added
    - Expected: 200 OK with ReadingStatus=Completed
    
41. **PUT /api/books/{bookId}/reading-status** - Update reading status
    - Body: ReadingStatusDto with Status=Abandoned
    - Expected: 200 OK (status updated, not duplicated)
    
42. **GET /api/books/{id}** - Verify reading status updated
    - Expected: 200 OK with ReadingStatus=Abandoned
    
43. **DELETE /api/books/{bookId}/reading-status** - Delete reading status
    - Expected: 204 No Content
    
44. **DELETE /api/books/{bookId}/reading-status** - Delete status (book not found)
    - Use non-existent bookId
    - Expected: 404 Not Found
    
45. **GET /api/books/{id}** - Verify reading status removed
    - Expected: 200 OK with ReadingStatus=null

**Test Cascade Delete:**

46. **Create book with rating, loan history, and reading status**
    - Create book, add rating, loan it, return it, set reading status
    
47. **DELETE /api/books/{id}** - Delete book
    - Expected: 204 No Content
    
48. **GET /api/books/{id}** - Verify book deleted
    - Expected: 404 Not Found
    
49. **Verify related data cascade deleted**
    - Check database: ratings, loans, reading statuses for deleted book should also be removed

**Additional Verification:**
- All validation errors return 400 BadRequest with clear, structured validation messages in ProblemDetails format
- All 404 responses return ProblemDetails with appropriate error messages
- 409 Conflict includes clear business rule violation message
- Response JSON uses camelCase for property names
- Enum values serialized as strings (not integers)
- All Guid parameters parsed correctly
- Check database tables after operations to ensure data persisted correctly
- Swagger UI shows all endpoints with correct HTTP methods, routes, and response types
- XML documentation comments visible in Swagger UI

**Dependencies:** Subplan 2 (Data Layer)
