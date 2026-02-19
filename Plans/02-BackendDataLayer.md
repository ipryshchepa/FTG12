# Subplan 2: Backend Data Layer

**Context:** Create Entity Framework Core data layer for Personal Library application including entity models, DbContext, relationships, and initial migration. Backend uses ASP.NET Core 10 with EF Core 10 and SQL Server.

## Data Model Requirements

### Book
- Id (guid, required, primary key)
- Title (string(100), required)
- Author (string(100), required)
- Description (string(500), optional)
- Notes (string(1000), optional)
- ISBN (string(20), optional)
- PublishedYear (int, optional)
- PageCount (int, optional)
- OwnershipStatus (required, enum: Want to buy, Own, Sold/Gave away)

### Rating
- Id (guid, required, primary key)
- BookId (guid, required, foreign key to Book, UNIQUE)
- Score (int, required, range 1-10)
- Notes (string(1000), optional)

### Loan
- Id (guid, required, primary key)
- BookId (guid, required, foreign key to Book)
- BorrowedTo (string(100), required)
- LoanDate (DateTime, required)
- IsReturned (bool, required, default false)
- ReturnedDate (DateTime, optional)

### ReadingStatus
- Id (guid, required, primary key)
- BookId (guid, required, foreign key to Book, UNIQUE)
- Status (required, enum: Backlog, Completed, Abandoned)

## Relationships
- Book 1:0..1 Rating (one book can have zero or one rating)
- Book 1:0..1 ReadingStatus (one book can have zero or one reading status)
- Book 1:N Loan (one book can have multiple loans over time, but only one active)

## Current State
- PersonalLibrary.API has basic API setup
- EF Core packages already installed in PersonalLibrary.API.csproj
- No data layer exists yet
- Connection string configured in previous subplan

## DTO Strategy

**Two-DTO Approach:** Separate DTOs for write operations vs read operations.

**Key Decisions:**
- `BookDto` - contains Book entity properties, used for create and update operations (POST/PUT)
- `BookDetailsDto` - flat DTO with Book properties plus flattened related entity data, used for grid and details page (GET)
- `Id` property is optional (Guid?) in BookDto - null for create, present for update
- Related entities have their own dedicated DTOs (RatingDto, ReadingStatusDto, LoanDto) for standalone create/update operations via separate endpoints

## Tasks

### 1. Create Folder Structure
Create folder structure in PersonalLibrary.API:
- `Models/` - entity classes
- `Data/` - DbContext and repositories
- `DTOs/` - data transfer objects
- `Validators/` - input validation
- `Extensions/` - extension methods

### 2. Create Models/OwnershipStatus.cs
Enum with values: Want to buy, Own, Sold/Gave away
- Use appropriate naming (PascalCase for enum members)

### 3. Create Models/ReadingStatusEnum.cs
Enum with values: Backlog, Completed, Abandoned

### 4. Create Models/Book.cs
- All properties from data model with proper types
- Navigation properties: `Rating?`, `ReadingStatus?`, `ICollection<Loan>`
- Constructor initializing Id with new Guid and Loans collection

### 5. Create Models/Rating.cs
- All properties from data model
- Navigation property: `Book`
- Constructor initializing Id

### 6. Create Models/ReadingStatus.cs
- All properties from data model
- Navigation property: `Book`
- Constructor initializing Id

### 7. Create Models/Loan.cs
- All properties from data model (including IsReturned and ReturnedDate)
- Navigation property: `Book`
- Constructor initializing Id, IsReturned = false

### 8. Create Data/LibraryDbContext.cs
Inherit from `DbContext` and configure:
- DbSet properties for: Books, Ratings, ReadingStatuses, Loans
- Override `OnModelCreating` to configure:
  - Book: required fields, max lengths, default OwnershipStatus
  - Rating: required fields, unique index on BookId, check constraint for Score (1-10)
  - ReadingStatus: required fields, unique index on BookId
  - Loan: required fields, index on IsReturned for querying active loans
  - Relationships: configure foreign keys, cascade delete behaviors
  - Enum conversions: store as strings for readability

