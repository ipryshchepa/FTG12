import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as loanService from '../services/loanService';
import * as bookService from '../services/bookService';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import Button from '../components/shared/Button';

/**
 * Loan History page - displays complete loan history for a book
 */
function LoanHistory() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [loanHistory, setLoanHistory] = useState([]);
  const [bookTitle, setBookTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch book details and loan history in parallel
      const [book, loans] = await Promise.all([
        bookService.getBookDetails(bookId),
        loanService.getLoanHistory(bookId)
      ]);

      setBookTitle(book.title);
      // Sort loans by date descending (most recent first)
      const sortedLoans = [...loans].sort((a, b) => 
        new Date(b.loanDate) - new Date(a.loanDate)
      );
      setLoanHistory(sortedLoans);
    } catch (err) {
      console.error('Error fetching loan history:', err);
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Book not found');
      } else {
        setError(err.message || 'Failed to load loan history');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const handleRetry = () => {
    fetchData();
  };

  const handleBack = () => {
    // Use browser back to return to wherever the user came from
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to book details if no history
      navigate(`/books/${bookId}`);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="loan-history-page container" style={{ marginTop: '2rem' }}>
        <ErrorMessage message={error} />
        <div style={{ marginTop: '1rem' }}>
          <Button variant="primary" onClick={handleRetry} style={{ marginRight: '1rem' }}>
            Retry
          </Button>
          <Button variant="text" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="loan-history-page container" style={{ marginTop: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Button onClick={handleBack} variant="secondary">
          <i className="material-icons left">arrow_back</i>
          Back to Book Details
        </Button>
      </div>

      <h4>Loan History for "{bookTitle}"</h4>

      {loanHistory.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <i className="material-icons large grey-text">history</i>
          <p className="grey-text" style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
            No loan history for this book
          </p>
        </div>
      ) : (
        <table className="striped highlight responsive-table" style={{ marginTop: '1.5rem' }}>
          <thead>
            <tr>
              <th>Borrower</th>
              <th>Loan Date</th>
              <th>Return Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loanHistory.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.borrowedTo}</td>
                <td>{formatDate(loan.loanDate)}</td>
                <td>{loan.returnedDate ? formatDate(loan.returnedDate) : 'Not returned'}</td>
                <td>
                  <span 
                    className={`badge ${loan.isReturned ? 'green' : 'blue'}`}
                    style={{ color: 'white' }}
                  >
                    {loan.isReturned ? 'Returned' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LoanHistory;
