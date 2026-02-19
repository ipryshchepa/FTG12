import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useModal } from '../hooks/useModal';
import BookGrid from '../components/books/BookGrid';
import AddBookModal from '../components/books/AddBookModal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import Button from '../components/shared/Button';
import './Dashboard.css';

/**
 * Dashboard page - displays paginated and sortable book collection
 */
function Dashboard() {
  const navigate = useNavigate();
  const { books, loading, error, totalCount, fetchBooks } = useBooks();
  const addBookModal = useModal();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState('Title');
  const [sortDirection, setSortDirection] = useState('asc');

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
    navigate(`/books/${bookId}`);
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
    </div>
  );
}

export default Dashboard;
