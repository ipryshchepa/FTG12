## Subplan 13: Frontend Update Reading Status Feature

**Purpose:** Implement reading status management allowing users to set a book's reading status (Backlog, Completed, Abandoned). Includes Update Status button on Dashboard grid and Book Details page.

**Current State:**
- Dashboard displays books with reading status column (Plan 06)
- Book Details page shows Reading Status section (Plan 09)
- ReadingStatusService.updateReadingStatus() available
- Constants with READING_STATUS_OPTIONS available

**Backend API:**
- PUT /api/books/{bookId}/reading-status → Create or update status from ReadingStatusDto
- ReadingStatusDto: { status (ReadingStatusEnum: Backlog, Completed, Abandoned) }
- Do NOT include id field
- Returns 200 OK

**What This Plan Delivers:**
- Update Status button on Dashboard grid
- Update Status button on Book Details page
- Update Reading Status modal with dropdown
- Create new status or update existing status
- Display updated status immediately after save
- Success/error handling with toast notifications

---

## Tasks

### 1. Component Development

**Create `src/components/books/UpdateReadingStatusModal.jsx`:**
- Props: isOpen, onClose, bookId, currentStatus (string), onSuccess
- Import: Modal, FormSelect, Button, useToast, constants (READING_STATUS_OPTIONS)
- Import: readingStatusService
- State: status (string), submitting (boolean), error (string)
- Initialize: if currentStatus provided, pre-select in dropdown
- Form:
  - Dropdown: "Reading Status"
  - Options: Backlog, Completed, Abandoned (from READING_STATUS_OPTIONS)
  - Default: currentStatus or Backlog
- Submit handler:
  - Validate: status must be selected
  - Set submitting true
  - Prepare payload: { status }
  - Call readingStatusService.updateReadingStatus(bookId, payload)
  - On success: show success toast "Reading status updated", call onSuccess(), close modal
  - On error: show error toast with message
  - Finally: set submitting false
- Cancel button: close modal without saving
- Disable form while submitting
- Modal title: "Update Reading Status"

**Update `src/components/books/BookGrid.jsx` (add Update Status action):**
- Add prop: onUpdateStatus (function)
- Add "Update Status" button in Actions column
- Button click: call onUpdateStatus(book)
- Use icon button or text button
- Materialize styling

**Update `src/pages/Dashboard.jsx` (add Update Status functionality):**
- Import: UpdateReadingStatusModal, useModal
- Add state: statusModal = useModal(), selectedBook (object)
- Add Update Status handler:
  - Set selectedBook
  - Open statusModal with book's current status
- Pass onUpdateStatus={handleUpdateStatus} to BookGrid
- Render UpdateReadingStatusModal:
  - isOpen={statusModal.isOpen}
  - onClose={statusModal.closeModal}
  - bookId={selectedBook?.id}
  - currentStatus={selectedBook?.readingStatus}
  - onSuccess={() => { refreshBooks(); statusModal.closeModal(); }}

**Update `src/pages/BookDetails.jsx` (add Update Status button):**
- Import: UpdateReadingStatusModal, useModal
- Add state: statusModal = useModal()
- Add "Update Status" button in Reading Status section
- Button click: open statusModal
- Pass current status: book.readingStatus
- Render UpdateReadingStatusModal with same props
- On success: refetch book data to show updated status

### 2. Testing

**Create `src/components/books/UpdateReadingStatusModal.test.jsx`:**
- Mock readingStatusService.updateReadingStatus
- Mock useToast
- Mock Materialize components (Modal, FormSelect)
- Test modal renders when isOpen true
- Test dropdown present with options: Backlog, Completed, Abandoned
- Test current status pre-selected:
  - Pass currentStatus="Completed"
  - Verify "Completed" selected in dropdown
- Test selecting different status:
  - Select "Abandoned"
  - Click Submit
  - Verify updateReadingStatus called with { status: "Abandoned" }
  - Verify success toast shown
  - Verify onSuccess called
  - Verify modal closes
- Test validation:
  - Submit without selecting status: verify error (or default to Backlog)
- Test error handling:
  - Mock service to throw error
  - Verify error toast shown
  - Verify modal stays open
- Test cancel button closes without saving
- Test form disabled while submitting

**Update `src/components/books/BookGrid.test.jsx`:**
- Test "Update Status" button present in Actions column
- Test clicking button calls onUpdateStatus with correct book

**Update `src/pages/Dashboard.test.jsx`:**
- Test "Update Status" button click opens UpdateReadingStatusModal
- Test modal receives correct bookId and currentStatus
- Test modal onSuccess refreshes books grid
- Integration test: open status modal, select status, submit, verify grid updates

**Update `src/pages/BookDetails.test.jsx`:**
- Test "Update Status" button present in Reading Status section
- Test clicking button opens UpdateReadingStatusModal
- Test modal receives correct bookId and currentStatus
- Test modal onSuccess refetches book data
- Test Reading Status section updates after save

---

## Verification Steps

1. Start backend and frontend
2. Navigate to Dashboard
3. Verify "Update Status" button visible for each book in grid

**Test from Dashboard:**
4. Click "Update Status" for a book: verify modal opens
5. Verify dropdown shows all options: Backlog, Completed, Abandoned
6. Select "Completed"
7. Click Submit: verify success toast "Reading status updated"
8. Verify modal closes
9. Verify book in grid now shows "Completed" in Reading Status column
10. Click "Update Status" for same book: verify "Completed" pre-selected
11. Change to "Abandoned", save: verify updates

**Test from Book Details:**
12. Navigate to Book Details for a book
13. Verify Reading Status section shows current status (or "No reading status set")
14. Click "Update Status" button: verify modal opens with current status selected
15. Select "Backlog", save: verify success toast
16. Verify Reading Status section updates immediately to "Backlog"
17. Refresh page: verify status persisted

**Test Different Scenarios:**
18. Test book with no status: verify can set initial status
19. Test book with existing status: verify can update
20. Test all three status options: Backlog, Completed, Abandoned
21. Test cancel button: opens modal, selects status, cancels, reopens, verify no change
22. Stop backend, try to update: verify error toast
23. Check browser console: no errors
24. Run `npm test` - all tests pass
25. Run `npm run test:coverage` - verify coverage >80%

---

## Sample Test Data

Update reading statuses for these books:
1. "The Great Adventure" → Completed
2. "Mystery Tales" → Backlog
3. "Space Odyssey" → Abandoned
4. Update "The Great Adventure" from Completed → Backlog

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Plan 06 (Dashboard with grid)
- Plan 09 (Book Details page)
- Backend: PUT /api/books/{bookId}/reading-status endpoint

## Notes

- Reading status is create or update (one status per book)
- Do NOT include id field in payload
- Backend automatically creates new or updates existing status
- Status is required (cannot be cleared once set - use one of the three options)
- Delete reading status functionality can be added separately if needed
- Consider adding colors or icons for different statuses (Backlog: blue, Completed: green, Abandoned: gray)