### 9. Create DTOs/BookDto.cs
**Write operations DTO**
- Properties: `Guid? Id`, `string Title`, `string Author`, `string? Description`, `string? Notes`, `string? ISBN`, `int? PublishedYear`, `int? PageCount`, `OwnershipStatus OwnershipStatus`
- `Id` is nullable - null/omitted for create, present for update
- Contains all Book entity properties only
- Used for:
  - POST /api/books - book creation (Id null or omitted)
  - PUT /api/books/{id} - book updates (Id populated from route)

### 10. Create DTOs/BookDetailsDto.cs
**Flat read-only DTO for grid display and details page**
- Properties:
  - Book properties: `Guid Id`, `string Title`, `string Author`, `string? Description`, `string? Notes`, `string? ISBN`, `int? PublishedYear`, `int? PageCount`, `OwnershipStatus OwnershipStatus`
  - Flattened Rating: `int? Score`, `string? RatingNotes`
  - Flattened ReadingStatus: `ReadingStatusEnum? ReadingStatus`
  - Flattened Loan (active only): `string? Loanee`, `DateTime? LoanDate`
- All related entity data flattened into single structure
- Used for:
  - GET /api/books - book list/grid (all properties)
  - GET /api/books/{id} - detailed book view (all properties)
- Not used for create/update operations

### 11. Create DTOs/RatingDto.cs
- Properties: `int Score`, `string? Notes`
- Used for creating/updating ratings via dedicated endpoints (POST/PUT /api/books/{id}/rating)

### 12. Create DTOs/ReadingStatusDto.cs
- Property: `ReadingStatusEnum Status`
- Used for updating reading status via dedicated endpoint (PUT /api/books/{id}/reading-status)

### 13. Create DTOs/LoanDto.cs
- Properties: `string BorrowedTo`, `DateTime? LoanDate`, `bool? IsReturned`, `DateTime? ReturnedDate`
- Used for creating/managing loans via dedicated endpoints (POST /api/books/{id}/loan)
- Only `BorrowedTo` required for creating new loan

### 14. Add FluentValidation NuGet Package
Install `FluentValidation.AspNetCore` version 11+

### 15. Create Validators/CreateBookValidator.cs
Validates `BookDto` for **create** scenarios:
- Title: required, max 100 chars
- Author: required, max 100 chars
- Description: max 500 chars if provided
- Notes: max 1000 chars if provided
- ISBN: max 20 chars if provided
- PublishedYear: range 1000-2100 if provided
- PageCount: positive integer if provided
- OwnershipStatus: valid enum value
- **Id: must be null or not provided**

### 16. Create Validators/UpdateBookValidator.cs
Validates `BookDto` for **update** scenarios:
- Same validation rules as CreateBookValidator except:
- **Id: must be provided (not null)**

### 17. Create Validators/RatingDtoValidator.cs
- Score: required, range 1-10
- Notes: max 1000 chars if provided

### 18. Create Validators/LoanDtoValidator.cs
- BorrowedTo: required, max 100 chars

### 19. Create Validators/ReadingStatusDtoValidator.cs
- Status: must be valid enum value

### 20. Register DbContext and Validators in Program.cs
- Add DbContext with SQL Server connection string from configuration
- Register FluentValidation validators
- Enable automatic validation

### 21. Create EF Core Migration
Run from PersonalLibrary.API directory:
```powershell
dotnet ef migrations add InitialCreate
```
Review generated migration file for correctness

### 22. Apply Migration (Local Development)
Run from PersonalLibrary.API directory:
```powershell
dotnet ef database update
```
Or configure automatic migration on startup in Program.cs for development

## Verification

- Build project: `dotnet build` - should succeed with no errors
- Check migration files created in `Migrations/` folder
- Start application and verify database created
- Check SQL Server database has all tables with proper schema
- Verify foreign keys and indexes created correctly
- Verify enum columns use string storage, not integers
- Verify unique constraints on Rating.BookId and ReadingStatus.BookId
- Test validation by attempting to create invalid DTOs (can test in next subplan)

## Dependencies
- Subplan 1 (Docker setup) - requires SQL Server running

## Benefits of This Approach

**Performance:** Single flat DTO for all read operations enables efficient joins without nested object serialization overhead

**Simplicity:** BookDto for writes, BookDetailsDto for reads - clear separation with minimal validation complexity

**Flexibility:** Related entities managed via dedicated endpoints while read operations provide complete flattened data

**Frontend Efficiency:** Same DTO structure for grid and details allows component reuse with conditional field display