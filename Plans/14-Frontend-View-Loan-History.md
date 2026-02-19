## Subplan 14: Frontend View Loan History Feature

**Purpose:** Implement the Loan History page displaying complete loan history (both active and returned loans) for a specific book. Includes navigation from Book Details page.

**Current State:**
- Book Details page displays loan information (Plan 09)
- Placeholder LoanHistory page exists
- LoanService.getLoanHistory() available
- Navigation to /books/:bookId/history working

**Backend API:**
- GET /api/books/{bookId}/loans → returns Loan[] with full history
- Loan: { id, bookId, borrowedTo, loanDate, isReturned, returnedDate? }
- Returns 404 if book not found
- Returns empty array if no loan history

**What This Plan Delivers:**
- Full-page Loan History view
- Table showing all loans (active and returned) with columns: Borrower, Loan Date, Return Date, Status
- Breadcrumb or back button to return to Book Details
- Loading and error states
- Empty state if no loan history
- Sort by loan date descending (most recent first)

---

## Tasks

### 1. Component Development

**Update `src/pages/LoanHistory.jsx` (full implementation):**
- Import: useState, useEffect from react
- Import: useParams, useNavigate, Link from react-router-dom
- Import: loanService, bookService, formatDate, LoadingSpinner, ErrorMessage, Button
- Get bookId from useParams()
- State: loanHistory (Loan[]), bookTitle (string), loading, error
- On mount:
  - Fetch book details to get title: bookService.getBookDetails(bookId)
  - Fetch loan history: loanService.getLoanHistory(bookId)
  - Handle errors for both calls
- Handle loading: display LoadingSpinner
- Handle error: display ErrorMessage with retry and back to book details button
- Handle not found: display "Book not found"
- Handle empty history: display "No loan history for this book"
- Display Loan History:
  - Page header: "Loan History for [Book Title]"
  - Breadcrumb or back link: "← Back to Book Details"
  - Table with columns:
    - Borrower (borrowedTo)
    - Loan Date (formatted using formatDate)
    - Return Date (formatted using formatDate, or "Not returned" if null)
    - Status: "Active" if isReturned=false, "Returned" if isReturned=true
  - Sort loans by loanDate descending (most recent first)
  - Use Materialize table styling
  - Show status with color coding: Active (blue/info), Returned (green/success)
- Back button: navigate to `/books/{bookId}` (Book Details)
- Responsive design

### 2. Update Book Details Page

**Update `src/pages/BookDetails.jsx` (add View History button):**
- Add "View Loan History" button in Loan Information section
- Button visible always (even if no loans)
- Button click: navigate to `/books/{bookId}/history`
- Position button prominently in Loan section

### 3. Testing

**Update `src/pages/LoanHistory.test.jsx`:**
- Mock loanService.getLoanHistory
- Mock bookService.getBookDetails
- Mock useParams returning test bookId
- Mock useNavigate
- Test fetches loan history on mount
- Test passes correct bookId to service
- Test fetches book details to display title
- Test displays loading spinner while fetching
- Test displays error message on fetch failure
- Test error retry button refetches data
- Test displays "Book not found" on 404
- Test displays empty state when no loan history
- Test displays page header with book title
- Test displays breadcrumb/back link to book details
- Test displays table with correct columns
- Test displays all loans:
  - Borrower name
  - Loan date formatted
  - Return date formatted (or "Not returned")
  - Status: "Active" or "Returned"
- Test active loan: isReturned=false, shows "Active", no return date
- Test returned loan: isReturned=true, shows "Returned", formatted return date
- Test loans sorted by date descending (most recent first)
- Test back button navigates to book details page
- Integration test: fetch book and loans, display correct data

**Update `src/pages/BookDetails.test.jsx`:**
- Test "View Loan History" button present in Loan Information section
- Test clicking button navigates to loan history page

---

## Verification Steps

1. Start backend and frontend
2. Create a book with loan history (loan, return, loan again)
3. Navigate to Dashboard, click book title to view details

**Test Navigation to Loan History:**
4. Verify "View Loan History" button present in Loan Information section
5. Click button: verify navigation to /books/{bookId}/history

**Test Loan History Page:**
6. Verify page header displays "Loan History for [Book Title]"
7. Verify breadcrumb or back link present
8. Verify table displays with columns: Borrower, Loan Date, Return Date, Status
9. Verify all loans displayed (both active and returned)
10. Verify active loan shows:
    - Borrower name
    - Loan date (formatted)
    - Return date: "Not returned" or "-"
    - Status: "Active" (with color coding)
11. Verify returned loan shows:
    - Borrower name
    - Loan date (formatted)
    - Return date (formatted)
    - Status: "Returned" (with color coding)
12. Verify loans sorted by date descending (most recent at top)

**Test Back Navigation:**
13. Click back button/link: verify returns to Book Details page

**Test Empty State:**
14. Navigate to loan history for book with no loans
15. Verify empty state message: "No loan history for this book"

**Test Error Scenarios:**
16. Manually navigate to /books/invalid-guid/history
17. Verify "Book not found" message
18. Stop backend, refresh page: verify error message
19. Click retry: verify attempts to refetch
20. Restart backend, retry: verify loads successfully

**Test Multiple Loans:**
21. Create book with multiple loan cycles:
    - Loan to Jane Doe, return
    - Loan to John Smith, return
    - Loan to Alice Johnson, currently active
22. Verify all three loans displayed in history
23. Verify most recent (Alice) at top
24. Verify active status for Alice
25. Verify returned status for Jane and John

26. Check browser console: no errors
27. Test on mobile: verify responsive table
28. Run `npm test` - all tests pass
29. Run `npm run test:coverage` - verify coverage >80%

---

## Sample Test Data

Create loan history for testing:
1. Book: "The Great Adventure" by Author McAuthorface
   - Loan 1: Jane Doe, loaned Feb 10 2026, returned Feb 12 2026
   - Loan 2: John Smith, loaned Feb 15 2026, returned Feb 18 2026
   - Loan 3: Alice Johnson, loaned Feb 19 2026, still active

Expected display (sorted by date desc):
- Alice Johnson | Feb 19, 2026 | Not returned | Active
- John Smith | Feb 15, 2026 | Feb 18, 2026 | Returned
- Jane Doe | Feb 10, 2026 | Feb 12, 2026 | Returned

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Plan 09 (Book Details page)
- Backend: GET /api/books/{bookId}/loans endpoint

## Notes

- Loan history shows complete history, not just active loan
- Returned loans are not deleted, just marked with isReturned=true
- Sort by loanDate ensures most recent activity shown first
- Status color coding helps distinguish active vs returned
- Consider adding pagination if loan history becomes very long (future enhancement)
- Consider adding loan duration calculation (days loaned) in table (future enhancement)
