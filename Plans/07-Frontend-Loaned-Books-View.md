## Subplan 7: Frontend Loaned Books Dashboard View

**Purpose:** Implement the Loaned Books page with a read-only grid displaying all currently loaned books. No action buttons yet - just viewing capability with navigation to book details.

**Current State:**
- Frontend infrastructure complete (Plan 05)
- Placeholder LoanedBooks page exists
- LoanService available with getActiveLoanedBooks()
- BookService available for fetching book details
- Shared components available

**Backend API:**
- GET /api/loans → returns Loan[] with active loans only
- Loan object: { id, bookId, borrowedTo, loanDate, isReturned, returnedDate }
- Need to fetch book details separately using bookId to get Title and Author

**What This Plan Delivers:**
- Loaned Books page showing all currently loaned books
- Grid with: Title (clickable), Author, Loanee, Loan Date
- Sorting by Title, Author, and Loanee columns (ascending/descending)
- Title navigation to book details
- Loading and error states
- Empty state when no books are loaned

---

## Tasks

### 1. Component Development

**Create `src/components/loans/LoanedBookGrid.jsx`:**
- Props: loanedBooks (array of Loan objects with book details), loading (boolean), onTitleClick (function)
- Render Materialize responsive table
- Columns:
  - Title (clickable link to book details, sortable)
  - Author (sortable)
  - Loanee (borrowedTo, sortable)
  - Loan Date (formatted using formatDate)
- Sorting functionality:
  - State: sortColumn (string: 'title', 'author', 'loanee'), sortDirection ('asc' or 'desc')
  - Default sort: title date descending
  - Column headers for Title, Author, and Loanee are clickable
  - Click handler: toggle sort direction if same column, otherwise set to 'asc'
  - Display sort indicator (▲ for ascending, ▼ for descending) on active column
  - Apply sorting to loanedBooks array before rendering
- Title click handler: call onTitleClick(bookId)
- Handle loading state: display LoadingSpinner
- Handle empty state: display message "No books are currently loaned out."
- Responsive design

**Update `src/pages/LoanedBooks.jsx`:**
- Import useState, useEffect from react
- Import useNavigate from react-router-dom
- Import loanService, bookService
- Import LoanedBookGrid, LoadingSpinner, ErrorMessage
- Import useToast for error notifications
- State: loanedBooks (array), loading, error
- On mount: fetch active loans using loanService.getActiveLoanedBooks()
- For each loan: fetch book details using bookService.getBookDetails(loan.bookId)
- Combine loan data with book data: { ...loan, book: { title, author } }
- Handle loading state while fetching
- Handle errors: display ErrorMessage with retry
- Handle title click: navigate to `/books/{bookId}`
- Render page structure:
  - Page header: "Loaned Books"
  - Error state: ErrorMessage with retry
  - Loading/Success state: LoanedBookGrid with combined data
- Clean layout with proper spacing

### 2. Testing

**Create `src/components/loans/LoanedBookGrid.test.jsx`:**
- Mock formatDate
- Test renders table with loaned books
- Test displays all columns correctly
- Test Title column renders as clickable element
- Test clicking title calls onTitleClick with correct bookId
- Test Loanee displays borrowedTo value
- Test Loan Date formatted correctly
- Test loading state shows LoadingSpinner
- Test empty state shows "No books loaned" message
- Test books sorted by loan date descending by default
- Test sorting by Title column (ascending/descending)
- Test sorting by Author column (ascending/descending)
- Test sorting by Loanee column (ascending/descending)
- Test clicking same column header toggles sort direction
- Test clicking different column header changes sort column
- Test sort indicator displays correctly (▲ for asc, ▼ for desc)
- Test responsive behavior

**Create `src/pages/LoanedBooks.test.jsx`:**
- Mock loanService.getActiveLoanedBooks
- Mock bookService.getBookDetails
- Mock useNavigate
- Test page renders loading spinner initially
- Test fetches active loans on mount
- Test fetches book details for each loan
- Test displays combined loan and book data in grid
- Test displays error message on fetch failure
- Test error message retry button refetches data
- Test page header displays "Loaned Books"
- Test title click navigates to book details page
- Test displays empty state when no loans
- Integration test: fetch loans, combine with books, display in grid

---

## Verification Steps

1. Ensure backend is running
2. Ensure at least one book is loaned (use backend .http file to create loan)
3. Start frontend: npm run dev
4. Navigate to http://localhost:5173/loans
5. Verify Loaned Books page loads
6. If no loans exist: verify empty state message
7. If loans exist: verify grid displays:
   - Title (clickable)
   - Author
   - Loanee (borrower name)
   - Loan Date (formatted as "Feb 19, 2026")
8. Click book title: verify navigation to /books/{bookId}
9. Return to Loaned Books page
10. Test sorting:
    - Click "Title" column header: verify books sorted by title ascending with ▲ indicator
    - Click "Title" again: verify sorted descending with ▼ indicator
    - Click "Author" column header: verify books sorted by author ascending with ▲ indicator
    - Click "Author" again: verify sorted descending with ▼ indicator
    - Click "Loanee" column header: verify books sorted by loanee ascending with ▲ indicator
    - Click "Loanee" again: verify sorted descending with ▼ indicator
11. Return a loaned book via backend: verify it disappears from grid on refresh
12. Loan another book: verify it appears in grid
13. Check browser console: no errors
14. Test loading state: throttle network, observe spinner
15. Stop backend: verify error message
16. Click retry: verify attempts to refetch
17. Run `npm test` - all tests pass
18. Run `npm run test:coverage` - verify coverage >80%

---

## Sample Test Data

Create these loans for testing (ensure variety for sorting verification):
1. Book: "The Great Adventure" by Author McAuthorface, Loaned to: "Jane Doe", Loan Date: Feb 15, 2026
2. Book: "Mystery Tales" by Author McAuthorface, Loaned to: "John Smith", Loan Date: Feb 18, 2026
3. Book: "A Beginning Story" by Author McAuthorface, Loaned to: "Alice Brown", Loan Date: Feb 17, 2026

Note: Having 3+ loans helps verify sorting works correctly across all columns.

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Backend API: GET /api/loans endpoint

## Notes

- No Return button yet (will be added in Plan 15)
- Focus is purely on viewing loaned books and navigating to details
- Need to fetch book details separately because Loan entity doesn't include title/author
- Consider adding loading state per book if fetching details individually is slow
