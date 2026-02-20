## Subplan 12: Frontend Loan and Return Book Features

**Purpose:** Implement loan and return functionality allowing users to loan books to others and mark them as returned. Includes Loan button on Dashboard and Book Details page, Return button on Dashboard and Loaned Books page.

**Current State:**
- Dashboard displays books with grid (Plan 06)
- Loaned Books page displays loaned books (Plan 07)
- Book Details page shows loan information (Plan 09)
- LoanService.createLoan() and returnBook() available

**Backend API:**
- POST /api/books/{bookId}/loan → Create loan from LoanDto
- LoanDto: { borrowedTo (required) }
- Backend sets loanDate, id, isReturned automatically
- Returns 201 Created or 409 Conflict if already loaned
- DELETE /api/books/{bookId}/loan → Mark loan as returned
- Backend sets returnedDate and isReturned=true

**What This Plan Delivers:**
- Loan button on Dashboard grid (disabled if already loaned)
- Loan button on Book Details page (disabled if already loaned)
- Loan Book modal for entering borrower name
- Return button on Dashboard grid (visible only if loaned)
- Return button on Loaned Books grid
- Success/error handling with toast notifications
- Grid refresh after loan/return operations

---

## Tasks

### 1. Component Development

**Create `src/components/books/LoanBookModal.jsx`:**
- Props: isOpen, onClose, bookId, onSuccess
- Import: Modal, FormInput, Button, useToast, constants (MAX_LENGTHS)
- Import: loanService
- State: borrowedTo (string), submitting (boolean), error (string)
- Form:
  - Single input: "Borrower Name" (required, max 100 chars)
  - Validate: required, not empty
- Submit handler:
  - Validate borrowedTo
  - Set submitting true
  - Prepare payload: { borrowedTo }
  - Call loanService.createLoan(bookId, payload)
  - On success: show success toast "Book loaned to [borrower]", call onSuccess(), reset form, close modal
  - On error 409: show error toast "Book is already loaned out"
  - On other error: show error toast with message
  - Finally: set submitting false
- Cancel button: close modal without creating loan
- Disable form while submitting

**Update `src/components/books/BookGrid.jsx` (add Loan and Return actions):**
- Add props: onLoan (function), onReturn (function)
- Add Loan button in Actions column:
  - Visible for all books
  - Disabled if book is loaned (book.loanee exists)
  - Tooltip: "Already loaned" when disabled
  - Button click: call onLoan(book)
- Add Return button in Actions column:
  - Visible only if book is loaned (book.loanee exists)
  - Button click: call onReturn(book)
- Use icon buttons with tooltips
- Materialize styling

**Update `src/components/loans/LoanedBookGrid.jsx` (add Return action):**
- Add prop: onReturn (function)
- Add Return button in Actions column for each row
- Button click: call onReturn(loanedBook)
- Icon button with Materialize styling

**Update `src/pages/Dashboard.jsx` (add Loan and Return functionality):**
- Import: LoanBookModal, useModal
- Add state: loanModal = useModal(), selectedBook (object)
- Add Loan handler:
  - Set selectedBook
  - Open loanModal
- Add Return handler:
  - Call loanService.returnBook(selectedBook.id)
  - Show success toast "Book returned from [borrower]"
  - Refresh books grid
  - Handle errors with error toast
- Pass onLoan={handleLoan} to BookGrid
- Pass onReturn={handleReturn} to BookGrid
- Render LoanBookModal:
  - isOpen={loanModal.isOpen}
  - onClose={loanModal.closeModal}
  - bookId={selectedBook?.id}
  - onSuccess={() => { refreshBooks(); loanModal.closeModal(); }}

**Update `src/pages/LoanedBooks.jsx` (add Return functionality):**
- Import: useToast, loanService
- Add Return handler:
  - Call loanService.returnBook(bookId)
  - Show success toast "Book returned"
  - Refetch loaned books (remove returned book from list)
  - Handle errors with error toast
- Pass onReturn={handleReturn} to LoanedBookGrid

**Update `src/pages/BookDetails.jsx` (add Loan button):**
- Import: LoanBookModal, useModal
- Add state: loanModal = useModal()
- Add Loan button in Loan Information section:
  - Visible when book is not loaned
  - Button text: "Loan Book"
  - Button click: open loanModal
- If book is loaned: show "Already loaned to [loanee]" and Return button
- Add Return button:
  - Visible when book is loaned
  - Button click: call loanService.returnBook(bookId)
  - Show success toast
  - Refetch book data
- Render LoanBookModal with same props
- On success: refetch book data to update loan information

### 2. Testing

