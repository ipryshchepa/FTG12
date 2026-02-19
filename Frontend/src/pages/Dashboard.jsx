import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import BookGrid from '../components/books/BookGrid';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import './Dashboard.css';

/**
 * Dashboard page - displays paginated and sortable book collection
 */
function Dashboard() {
  const navigate = useNavigate();
  const { books, loading, error, totalCount, fetchBooks } = useBooks();
  
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

  if (error) {
    return (
      <div className="dashboard-page">
        <h4>Books Dashboard</h4>
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h4>Books Dashboard</h4>
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
    </div>
  );
}

export default Dashboard;
