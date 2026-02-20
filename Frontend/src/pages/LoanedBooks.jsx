import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as loanService from '../services/loanService';
import * as bookService from '../services/bookService';
import LoanedBookGrid from '../components/loans/LoanedBookGrid';
import ErrorMessage from '../components/shared/ErrorMessage';
import { useToast } from '../hooks/useToast';

/**
 * Loaned Books page - displays all currently loaned books
 */
function LoanedBooks() {
  const [loanedBooks, setLoanedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const fetchLoanedBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all active loans
      const loans = await loanService.getActiveLoanedBooks();

      // Fetch book details for each loan
      const loansWithBookDetails = await Promise.all(
        loans.map(async (loan) => {
          try {
            const bookDetails = await bookService.getBookDetails(loan.bookId);
            return {
              ...loan,
              book: {
                title: bookDetails.title,
                author: bookDetails.author
              }
            };
          } catch (err) {
            // If book details fetch fails, still include the loan with placeholder
            console.error(`Failed to fetch book details for bookId ${loan.bookId}:`, err);
            return {
              ...loan,
              book: {
                title: 'Unknown',
                author: 'Unknown'
              }
            };
          }
        })
      );

      setLoanedBooks(loansWithBookDetails);
    } catch (err) {
      console.error('Error fetching loaned books:', err);
      setError('Failed to load loaned books. Please try again.');
      showToast('Failed to load loaned books', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLoanedBooks();
  }, [fetchLoanedBooks]);

  const handleTitleClick = (bookId) => {
    navigate(`/books/${bookId}`, { state: { from: location.pathname } });
  };

  const handleReturn = async (loan) => {
    try {
      await loanService.returnBook(loan.bookId);
      showToast('Book returned', 'success');
      // Refresh the loaned books list
      fetchLoanedBooks();
    } catch (err) {
      console.error('Error returning book:', err);
      const errorMessage = err.message || 'Failed to return book. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleRetry = () => {
    fetchLoanedBooks();
  };

  return (
    <div className="loaned-books-page container">
      <div className="page-header">
        <h4>Loaned Books</h4>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRetry}
        />
      )}

      {!error && (
        <LoanedBookGrid
          loanedBooks={loanedBooks}
          loading={loading}
          onTitleClick={handleTitleClick}
          onReturn={handleReturn}
        />
      )}
    </div>
  );
}

export default LoanedBooks;
