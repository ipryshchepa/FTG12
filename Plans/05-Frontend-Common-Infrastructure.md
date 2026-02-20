## Subplan 5: Frontend Common Infrastructure

**Purpose:** Set up foundational frontend infrastructure including dependencies, configuration, routing, API integration layer, shared components, utilities, and testing framework. This plan prepares the application for feature development.

**Technology Stack:**
- React 19.2.0 with Vite 7.3.1
- React Router DOM v7+
- Vitest + React Testing Library
- Materialize CSS (already configured)

**Current State:**
- Basic React app exists with single-page App component
- Materialize CSS 1.0.0 configured in main.jsx
- Backend API running on http://localhost:5274 with CORS enabled
- All backend endpoints implemented (Books, Ratings, Loans, Reading Status)

**Backend API Information:**
- Base URL: http://localhost:5274
- DTOs: BookDto (create/update with Id? field), BookDetailsDto (read operations with flattened data), RatingDto, LoanDto, ReadingStatusDto
- Error responses: ProblemDetails format
- JSON: camelCase, enums as strings
- Ownership Status: WantToBuy, Own, SoldOrGaveAway
- Reading Status: Backlog, Completed, Abandoned

---

## Tasks

### 1. Dependency Installation

**Install routing and testing libraries:**
- React Router DOM v7+
- Vitest and UI
- jsdom
- React Testing Library (@testing-library/react, @testing-library/jest-dom, @testing-library/user-event)
- Coverage provider (@vitest/coverage-v8)
- PropTypes for component validation

### 2. Configuration Setup

**Create environment files:**
- `.env.development` with VITE_API_URL=http://localhost:5274
- `.env.production` with VITE_API_URL placeholder
- `.env.example` as template

**Update vite.config.js:**
- Add test configuration with jsdom environment
- Enable globals for test utilities
- Configure setupFiles pointing to setupTests.js
- Set coverage thresholds: 80% for lines, functions, branches, statements
- Set coverage reporters: text, html, json

**Update package.json scripts:**
- Add test scripts: test, test:watch, test:ui, test:coverage
- Update build script to run tests first: `npm test && vite build`

**Update .gitignore:**
- Add coverage/ directory

### 3. Application Configuration

**Create `src/config/index.js`:**
- Export configuration object with API_URL from environment
- Add other config constants as needed

**Create `src/constants/index.js`:**
- OWNERSHIP_STATUS enum: { WANT_TO_BUY: 'WantToBuy', OWN: 'Own', SOLD_OR_GAVE_AWAY: 'SoldOrGaveAway' }
- READING_STATUS enum: { BACKLOG: 'Backlog', COMPLETED: 'Completed', ABANDONED: 'Abandoned' }
- OWNERSHIP_STATUS_OPTIONS array for dropdowns: [{ value, label }]
- READING_STATUS_OPTIONS array for dropdowns: [{ value, label }]
- MAX_LENGTHS: { TITLE: 100, AUTHOR: 100, DESCRIPTION: 500, NOTES: 1000, ISBN: 20, BORROWED_TO: 100, RATING_NOTES: 1000 }
- SCORE_MIN: 1, SCORE_MAX: 10

### 4. API Integration Layer

**Create `src/services/api.js`:**
- Base fetch wrapper with error handling
- Functions: get(endpoint), post(endpoint, data), put(endpoint, data), del(endpoint)
- Set base URL from config
- Add Content-Type: application/json header
- Parse JSON responses
- Handle error status codes (4xx, 5xx)
- Extract error messages from ProblemDetails format
- Throw descriptive errors with status codes
- Use async/await patterns

**Create `src/services/bookService.js`:**
- getAllBooks() - GET /api/books → BookDetailsDto[]
- getBookDetails(id) - GET /api/books/{id} → BookDetailsDto
- createBook(bookData) - POST /api/books (Id must be null or omitted)
- updateBook(id, bookData) - PUT /api/books/{id} (Id must match route parameter)
- deleteBook(id) - DELETE /api/books/{id}

**Create `src/services/ratingService.js`:**
- createOrUpdateRating(bookId, ratingData) - POST /api/books/{bookId}/rating
- deleteRating(bookId) - DELETE /api/books/{bookId}/rating

**Create `src/services/loanService.js`:**
- getActiveLoanedBooks() - GET /api/loans → Loan[]
- getLoanHistory(bookId) - GET /api/books/{bookId}/loans → Loan[]
- createLoan(bookId, loanData) - POST /api/books/{bookId}/loan
- returnBook(bookId) - DELETE /api/books/{bookId}/loan

**Create `src/services/readingStatusService.js`:**
- updateReadingStatus(bookId, statusData) - PUT /api/books/{bookId}/reading-status
- deleteReadingStatus(bookId) - DELETE /api/books/{bookId}/reading-status

### 5. Custom Hooks

