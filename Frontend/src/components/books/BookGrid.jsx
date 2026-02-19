import { formatOwnershipStatus, formatReadingStatus, formatStarRating } from '../../utils/formatters';
import LoadingSpinner from '../shared/LoadingSpinner';
import './BookGrid.css';

/**
 * BookGrid component - displays books in a paginated, sortable table
 * @param {Object} props
 * @param {Array} props.books - Array of book objects
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onTitleClick - Callback when book title is clicked
 * @param {number} props.currentPage - Current page number
 * @param {number} props.pageSize - Number of items per page
 * @param {number} props.totalCount - Total number of books
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {string} props.sortBy - Current sort field
 * @param {string} props.sortDirection - Current sort direction ('asc' or 'desc')
 * @param {Function} props.onSort - Callback when sort changes
 */
function BookGrid({
  books,
  loading,
  onTitleClick,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  sortBy,
  sortDirection,
  onSort
}) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!books || books.length === 0) {
    return (
      <div className="empty-state">
        <p>No books in library. Add your first book!</p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  const renderSortIndicator = (columnName) => {
    if (sortBy.toLowerCase() !== columnName.toLowerCase()) {
      return null;
    }
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const handleSort = (columnName) => {
    if (onSort) {
      onSort(columnName);
    }
  };

  const renderTableHeader = (label, columnName, sortable = true) => {
    if (!sortable) {
      return <th>{label}</th>;
    }

    return (
      <th
        className="sortable"
        onClick={() => handleSort(columnName)}
        style={{ cursor: 'pointer' }}
      >
        {label}{renderSortIndicator(columnName)}
      </th>
    );
  };

  const getPaginationRange = () => {
    const range = [];
    const maxPages = 5; // Show up to 5 page numbers

    let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let end = Math.min(totalPages, start + maxPages - 1);

    // Adjust start if we're near the end
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  return (
    <div className="book-grid">
      <div className="table-container">
        <table className="striped responsive-table">
          <thead>
            <tr>
              {renderTableHeader('Title', 'Title')}
              {renderTableHeader('Author', 'Author')}
              {renderTableHeader('Score', 'Score')}
              {renderTableHeader('Ownership', 'OwnershipStatus')}
              {renderTableHeader('Reading Status', 'ReadingStatus')}
              {renderTableHeader('Loanee', 'Loanee')}
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onTitleClick) {
                        onTitleClick(book.id);
                      }
                    }}
                    className="book-title-link"
                  >
                    {book.title}
                  </a>
                </td>
                <td>{book.author || '-'}</td>
                <td>{book.score ? formatStarRating(book.score) : '-'}</td>
                <td>{formatOwnershipStatus(book.ownershipStatus)}</td>
                <td>{book.readingStatus ? formatReadingStatus(book.readingStatus) : '-'}</td>
                <td>{book.loanee || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalCount > pageSize && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex}-{endIndex} of {totalCount} books
          </div>
          <ul className="pagination">
            <li className={currentPage === 1 ? 'disabled' : 'waves-effect'}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1 && onPageChange) {
                    onPageChange(currentPage - 1);
                  }
                }}
              >
                <i className="material-icons">chevron_left</i>
              </a>
            </li>
            
            {getPaginationRange().map((page) => (
              <li
                key={page}
                className={page === currentPage ? 'active' : 'waves-effect'}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onPageChange) {
                      onPageChange(page);
                    }
                  }}
                >
                  {page}
                </a>
              </li>
            ))}

            <li className={currentPage === totalPages ? 'disabled' : 'waves-effect'}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages && onPageChange) {
                    onPageChange(currentPage + 1);
                  }
                }}
              >
                <i className="material-icons">chevron_right</i>
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default BookGrid;
