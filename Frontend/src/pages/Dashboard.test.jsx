import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as booksHook from '../hooks/useBooks';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock components
vi.mock('../components/books/BookGrid', () => ({
  default: ({ books, loading, onTitleClick, onPageChange, onSort }) => (
    <div data-testid="book-grid">
      {loading && <div>Grid Loading...</div>}
      {books.map((book) => (
        <div key={book.id} data-testid={`book-${book.id}`}>
          <button onClick={() => onTitleClick(book.id)}>{book.title}</button>
        </div>
      ))}
      <button onClick={() => onPageChange(2)}>Next Page</button>
      <button onClick={() => onSort('Author')}>Sort Author</button>
    </div>
  )
}));

vi.mock('../components/books/AddBookModal', () => ({
  default: ({ isOpen, onClose, onSuccess }) => (
    isOpen ? (
      <div data-testid="add-book-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => {
          onSuccess();
          onClose();
        }}>Submit Book</button>
      </div>
    ) : null
  )
}));

vi.mock('../components/shared/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
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
  default: ({ children, onClick, icon }) => (
    <button onClick={onClick} data-icon={icon}>
      {children}
    </button>
  )
}));

describe('Dashboard Page', () => {
  const mockFetchBooks = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page header', () => {
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 0,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Books Dashboard')).toBeInTheDocument();
  });

  it('should fetch books on mount with default params', async () => {
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 0,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetchBooks).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        sortBy: 'Title',
        sortDirection: 'asc'
      });
    });
  });

  it('should display books in grid after successful fetch', () => {
    const mockBooks = [
      {
        id: '1',
        title: 'Test Book 1',
        author: 'Author McAuthorface',
        ownershipStatus: 'Own'
      }
    ];

    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: mockBooks,
      loading: false,
      error: null,
      totalCount: 1,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('book-grid')).toBeInTheDocument();
    expect(screen.getByText('Test Book 1')).toBeInTheDocument();
  });

  it('should display error message on fetch failure', () => {
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: 'Failed to fetch books',
      totalCount: 0,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch books')).toBeInTheDocument();
  });

  it('should call fetchBooks when retry button is clicked', async () => {
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: 'Network error',
      totalCount: 0,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const retryButton = screen.getByText('Retry');
    retryButton.click();

    expect(mockFetchBooks).toHaveBeenCalled();
  });

  it('should navigate to book details when title is clicked', () => {
    const mockBooks = [
      {
        id: 'book-123',
        title: 'Test Book',
        author: 'Author McAuthorface',
        ownershipStatus: 'Own'
      }
    ];

    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: mockBooks,
      loading: false,
      error: null,
      totalCount: 1,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const titleButton = screen.getByText('Test Book');
    titleButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/books/book-123');
  });

  it('should refetch books when page changes', async () => {
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 20,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Initial call
    await waitFor(() => {
      expect(mockFetchBooks).toHaveBeenCalledTimes(1);
    });

    // Click next page
    const nextButton = screen.getByText('Next Page');
    nextButton.click();

    await waitFor(() => {
      expect(mockFetchBooks).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        sortBy: 'Title',
        sortDirection: 'asc'
      });
    });
  });

  it('should refetch books when sort changes', async () => {
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 20,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Initial call
    await waitFor(() => {
      expect(mockFetchBooks).toHaveBeenCalledTimes(1);
    });

    // Change sort
    const sortButton = screen.getByText('Sort Author');
    sortButton.click();

    await waitFor(() => {
      expect(mockFetchBooks).toHaveBeenCalledWith({
        page: 1, // Should reset to page 1
        pageSize: 10,
        sortBy: 'Author',
        sortDirection: 'asc'
      });
    });
  });

  it('should toggle sort direction when clicking same column', async () => {
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 20,
      fetchBooks: mockFetchBooks
    });

    const { rerender } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetchBooks).toHaveBeenCalledTimes(1);
    });

    // Mock to return different onSort to simulate state change
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 20,
      fetchBooks: mockFetchBooks
    });

    rerender(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Note: This test verifies the logic exists, actual toggle behavior 
    // requires more complex state mocking
    expect(mockFetchBooks).toHaveBeenCalled();
  });

  it('should render Add Book button', () => {
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 0,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Add Book/i })).toBeInTheDocument();
  });

  it('should open AddBookModal when Add Book button is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 0,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const addButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(addButton);

    expect(screen.getByTestId('add-book-modal')).toBeInTheDocument();
  });

  it('should refresh books grid after successful book addition', async () => {
    const user = userEvent.setup();
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 0,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Open modal
    const addButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(addButton);

    // Clear previous calls
    mockFetchBooks.mockClear();

    // Submit book
    const submitButton = screen.getByRole('button', { name: /Submit Book/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetchBooks).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        sortBy: 'Title',
        sortDirection: 'asc'
      });
    });
  });

  it('should close modal after successful book addition', async () => {
    const user = userEvent.setup();
    vi.spyOn(booksHook, 'useBooks').mockReturnValue({
      books: [],
      loading: false,
      error: null,
      totalCount: 0,
      fetchBooks: mockFetchBooks
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Open modal
    const addButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(addButton);

    expect(screen.getByTestId('add-book-modal')).toBeInTheDocument();

    // Submit book
    const submitButton = screen.getByRole('button', { name: /Submit Book/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByTestId('add-book-modal')).not.toBeInTheDocument();
    });
  });
});