**Create `src/hooks/useBooks.js`:**
- Manages books state: books array, loading, error
- fetchBooks() function calling bookService
- refreshBooks() for manual refresh
- useEffect to fetch on mount
- Returns: books, loading, error, fetchBooks, refreshBooks

**Create `src/hooks/useModal.js`:**
- Manages modal state: isOpen, data
- Functions: openModal(data?), closeModal(), toggle()
- Returns: isOpen, data, openModal, closeModal, toggle

**Create `src/hooks/useToast.js`:**
- Wrapper for Materialize toast notifications
- showToast(message, type) where type: 'success', 'error', 'info'
- Uses M.toast() method
- Returns: showToast function

### 6. Utility Functions

**Create `src/utils/formatters.js`:**
- formatOwnershipStatus(status) - convert enum to readable text
- formatReadingStatus(status) - convert enum to readable text
- formatStarRating(score) - return stars display (★ symbols)
- formatDate(date) - format date to readable string

**Create `src/utils/validators.js`:**
- validateTitle(title) - required, max 100 chars
- validateAuthor(author) - required, max 100 chars
- validateUrl(url) - valid URL format
- validateYear(year) - valid year range
- validateScore(score) - 1-10 range
- Return error message or null if valid

### 7. Shared UI Components

**Create `src/components/shared/Modal.jsx`:**
- Reusable modal using Materialize
- Props: isOpen, onClose, title, children, maxWidth
- Initialize Materialize modal on mount
- Handle open/close with instance
- Close button (X) in header

**Create `src/components/shared/Button.jsx`:**
- Props: children, onClick, variant, disabled, type
- Variants: primary, secondary, danger
- Apply Materialize button classes

**Create `src/components/shared/FormInput.jsx`:**
- Props: label, name, value, onChange, type, required, maxLength, error
- Materialize input field structure
- Display validation error if provided

**Create `src/components/shared/FormSelect.jsx`:**
- Props: label, name, value, onChange, options, required, error
- Options: array of {value, label}
- Initialize Materialize select on mount

**Create `src/components/shared/FormTextarea.jsx`:**
- Props: label, name, value, onChange, maxLength, error, rows
- Display character count
- Materialize styling

**Create `src/components/shared/LoadingSpinner.jsx`:**
- Props: message (optional)
- Materialize preloader
- Centered display

**Create `src/components/shared/ErrorMessage.jsx`:**
- Props: message, onRetry (optional)
- Materialize card/alert styling
- Red color scheme
- Optional retry button

### 8. Layout and Navigation

**Create `src/components/Navigation.jsx`:**
- Materialize navbar structure
- Links: Dashboard (/), Loaned Books (/loans)
- Use Link from react-router-dom
- Mobile hamburger menu support

**Create `src/components/Layout.jsx`:**
- Wrapper component accepting children
- Render Navigation component
- Render main content area
- Include Outlet for nested routes

**Clean up stub code:**
- Remove content from App.jsx (will be removed/replaced)
- Clear App.css (keep file but remove stub styles)
- Keep main.jsx (Materialize initialization)
- Keep index.css (global styles)

### 9. Routing Structure

**Create `src/router/index.jsx`:**
- Import createBrowserRouter, RouterProvider
- Define routes:
  - Parent: Layout component
  - Child: '/' → Dashboard (placeholder)
  - Child: '/loans' → LoanedBooks (placeholder)
  - Child: '/books/:bookId' → BookDetails (placeholder)
  - Child: '/books/:bookId/history' → LoanHistory (placeholder)
- Create and export router

**Create placeholder pages:**
- `src/pages/Dashboard.jsx` - simple component with heading
- `src/pages/LoanedBooks.jsx` - simple component with heading
- `src/pages/BookDetails.jsx` - use useParams, display bookId temporarily
- `src/pages/LoanHistory.jsx` - use useParams, display bookId temporarily

**Update main.jsx:**
- Import router
- Replace <App /> with <RouterProvider router={router} />
- Keep Materialize initialization
- Keep StrictMode

**Remove App.jsx:**
- No longer needed with Layout component

### 10. Test Infrastructure

**Create `src/setupTests.js`:**
- Import '@testing-library/jest-dom'
- Add custom matchers
- Setup Materialize mocks if needed

**Create `src/test-utils/index.jsx`:**
- Custom render function wrapping with MemoryRouter
- Mock router helper
- Mock data generators (mockBook, mockRating, etc.)
- Re-export everything from @testing-library/react

### 11. Styling Setup

**Update `src/App.css`:**
- Styles for star rating components
- Grid action button styles
- Modal content layout
- Responsive styles for mobile

**Update `src/index.css`:**
- Global error message styles
- Loading overlay styles
- Empty state styles
- Spacing and alignment

---

## Testing Tasks

### API Service Tests

