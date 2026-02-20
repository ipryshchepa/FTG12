## Subplan 6: Frontend Books Dashboard View

**Purpose:** Implement the Books Dashboard page with a read-only grid displaying all books with their details (title, author, score, ownership status, reading status, loanee). No action buttons yet - just viewing capability with navigation to book details.

**Current State:**
- Frontend infrastructure complete (Plan 05)
- Placeholder Dashboard page exists
- useBooks hook available
- BookService available
- Shared components available (LoadingSpinner, ErrorMessage)

**Backend API:**
- GET /api/books → returns BookDetailsDto[] with all book info including flattened related data
- Query parameters:
  - page (default: 1)
  - pageSize (default: 10)
  - sortBy (default: "Title") - can be: Title, Author, Score, OwnershipStatus, ReadingStatus
  - sortDirection (default: "asc") - can be: asc, desc
- Response includes:
  - items: BookDetailsDto[]
  - totalCount: number
  - page: number
  - pageSize: number

**What This Plan Delivers:**
- Dashboard page showing all books in a paginated, sortable grid
- Title column clickable to navigate to book details (placeholder page)
- Display of book properties: Title, Author, Score, Ownership Status, Reading Status, Loanee
- Pagination controls (Previous/Next, page numbers)
- Sortable columns (click column header to sort)
- Loading and error states
- Empty state when no books exist

---

## Backend Changes Required

**Update `BooksController.cs` GET endpoint:**
- Add query parameters: page, pageSize, sortBy, sortDirection
- Implement pagination in repository layer
- Implement sorting in repository layer
- Return paginated response with:
  ```csharp
  {
    "items": BookDetailsDto[],
    "totalCount": number,
    "page": number,
    "pageSize": number
  }
  ```
- Validate sortBy field (only allow valid column names)
- Default values: page=1, pageSize=10, sortBy="Title", sortDirection="asc"

**Update `IBookRepository.cs` and `BookRepository.cs`:**
- Add method signature: `Task<(IEnumerable<Book> Items, int TotalCount)> GetAllBooksAsync(int page, int pageSize, string sortBy, string sortDirection)`
- Implement pagination using `.Skip()` and `.Take()`
- Implement sorting using dynamic LINQ or switch statement on sortBy parameter
- Get total count before pagination for accurate page calculation

---

## Tasks

### 1. Backend Implementation

**Update `BooksController.cs` GetAllBooks endpoint:**
- Add query parameters with defaults
- Call repository with pagination/sorting params
- Return paginated response object
- Handle invalid sortBy values with validation

**Update `BookRepository.cs`:**
- Implement `GetAllBooksAsync` with pagination and sorting
- Calculate total count
- Apply sorting based on sortBy parameter
- Apply Skip/Take for pagination
- Include related entities (ReadingStatus, Rating, Loan)

### 2. Frontend Service Layer

**Update `src/services/bookService.js`:**
- Modify `getAllBooks()` to accept query parameters: { page, pageSize, sortBy, sortDirection }
- Build query string from parameters
- Parse response to extract items, totalCount, page, pageSize
- Return structured response object
- Handle backward compatibility if params not provided (use defaults)

### 3. Component Development

**Create `src/components/books/BookGrid.jsx`:**
- Props: 
  - books (array)
  - loading (boolean)
  - onTitleClick (function)
  - currentPage (number)
  - pageSize (number)
  - totalCount (number)
  - onPageChange (function)
  - sortBy (string)
  - sortDirection (string)
  - onSort (function)
- Render Materialize responsive table
- Columns (sortable where applicable):
  - Title (clickable link styled as button/link, sortable)
  - Author (sortable)
  - Score (display as stars using formatStarRating, or number, sortable)
  - Ownership Status (formatted text, sortable)
  - Reading Status (formatted text, sortable)
  - Loanee (display if book is loaned, not sortable)
- Column headers: 
  - Clickable for sortable columns
  - Display sort indicator (↑ or ↓) when column is currently sorted
  - Call onSort(columnName) when clicked
