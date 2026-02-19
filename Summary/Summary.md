---

Prompt (Agent mode):

I want to build personal library application. It will have .Net 10 backend, MS SQL database, ReactJS frontend and Materialize CSS. I want you to create appropriate solution structure with necessary packages and libraries with the latest versions. Create barebones homepage so I would be able to verify that the initial set up is configured properly.

Result:

This was an initial prompt during repo creation. As I was limited to 500 characters during this process I utilized the initial prompt as a general project description without details of the planned stack of technologies. Copilot created PR with the next file structure and barebones .Net and React projects:

FTG12/
├── Backend/
│   └── PersonalLibrary.API/     # .NET 10 Web API
├── Frontend/                    # React + Vite app
├── PersonalLibrary.sln          # Solution file
├── .gitignore                   # Comprehensive ignore rules
└── README.md                    # Setup instructions

This is more or less what I expected, but i am not happy with the 'Frontend', 'Backend' folder naming. On one hand it was my fault that I did not think about that part, on the other I see that copilot requires more specifics where I did not expect them. I planned initially to add 'Ask clarifying questions if needed' to the prompt, but based on how github presented the field for the prompt I was not sure that this initial prompt would follow through with that. I suspect, I should've still added that clause.

---

Prompt (Agent mode):

Create a copilot instruction file for this application. Application is using ReactJS, Materialize CSS, .Net 10, Entity Framework Core, MS SQL. Consider that C# and ReactJS specific instructions are defined in path specific insturctions. Use best coding and security practices. All front end and back end code should be covered by unit tests, and succesful run of those tests is a requirement for a build. Ask clarifying questions if needed.

Result: 

Copilot generated extensive 580 line file with instructions. It asked me about CI/CD configuration, authorisation, project business details and preferred testing tools and proposed options for those questions. For me it seems that asking copilot to ask questions is one of the most useful things I can do as it is easy to forget or not to think about requirements during prompting. The resulting instructions include among other things proposed data structure, api calls, testing patterns, EntityFramework, CSS, CI/CD instructions. That looks quite extensive for general instructions, so I wanto split it, but that seems to be a good start with all the potential instructions gathered in one place.

Fix request: 

I deceded I do not want authorisation in this application at the moment as the application is not planned to be public. Remove authorisation requirements from the instructions

Result:

For this and further fix requests I added generated instruction files as a context to the chat. I decided to change my requirements and reflect that in the instructions. I like that Copilot makes it easier to hone your ideas as you go.

Fix request:

Update instructions according to updated data models:
Book:
Id - guid - required
Title - string(100) - required
Author - string(100) - required
Descrtiption - string(100) - optional
Notes - string(1000) - optional
ISBN - string - optional
PublishedYear - int - optional
PageCount - int - optional
CoverImageUrl - Uri - optional
OwnershipStatus - enum(Want to buy, Own, Sold/Gave away) - required

Rating:
Id - guid - required
BookId - guid - required - foreign key to Book
Score - int - required
Notes - string(1000) - optional

Loan:
Id - guid - required
BookId - guid - required - foreign key to Book
BorrowedTo - string(100) - required
LoanDate - DateTime - required

ReadingStatus:
Id - guid - required
BookId - guid - required - foreign key to Book
Status - enum(Backlog, Completed, Abandoned) - required

Result: 

I wanted to described desired structure using simplest possible definitions, but that is not enough If I want robust results, as Copilot misunderstood optional/required field flag for enum values. For example it proposed these enum values: - OwnershipStatus (enum: Want to buy, Own, Sold/Gave away, required)

Fix request:

Update the instructions so that it would be obvious that required/optional is a property requriement and not a enum value or type description

Result:

The result suited me as the resulting propery description looked like this: - OwnershipStatus: enum { Want to buy, Own, Sold/Gave away } - **Required**

Fix request:

Instructions file is too extensive. Remove model info, api info and examples from the instructions. Split instructions into path specific instrucions where appropriate. Leave only essentials in general instructions file

Result: 