**Create `src/components/books/LoanBookModal.test.jsx`:**
- Mock loanService.createLoan
- Mock useToast
- Test modal renders when isOpen true
- Test borrower name input present
- Test can type into input
- Test validation:
  - Submit with empty borrower: verify error
  - Submit with borrower >100 chars: verify error
- Test submit with valid borrower:
  - Enter "Jane Doe"
  - Click submit
  - Verify createLoan called with { borrowedTo: "Jane Doe" }
  - Verify success toast shown
  - Verify onSuccess called
  - Verify modal closes
  - Verify form resets
- Test error 409 (already loaned):
  - Mock createLoan to throw 409 error
  - Submit form
  - Verify specific error toast "Book is already loaned out"
- Test other errors: verify error toast shown
- Test cancel button closes without creating loan
- Test form disabled while submitting

**Update `src/components/books/BookGrid.test.jsx`:**
- Test Loan button present for all books
- Test Loan button disabled when book is loaned (loanee exists)
- Test Loan button enabled when book not loaned
- Test clicking Loan button calls onLoan with book
- Test Return button present only when book is loaned
- Test Return button hidden when book not loaned
- Test clicking Return button calls onReturn with book

**Update `src/components/loans/LoanedBookGrid.test.jsx`:**
- Test Return button present for each loaned book
- Test clicking Return button calls onReturn with correct book

**Update `src/pages/Dashboard.test.jsx`:**
- Test Loan button click opens LoanBookModal
- Test LoanBookModal onSuccess refreshes books grid
- Test Return button click calls returnBook service
- Test Return success shows toast and refreshes grid
- Integration test: loan book, verify appears as loaned in grid, return book, verify loanee cleared

**Update `src/pages/LoanedBooks.test.jsx`:**
- Test Return button click calls returnBook service
- Test Return success shows toast
- Test returned book removed from loaned books list

**Update `src/pages/BookDetails.test.jsx`:**
- Test Loan button visible when book not loaned
- Test Loan button click opens LoanBookModal
- Test LoanBookModal onSuccess refetches book data
- Test Return button visible when book is loaned
- Test Return button click calls returnBook
- Test Return success shows toast and refetches data
- Test loan information section updates after loan/return

---

## Verification Steps

1. Start backend and frontend
2. Navigate to Dashboard with unloaned book

**Test Loan from Dashboard:**
3. Verify Loan button enabled for unloaned book
4. Click Loan button: verify modal opens
5. Enter borrower: "Jane Doe"
6. Click Submit: verify success toast
7. Verify book in grid now shows "Jane Doe" in Loanee column
8. Verify Loan button now disabled for that book
9. Verify Return button now visible for that book

**Test Return from Dashboard:**
10. Click Return button: verify confirmation or immediate return
11. Verify success toast "Book returned from Jane Doe"
12. Verify Loanee column now empty
13. Verify Loan button enabled again
14. Verify Return button hidden

**Test Loan from Book Details:**
15. Click unloaned book title to view details
16. Verify Loan Information section shows "Not currently loaned"
17. Verify Loan button visible
18. Click Loan button: verify modal opens
19. Loan book to "John Smith"
20. Verify Loan Information section updates: shows "Loaned to: John Smith" and loan date
21. Verify Loan button hidden or disabled
22. Verify Return button visible

**Test Return from Book Details:**
23. Click Return button: verify success toast
24. Verify Loan Information section updates: "Not currently loaned"
25. Verify Return button hidden
26. Verify Loan button visible again

**Test Loaned Books Page:**
27. Navigate to Loaned Books page
28. Verify loaned book appears in list
29. Click Return button: verify success toast
30. Verify book removed from loaned books list
31. Navigate back to Dashboard: verify loanee cleared

**Test Edge Cases:**
32. Try to loan already loaned book (simulate 409): verify error toast
33. Test with backend stopped: verify error toast
34. Check browser console: no errors
35. Run `npm test` - all tests pass
36. Run `npm run test:coverage` - verify coverage >80%

---

## Sample Test Data

Use for testing:
1. Loan "The Great Adventure" to "Jane Doe"
2. Loan "Mystery Tales" to "John Smith"
3. Return "The Great Adventure"
4. Loan "Space Odyssey" to "Alice Johnson"

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Plan 06 (Dashboard with grid)
- Plan 07 (Loaned Books page)
- Plan 09 (Book Details page)
- Backend: POST /api/books/{bookId}/loan and DELETE /api/books/{bookId}/loan endpoints

## Notes

- Loan button disabled/hidden when book already loaned
- Return button only visible when book is loaned
- Backend manages loanDate, returnedDate, isReturned fields
- Frontend only provides borrowedTo
- Consider adding confirmation modal for return operation (optional)
- Backend enforces business rule: no duplicate active loans (returns 409)
- Returned loans remain in history (not deleted)