- Title click handler: call onTitleClick(bookId) for navigation
- Pagination controls at bottom:
  - Display "Showing X-Y of Z books"
  - Previous/Next buttons
  - Page numbers (show current and nearby pages)
  - Use Materialize pagination classes
  - Disable Previous on first page, Next on last page
  - Call onPageChange(newPage) when page changes
- Handle loading state: display LoadingSpinner
- Handle empty state: display message "No books in library. Add your first book!"
- Format enum values to readable text using utility functions
- Display "N/A" or "-" for missing optional fields
- Responsive design: stack columns on mobile

**Update `src/pages/Dashboard.jsx`:**
- Import useBooks hook
- Import useNavigate from react-router-dom
- Import useState for pagination and sorting state
- Import BookGrid component
- Import LoadingSpinner, ErrorMessage
- State: 
  - Use useBooks hook (books, loading, error, fetchBooks)
  - currentPage (default: 1)
  - pageSize (default: 10)
  - totalCount (from API response)
  - sortBy (default: "Title")
  - sortDirection (default: "asc")
- Effects:
  - Fetch books on mount and when page/sort changes
  - Call fetchBooks with query params: { page, pageSize, sortBy, sortDirection }
- Handlers:
  - handlePageChange: update currentPage state, triggers refetch
  - handleSort: update sortBy/sortDirection, reset to page 1, triggers refetch
  - handleTitleClick: navigate to `/books/{bookId}`
- Render page structure:
  - Page header: "Books Dashboard"
  - Error state: ErrorMessage with retry button calling fetchBooks
  - Loading/Success state: BookGrid with books data and pagination/sorting props
- Clean layout with proper spacing
- No action buttons in this phase

### 4. Testing

**Backend Tests - Update `BooksControllerTests.cs` or create new tests:**
- Test GetAllBooks with pagination parameters returns correct page
- Test GetAllBooks with default parameters (page=1, pageSize=10)
- Test GetAllBooks returns correct totalCount
- Test GetAllBooks with sortBy="Title" sorts correctly
- Test GetAllBooks with sortBy="Author" sorts correctly
- Test GetAllBooks with sortDirection="desc" sorts descending
- Test GetAllBooks validates invalid sortBy field (returns error or defaults)
- Test GetAllBooks with page beyond available pages returns empty items
- Test GetAllBooks with pageSize=5 returns only 5 items
- Integration test with database: verify pagination and sorting work end-to-end

**Frontend Tests:**

**Create `src/components/books/BookGrid.test.jsx`:**
- Mock formatters (formatStarRating, formatOwnershipStatus, formatReadingStatus)
- Test renders table with books
- Test displays all columns correctly
- Test Title column renders as clickable element
- Test clicking title calls onTitleClick with correct bookId
- Test Score displays formatted (stars or number)
- Test Ownership Status formatted correctly
- Test Reading Status formatted correctly
- Test Loanee displays when book is loaned
- Test Loanee empty when book not loaned
- Test displays "N/A" or "-" for missing optional fields
- Test loading state: shows LoadingSpinner
- Test empty state: shows "No books" message
- Test responsive behavior (if applicable)
- **Pagination tests:**
  - Test pagination controls render with correct page info
  - Test "Showing X-Y of Z books" displays correctly
  - Test Previous button disabled on first page
  - Test Next button disabled on last page
  - Test clicking Next button calls onPageChange with currentPage + 1
  - Test clicking Previous button calls onPageChange with currentPage - 1
  - Test clicking page number calls onPageChange with that page number
  - Test pagination hidden when totalCount <= pageSize
- **Sorting tests:**
  - Test sortable column headers are clickable
  - Test clicking column header calls onSort with column name
  - Test sort indicator (↑) displays when column sorted ascending
  - Test sort indicator (↓) displays when column sorted descending
  - Test Loanee column is not sortable
  - Test sort indicator only shows on currently sorted column

**Update `src/pages/Dashboard.test.jsx`:**
- Mock useBooks hook
- Mock useNavigate
- Mock useState for pagination/sorting
- Mock bookService
- Test page renders loading spinner initially
- Test displays error message on fetch failure
- Test error message retry button calls fetchBooks
- Test books displayed in grid after successful fetch
- Test page header displays "Books Dashboard"
- Test title click navigates to book details page (calls navigate with correct path)
- Test fetches books on mount with default params (page=1, pageSize=10, sortBy="Title", sortDirection="asc")
- **Pagination tests:**
  - Test page change triggers fetchBooks with new page number
  - Test page change maintains current sort settings
  - Test totalCount passed to BookGrid correctly