Resulting backend and frontend instructions mostly were similar to the react/c# instructions from awesome-copilit repo, so I decided to remove them. General instructions were still excessive, with the info on how to build and deploy application in .Net for example. I removed those and left only short project summary, technology stack, security and code review requirementss. I definitely need more practice and understanding of the preferred content of the general instructions file and the optimal way of its generation.

---

Prompt (Plan mode):

Task: Create a development plan for a personal library assistant. Plan should include list of well described expected tasks for copilot in order of development. Technology stack is described in the instruction files.
Application logic: 
1. Application should have a home page with books dashboard. Dashboard should contain a grid with books. Columns: Title, Author, Score, Ownership Status, Reading Status, Loanee. Grid rows should have next actions available to them: Details, Loan, Rate, Update reading status, Delete. Details action opens popup with editable book details. Loan action opens popup with the Name input. Rate action opens popup with the 10 star score and notes inputs. Update reading status opens popup with editable reading status. Delete action deletes book from the database.
2. Dashboard page should have 'Add book' action that opens a popup with inputs for book details, validation and saving book to the db. After the book is added, grid on the dashboard should be refreshed.
3. Loaned books page that contains grid with the columns: Title, Author, Loanee. Grid should contain only loaned books. Grid rows should have available action: Return. Return action deletes book loan info and refreshes the grid.

Expected data model: 
Book:
Id - guid - required
Title - string(100) - required
Author - string(100) - required
Descrtiption - string(100) - optional
Notes - string(1000) - optional
ISBN - string - optional
PublishedYear - int - optional
PageCount - int - optional
CoverImageUrl - Uri - optional
OwnershipStatus - enum(Want to buy, Own, Sold/Gave away) - required

Rating:
Id - guid - required
BookId - guid - required - foreign key to Book
Score - int - required
Notes - string(1000) - optional

Loan:
Id - guid - required
BookId - guid - required - foreign key to Book
BorrowedTo - string(100) - required
LoanDate - DateTime - required

ReadingStatus:
Id - guid - required
BookId - guid - required - foreign key to Book
Status - enum(Backlog, Completed, Abandoned) - required

Additional task:
Application requires creation of MS SQL db docker container

Ask, if you need additional tools to create the plan or execute the task. Ask, if you have clarifying questions. Think through the plan step by step.

Result: 

Copilot provided quite an extensive in 10 stages for the whole application development. While the plan seemed like what I want, I had few little details I wanted to change. I decided to ask copilot to split that plan into separate subplans, so that the whole process is more manageable. 

Fix Request: 

Based on proposed stages convert this plan into independent subplans that can be executed individually. Provide all the necessary context to each subplan.

Result:

Copilot started splitting the plan, but it also decided that the context I'm asking for also contains code, so it basically started implementing the code in the prompt result, which quickly ate all awailable tokens. I rolled back the results, and rephrased the prompt a bit.

Fix Request:

Based on proposed stages split this plan into independent subplans that can be executed individually. Provide all the necessary context to each subplan. Do not provide code examples

Result: 

Copilot provided 9 subplans (it combined two stages into one plan in this version) that I could use as prompts with minimal changes.

---

Prompt (Agent mode):

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

Result:

This is the original prompt, provided by the copilot, the end prompt is in \Plans\01-Docker.md. Copilot produced necessary docker files and configuration, but I had an issue with SSL certificate on my machine during docker-compose. By feeding copilot stack trace of the error multiple times and manual rebuilding, it ended up disabling SSL verification. I haven't figured out the issue with SSL cert on my machine myself, so I went with the unsafe solution.

---

Prompt (Agent mode):

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

Result: 

This is the original prompt, provided by the copilot, the end prompt is in \Plans\02-BackendDataLayer.md. I didn't like the abundance of Book Dtos, so I asked copilot to update the plan to reduce the amount of DTOs. After the updated plan was implemented I reviewed the code and noticed that Copilot did not include display text for enums, and Ids for DTOs, so I had to fix with the separate prompts.