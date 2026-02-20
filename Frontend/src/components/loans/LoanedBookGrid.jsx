import { useState } from 'react';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../shared/LoadingSpinner';
import './LoanedBookGrid.css';

/**
 * LoanedBookGrid component - displays currently loaned books in a sortable table
 * @param {Object} props
 * @param {Array} props.loanedBooks - Array of loan objects with book details
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onTitleClick - Callback when book title is clicked
 * @param {Function} props.onReturn - Callback when return button is clicked
 */
function LoanedBookGrid({ loanedBooks, loading, onTitleClick, onReturn }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!loanedBooks || loanedBooks.length === 0) {
    return (
      <div className="empty-state">
        <p>No books are currently loaned out.</p>
      </div>
    );
  }

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with ascending direction
      setSortColumn(columnName);
      setSortDirection('asc');
    }
  };

  const getSortedBooks = () => {
    if (!sortColumn) {
      // Default sort by loan date descending (most recent first)
      return [...loanedBooks].sort((a, b) => {
        const dateA = new Date(a.loanDate);
        const dateB = new Date(b.loanDate);
        return dateB - dateA;
      });
    }

    return [...loanedBooks].sort((a, b) => {
      let valueA, valueB;

      switch (sortColumn) {
        case 'title':
          valueA = a.book?.title?.toLowerCase() || '';
          valueB = b.book?.title?.toLowerCase() || '';
          break;
        case 'author':
          valueA = a.book?.author?.toLowerCase() || '';
          valueB = b.book?.author?.toLowerCase() || '';
          break;
        case 'loanee':
          valueA = a.borrowedTo?.toLowerCase() || '';
          valueB = b.borrowedTo?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const renderSortIndicator = (columnName) => {
    if (sortColumn !== columnName) {
      return null;
    }
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const renderSortableHeader = (label, columnName) => {
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

  const sortedBooks = getSortedBooks();

  return (
    <div className="loaned-book-grid">
      <div className="table-container">
        <table className="striped responsive-table">
          <thead>
            <tr>
              {renderSortableHeader('Title', 'title')}
              {renderSortableHeader('Author', 'author')}
              {renderSortableHeader('Loanee', 'loanee')}
              <th>Loan Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBooks.map((loan) => (
              <tr key={loan.id}>
                <td>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onTitleClick) {
                        onTitleClick(loan.bookId);
                      }
                    }}
                    className="book-title-link"
                  >
                    {loan.book?.title || 'Unknown'}
                  </a>
                </td>
                <td>{loan.book?.author || '-'}</td>
                <td>{loan.borrowedTo || '-'}</td>
                <td>{formatDate(loan.loanDate)}</td>
                <td>
                  <button
                    className="btn-small waves-effect waves-light red"
                    onClick={() => onReturn && onReturn(loan)}
                    title="Return this book"
                  >
                    <i className="material-icons">assignment_return</i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LoanedBookGrid;