**Create `src/services/api.test.js`:**
- Mock global fetch
- Test get() - verify fetch called correctly
- Test post() - verify JSON body, Content-Type header
- Test put() - similar to post
- Test del() - verify DELETE method
- Test error handling with failed responses
- Test response parsing

**Create `src/services/bookService.test.js`:**
- Mock api module
- Test getAllBooks() - correct endpoint
- Test getBookDetails(id) - correct endpoint with id
- Test createBook(data) - api.post called
- Test updateBook(id, data) - api.put called
- Test deleteBook(id) - api.del called
- Test error propagation

**Create `src/services/ratingService.test.js`:**
- Mock api module
- Test createOrUpdateRating() - correct endpoint and payload
- Test deleteRating() - correct endpoint

**Create `src/services/loanService.test.js`:**
- Mock api module
- Test getActiveLoanedBooks() - correct endpoint
- Test getLoanHistory(bookId) - correct endpoint with id
- Test createLoan() - correct payload
- Test returnBook() - delete call

**Create `src/services/readingStatusService.test.js`:**
- Mock api module
- Test updateReadingStatus() - correct endpoint and payload
- Test deleteReadingStatus() - correct endpoint

### Hook Tests

**Create `src/hooks/useBooks.test.js`:**
- Use renderHook from RTL
- Mock bookService
- Test initial state: loading true, books empty
- Test successful fetch: books populated, loading false
- Test fetch error: error state set
- Test refreshBooks: re-fetches data

**Create `src/hooks/useModal.test.js`:**
- Test initial state: isOpen false
- Test openModal(): isOpen becomes true
- Test closeModal(): isOpen becomes false
- Test data passing

**Create `src/hooks/useToast.test.js`:**
- Mock Materialize M.toast
- Test showToast() - M.toast called with correct parameters
- Test different toast types

### Shared Component Tests

**Create `src/components/shared/Modal.test.jsx`:**
- Mock Materialize modal initialization
- Test renders children when isOpen true
- Test doesn't render when isOpen false
- Test onClose called on close button click
- Test title displayed

**Create `src/components/shared/Button.test.jsx`:**
- Test renders children
- Test onClick handler called
- Test disabled state prevents clicks
- Test variant classes applied

**Create `src/components/shared/FormInput.test.jsx`:**
- Test renders label and input
- Test value controlled
- Test onChange called
- Test error message displayed
- Test required attribute

**Create `src/components/shared/FormSelect.test.jsx`:**
- Mock Materialize select
- Test options rendered
- Test selection change
- Test error display

**Create `src/components/shared/FormTextarea.test.jsx`:**
- Test character count displayed
- Test maxLength enforced
- Test value and onChange

**Create `src/components/shared/LoadingSpinner.test.jsx`:**
- Test spinner renders
- Test message displayed if provided

**Create `src/components/shared/ErrorMessage.test.jsx`:**
- Test message displayed
- Test retry button if provided

### Utility Tests

**Create `src/utils/formatters.test.js`:**
- Test formatOwnershipStatus - all enum values
- Test formatReadingStatus - all enum values
- Test formatStarRating - scores 1-10
- Test formatDate - readable string output

**Create `src/utils/validators.test.js`:**
- Test each validator with valid and invalid inputs
- Test validateTitle: empty, too long, valid
- Test validateAuthor: same cases
- Test validateUrl: invalid format, valid
- Test validateYear: out of range, valid
- Test validateScore: below 1, above 10, valid

### Layout and Navigation Tests

**Create `src/components/Navigation.test.jsx`:**
- Test renders navigation links
- Test links have correct href attributes
- Test active link highlighting

**Create `src/components/Layout.test.jsx`:**
- Test renders Navigation
- Test renders children
- Test renders Outlet for nested routes

---

## Verification Steps

1. Run `npm install` - verify all dependencies install
2. Run `npm run dev` - verify app starts on port 5173
3. Open browser to http://localhost:5173 - verify app loads
4. Verify navigation between Dashboard and Loaned Books works
5. Manually navigate to /books/test-id - verify BookDetails placeholder loads
6. Manually navigate to /books/test-id/history - verify LoanHistory placeholder loads
7. Check browser console - no errors
8. Run `npm test` - all tests pass
9. Run `npm run test:ui` - Vitest UI opens
10. Run `npm run test:coverage` - verify all infrastructure code covered
11. Verify environment variables: console.log(import.meta.env.VITE_API_URL)
12. Test API connectivity from browser console: `fetch('http://localhost:5274/api/books')`
13. Run `npm run build` - tests run first, build succeeds

---

## Dependencies

- Plan 1 (Docker infrastructure)
- Plan 3 (Backend API endpoints)

## Notes

- All test data should use books by imaginary author "Author McAuthorface"
- This plan provides foundation for all feature implementations
- No actual feature functionality yet - just infrastructure and placeholders
