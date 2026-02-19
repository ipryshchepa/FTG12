## Subplan 9: Frontend View Book Details Feature

**Purpose:** Implement the Book Details page displaying complete book information in a full-page view. Users can view all book properties, rating, reading status, and loan information. This phase focuses on viewing only - editing, rating, and loan actions will be added in subsequent plans.

**Current State:**
- Dashboard displays books with clickable titles (Plan 06)
- Placeholder BookDetails page exists
- BookService.getBookDetails() available
- Navigation to /books/:bookId working

**Backend API:**
- GET /api/books/{id} → returns BookDetailsDto
- BookDetailsDto: All book properties plus flattened related data (score, ratingNotes, readingStatus, loanee, loanDate)

**What This Plan Delivers:**
- Full-page book details view
- Display all book properties: Title, Author, Description, Notes, ISBN, Published Year, Page Count, Ownership Status
- Display rating: Score (stars) and Rating Notes if exists
- Display reading status if exists
- Display loan information if book is loaned: Borrower and Loan Date
- Back button to return to Dashboard
- Loading and error states

---

## Tasks

### 1. Component Development

**Update `src/pages/BookDetails.jsx` (read-only implementation):**
- Import: useState, useEffect from react
- Import: useParams, useNavigate from react-router-dom
- Import: bookService, formatters, LoadingSpinner, ErrorMessage, Button
- Get bookId from useParams()
- State: book (BookDetailsDto object), loading, error
- On mount: fetch book details using bookService.getBookDetails(bookId)
- Handle loading: display LoadingSpinner
- Handle error: display ErrorMessage with retry and back to Dashboard button
- Handle not found: display specific message "Book not found"
- Display book information in sections:

  **Section 1: Book Information**
  - Title (large heading)
  - Author (subheading)
  - Description (if exists)
  - Notes (if exists)
  - ISBN (if exists)
  - Published Year (if exists)
  - Page Count (if exists)
  - Ownership Status (formatted readable text)

  **Section 2: Rating**
  - Label: "Rating"
  - If rating exists: display Score as stars and Rating Notes
  - If no rating: display "No rating yet"

  **Section 3: Reading Status**
  - Label: "Reading Status"
  - If status exists: display formatted status (Backlog, Completed, Abandoned)
  - If no status: display "No reading status set"

  **Section 4: Loan Information**
  - Label: "Loan Information"
  - If loaned: display "Loaned to: [Loanee]" and "Loan Date: [formatted date]"
  - If not loaned: display "Not currently loaned"

- Add Back button: navigate to '/' (Dashboard)
- Use Materialize cards or sections for clean layout
- Responsive design
- Display "N/A" or "-" for missing optional basic fields (Description, Notes, etc.)

### 2. Testing

**Update `src/pages/BookDetails.test.jsx`:**
- Mock bookService.getBookDetails
- Mock useParams returning test bookId
- Mock useNavigate
- Test fetches book details on mount
- Test passes correct bookId to service
- Test displays loading spinner while fetching
- Test displays error message on fetch failure
- Test error retry button refetches data
- Test displays "Book not found" on 404 error
- Test displays all book information sections
- Test Book Information section:
  - Title displayed
  - Author displayed
  - Description displayed if exists
  - Notes displayed if exists
  - ISBN displayed if exists
  - Published Year displayed if exists
  - Page Count displayed if exists
  - Ownership Status formatted and displayed
  - Missing fields show "N/A" or "-"
- Test Rating section:
  - Score displayed as stars if exists
  - Rating Notes displayed if exists
  - "No rating yet" displayed if no rating
- Test Reading Status section:
  - Status formatted and displayed if exists
  - "No reading status set" displayed if no status
- Test Loan Information section:
  - Loanee and Loan Date displayed if loaned
  - "Not currently loaned" displayed if not loaned
  - Loan Date formatted correctly
- Test Back button navigates to Dashboard
- Integration test: fetch book with all data, verify all sections displayed correctly

---

## Verification Steps

1. Start backend and frontend
2. Ensure at least one book exists with complete data:
   - Title: "Complete Book"
   - Author: "Author McAuthorface"
   - Description: "A fully detailed test book"
   - Notes: "My personal notes"
   - ISBN: "978-1234567890"
   - Published Year: 2024
   - Page Count: 350
   - Ownership Status: Own
   - Rating: Score 8, Notes "Great read!"
   - Reading Status: Completed
   - Loaned to: "Jane Doe", Loan Date: Feb 15, 2026
3. Navigate to Dashboard
4. Click book title: verify navigation to BookDetails page
5. Verify all sections display correctly:
   - Book Information: all fields visible
   - Rating: shows 8 stars and notes
   - Reading Status: shows "Completed"
   - Loan Information: shows borrower and date
6. Test with book without rating: verify "No rating yet"
7. Test with book without reading status: verify "No reading status set"
8. Test with book not loaned: verify "Not currently loaned"
9. Test with book with minimal data (only required fields):
   - Verify Title, Author, Ownership Status shown
   - Verify optional fields show "N/A" or "-"
10. Click Back button: verify returns to Dashboard
11. Manually navigate to /books/invalid-guid: verify error message
12. Stop backend, refresh page: verify error message and retry button
13. Restart backend, click retry: verify book loads
14. Check browser console: no errors
15. Test responsive design: resize browser, verify layout adapts
16. Run `npm test` - all tests pass
17. Run `npm run test:coverage` - verify coverage >80%

---

## Sample Test Data

Create books with varying data for testing:
1. **Complete Book**: All fields populated, rated, reading status, loaned
2. **Minimal Book**: Only Title, Author, Ownership Status
3. **Partial Book**: Title, Author, Description, Ownership, Rating but no status or loan

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Plan 06 (Dashboard with clickable titles)
- Backend: GET /api/books/{id} endpoint

## Notes

- This is read-only view - no editing yet
- No action buttons yet (Rate, Loan, Update Status, Delete, Edit)
- Navigation to Loan History page will be added in Plan 14
- Focus on clear information display and layout
- Ensure proper formatting of dates (using formatDate utility)
- Ensure proper formatting of enums (using format utilities)
- Consider using Materialize cards for section layout
