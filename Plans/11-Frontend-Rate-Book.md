## Subplan 11: Frontend Rate Book Feature

**Purpose:** Implement book rating functionality allowing users to rate books with a score (1-10) and optional notes. Includes Rate button and modal on both Dashboard grid and Book Details page.

**Current State:**
- Dashboard displays books with grid (Plan 06)
- Book Details page shows rating section (Plan 09)
- RatingService.createOrUpdateRating() available
- Shared Modal component available

**Backend API:**
- POST /api/books/{bookId}/rating → Create or update rating from RatingDto
- RatingDto: { score (1-10, required), notes? }
- Id field should NOT be included (backend manages this)
- Returns 200 OK for success

**What This Plan Delivers:**
- Rate button in Dashboard grid for each book
- Rate button on Book Details page
- Rate Book modal with 10-star rating input and notes textarea
- Create new rating or update existing rating
- Display updated rating immediately after save
- Success/error handling with toast notifications

---

## Tasks

### 1. Component Development

**Create `src/components/books/RateBookModal.jsx`:**
- Props: isOpen, onClose, bookId, existingRating (object: { score, notes }), onSuccess
- Import: Modal, FormTextarea, Button, useToast, constants (SCORE_MIN, SCORE_MAX, MAX_LENGTHS)
- Import: ratingService
- State: score (number, 1-10), notes (string), submitting (boolean), error (string)
- Initialize: if existingRating provided, pre-fill score and notes
- Star rating input:
  - Render 10 clickable stars (☆ or ★)
  - Clicking star sets score to that star's number
  - Show selected stars as filled (★), unselected as empty (☆)
  - Hover effect: show preview of selection
  - Display current score number (e.g., "7/10")
- Notes textarea:
  - Optional
  - Max 1000 characters
  - Show character count
- Submit handler:
  - Validate: score must be 1-10
  - Set submitting true
  - Prepare payload: { score, notes: notes || null }
  - Call ratingService.createOrUpdateRating(bookId, payload)
  - On success: show success toast, call onSuccess(), close modal
  - On error: show error toast, set error state
  - Finally: set submitting false
- Cancel button: close modal without saving
- Modal title: "Rate Book" (or "Update Rating" if existingRating)
- Disable form while submitting

**Update `src/components/books/BookGrid.jsx` (add Rate action):**
- Add prop: onRate (function)
- Add Rate button in Actions column for each book row
- Button click: call onRate(book)
- Use icon button style (small button or icon)
- Materialize button styling

**Update `src/pages/Dashboard.jsx` (add Rate functionality):**
- Import: RateBookModal, useModal
- Add state: rateModal = useModal(), selectedBook (object)
- Add Rate handler:
  - Set selectedBook to book being rated
  - Open rateModal with book's existing rating data
- Pass onRate={handleRate} to BookGrid
- Render RateBookModal:
  - isOpen={rateModal.isOpen}
  - onClose={rateModal.closeModal}
  - bookId={selectedBook?.id}
  - existingRating={selectedBook?.score ? { score: selectedBook.score, notes: selectedBook.ratingNotes } : null}
  - onSuccess={() => { refreshBooks(); rateModal.closeModal(); }}

**Update `src/pages/BookDetails.jsx` (add Rate button):**
- Import: RateBookModal, useModal
- Add state: rateModal = useModal()
- Add Rate button in Rating section
- Button click: open rateModal
- Pass existing rating data: { score: book.score, notes: book.ratingNotes }
- Render RateBookModal with same props as Dashboard
- On success: refetch book data to show updated rating

### 2. Styling

**Update `src/App.css` (add star rating styles):**
- Star display styles: size, color, spacing
- Star hover effects: highlight, preview
- Star selected state: filled color (gold/yellow)
- Star unselected state: empty or gray
- Clickable cursor on stars
- Responsive star size for mobile

### 3. Testing

**Create `src/components/books/RateBookModal.test.jsx`:**
- Mock ratingService.createOrUpdateRating
- Mock useToast
- Mock Materialize Modal
- Test modal renders when isOpen true
- Test 10 stars rendered and clickable
- Test clicking star sets score correctly
- Test star display: selected stars filled, others empty
- Test score number displays (e.g., "7/10")
- Test notes textarea present and functional
- Test character count for notes
- Test submit with valid score:
  - Select score 8
  - Enter notes "Great book"
  - Click submit
  - Verify createOrUpdateRating called with { score: 8, notes: "Great book" }
  - Verify success toast shown
  - Verify onSuccess called
  - Verify modal closes
- Test submit without notes:
  - Select score 9
  - Leave notes empty
  - Verify payload: { score: 9, notes: null }
- Test validation:
  - Try submit without selecting score: verify error
- Test error handling:
  - Mock service to throw error
  - Verify error toast shown
  - Verify modal stays open
- Test existing rating pre-fills:
  - Pass existingRating: { score: 7, notes: "Good" }
  - Verify score 7 stars selected
  - Verify notes "Good" displayed
- Test cancel button closes without saving
- Test form disabled while submitting

**Update `src/components/books/BookGrid.test.jsx`:**
- Test Rate button present in Actions column
- Test clicking Rate button calls onRate with correct book

**Update `src/pages/Dashboard.test.jsx`:**
- Test Rate button click opens RateBookModal
- Test RateBookModal receives correct bookId
- Test RateBookModal receives existing rating if present
- Test RateBookModal onSuccess refreshes books grid
- Integration test: open rate modal, select rating, submit, verify grid updates

**Update `src/pages/BookDetails.test.jsx`:**
- Test Rate button present in Rating section
- Test clicking Rate button opens RateBookModal
- Test RateBookModal receives correct bookId and existing rating
- Test RateBookModal onSuccess refetches book data
- Test updated rating displays after save

---

## Verification Steps

1. Start backend and frontend
2. Navigate to Dashboard
3. Verify Rate button visible for each book in grid
4. Click Rate button: verify modal opens
5. Verify 10 stars rendered
6. Click different stars: verify selection updates
7. Verify selected stars highlighted/filled
8. Enter notes: "This is a test rating"
9. Click Submit: verify success toast
10. Verify modal closes
11. Verify book in grid now shows updated score
12. Click same book's Rate button again: verify existing rating pre-filled
13. Change score and notes, save: verify updates
14. Navigate to Book Details page for a book
15. Verify Rating section shows current rating (or "No rating yet")
16. Click Rate button on Book Details page: verify modal opens with existing data
17. Update rating, save: verify success toast
18. Verify Rating section updates immediately
19. Test rating a book with no existing rating: verify works
20. Test hover effect on stars
21. Test notes character count and max length
22. Test cancel button: verify no changes made
23. Stop backend, try to rate: verify error toast
24. Check browser console: no errors
25. Run `npm test` - all tests pass
26. Run `npm run test:coverage` - verify coverage >80%

---

## Sample Test Data

Rate these books for testing:
1. "The Great Adventure" → Score: 9, Notes: "Excellent story and characters"
2. "Mystery Tales" → Score: 7, Notes: "Good but predictable ending"
3. Unrated book → Score: 5, Notes: "Average read"

---

## Dependencies

- Plan 05 (Frontend Common Infrastructure)
- Plan 06 (Dashboard with grid)
- Plan 09 (Book Details page)
- Backend: POST /api/books/{bookId}/rating endpoint

## Notes

- Rating is create or update (one rating per book)
- Do NOT include id field in payload
- Backend automatically creates new or updates existing rating
- Stars should be visually appealing and easy to click
- Consider accessibility: keyboard navigation for stars
- Score is required (1-10), notes are optional
- Delete rating functionality will be handled separately if needed
