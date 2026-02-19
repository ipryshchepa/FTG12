import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoanedBookGrid from './LoanedBookGrid';

// Mock formatDate
vi.mock('../../utils/formatters', () => ({
  formatDate: (date) => {
    if (!date) return '';
    return 'Feb 15, 2026';
  }
}));

// Mock LoadingSpinner
vi.mock('../shared/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

describe('LoanedBookGrid Component', () => {
  const mockLoanedBooks = [
    {
      id: 1,
      bookId: 101,
      borrowedTo: 'Jane Doe',
      loanDate: '2026-02-15T00:00:00Z',
      isReturned: false,
      returnedDate: null,
      book: {
        title: 'The Great Adventure',
        author: 'Author McAuthorface'
      }
    },
    {
      id: 2,
      bookId: 102,
      borrowedTo: 'John Smith',
      loanDate: '2026-02-18T00:00:00Z',
      isReturned: false,
      returnedDate: null,
      book: {
        title: 'Mystery Tales',
        author: 'Author McAuthorface'
      }
    },
    {
      id: 3,
      bookId: 103,
      borrowedTo: 'Alice Brown',
      loanDate: '2026-02-17T00:00:00Z',
      isReturned: false,
      returnedDate: null,
      book: {
        title: 'A Beginning Story',
        author: 'Author McAuthorface'
      }
    }
  ];

  const defaultProps = {
    loanedBooks: mockLoanedBooks,
    loading: false,
    onTitleClick: vi.fn()
  };

  it('should render table with loaned books', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    expect(screen.getByText('The Great Adventure')).toBeInTheDocument();
    expect(screen.getByText('Mystery Tales')).toBeInTheDocument();
    expect(screen.getByText('A Beginning Story')).toBeInTheDocument();
  });

  it('should display all columns correctly', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    expect(screen.getByRole('columnheader', { name: /Title/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Author/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Loanee/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Loan Date/i })).toBeInTheDocument();
  });

  it('should render title column as clickable element', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const titleLink = screen.getByText('The Great Adventure');
    expect(titleLink.tagName).toBe('A');
  });

  it('should call onTitleClick with correct bookId when title is clicked', () => {
    const onTitleClick = vi.fn();
    render(<LoanedBookGrid {...defaultProps} onTitleClick={onTitleClick} />);
    
    const titleLink = screen.getByText('The Great Adventure');
    fireEvent.click(titleLink);
    
    expect(onTitleClick).toHaveBeenCalledWith(101);
  });

  it('should display borrowedTo value in Loanee column', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
  });

  it('should display formatted loan date', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    // All dates will be formatted the same by our mock
    const formattedDates = screen.getAllByText('Feb 15, 2026');
    expect(formattedDates.length).toBeGreaterThan(0);
  });

  it('should show LoadingSpinner when loading', () => {
    render(<LoanedBookGrid {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should show empty state message when no books are loaned', () => {
    render(<LoanedBookGrid {...defaultProps} loanedBooks={[]} />);
    
    expect(screen.getByText('No books are currently loaned out.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('should sort books by loan date descending by default', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const rows = screen.getAllByRole('row');
    // Skip header row
    const dataRows = rows.slice(1);
    
    // Most recent loan (Feb 18) should be first
    expect(dataRows[0]).toHaveTextContent('Mystery Tales');
    // Feb 17 should be second
    expect(dataRows[1]).toHaveTextContent('A Beginning Story');
    // Feb 15 should be last
    expect(dataRows[2]).toHaveTextContent('The Great Adventure');
  });

  it('should sort by Title column in ascending order when clicked', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const titleHeader = screen.getByRole('columnheader', { name: /Title/i });
    fireEvent.click(titleHeader);
    
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    
    // "A Beginning Story" should be first alphabetically
    expect(dataRows[0]).toHaveTextContent('A Beginning Story');
    expect(dataRows[1]).toHaveTextContent('Mystery Tales');
    expect(dataRows[2]).toHaveTextContent('The Great Adventure');
  });

  it('should sort by Title column in descending order when clicked twice', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const titleHeader = screen.getByRole('columnheader', { name: /Title/i });
    fireEvent.click(titleHeader); // First click: ascending
    fireEvent.click(titleHeader); // Second click: descending
    
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    
    // "The Great Adventure" should be first in descending order
    expect(dataRows[0]).toHaveTextContent('The Great Adventure');
    expect(dataRows[1]).toHaveTextContent('Mystery Tales');
    expect(dataRows[2]).toHaveTextContent('A Beginning Story');
  });

  it('should sort by Author column when clicked', () => {
    const booksWithDifferentAuthors = [
      {
        ...mockLoanedBooks[0],
        book: { title: 'Book 1', author: 'Zebra Author' }
      },
      {
        ...mockLoanedBooks[1],
        book: { title: 'Book 2', author: 'Alpha Author' }
      },
      {
        ...mockLoanedBooks[2],
        book: { title: 'Book 3', author: 'Beta Author' }
      }
    ];

    render(<LoanedBookGrid {...defaultProps} loanedBooks={booksWithDifferentAuthors} />);
    
    const authorHeader = screen.getByRole('columnheader', { name: /Author/i });
    fireEvent.click(authorHeader);
    
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    
    expect(dataRows[0]).toHaveTextContent('Alpha Author');
    expect(dataRows[1]).toHaveTextContent('Beta Author');
    expect(dataRows[2]).toHaveTextContent('Zebra Author');
  });

  it('should sort by Loanee column when clicked', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const loaneeHeader = screen.getByRole('columnheader', { name: /Loanee/i });
    fireEvent.click(loaneeHeader);
    
    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    
    // Alphabetically: Alice, Jane, John
    expect(dataRows[0]).toHaveTextContent('Alice Brown');
    expect(dataRows[1]).toHaveTextContent('Jane Doe');
    expect(dataRows[2]).toHaveTextContent('John Smith');
  });

  it('should toggle sort direction when clicking same column header', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const loaneeHeader = screen.getByRole('columnheader', { name: /Loanee/i });
    
    // First click: ascending
    fireEvent.click(loaneeHeader);
    expect(loaneeHeader.textContent).toContain('▲');
    
    // Second click: descending
    fireEvent.click(loaneeHeader);
    expect(loaneeHeader.textContent).toContain('▼');
  });

  it('should change sort column when clicking different column header', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const titleHeader = screen.getByRole('columnheader', { name: /Title/i });
    const authorHeader = screen.getByRole('columnheader', { name: /Author/i });
    
    // Click title first
    fireEvent.click(titleHeader);
    expect(titleHeader.textContent).toContain('▲');
    
    // Click author - should be ascending
    fireEvent.click(authorHeader);
    expect(authorHeader.textContent).toContain('▲');
    expect(titleHeader.textContent).not.toContain('▲');
  });

  it('should display sort indicator correctly for ascending', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const titleHeader = screen.getByRole('columnheader', { name: /Title/i });
    fireEvent.click(titleHeader);
    
    expect(titleHeader.textContent).toContain('▲');
    expect(titleHeader.textContent).not.toContain('▼');
  });

  it('should display sort indicator correctly for descending', () => {
    render(<LoanedBookGrid {...defaultProps} />);
    
    const titleHeader = screen.getByRole('columnheader', { name: /Title/i });
    fireEvent.click(titleHeader); // First click: asc
    fireEvent.click(titleHeader); // Second click: desc
    
    expect(titleHeader.textContent).toContain('▼');
    expect(titleHeader.textContent).not.toContain('▲');
  });

  it('should handle books with missing author', () => {
    const booksWithMissingAuthor = [
      {
        ...mockLoanedBooks[0],
        book: { title: 'Book Without Author', author: null }
      }
    ];

    render(<LoanedBookGrid {...defaultProps} loanedBooks={booksWithMissingAuthor} />);
    
    expect(screen.getByText('Book Without Author')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle books with missing title', () => {
    const booksWithMissingTitle = [
      {
        ...mockLoanedBooks[0],
        book: { title: null, author: 'Some Author' }
      }
    ];

    render(<LoanedBookGrid {...defaultProps} loanedBooks={booksWithMissingTitle} />);
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should be responsive', () => {
    const { container } = render(<LoanedBookGrid {...defaultProps} />);
    
    const table = container.querySelector('table');
    expect(table).toHaveClass('responsive-table');
  });
});
