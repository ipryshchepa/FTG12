## Subplan 10: Frontend Update Book Feature

**Purpose:** Add editing capability to the Book Details page, allowing users to modify book information. Includes Edit/Save/Cancel buttons and form validation.

**Current State:**
- Book Details page displays book information in read-only mode (Plan 09)
- BookService.updateBook() available
- Form components and validators available

**Backend API:**
- PUT /api/books/{id} → Update book from BookDto
- BookDto must include id field matching route parameter
- Backend validates id match and returns 400 if mismatch

**What This Plan Delivers:**
- Edit button on Book Details page
- Toggle between read-only and edit modes
- Editable form for all book properties
- Save and Cancel buttons in edit mode
- Validation matching backend rules
- Success/error handling with toast notifications

---

## Tasks

### 1. Component Development

**Update `src/pages/BookDetails.jsx` (add editing capability):**
- Import: FormInput, FormSelect, FormTextarea, useToast, validators, constants
- Add state: editing (boolean), formData (object), originalData (object), errors (object), submitting (boolean)
- Initialize formData with book data after fetch
- Store originalData for cancel functionality
- Add Edit button (visible when not editing):
  - Click: set editing=true, copy current book data to formData
- In edit mode:
  - Replace static text displays with form inputs:
    - Title: FormInput (required, max 100)
    - Author: FormInput (required, max 100)
    - Description: FormTextarea (optional, max 500)
    - Notes: FormTextarea (optional, max 1000)
    - ISBN: FormInput (optional, max 20)
    - Published Year: FormInput type="number" (optional, validate year)
    - Page Count: FormInput type="number" (optional, positive integer)
    - Ownership Status: FormSelect (required, dropdown)
  - Add Save button:
    - Validate form data
    - Call bookService.updateBook(bookId, { ...formData, id: bookId })
    - On success: show success toast, refetch book data, set editing=false
    - On error: show error toast, stay in edit mode
  - Add Cancel button:
    - Revert formData to originalData
    - Set editing=false
    - Clear errors
- Keep Rating, Reading Status, and Loan sections read-only (not editable here)
- Disable Edit button if book is being edited
- Disable Save/Cancel buttons while submitting
- Show validation errors inline for each field

### 2. Testing

**Update `src/pages/BookDetails.test.jsx` (add editing tests):**
- Test Edit button visible when not editing
- Test clicking Edit button enables edit mode
- Test in edit mode: form inputs visible instead of static text
- Test all form fields editable:
  - Can type into Title input
  - Can type into Author input
  - Can type into Description textarea
  - Can type into Notes textarea
  - Can type into ISBN input
  - Can type into Published Year input
  - Can type into Page Count input
  - Can select Ownership Status from dropdown
- Test Save button:
  - Modify fields in edit mode
  - Click Save
  - Verify validation runs
  - Verify bookService.updateBook called with correct payload (including id)
  - Verify success toast shown
  - Verify edit mode disabled after save
  - Verify book data refetched and displayed
- Test Cancel button:
  - Modify fields in edit mode
  - Click Cancel
  - Verify changes reverted to original values
  - Verify edit mode disabled
  - Verify errors cleared
- Test validation:
  - Clear Title field: verify error shown
  - Clear Author field: verify error shown
  - Enter Title >100 chars: verify error shown
  - Try save with validation errors: verify save prevented
- Test error handling:
  - Mock updateBook to throw error
  - Try to save
  - Verify error toast shown
  - Verify stays in edit mode
- Test Edit button disabled while editing
- Test Save/Cancel buttons disabled while submitting

---

## Verification Steps

1. Start backend and frontend
2. Navigate to Dashboard, click a book title to view details
3. Verify Edit button visible (when not editing)
4. Click Edit button: verify form inputs appear
5. Verify all fields are editable:
   - Type into Title
   - Type into Author
   - Modify Description
   - Modify Notes
   - Change ISBN
   - Change Published Year
   - Change Page Count
   - Select different Ownership Status
6. Modify some fields and click Save:
   - Verify success toast appears
   - Verify edit mode disables
   - Verify updated data displays
7. Verify changes persisted: refresh page, verify new values shown
8. Enable edit mode again, modify fields, click Cancel:
   - Verify changes reverted to saved values
   - Verify edit mode disables
9. Test validation:
   - Edit book, clear Title field, click Save
   - Verify error message appears
   - Verify save prevented
   - Fill Title, click Save again: verify saves successfully
10. Test with backend stopped: try to save, verify error toast
11. Test Rating, Reading Status, Loan sections: verify not editable in edit mode
12. Check browser console: no errors
13. Test Edit button disabled while editing
14. Run `npm test` - all tests pass
15. Run `npm run test:coverage` - verify coverage >80%

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Plan 09 (View Book Details)
- Backend: PUT /api/books/{id} endpoint

## Notes

- Only basic book information is editable (not rating, status, or loan)
- Id field must be included in payload and match route parameter
- Backend validates this and returns 400 if mismatch
- Consider adding "unsaved changes" warning if user navigates away while editing (optional enhancement)
- Ownership status change doesn't affect rating or reading status (but consider if WantToBuy should clear these in future)
