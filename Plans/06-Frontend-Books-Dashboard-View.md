## Subplan 6: Frontend Books Dashboard View

**Purpose:** Implement the Books Dashboard page with a read-only grid displaying all books with their details (title, author, score, ownership status, reading status, loanee). No action buttons yet - just viewing capability with navigation to book details.

**Current State:**
- Frontend infrastructure complete (Plan 08)
- Placeholder Dashboard page exists
- useBooks hook available
- BookService available
- Shared components available (LoadingSpinner, ErrorMessage)

**Backend API:**
- GET /api/books → returns BookDetailsDto[] with all book info including flattened related data

**What This Plan Delivers:**
- Dashboard page showing all books in a grid
- Title column clickable to navigate to book details (placeholder page)
- Display of book properties: Title, Author, Score, Ownership Status, Reading Status, Loanee
- Loading and error states
- Empty state when no books exist

---

## Tasks

### 1. Component Development

**Create `src/components/books/BookGrid.jsx`:**
- Props: books (array), loading (boolean), onTitleClick (function)
- Render Materialize responsive table
- Columns:
  - Title (clickable link styled as button/link)
  - Author
  - Score (display as stars using formatStarRating, or number)
  - Ownership Status (formatted text)
  - Reading Status (formatted text)
  - Loanee (display if book is loaned)
- Title click handler: call onTitleClick(bookId) for navigation
- Handle loading state: display LoadingSpinner
- Handle empty state: display message "No books in library. Add your first book!"
- Format enum values to readable text using utility functions
- Display "N/A" or "-" for missing optional fields
- Responsive design: stack columns on mobile

**Update `src/pages/Dashboard.jsx`:**
- Import useBooks hook
- Import useNavigate from react-router-dom
- Import BookGrid component
- Import LoadingSpinner, ErrorMessage
- State: Use useBooks hook (books, loading, error, fetchBooks)
- Handle title click: navigate to `/books/{bookId}`
- Render page structure:
  - Page header: "Books Dashboard"
  - Error state: ErrorMessage with retry button calling fetchBooks
  - Loading/Success state: BookGrid with books data
- Clean layout with proper spacing
- No action buttons in this phase

### 2. Testing

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

**Update `src/pages/Dashboard.test.jsx`:**
- Mock useBooks hook
- Mock useNavigate
- Mock bookService
- Test page renders loading spinner initially
- Test displays error message on fetch failure
- Test error message retry button calls fetchBooks
- Test books displayed in grid after successful fetch
- Test page header displays "Books Dashboard"
- Test title click navigates to book details page (calls navigate with correct path)
- Test fetches books on mount
- Integration test: render Dashboard, wait for books to load, verify grid populated

---

## Verification Steps

1. Start backend: docker-compose up (or dotnet run)
2. Start frontend: npm run dev
3. Navigate to http://localhost:5173
4. Verify Dashboard loads without errors
5. If no books exist: verify empty state message displayed
6. Add test books via backend API (using .http file or manual)
7. Refresh Dashboard: verify books appear in grid
8. Verify all columns display correct data:
   - Title (text)
   - Author (text)
   - Score (stars or number, or empty if no rating)
   - Ownership Status (readable text like "Own")
   - Reading Status (readable text like "Completed", or empty)
   - Loanee (name if loaned, or empty)
9. Click book title: verify navigation to /books/{bookId} (BookDetails placeholder)
10. Return to Dashboard: verify still loads correctly
11. Stop backend: verify error message displays
12. Click retry: verify attempts to fetch again
13. Restart backend: verify books load after retry
14. Check browser console: no errors
15. Test on mobile viewport: verify responsive layout
16. Run `npm test` - all tests pass
17. Run `npm run test:coverage` - verify coverage maintained >80%

---

## Sample Test Data

Use these books for testing (Author McAuthorface per guidelines):
1. Title: "The Great Adventure", Author: "Author McAuthorface", Ownership: Own, Reading Status: Completed, Score: 9
2. Title: "Mystery Tales", Author: "Author McAuthorface", Ownership: Own, Reading Status: Backlog
3. Title: "Space Odyssey", Author: "Author McAuthorface", Ownership: WantToBuy
4. Title: "Loaned Novel", Author: "Author McAuthorface", Ownership: Own, Loanee: "Jane Doe"

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)

## Notes

- No action buttons in grid yet (Rate, Loan, Update Status, Delete)
- No Add Book button yet
- Focus is purely on viewing and navigating to details
- Book details page is still placeholder (will be implemented in Plan 11)
