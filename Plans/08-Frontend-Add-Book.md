## Subplan 8: Frontend Add Book Feature

**Purpose:** Implement the Add Book functionality allowing users to create new books in their library. Includes "Add Book" button on Dashboard and modal form with validation.

**Current State:**
- Dashboard displays books in grid (Plans 05-06)
- BookService.createBook() available
- Shared Modal, FormInput, FormSelect components available
- Constants and validators available

**Backend API:**
- POST /api/books → Create book from BookDto
- BookDto fields: Title (required), Author (required), Description?, Notes?, ISBN?, PublishedYear?, PageCount?, OwnershipStatus (required)
- Id field must be null or omitted for creation
- Returns 201 Created with Location header and created book

**What This Plan Delivers:**
- "Add Book" button on Dashboard
- Add Book modal with form
- Client-side validation matching backend rules
- Success/error handling with toast notifications
- Grid refresh after successful creation

---

## Tasks

### 1. Component Development

**Create `src/components/books/AddBookModal.jsx`:**
- Props: isOpen, onClose, onSuccess
- Import: Modal, FormInput, FormSelect, FormTextarea, Button
- Import: bookService, constants (MAX_LENGTHS, OWNERSHIP_STATUS_OPTIONS), validators, useToast
- State: formData (object with all book fields), errors (object), submitting (boolean)
- Initial form state: empty fields, OwnershipStatus defaults to 'Own'
- Form fields:
  - Title (required, max 100 chars)
  - Author (required, max 100 chars)
  - Description (optional, max 500 chars, textarea)
  - Notes (optional, max 1000 chars, textarea)
  - ISBN (optional, max 20 chars)
  - Published Year (optional, number input, validate year range)
  - Page Count (optional, number input, positive integer)
  - Ownership Status (required, dropdown, options from constants)
- Validation: Run on form submission
  - Use validators from utils
  - Display inline errors for each field
  - Prevent submission if validation fails
- Submit handler:
  - Set submitting true
  - Prepare payload: { ...formData, id: null } or omit id field
  - Call bookService.createBook(payload)
  - On success: show success toast, call onSuccess(), reset form, close modal
  - On error: show error toast with message, set submitting false
  - Finally: set submitting false
- Cancel button: reset form, close modal
- Disable form inputs and buttons while submitting
- Use Materialize form styling

**Update `src/pages/Dashboard.jsx` (add Add Book functionality):**
- Import: AddBookModal, useModal, useToast
- Add modal state: const addBookModal = useModal()
- Add "Add Book" button above BookGrid (top-right or header area)
- Button click: open addBookModal
- Render AddBookModal component:
  - isOpen={addBookModal.isOpen}
  - onClose={addBookModal.closeModal}
  - onSuccess={() => { refreshBooks(); addBookModal.closeModal(); }}
- Success callback: refresh books grid and close modal

### 2. Testing

**Create `src/components/books/AddBookModal.test.jsx`:**
- Mock bookService.createBook
- Mock useToast
- Mock Materialize components (Modal, FormSelect)
- Test modal renders when isOpen true
- Test modal doesn't render when isOpen false
- Test all form fields present: Title, Author, Description, Notes, ISBN, Published Year, Page Count, Ownership Status
- Test can type into text inputs
- Test can select ownership status from dropdown
- Test client-side validation:
  - Submit with empty Title: error displayed
  - Submit with empty Author: error displayed
  - Submit with Title >100 chars: error displayed
  - Submit with valid data: no errors
- Test form submission:
  - Fill valid data
  - Click submit
  - Verify bookService.createBook called with correct payload (no id field or id=null)
  - Verify success toast shown
  - Verify onSuccess callback called
  - Verify modal closes
  - Verify form resets
- Test error handling:
  - Mock createBook to throw error
  - Submit form
  - Verify error toast shown with error message
  - Verify modal stays open
  - Verify submitting state resets
- Test cancel button: closes modal without creating book
- Test form disabled while submitting

**Update `src/pages/Dashboard.test.jsx`:**
- Add test for "Add Book" button present
- Test clicking "Add Book" button opens AddBookModal
- Test AddBookModal onSuccess callback refreshes books grid
- Integration test: open modal, fill form, submit, verify new book appears in grid

---

## Verification Steps

1. Start backend and frontend
2. Navigate to Dashboard
3. Verify "Add Book" button visible
4. Click "Add Book" button: verify modal opens
5. Verify all form fields present and labeled correctly
6. Test validation:
   - Try submit with empty Title: verify error message
   - Try submit with empty Author: verify error message
   - Try submit with Title >100 chars: verify error message
   - Fill all required fields: verify can submit
7. Fill valid book data:
   - Title: "Test Book"
   - Author: "Author McAuthorface"
   - Description: "A test book for verification"
   - Ownership Status: "Own"
8. Click Submit: verify success toast appears
9. Verify modal closes
10. Verify new book appears in Dashboard grid
11. Click "Add Book" again: verify form is cleared (no data from previous submission)
12. Try submitting with backend stopped: verify error toast with connection error
13. Check browser console: no errors
14. Test with different ownership statuses: WantToBuy, Own, SoldOrGaveAway
15. Test with optional fields: Published Year, Page Count, ISBN
16. Test cancel button: opens modal, partially fills form, clicks cancel, reopens modal, verify form is cleared
17. Run `npm test` - all tests pass
18. Run `npm run test:coverage` - verify coverage >80%

---

## Sample Test Data

Use for testing:
- Title: "The Great Test", Author: "Author McAuthorface", Ownership: Own
- Title: "Future Reading", Author: "Author McAuthorface", Ownership: WantToBuy
- Title: "Finished Book", Author: "Author McAuthorface", Ownership: SoldOrGaveAway, Description: "Already read and gave to friend"

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Plan 06 (Dashboard View)
- Backend: POST /api/books endpoint

## Notes

- Id field handling: must be null or omitted when creating
- Backend validates this and returns 400 if id is provided
- All ownership status options should be available in dropdown
- Form should reset after successful submission
- Consider adding a "Add Another" button that keeps modal open after success (optional enhancement)
