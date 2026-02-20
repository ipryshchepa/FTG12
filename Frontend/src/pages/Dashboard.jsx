import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useModal } from '../hooks/useModal';
import { useToast } from '../hooks/useToast';
import BookGrid from '../components/books/BookGrid';
import AddBookModal from '../components/books/AddBookModal';
import RateBookModal from '../components/books/RateBookModal';
import LoanBookModal from '../components/books/LoanBookModal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import Button from '../components/shared/Button';
import * as loanService from '../services/loanService';
import './Dashboard.css';

/**
 * Dashboard page - displays paginated and sortable book collection
 */
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books, loading, error, totalCount, fetchBooks } = useBooks();
  const addBookModal = useModal();
  const rateModal = useModal();
  const loanModal = useModal();
  const { showToast } = useToast();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('Title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks({
      page: currentPage,
      pageSize,
      sortBy,
      sortDirection
    });
  }, [currentPage, pageSize, sortBy, sortDirection, fetchBooks]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      // Toggle sort direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortBy(columnName);
      setSortDirection('asc');
      setCurrentPage(1); // Reset to first page when changing sort
    }
  };

  const handleTitleClick = (bookId) => {
    navigate(`/books/${bookId}`, { state: { from: location.pathname } });
  };

  const handleRetry = () => {
    fetchBooks({
      page: currentPage,
      pageSize,
      sortBy,
      sortDirection
    });
  };

  const handleAddBookSuccess = () => {
    // Refresh the books grid after successful book addition
    fetchBooks({
      page: currentPage,
      pageSize,
      sortBy,
      sortDirection
    });
  };

  const handleRate = (book) => {
    setSelectedBook(book);
    rateModal.openModal();
  };

  const handleRateSuccess = () => {
    fetchBooks({
      page: currentPage,
      pageSize,
      sortBy,
      sortDirection
    });
  };

  const handleLoan = (book) => {
    setSelectedBook(book);
    loanModal.openModal();
  };

  const handleLoanSuccess = () => {
    fetchBooks({
      page: currentPage,
      pageSize,
      sortBy,
      sortDirection
    });
  };

  const handleReturn = async (book) => {
    try {
      await loanService.returnBook(book.id);
      showToast(`Book returned from ${book.loanee}`, 'success');
      fetchBooks({
        page: currentPage,
        pageSize,
        sortBy,
        sortDirection
      });
    } catch (err) {
      console.error('Error returning book:', err);
      const errorMessage = err.message || 'Failed to return book. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h4>Books Dashboard</h4>
        </div>
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h4>Books Dashboard</h4>
        <Button
          variant="primary"
          onClick={addBookModal.openModal}
          icon="add"
        >
          Add Book
        </Button>
      </div>
      
      <BookGrid
        books={books}
        loading={loading}
        onTitleClick={handleTitleClick}
        onRate={handleRate}
        onLoan={handleLoan}
        onReturn={handleReturn}
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      <AddBookModal
        isOpen={addBookModal.isOpen}
        onClose={addBookModal.closeModal}
        onSuccess={handleAddBookSuccess}
      />

      <RateBookModal
        isOpen={rateModal.isOpen}
        onClose={rateModal.closeModal}
        bookId={selectedBook?.id}
        existingRating={selectedBook?.score ? { score: selectedBook.score, notes: selectedBook.ratingNotes } : null}
        onSuccess={handleRateSuccess}
      />

      <LoanBookModal
        isOpen={loanModal.isOpen}
        onClose={loanModal.closeModal}
        bookId={selectedBook?.id}
        onSuccess={handleLoanSuccess}
      />
    </div>
  );
}

export default Dashboard;
