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
  default: ({ children, onClick, variant }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  )
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
  });
});
