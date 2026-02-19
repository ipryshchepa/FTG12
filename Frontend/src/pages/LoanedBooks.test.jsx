import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoanedBooks from './LoanedBooks';
import * as loanService from '../services/loanService';
import * as bookService from '../services/bookService';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock LoanedBookGrid
vi.mock('../components/loans/LoanedBookGrid', () => ({
  default: ({ loanedBooks, loading, onTitleClick }) => (
    <div data-testid="loaned-book-grid">
      {loading && <div>Grid Loading...</div>}
      {loanedBooks.map((loan) => (
        <div key={loan.id} data-testid={`loan-${loan.id}`}>
          <button onClick={() => onTitleClick(loan.bookId)}>
            {loan.book?.title || 'Unknown'}
          </button>
          <span>{loan.borrowedTo}</span>
        </div>
      ))}
    </div>
  )
}));

// Mock ErrorMessage
vi.mock('../components/shared/ErrorMessage', () => ({
  default: ({ message, onRetry }) => (
    <div data-testid="error-message">
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}));

// Mock useToast
vi.mock('../hooks/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn()
  })
}));

describe('LoanedBooks Page', () => {
  const mockLoans = [
    {
      id: 1,
      bookId: 101,
      borrowedTo: 'Jane Doe',
      loanDate: '2026-02-15T00:00:00Z',
      isReturned: false,
      returnedDate: null
    },
    {
      id: 2,
      bookId: 102,
      borrowedTo: 'John Smith',
      loanDate: '2026-02-18T00:00:00Z',
      isReturned: false,
      returnedDate: null
    }
  ];

  const mockBookDetails = {
    101: {
      id: 101,
      title: 'The Great Adventure',
      author: 'Author McAuthorface'
    },
    102: {
      id: 102,
      title: 'Mystery Tales',
      author: 'Author McAuthorface'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page header', () => {
    vi.spyOn(loanService, 'getActiveLoanedBooks').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    expect(screen.getByText('Loaned Books')).toBeInTheDocument();
  });

  it('should render loading spinner initially', () => {
    vi.spyOn(loanService, 'getActiveLoanedBooks').mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    expect(screen.getByTestId('loaned-book-grid')).toBeInTheDocument();
    expect(screen.getByText('Grid Loading...')).toBeInTheDocument();
  });

  it('should fetch active loans on mount', async () => {
    const getActiveLoanedBooksSpy = vi.spyOn(loanService, 'getActiveLoanedBooks')
      .mockResolvedValue(mockLoans);
    
    vi.spyOn(bookService, 'getBookDetails').mockImplementation((id) => 
      Promise.resolve(mockBookDetails[id])
    );

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getActiveLoanedBooksSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should fetch book details for each loan', async () => {
    vi.spyOn(loanService, 'getActiveLoanedBooks').mockResolvedValue(mockLoans);
    
    const getBookDetailsSpy = vi.spyOn(bookService, 'getBookDetails')
      .mockImplementation((id) => Promise.resolve(mockBookDetails[id]));

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(getBookDetailsSpy).toHaveBeenCalledWith(101);
      expect(getBookDetailsSpy).toHaveBeenCalledWith(102);
      expect(getBookDetailsSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('should display combined loan and book data in grid', async () => {
    vi.spyOn(loanService, 'getActiveLoanedBooks').mockResolvedValue(mockLoans);
    vi.spyOn(bookService, 'getBookDetails').mockImplementation((id) => 
      Promise.resolve(mockBookDetails[id])
    );

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Adventure')).toBeInTheDocument();
      expect(screen.getByText('Mystery Tales')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    vi.spyOn(loanService, 'getActiveLoanedBooks').mockRejectedValue(
      new Error('Network error')
    );

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to load loaned books. Please try again.')).toBeInTheDocument();
    });
  });

  it('should retry fetching data when retry button is clicked', async () => {
    const getActiveLoanedBooksSpy = vi.spyOn(loanService, 'getActiveLoanedBooks')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(getActiveLoanedBooksSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('should navigate to book details page when title is clicked', async () => {
    vi.spyOn(loanService, 'getActiveLoanedBooks').mockResolvedValue(mockLoans);
    vi.spyOn(bookService, 'getBookDetails').mockImplementation((id) => 
      Promise.resolve(mockBookDetails[id])
    );

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('The Great Adventure')).toBeInTheDocument();
    });

    const titleButton = screen.getByText('The Great Adventure');
    fireEvent.click(titleButton);

    expect(mockNavigate).toHaveBeenCalledWith('/books/101');
  });

  it('should display empty state when no loans exist', async () => {
    vi.spyOn(loanService, 'getActiveLoanedBooks').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loaned-book-grid')).toBeInTheDocument();
    });

    // Empty state is handled by the grid component
    const loans = screen.queryAllByTestId(/^loan-/);
    expect(loans).toHaveLength(0);
  });

  it('should handle book details fetch failure gracefully', async () => {
    vi.spyOn(loanService, 'getActiveLoanedBooks').mockResolvedValue([mockLoans[0]]);
    vi.spyOn(bookService, 'getBookDetails').mockRejectedValue(
      new Error('Book not found')
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should integrate: fetch loans, combine with books, display in grid', async () => {
    const getActiveLoanedBooksSpy = vi.spyOn(loanService, 'getActiveLoanedBooks')
      .mockResolvedValue(mockLoans);
    
    const getBookDetailsSpy = vi.spyOn(bookService, 'getBookDetails')
      .mockImplementation((id) => Promise.resolve(mockBookDetails[id]));

    render(
      <BrowserRouter>
        <LoanedBooks />
      </BrowserRouter>
    );

    // Should show loading initially
    expect(screen.getByText('Grid Loading...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(getActiveLoanedBooksSpy).toHaveBeenCalled();
      expect(getBookDetailsSpy).toHaveBeenCalledTimes(2);
    });

    // Should display combined data
    await waitFor(() => {
      expect(screen.getByText('The Great Adventure')).toBeInTheDocument();
      expect(screen.getByText('Mystery Tales')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    // Should not show loading or error
    expect(screen.queryByText('Grid Loading...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
});