- **Sorting tests:**
  - Test sort change triggers fetchBooks with new sort params
  - Test sort change resets to page 1
  - Test toggling sort direction on same column (asc → desc → asc)
  - Test changing sort column resets to ascending
- Integration test: render Dashboard, wait for books to load, verify grid populated with pagination controls

**Update `src/services/bookService.test.js` (if exists) or add tests:**
- Test getAllBooks without params uses defaults
- Test getAllBooks with params builds correct query string
- Test getAllBooks parses response correctly
- Test getAllBooks handles pagination response structure

---

## Verification Steps

1. Start backend: docker-compose up (or dotnet run)
2. Start frontend: npm run dev
3. Navigate to http://localhost:5173
4. Verify Dashboard loads without errors
5. If no books exist: verify empty state message displayed
6. Add test books via backend API (using .http file or manual) - **add at least 15 books for pagination testing**
7. Refresh Dashboard: verify books appear in grid
8. Verify all columns display correct data:
   - Title (text)
   - Author (text)
   - Score (stars or number, or empty if no rating)
   - Ownership Status (readable text like "Own")
   - Reading Status (readable text like "Completed", or empty)
   - Loanee (name if loaned, or empty)
9. **Test Pagination:**
   - Verify "Showing 1-10 of X books" displays correctly
   - Verify page numbers appear at bottom
   - Click Next: verify page 2 loads with next 10 books
   - Verify "Showing 11-20 of X books" updates
   - Click Previous: verify returns to page 1
   - Verify Previous button disabled on page 1
   - Navigate to last page: verify Next button disabled
   - Click specific page number: verify that page loads
10. **Test Sorting:**
    - Click Title column header: verify books sort alphabetically by title
    - Verify sort indicator (↑) appears on Title header
    - Click Title again: verify sort reverses (Z to A)
    - Verify sort indicator changes to (↓)
    - Click Author column: verify books sort by author
    - Verify sort indicator moves to Author column
    - Click Score column: verify books sort by rating
    - Test sorting on Ownership Status and Reading Status columns
    - Verify Loanee column is not sortable (no click behavior)
    - Verify sorting resets to page 1 when changed
11. Click book title: verify navigation to /books/{bookId} (BookDetails placeholder)
12. Return to Dashboard: verify page/sort state is preserved (or resets, depending on implementation)
13. Stop backend: verify error message displays
14. Click retry: verify attempts to fetch again
15. Restart backend: verify books load after retry
16. Check browser console: no errors
17. Test on mobile viewport: verify responsive layout
18. Run `npm test` - all tests pass
19. Run `npm run test:coverage` - verify coverage maintained >80%

---

## Sample Test Data

Use these books for testing (Author McAuthorface per guidelines):
1. Title: "The Great Adventure", Author: "Author McAuthorface", Ownership: Own, Reading Status: Completed, Score: 9
2. Title: "Mystery Tales", Author: "Author McAuthorface", Ownership: Own, Reading Status: Backlog
3. Title: "Space Odyssey", Author: "Author McAuthorface", Ownership: WantToBuy
4. Title: "Loaned Novel", Author: "Author McAuthorface", Ownership: Own, Loanee: "Jane Doe"

**For pagination testing, create at least 15-20 books** with varied titles (A-Z), authors, scores, and statuses to properly test:
- Multiple pages of results
- Sorting by different columns
- Navigation between pages

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)

## Notes

- No action buttons in grid yet (Rate, Loan, Update Status, Delete)
- No Add Book button yet
- Focus is on viewing, navigating to details, pagination, and sorting
- Book details page is still placeholder (will be implemented in Plan 11)
- Backend API must be updated to support pagination and sorting query parameters
- Default page size is 10, but can be adjusted based on UX preferences
- Pagination state may or may not persist on navigation (implementation choice)
