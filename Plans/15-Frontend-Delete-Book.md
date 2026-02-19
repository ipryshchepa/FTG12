## Subplan 15: Frontend Delete Book Feature

**Purpose:** Implement book deletion functionality allowing users to remove books from their library. Includes Delete button on Dashboard grid and Book Details page with confirmation modal.

**Current State:**
- Dashboard displays books in grid (Plan 06)
- Book Details page shows book information (Plans 09-10)
- BookService.deleteBook() available
- Shared Modal component available

**Backend API:**
- DELETE /api/books/{id} → Delete book and cascade delete related entities (rating, loans, status)
- Returns 204 No Content on success
- Returns 404 if book not found

**What This Plan Delivers:**
- Delete button on Dashboard grid
- Delete button on Book Details page
- Delete confirmation modal with book title
- Cascade deletion of related data (rating, loans, reading status)
- Navigation to Dashboard after deleting from Book Details page
- Success/error handling with toast notifications

---

## Tasks

### 1. Component Development

**Create `src/components/books/DeleteBookConfirmation.jsx`:**
- Props: isOpen, onClose, bookId, bookTitle, onSuccess
- Import: Modal, Button, useToast
- Import: bookService
- State: submitting (boolean)
- Display warning message:
  - "Are you sure you want to delete this book?"
  - Display book title prominently
  - Warning: "This will also delete the book's rating, reading status, and loan history. This action cannot be undone."
- Buttons:
  - Cancel: close modal without deleting
  - Confirm Delete: call bookService.deleteBook(bookId)
- Confirm handler:
  - Set submitting true
  - Call bookService.deleteBook(bookId)
  - On success: show success toast "Book deleted", call onSuccess(), close modal
  - On error: show error toast with message
  - Finally: set submitting false
- Use danger/red styling for delete button
- Disable buttons while submitting
- Modal title: "Delete Book"

**Update `src/components/books/BookGrid.jsx` (add Delete action):**
- Add prop: onDelete (function)
- Add Delete button in Actions column
- Button click: call onDelete(book)
- Use icon button with trash/delete icon
- Danger/red color
- Materialize styling

**Update `src/pages/Dashboard.jsx` (add Delete functionality):**
- Import: DeleteBookConfirmation, useModal
- Add state: deleteModal = useModal(), selectedBook (object)
- Add Delete handler:
  - Set selectedBook
  - Open deleteModal
- Pass onDelete={handleDelete} to BookGrid
- Render DeleteBookConfirmation:
  - isOpen={deleteModal.isOpen}
  - onClose={deleteModal.closeModal}
  - bookId={selectedBook?.id}
  - bookTitle={selectedBook?.title}
  - onSuccess={() => { refreshBooks(); deleteModal.closeModal(); }}

**Update `src/pages/BookDetails.jsx` (add Delete button):**
- Import: DeleteBookConfirmation, useModal
- Add state: deleteModal = useModal()
- Add Delete button (prominently placed, perhaps in header or at bottom of page)
- Button styling: danger/red, clear labeling "Delete Book"
- Button click: open deleteModal
- Render DeleteBookConfirmation:
  - isOpen={deleteModal.isOpen}
  - onClose={deleteModal.closeModal}
  - bookId={book.id}
  - bookTitle={book.title}
  - onSuccess={() => { navigate('/'); }} (navigate to Dashboard after delete)

### 2. Testing

**Create `src/components/books/DeleteBookConfirmation.test.jsx`:**
- Mock bookService.deleteBook
- Mock useToast
- Test modal renders when isOpen true
- Test displays warning message
- Test displays book title in message
- Test displays cascade warning (rating, status, loans deleted)
- Test Cancel button:
  - Click cancel
  - Verify modal closes
  - Verify deleteBook NOT called
- Test Confirm button:
  - Click confirm
  - Verify bookService.deleteBook called with correct bookId
  - Verify success toast shown
  - Verify onSuccess called
  - Verify modal closes
- Test error handling:
  - Mock deleteBook to throw error
  - Click confirm
  - Verify error toast shown
  - Verify modal stays open
- Test buttons disabled while submitting
- Test Confirm button has danger styling

**Update `src/components/books/BookGrid.test.jsx`:**
- Test Delete button present in Actions column
- Test Delete button has danger/red styling
- Test clicking Delete button calls onDelete with correct book

**Update `src/pages/Dashboard.test.jsx`:**
- Test Delete button click opens DeleteBookConfirmation
- Test confirmation displays correct book title
- Test confirmation onSuccess refreshes books grid
- Test deleted book removed from grid
- Integration test: delete book, verify removed from grid

**Update `src/pages/BookDetails.test.jsx`:**
- Test Delete button present on page
- Test Delete button has danger styling and clear label
- Test clicking Delete button opens DeleteBookConfirmation
- Test confirmation displays correct book title
- Test confirmation onSuccess navigates to Dashboard
- Integration test: delete book from details page, verify navigation to Dashboard

---

## Verification Steps

1. Start backend and frontend
2. Navigate to Dashboard with multiple books

**Test Delete from Dashboard:**
3. Verify Delete button visible for each book (with danger styling)
4. Click Delete button: verify confirmation modal opens
5. Verify modal displays book title
6. Verify warning about cascade deletion
7. Click Cancel: verify modal closes without deleting
8. Verify book still in grid
9. Click Delete button again, click Confirm Delete
10. Verify success toast "Book deleted"
11. Verify modal closes
12. Verify book removed from grid
13. Refresh page: verify book still deleted (persisted)

**Test Delete from Book Details:**
14. Click book title to view details
15. Verify Delete button present (prominently placed, danger styled)
16. Click Delete button: verify confirmation modal opens
17. Verify modal displays correct book title
18. Click Cancel: verify modal closes, stays on details page
19. Click Delete button again, click Confirm Delete
20. Verify success toast
21. Verify navigation to Dashboard
22. Verify book no longer in grid

**Test Cascade Deletion:**
23. Create a book with:
    - Rating (score and notes)
    - Reading status
    - Loan history (loan, return, loan again)
24. Delete this book
25. Verify deletion successful
26. Try to access book details directly (via URL): verify 404 or redirect
27. Check backend database (optional): verify related entities deleted

**Test Edge Cases:**
28. Try to delete book while backend stopped: verify error toast
29. Try to delete already deleted book (manually via backend): verify 404 error handled
30. Delete book that is currently loaned: verify deletes successfully (cascade)
31. Check browser console: no errors
32. Run `npm test` - all tests pass
33. Run `npm run test:coverage` - verify coverage >80%

---

## Sample Test Data

Create and delete these books:
1. Simple book: no rating, status, or loans → Delete successfully
2. Complex book: with rating, reading status, and loan history → Delete successfully, verify cascade
3. Currently loaned book → Delete successfully

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Plan 06 (Dashboard with grid)
- Plan 09 (Book Details page)
- Backend: DELETE /api/books/{id} endpoint with cascade delete

## Notes

- Backend handles cascade deletion automatically (EF Core configured for this)
- Frontend just calls DELETE endpoint - no need to delete related entities separately
- Confirmation modal is critical - prevent accidental deletions
- Consider adding "soft delete" functionality in future (mark as deleted rather than permanently remove)
- Navigation after delete from Book Details is important - can't stay on deleted book's page
- Delete button should be clearly marked as destructive action (red/danger styling)
- Consider requiring additional confirmation for books with loans or extensive data (future enhancement)
