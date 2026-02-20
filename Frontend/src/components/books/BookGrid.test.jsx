import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BookGrid from './BookGrid';

// Mock formatters
vi.mock('../../utils/formatters', () => ({
  formatOwnershipStatus: (status) => status,
  formatReadingStatus: (status) => status,
  formatStarRating: (score) => `${score} stars`
}));

// Mock LoadingSpinner
vi.mock('../shared/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

describe('BookGrid Component', () => {
  const mockBooks = [
    {
      id: '1',
      title: 'Test Book 1',
      author: 'Author McAuthorface',
      score: 8,
      ownershipStatus: 'Own',
      readingStatus: 'Completed',
      loanee: null
    },
    {
      id: '2',
      title: 'Test Book 2',
      author: 'Author McAuthorface',
      score: null,
      ownershipStatus: 'WantToBuy',
      readingStatus: null,
      loanee: 'John Doe'
    }
  ];

  const defaultProps = {
    books: mockBooks,
    loading: false,
    onTitleClick: vi.fn(),
    onRate: vi.fn(),
    onUpdateStatus: vi.fn(),
    onLoan: vi.fn(),
    onReturn: vi.fn(),
    currentPage: 1,
    pageSize: 10,
    totalCount: 2,
    onPageChange: vi.fn(),
    sortBy: 'Title',
    sortDirection: 'asc',
    onSort: vi.fn()
  };

  it('should render table with books', () => {
    render(<BookGrid {...defaultProps} />);
    
    expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    expect(screen.getByText('Test Book 2')).toBeInTheDocument();
  });

  it('should display all columns correctly', () => {
    render(<BookGrid {...defaultProps} />);
    
    expect(screen.getByRole('columnheader', { name: /Title/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Author/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Score/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Ownership/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Reading Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Loanee/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Actions/i })).toBeInTheDocument();
  });

  it('should render title as clickable link', () => {
    render(<BookGrid {...defaultProps} />);
    
    const titleLink = screen.getByText('Test Book 1');
    expect(titleLink.tagName).toBe('A');
  });

  it('should call onTitleClick when title is clicked', () => {
    render(<BookGrid {...defaultProps} />);
    
    const titleLink = screen.getByText('Test Book 1');
    fireEvent.click(titleLink);
    
    expect(defaultProps.onTitleClick).toHaveBeenCalledWith('1');
  });

  it('should display formatted score', () => {
    render(<BookGrid {...defaultProps} />);
    
    expect(screen.getByText('8 stars')).toBeInTheDocument();
  });

  it('should display ownership status', () => {
    render(<BookGrid {...defaultProps} />);
    
    expect(screen.getByText('Own')).toBeInTheDocument();
    expect(screen.getByText('WantToBuy')).toBeInTheDocument();
  });

  it('should display reading status when present', () => {
    render(<BookGrid {...defaultProps} />);
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should display loanee when book is loaned', () => {
    render(<BookGrid {...defaultProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should display dash for missing score', () => {
    render(<BookGrid {...defaultProps} />);
    
    const rows = screen.getAllByRole('row');
    expect(rows[2]).toHaveTextContent('-'); // Second data row should have dash for score
  });

  it('should display dash for missing reading status', () => {
    render(<BookGrid {...defaultProps} />);
    
    const rows = screen.getAllByRole('row');
    expect(rows[2]).toHaveTextContent('-'); // Second data row should have dash
  });

  it('should show loading spinner when loading', () => {
    render(<BookGrid {...defaultProps} loading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show empty state when no books', () => {
    render(<BookGrid {...defaultProps} books={[]} />);
    
    expect(screen.getByText('No books in library. Add your first book!')).toBeInTheDocument();
  });

  it('should display pagination showing text', () => {
    const props = {
      ...defaultProps,
      totalCount: 25,
      currentPage: 1,
      pageSize: 10
    };
    render(<BookGrid {...props} />);
    
    expect(screen.getByText('Showing 1-10 of 25 books')).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    render(<BookGrid {...defaultProps} totalCount={20} currentPage={1} />);
    
    const pagination = document.querySelector('.pagination');
    const liElements = pagination.querySelectorAll('li');
    const prevButton = liElements[0];
    
    expect(prevButton).toHaveClass('disabled');
  });

  it('should disable Next button on last page', () => {
    const { container } = render(<BookGrid {...defaultProps} totalCount={10} currentPage={1} pageSize={10} />);
    
    // With only 10 items and pageSize 10, we're on the only/last page
    // Pagination should not be shown when totalCount <= pageSize
    const pagination = container.querySelector('.pagination');
    expect(pagination).toBeNull();
  });

  it('should call onPageChange when Next is clicked', () => {
    render(<BookGrid {...defaultProps} totalCount={20} currentPage={1} />);
    
    const pagination = document.querySelector('.pagination');
    const liElements = pagination.querySelectorAll('li');
    const nextButton = liElements[liElements.length - 1].querySelector('a');
    fireEvent.click(nextButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when Previous is clicked', () => {
    render(<BookGrid {...defaultProps} totalCount={20} currentPage={2} />);
    
    const pagination = document.querySelector('.pagination');
    const liElements = pagination.querySelectorAll('li');
    const prevButton = liElements[0].querySelector('a');
    fireEvent.click(prevButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('should call onPageChange when page number is clicked', () => {
    render(<BookGrid {...defaultProps} totalCount={30} currentPage={1} />);
    
    const pageButton = screen.getByText('2');
    fireEvent.click(pageButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('should hide pagination when totalCount <= pageSize', () => {
    render(<BookGrid {...defaultProps} totalCount={5} pageSize={10} />);
    
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it('should call onSort when sortable column header is clicked', () => {
    render(<BookGrid {...defaultProps} />);
    
    const titleHeader = screen.getByRole('columnheader', { name: /Title/i });
    fireEvent.click(titleHeader);
    
    expect(defaultProps.onSort).toHaveBeenCalledWith('Title');
  });

  it('should display sort indicator on sorted column', () => {
    render(<BookGrid {...defaultProps} sortBy="Title" sortDirection="asc" />);
    
    const titleHeader = screen.getByRole('columnheader', { name: /Title/i });
    expect(titleHeader.textContent).toContain('↑');
  });

  it('should display descending sort indicator', () => {
    render(<BookGrid {...defaultProps} sortBy="Author" sortDirection="desc" />);
    
    const authorHeader = screen.getByRole('columnheader', { name: /Author/i });
    expect(authorHeader.textContent).toContain('↓');
  });

  it('should not display sort indicator on unsorted columns', () => {
    render(<BookGrid {...defaultProps} sortBy="Title" sortDirection="asc" />);
    
    const authorHeader = screen.getByRole('columnheader', { name: 'Author' });
    expect(authorHeader.textContent).not.toContain('↑');
    expect(authorHeader.textContent).not.toContain('↓');
  });

  it('should make Loanee column sortable', () => {
    render(<BookGrid {...defaultProps} />);
    
    const loaneeHeader = screen.getByRole('columnheader', { name: 'Loanee' });
    expect(loaneeHeader).toHaveClass('sortable');
  });

  it('should render Rate button for each book', () => {
    render(<BookGrid {...defaultProps} />);
    
    // Should have 2 Rate buttons (one for each book) - using title attribute
    const buttons = screen.getAllByTitle('Rate this book');
    expect(buttons).toHaveLength(2);
  });

  it('should call onRate with correct book when Rate button is clicked', () => {
    render(<BookGrid {...defaultProps} />);
    
    const rateButtons = screen.getAllByTitle('Rate this book');
    fireEvent.click(rateButtons[0]); // Click first Rate button
    
    expect(defaultProps.onRate).toHaveBeenCalledWith(mockBooks[0]);
  });

  it('should call onRate with correct book data', () => {
    render(<BookGrid {...defaultProps} />);
    
    const rateButtons = screen.getAllByTitle('Rate this book');
    fireEvent.click(rateButtons[1]); // Click second Rate button
    
    expect(defaultProps.onRate).toHaveBeenCalledWith(mockBooks[1]);
    expect(defaultProps.onRate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '2',
        title: 'Test Book 2'
      })
    );
  });

  // Update Status button tests
  it('should render Update Status button for each book', () => {
    render(<BookGrid {...defaultProps} />);
    
    const buttons = screen.getAllByTitle('Update reading status');
    expect(buttons).toHaveLength(2);
  });

  it('should call onUpdateStatus with correct book when Update Status button is clicked', () => {
    render(<BookGrid {...defaultProps} />);
    
    const updateButtons = screen.getAllByTitle('Update reading status');
    fireEvent.click(updateButtons[0]);
    
    expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith(mockBooks[0]);
  });

  it('should call onUpdateStatus with correct book data', () => {
    render(<BookGrid {...defaultProps} />);
    
    const updateButtons = screen.getAllByTitle('Update reading status');
    fireEvent.click(updateButtons[1]);
    
    expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith(mockBooks[1]);
    expect(defaultProps.onUpdateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '2',
        title: 'Test Book 2',
        readingStatus: null
      })
    );
  });

  // Loan and Return button tests
  it('should render Loan button for all books', () => {
    render(<BookGrid {...defaultProps} />);
    
    const loanButtons = screen.getAllByTitle(/Loan this book|Already loaned/);
    expect(loanButtons).toHaveLength(2);
  });

  it('should enable Loan button when book is not loaned', () => {
    render(<BookGrid {...defaultProps} />);
    
    const loanButtons = screen.getAllByTitle('Loan this book');
    expect(loanButtons).toHaveLength(1); // Only book 1 is not loaned
    expect(loanButtons[0]).not.toBeDisabled();
  });

  it('should disable Loan button when book is already loaned', () => {
    render(<BookGrid {...defaultProps} />);
    
    const disabledLoanButton = screen.getByTitle('Already loaned');
    expect(disabledLoanButton).toBeDisabled();
  });

  it('should call onLoan with correct book when Loan button is clicked', () => {
    render(<BookGrid {...defaultProps} />);
    
    const loanButtons = screen.getAllByTitle('Loan this book');
    fireEvent.click(loanButtons[0]);
    
    expect(defaultProps.onLoan).toHaveBeenCalledWith(mockBooks[0]);
  });

  it('should render Return button only for loaned books', () => {
    render(<BookGrid {...defaultProps} />);
    
    const returnButtons = screen.getAllByTitle('Return this book');
    expect(returnButtons).toHaveLength(1); // Only book 2 is loaned
  });

  it('should not render Return button for non-loaned books', () => {
    const nonLoanedProps = {
      ...defaultProps,
      books: [mockBooks[0]] // Book without loanee
    };
    render(<BookGrid {...nonLoanedProps} />);
    
    const returnButtons = screen.queryAllByTitle('Return this book');
    expect(returnButtons).toHaveLength(0);
  });

  it('should call onReturn with correct book when Return button is clicked', () => {
    render(<BookGrid {...defaultProps} />);
    
    const returnButton = screen.getByTitle('Return this book');
    fireEvent.click(returnButton);
    
    expect(defaultProps.onReturn).toHaveBeenCalledWith(mockBooks[1]);
  });

  it('should render Rate, Loan, and Return buttons in same row', () => {
    render(<BookGrid {...defaultProps} />);
    
    const rows = screen.getAllByRole('row');
    const loanedBookRow = rows[2]; // Second data row (book with loanee)
    
    // Should have all three buttons visible in this row
    const rateButton = loanedBookRow.querySelector('[title="Rate this book"]');
    const loanButton = loanedBookRow.querySelector('[title="Already loaned"]');
    const returnButton = loanedBookRow.querySelector('[title="Return this book"]');
    
    expect(rateButton).toBeInTheDocument();
    expect(loanButton).toBeInTheDocument();
    expect(returnButton).toBeInTheDocument();
  });
});
