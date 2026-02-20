import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import BookDetails from './BookDetails';
import * as bookService from '../services/bookService';

// Mock useParams and useNavigate
const mockNavigate = vi.fn();
const mockBookId = '123e4567-e89b-12d3-a456-426614174000';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ bookId: mockBookId }),
    useNavigate: () => mockNavigate
  };
});

// Mock components
vi.mock('../components/shared/LoadingSpinner', () => ({
  default: ({ message }) => (
    <div data-testid="loading-spinner">{message}</div>
  )
}));

vi.mock('../components/shared/ErrorMessage', () => ({
  default: ({ message, onRetry }) => (
    <div data-testid="error-message">
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}));

vi.mock('../components/shared/Button', () => ({
  default: ({ children, onClick, variant, disabled, style }) => (
    <button onClick={onClick} data-variant={variant} disabled={disabled} style={style}>
      {children}
    </button>
  )
}));

vi.mock('../components/shared/FormInput', () => ({
  default: ({ label, name, value, onChange, error, required, maxLength, type }) => (
    <div data-testid="form-input">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <input
        id={name}
        name={name}
        type={type || 'text'}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  )
}));

vi.mock('../components/shared/FormSelect', () => ({
  default: ({ label, name, value, onChange, options, error, required }) => (
    <div data-testid="form-select">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">Choose {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  )
}));

vi.mock('../components/shared/FormTextarea', () => ({
  default: ({ label, name, value, onChange, error, maxLength }) => (
    <div data-testid="form-textarea">
      <label htmlFor={name}>{label}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
      />
      {error && <span data-testid={`error-${name}`}>{error}</span>}
    </div>
  )
}));

vi.mock('../components/books/RateBookModal', () => ({
  default: ({ isOpen, onClose, bookId, existingRating, onSuccess }) => (
    isOpen ? (
      <div data-testid="rate-book-modal">
        <p>Rating Book ID: {bookId}</p>
        {existingRating && <p>Existing Score: {existingRating.score}</p>}
        <button onClick={onClose}>Close Rate Modal</button>
        <button onClick={() => {
          onSuccess();
          onClose();
        }}>Submit Rating</button>
      </div>
    ) : null
  )
}));

vi.mock('../components/books/LoanBookModal', () => ({
  default: ({ isOpen, onClose, bookId, onSuccess }) => (
    isOpen ? (
      <div data-testid="loan-book-modal">
        <p>Loaning Book ID: {bookId}</p>
        <button onClick={onClose}>Close Loan Modal</button>
        <button onClick={() => {
          onSuccess();
          onClose();
        }}>Submit Loan</button>
      </div>
    ) : null
  )
}));

vi.mock('../components/books/UpdateReadingStatusModal', () => ({
  default: ({ isOpen, onClose, bookId, currentStatus, onSuccess }) => (
    isOpen ? (
      <div data-testid="update-status-modal">
        <p>Updating Status for Book ID: {bookId}</p>
        <p>Current Status: {currentStatus || 'None'}</p>
        <button onClick={onClose}>Close Status Modal</button>
        <button onClick={() => {
          onSuccess();
          onClose();
        }}>Submit Status</button>
      </div>
    ) : null
  )
}));

vi.mock('../components/books/DeleteBookConfirmation', () => ({
  default: ({ isOpen, onClose, bookId, bookTitle, onSuccess }) => (
    isOpen ? (
      <div data-testid="delete-book-modal">
        <p>Delete Book: {bookTitle}</p>
        <p>Book ID: {bookId}</p>
        <button onClick={onClose}>Cancel Delete</button>
        <button onClick={() => {
          onSuccess();
          onClose();
        }}>Confirm Delete</button>
      </div>
    ) : null
  )
}));

vi.mock('../hooks/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

describe('BookDetails Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockBook = (overrides = {}) => ({
    id: mockBookId,
    title: 'Test Book',
    author: 'Author McAuthorface',
    description: 'A test book description',
    notes: 'My personal notes',
    isbn: '978-1234567890',
    publishedYear: 2024,
    pageCount: 350,
    ownershipStatus: 'Own',
    score: 8,
    ratingNotes: 'Great read!',
    readingStatus: 'Completed',
    loanee: 'Jane Doe',
    loanDate: '2026-02-15T00:00:00Z',
    ...overrides
  });

  describe('Fetching and Loading', () => {
    it('should fetch book details on mount', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(bookService.getBookDetails).toHaveBeenCalledWith(mockBookId);
      });
    });

    it('should pass correct bookId to service', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(bookService.getBookDetails).toHaveBeenCalledWith(mockBookId);
      });
    });

    it('should display loading spinner while fetching', () => {
      vi.spyOn(bookService, 'getBookDetails').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading book details...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      const errorMessage = 'Network error';
      vi.spyOn(bookService, 'getBookDetails').mockRejectedValue(
        new Error(errorMessage)
      );

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display "Book not found" on 404 error', async () => {
      const error = new Error('Not found');
      error.status = 404;
      vi.spyOn(bookService, 'getBookDetails').mockRejectedValue(error);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Book not found')).toBeInTheDocument();
      });
    });

    it('should retry fetching when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      expect(bookService.getBookDetails).toHaveBeenCalledTimes(2);
    });

    it('should show back to dashboard button on error', async () => {
      vi.spyOn(bookService, 'getBookDetails').mockRejectedValue(
        new Error('Network error')
      );

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Book Information Section', () => {
    it('should display title', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });
    });

    it('should display author', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.author)).toBeInTheDocument();
      });
    });

    it('should display description if exists', async () => {
      const mockBook = createMockBook({ description: 'A fascinating tale' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('A fascinating tale')).toBeInTheDocument();
      });
    });

    it('should display notes if exists', async () => {
      const mockBook = createMockBook({ notes: 'Must read again' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Must read again')).toBeInTheDocument();
      });
    });

    it('should display ISBN if exists', async () => {
      const mockBook = createMockBook({ isbn: '978-1234567890' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('978-1234567890')).toBeInTheDocument();
      });
    });

    it('should display "N/A" for missing ISBN', async () => {
      const mockBook = createMockBook({ isbn: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });

    it('should display published year if exists', async () => {
      const mockBook = createMockBook({ publishedYear: 2024 });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('2024')).toBeInTheDocument();
      });
    });

    it('should display "N/A" for missing published year', async () => {
      const mockBook = createMockBook({ publishedYear: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/N\/A/)[0]).toBeInTheDocument();
      });
    });

    it('should display page count if exists', async () => {
      const mockBook = createMockBook({ pageCount: 350 });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('350')).toBeInTheDocument();
      });
    });

    it('should display "N/A" for missing page count', async () => {
      const mockBook = createMockBook({ pageCount: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/N\/A/)[0]).toBeInTheDocument();
      });
    });

    it('should format and display ownership status', async () => {
      const mockBook = createMockBook({ ownershipStatus: 'Own' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Own')).toBeInTheDocument();
      });
    });

    it('should not display description label if description is missing', async () => {
      const mockBook = createMockBook({ description: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Description:')).not.toBeInTheDocument();
      });
    });

    it('should not display notes label if notes is missing', async () => {
      const mockBook = createMockBook({ notes: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Rating Section', () => {
    it('should display score as stars if exists', async () => {
      const mockBook = createMockBook({ score: 8 });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        const ratingElement = screen.getByText('★★★★★★★★☆☆');
        expect(ratingElement).toBeInTheDocument();
      });
    });

    it('should display rating notes if exists', async () => {
      const mockBook = createMockBook({ 
        score: 8,
        ratingNotes: 'Excellent book!' 
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Excellent book!')).toBeInTheDocument();
      });
    });

    it('should display "No rating yet" if no rating', async () => {
      const mockBook = createMockBook({ 
        score: null,
        ratingNotes: null 
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No rating yet')).toBeInTheDocument();
      });
    });

    it('should not display rating notes label if notes is missing', async () => {
      const mockBook = createMockBook({ 
        score: 8,
        ratingNotes: null 
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Reading Status Section', () => {
    it('should format and display reading status if exists', async () => {
      const mockBook = createMockBook({ readingStatus: 'Completed' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });
    });

    it('should display reading status "Backlog"', async () => {
      const mockBook = createMockBook({ readingStatus: 'Backlog' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Backlog')).toBeInTheDocument();
      });
    });

    it('should display reading status "Abandoned"', async () => {
      const mockBook = createMockBook({ readingStatus: 'Abandoned' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Abandoned')).toBeInTheDocument();
      });
    });

    it('should display "No reading status set" if no status', async () => {
      const mockBook = createMockBook({ readingStatus: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No reading status set')).toBeInTheDocument();
      });
    });

    it('should have Update Status button in Reading Status section', async () => {
      const mockBook = createMockBook({ readingStatus: 'Completed' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        const updateButton = screen.getByTitle('Update reading status');
        expect(updateButton).toBeInTheDocument();
      });
    });

    it('should open UpdateReadingStatusModal when Update Status button is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ readingStatus: 'Backlog' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTitle('Update reading status')).toBeInTheDocument();
      });

      const updateButton = screen.getByTitle('Update reading status');
      await user.click(updateButton);

      expect(screen.getByTestId('update-status-modal')).toBeInTheDocument();
      expect(screen.getByText(/Updating Status for Book ID:/)).toBeInTheDocument();
      expect(screen.getByText('Current Status: Backlog')).toBeInTheDocument();
    });

    it('should pass current status to UpdateReadingStatusModal', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ readingStatus: 'Completed' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTitle('Update reading status')).toBeInTheDocument();
      });

      const updateButton = screen.getByTitle('Update reading status');
      await user.click(updateButton);

      expect(screen.getByText('Current Status: Completed')).toBeInTheDocument();
    });

    it('should pass None for books without reading status', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ readingStatus: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTitle('Update reading status')).toBeInTheDocument();
      });

      const updateButton = screen.getByTitle('Update reading status');
      await user.click(updateButton);

      expect(screen.getByText('Current Status: None')).toBeInTheDocument();
    });

    it('should refetch book details after successful status update', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ readingStatus: 'Backlog' });
      const getBookDetailsSpy = vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTitle('Update reading status')).toBeInTheDocument();
      });

      getBookDetailsSpy.mockClear(); // Clear initial fetch

      const updateButton = screen.getByTitle('Update reading status');
      await user.click(updateButton);

      const submitButton = screen.getByRole('button', { name: /Submit Status/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(getBookDetailsSpy).toHaveBeenCalled();
      });
    });

    it('should close modal after successful status update', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ readingStatus: 'Completed' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTitle('Update reading status')).toBeInTheDocument();
      });

      const updateButton = screen.getByTitle('Update reading status');
      await user.click(updateButton);

      expect(screen.getByTestId('update-status-modal')).toBeInTheDocument();

      const submitButton = screen.getByRole('button', { name: /Submit Status/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('update-status-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loan Information Section', () => {
    it('should display loanee and loan date if loaned', async () => {
      const mockBook = createMockBook({
        loanee: 'Jane Doe',
        loanDate: '2026-02-15T00:00:00Z'
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('should format loan date correctly', async () => {
      const mockBook = createMockBook({
        loanee: 'Jane Doe',
        loanDate: '2026-02-15T00:00:00Z'
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Date should be formatted as "Feb 15, 2026"
        expect(screen.getByText(/Feb 15, 2026/)).toBeInTheDocument();
      });
    });

    it('should display "Not currently loaned" if not loaned', async () => {
      const mockBook = createMockBook({
        loanee: null,
        loanDate: null
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Not currently loaned')).toBeInTheDocument();
      });
    });

    it('should display "View History" button', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /View History/i })).toBeInTheDocument();
      });
    });

    it('should navigate to loan history when View History button is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /View History/i })).toBeInTheDocument();
      });

      const viewHistoryButton = screen.getByRole('button', { name: /View History/i });
      await user.click(viewHistoryButton);

      expect(mockNavigate).toHaveBeenCalledWith(`/books/${mockBook.id}/history`);
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard when Back button is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const backButton = screen.getAllByText(/Back to Dashboard/)[0];
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Integration Tests', () => {
    it('should fetch and display book with all data correctly', async () => {
      const mockBook = createMockBook({
        title: 'Complete Book',
        author: 'Author McAuthorface',
        description: 'A fully detailed test book',
        notes: 'My personal notes',
        isbn: '978-1234567890',
        publishedYear: 2024,
        pageCount: 350,
        ownershipStatus: 'Own',
        score: 8,
        ratingNotes: 'Great read!',
        readingStatus: 'Completed',
        loanee: 'Jane Doe',
        loanDate: '2026-02-15T00:00:00Z'
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Book Information
        expect(screen.getByText('Complete Book')).toBeInTheDocument();
        expect(screen.getByText('Author McAuthorface')).toBeInTheDocument();
        expect(screen.getByText('A fully detailed test book')).toBeInTheDocument();
        expect(screen.getByText('My personal notes')).toBeInTheDocument();
        expect(screen.getByText('978-1234567890')).toBeInTheDocument();
        expect(screen.getByText('2024')).toBeInTheDocument();
        expect(screen.getByText('350')).toBeInTheDocument();
        expect(screen.getByText('Own')).toBeInTheDocument();

        // Rating
        expect(screen.getByText('★★★★★★★★☆☆')).toBeInTheDocument();
        expect(screen.getByText('Great read!')).toBeInTheDocument();

        // Reading Status
        expect(screen.getByText('Completed')).toBeInTheDocument();

        // Loan Information
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText(/Feb 15, 2026/)).toBeInTheDocument();
      });
    });

    it('should display book with minimal data correctly', async () => {
      const mockBook = createMockBook({
        title: 'Minimal Book',
        author: 'Author McAuthorface',
        description: null,
        notes: null,
        isbn: null,
        publishedYear: null,
        pageCount: null,
        ownershipStatus: 'Own',
        score: null,
        ratingNotes: null,
        readingStatus: null,
        loanee: null,
        loanDate: null
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Required fields
        expect(screen.getByText('Minimal Book')).toBeInTheDocument();
        expect(screen.getByText('Author McAuthorface')).toBeInTheDocument();
        expect(screen.getByText('Own')).toBeInTheDocument();

        // Missing optional fields show N/A
        expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);

        // No rating
        expect(screen.getByText('No rating yet')).toBeInTheDocument();

        // No reading status
        expect(screen.getByText('No reading status set')).toBeInTheDocument();

        // Not loaned
        expect(screen.getByText('Not currently loaned')).toBeInTheDocument();
      });
    });

    it('should display all sections', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Main book info is displayed (title and author as main headers)
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
        expect(screen.getByText(mockBook.author)).toBeInTheDocument();
        
        // Three metadata sections
        expect(screen.getByText('Rating')).toBeInTheDocument();
        expect(screen.getByText('Reading Status')).toBeInTheDocument();
        expect(screen.getByText('Loan Information')).toBeInTheDocument();
      });
    });
    describe('Edit Mode', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should display Edit button when not editing', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });
    });

    it('should enable edit mode when Edit button is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Form inputs should be visible
      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Author *')).toBeInTheDocument();
    });

    it('should hide Edit button when in edit mode', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Edit button should be hidden
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('should display all form fields in edit mode', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // All form fields should be visible
      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Author *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Notes')).toBeInTheDocument();
      expect(screen.getByLabelText('ISBN')).toBeInTheDocument();
      expect(screen.getByLabelText('Published Year')).toBeInTheDocument();
      expect(screen.getByLabelText('Page Count')).toBeInTheDocument();
      expect(screen.getByLabelText('Ownership Status *')).toBeInTheDocument();
    });

    it('should populate form fields with current book data', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({
        title: 'Test Book',
        author: 'Author McAuthorface',
        description: 'Test Description',
        notes: 'Test Notes',
        isbn: '978-1234567890',
        publishedYear: 2024,
        pageCount: 350,
        ownershipStatus: 'Own'
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Check all field values
      expect(screen.getByDisplayValue('Test Book')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Author McAuthorface')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Notes')).toBeInTheDocument();
      expect(screen.getByDisplayValue('978-1234567890')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument();
      expect(screen.getByDisplayValue('350')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Own')).toBeInTheDocument();
    });

    it('should allow typing into all form fields', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const titleInput = screen.getByLabelText('Title *');
      await user.clear(titleInput);
      await user.type(titleInput, 'New Title');
      expect(screen.getByDisplayValue('New Title')).toBeInTheDocument();
    });

    it('should call updateBook with correct payload when Save is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      vi.spyOn(bookService, 'updateBook').mockResolvedValue({});

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const titleInput = screen.getByLabelText('Title *');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(bookService.updateBook).toHaveBeenCalledWith(
          mockBookId,
          expect.objectContaining({
            id: parseInt(mockBookId, 10),
            title: 'Updated Title',
            author: mockBook.author
          })
        );
      });
    });

    it('should show success toast and exit edit mode after successful save', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      vi.spyOn(bookService, 'updateBook').mockResolvedValue({});

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Title *')).not.toBeInTheDocument();
      });
    });

    it('should revert changes when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ title: 'Original Title' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Original Title')).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const titleInput = screen.getByLabelText('Title *');
      await user.clear(titleInput);
      await user.type(titleInput, 'Modified Title');

      expect(screen.getByDisplayValue('Modified Title')).toBeInTheDocument();

      // Get all Cancel buttons and click the one that's NOT disabled (the form Cancel button)
      const cancelButtons = screen.getAllByText('Cancel');
      const formCancelButton = cancelButtons.find(btn => !btn.disabled);
      await user.click(formCancelButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Title *')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });

    it('should show validation error when Title is empty', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const titleInput = screen.getByLabelText('Title *');
      await user.clear(titleInput);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-title')).toHaveTextContent('Title is required');
      });
    });

    it('should show validation error when Author is empty', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const authorInput = screen.getByLabelText('Author *');
      await user.clear(authorInput);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-author')).toHaveTextContent('Author is required');
      });
    });

    it('should prevent save when validation errors exist', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      vi.spyOn(bookService, 'updateBook').mockResolvedValue({});

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const titleInput = screen.getByLabelText('Title *');
      await user.clear(titleInput);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(bookService.updateBook).not.toHaveBeenCalled();
      });
    });

    it('should show error toast and stay in edit mode on save failure', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      vi.spyOn(bookService, 'updateBook').mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(bookService.updateBook).toHaveBeenCalled();
      });

      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    });

    it('should disable Save and Cancel buttons while submitting', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      vi.spyOn(bookService, 'updateBook').mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      expect(screen.getByText('Saving...')).toBeDisabled();
      
      // Get all Cancel buttons and verify the form Cancel button is disabled
      const cancelButtons = screen.getAllByText('Cancel');
      const formCancelButton = cancelButtons[0]; // The edit form Cancel button
      expect(formCancelButton).toBeDisabled();
    });

    it('should not edit Rating, Reading Status, and Loan sections in edit mode', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ 
        score: 8, 
        ratingNotes: 'Great!',
        readingStatus: 'Completed',
        loanee: 'Jane Doe', 
        loanDate: '2026-02-15T00:00:00Z' 
      });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // These sections should still display as text
      expect(screen.getByText('★★★★★★★★☆☆')).toBeInTheDocument();
      expect(screen.getByText('Great!')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText(/Feb 15, 2026/)).toBeInTheDocument();
    });

    it('should include id field in update payload', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      vi.spyOn(bookService, 'updateBook').mockResolvedValue({});

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(bookService.updateBook).toHaveBeenCalledWith(
          mockBookId,
          expect.objectContaining({
            id: parseInt(mockBookId, 10)
          })
        );
      });
    });
  });

  describe('Rating Functionality', () => {
    it('should display Rate button in Rating section', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      // Find the Update button in the Rating section (when score exists)
      const rateButtons = screen.getAllByText('Update');
      expect(rateButtons.length).toBeGreaterThan(0);
    });

    it('should display "Rate" button when book has no rating', async () => {
      const mockBook = createMockBook({ score: null, ratingNotes: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      expect(screen.getByText('Rate')).toBeInTheDocument();
    });

    it('should open RateBookModal when Rate button is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ score: null, ratingNotes: null });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const rateButton = screen.getByText('Rate');
      await user.click(rateButton);

      expect(screen.getByTestId('rate-book-modal')).toBeInTheDocument();
    });

    it('should pass correct bookId to RateBookModal', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const updateButton = screen.getAllByText('Update')[0];
      await user.click(updateButton);

      expect(screen.getByText(`Rating Book ID: ${mockBook.id}`)).toBeInTheDocument();
    });

    it('should pass existing rating to RateBookModal when book has rating', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ score: 7, ratingNotes: 'Good book' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const updateButton = screen.getAllByText('Update')[0];
      await user.click(updateButton);

      expect(screen.getByText('Existing Score: 7')).toBeInTheDocument();
    });

    it('should refetch book data after successful rating', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      const getDetailsSpy = vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      // Clear previous calls
      getDetailsSpy.mockClear();

      const updateButton = screen.getAllByText('Update')[0];
      await user.click(updateButton);

      const submitButton = screen.getByText('Submit Rating');
      await user.click(submitButton);

      await waitFor(() => {
        expect(getDetailsSpy).toHaveBeenCalledWith(mockBookId);
      });
    });

    it('should close RateBookModal after successful rating', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const updateButton = screen.getAllByText('Update')[0];
      await user.click(updateButton);

      expect(screen.getByTestId('rate-book-modal')).toBeInTheDocument();

      const submitButton = screen.getByText('Submit Rating');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByTestId('rate-book-modal')).not.toBeInTheDocument();
      });
    });

    it('should display updated rating after successful rating submission', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ score: 7 });
      const updatedBook = createMockBook({ score: 9, ratingNotes: 'Excellent!' });
      
      vi.spyOn(bookService, 'getBookDetails')
        .mockResolvedValueOnce(mockBook)
        .mockResolvedValueOnce(updatedBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      const updateButton = screen.getAllByText('Update')[0];
      await user.click(updateButton);

      const submitButton = screen.getByText('Submit Rating');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('★★★★★★★★★☆')).toBeInTheDocument();
        expect(screen.getByText('Excellent!')).toBeInTheDocument();
      });
    });
  });

  // Delete Book Tests
  describe('Delete Book', () => {
    it('should render Delete button', async () => {
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });
    });

    it('should open DeleteBookConfirmation modal when Delete button is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      expect(screen.getByTestId('delete-book-modal')).toBeInTheDocument();
    });

    it('should pass correct book data to DeleteBookConfirmation modal', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook({ title: 'Book to Delete' });
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      expect(screen.getByText('Delete Book: Book to Delete')).toBeInTheDocument();
      expect(screen.getByText(`Book ID: ${mockBookId}`)).toBeInTheDocument();
    });

    it('should close DeleteBookConfirmation modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      expect(screen.getByTestId('delete-book-modal')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: /Cancel Delete/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('delete-book-modal')).not.toBeInTheDocument();
      });
    });

    it('should navigate to dashboard after successful deletion', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      const mockNavigate = vi.fn();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      
      // Mock useNavigate
      const ReactRouterDom = await import('react-router-dom');
      vi.spyOn(ReactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should not show Delete button when in edit mode', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      // Wait for book content to load
      await waitFor(() => {
        expect(screen.getByText(mockBook.title)).toBeInTheDocument();
      });

      // Click Edit button
      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Delete button should not be visible in edit mode
      expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();
    });

    it('should close modal and not navigate when delete is cancelled', async () => {
      const user = userEvent.setup();
      const mockBook = createMockBook();
      const mockNavigate = vi.fn();
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      
      // Mock useNavigate
      const ReactRouterDom = await import('react-router-dom');
      vi.spyOn(ReactRouterDom, 'useNavigate').mockReturnValue(mockNavigate);

      render(
        <BrowserRouter>
          <BookDetails />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      await user.click(deleteButton);

      const cancelButton = screen.getByRole('button', { name: /Cancel Delete/i });
      await user.click(cancelButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

});
});
