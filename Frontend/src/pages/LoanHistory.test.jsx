import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoanHistory from './LoanHistory';
import * as loanService from '../services/loanService';
import * as bookService from '../services/bookService';

// Mock useParams and useNavigate
const mockBookId = '123e4567-e89b-12d3-a456-426614174000';
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ bookId: mockBookId }),
    useNavigate: () => mockNavigate
  };
});

// Mock LoadingSpinner
vi.mock('../components/shared/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

// Mock ErrorMessage
vi.mock('../components/shared/ErrorMessage', () => ({
  default: ({ message }) => (
    <div data-testid="error-message">{message}</div>
  )
}));

// Mock Button
vi.mock('../components/shared/Button', () => ({
  default: ({ children, onClick, variant, ...props }) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  )
}));

describe('LoanHistory Page', () => {
  const mockBook = {
    id: mockBookId,
    title: 'The Great Adventure',
    author: 'Author McAuthorface'
  };

  const mockLoanHistory = [
    {
      id: 3,
      bookId: mockBookId,
      borrowedTo: 'Alice Johnson',
      loanDate: '2026-02-19T00:00:00Z',
      isReturned: false,
      returnedDate: null
    },
    {
      id: 2,
      bookId: mockBookId,
      borrowedTo: 'John Smith',
      loanDate: '2026-02-15T00:00:00Z',
      isReturned: true,
      returnedDate: '2026-02-18T00:00:00Z'
    },
    {
      id: 1,
      bookId: mockBookId,
      borrowedTo: 'Jane Doe',
      loanDate: '2026-02-10T00:00:00Z',
      isReturned: true,
      returnedDate: '2026-02-12T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching and Loading', () => {
    it('should fetch loan history on mount', async () => {
      const getLoanHistorySpy = vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue([]);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(getLoanHistorySpy).toHaveBeenCalledWith(mockBookId);
      });
    });

    it('should pass correct bookId to service', async () => {
      const getLoanHistorySpy = vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue([]);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(getLoanHistorySpy).toHaveBeenCalledWith(mockBookId);
      });
    });

    it('should fetch book details to display title', async () => {
      const getBookDetailsSpy = vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue([]);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(getBookDetailsSpy).toHaveBeenCalledWith(mockBookId);
      });
    });

    it('should display loading spinner while fetching', () => {
      vi.spyOn(loanService, 'getLoanHistory').mockReturnValue(new Promise(() => {}));
      vi.spyOn(bookService, 'getBookDetails').mockReturnValue(new Promise(() => {}));

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockRejectedValue(new Error('Network error'));
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should display "Book not found" on 404 error', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockRejectedValue(new Error('404 not found'));
      vi.spyOn(bookService, 'getBookDetails').mockRejectedValue(new Error('404 not found'));

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Book not found')).toBeInTheDocument();
      });
    });

    it('should retry fetching data when retry button is clicked', async () => {
      const user = userEvent.setup();
      const getLoanHistorySpy = vi.spyOn(loanService, 'getLoanHistory')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([]);
      const getBookDetailsSpy = vi.spyOn(bookService, 'getBookDetails')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(getLoanHistorySpy).toHaveBeenCalledTimes(2);
        expect(getBookDetailsSpy).toHaveBeenCalledTimes(2);
      });
    });

    it('should navigate back when back button is clicked in error state', async () => {
      const user = userEvent.setup();
      vi.spyOn(loanService, 'getLoanHistory').mockRejectedValue(new Error('Network error'));
      vi.spyOn(bookService, 'getBookDetails').mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /^Back$/i });
      await user.click(backButton);

      // Should navigate either back (-1) or to book details (fallback)
      expect(mockNavigate).toHaveBeenCalled();
      const callArg = mockNavigate.mock.calls[0][0];
      expect(callArg === -1 || callArg === `/books/${mockBookId}`).toBe(true);
    });
  });

  describe('Page Display', () => {
    it('should display page header with book title', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue([]);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(`Loan History for "${mockBook.title}"`)).toBeInTheDocument();
      });
    });

    it('should display breadcrumb/back button to previous page', async () => {
      const user = userEvent.setup();
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue([]);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /Back to Book Details/i });
        expect(backButton).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back to Book Details/i });
      await user.click(backButton);

      // Should navigate either back (-1) or to book details (fallback)
      expect(mockNavigate).toHaveBeenCalled();
      const callArg = mockNavigate.mock.calls[0][0];
      expect(callArg === -1 || callArg === `/books/${mockBookId}`).toBe(true);
    });

    it('should display empty state when no loan history', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue([]);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No loan history for this book')).toBeInTheDocument();
      });
    });
  });

  describe('Loan History Table', () => {
    it('should display table with correct columns', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Borrower')).toBeInTheDocument();
        expect(screen.getByText('Loan Date')).toBeInTheDocument();
        expect(screen.getByText('Return Date')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
      });
    });

    it('should display all loans with correct data', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('should format loan dates correctly', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Feb 19, 2026')).toBeInTheDocument();
        expect(screen.getByText('Feb 15, 2026')).toBeInTheDocument();
        expect(screen.getByText('Feb 10, 2026')).toBeInTheDocument();
      });
    });

    it('should display "Not returned" for active loans', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Not returned')).toBeInTheDocument();
      });
    });

    it('should format return dates correctly', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Feb 18, 2026')).toBeInTheDocument();
        expect(screen.getByText('Feb 12, 2026')).toBeInTheDocument();
      });
    });

    it('should display "Active" status for active loans', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        const activeBadges = screen.getAllByText('Active');
        expect(activeBadges).toHaveLength(1);
      });
    });

    it('should display "Returned" status for returned loans', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        const returnedBadges = screen.getAllByText('Returned');
        expect(returnedBadges).toHaveLength(2);
      });
    });

    it('should sort loans by date descending (most recent first)', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        // First row is header, so data starts at index 1
        expect(rows[1]).toHaveTextContent('Alice Johnson'); // Most recent
        expect(rows[2]).toHaveTextContent('John Smith');
        expect(rows[3]).toHaveTextContent('Jane Doe'); // Oldest
      });
    });
  });

  describe('Integration Tests', () => {
    it('should fetch book and loans and display correct data', async () => {
      vi.spyOn(loanService, 'getLoanHistory').mockResolvedValue(mockLoanHistory);
      vi.spyOn(bookService, 'getBookDetails').mockResolvedValue(mockBook);

      render(
        <BrowserRouter>
          <LoanHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Check page header
        expect(screen.getByText(`Loan History for "${mockBook.title}"`)).toBeInTheDocument();
        
        // Check table columns
        expect(screen.getByText('Borrower')).toBeInTheDocument();
        expect(screen.getByText('Loan Date')).toBeInTheDocument();
        expect(screen.getByText('Return Date')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        
        // Check loan data
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('John Smith')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        
        // Check statuses
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getAllByText('Returned')).toHaveLength(2);
      });
    });
  });
});
