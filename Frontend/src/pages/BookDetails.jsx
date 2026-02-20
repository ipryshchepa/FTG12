import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as bookService from '../services/bookService';
import { formatOwnershipStatus, formatReadingStatus, formatStarRating, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import Button from '../components/shared/Button';

/**
 * Book Details page - displays complete book information
 */
function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookService.getBookDetails(bookId);
      setBook(data);
    } catch (err) {
      if (err.status === 404) {
        setError('Book not found');
      } else {
        setError(err.message || 'Failed to load book details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return <LoadingSpinner message="Loading book details..." />;
  }

  if (error) {
    return (
      <div className="book-details-page container">
        <ErrorMessage message={error} onRetry={fetchBookDetails} />
        <div className="center-align" style={{ marginTop: '20px' }}>
          <Button onClick={handleBack} variant="secondary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="book-details-page container">
      <div className="row" style={{ marginBottom: '10px' }}>
        <div className="col s12">
          <Button onClick={handleBack} variant="secondary">
            <i className="material-icons left">arrow_back</i>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Main Book Information Card */}
      <div className="row" style={{ marginBottom: '10px' }}>
        <div className="col s12">
          <div className="card">
            <div className="card-content" style={{ paddingBottom: '10px' }}>
              <h4 style={{ marginTop: '0', marginBottom: '5px' }}>{book.title}</h4>
              <h5 className="grey-text" style={{ marginTop: '0', marginBottom: '10px' }}>{book.author}</h5>
              
              <div className="row" style={{ marginBottom: '5px' }}>
                <div className="col s12 m3">
                  <strong>ISBN:</strong> {book.isbn || 'N/A'}
                </div>
                <div className="col s12 m3">
                  <strong>Published Year:</strong> {book.publishedYear || 'N/A'}
                </div>
                <div className="col s12 m3">
                  <strong>Page Count:</strong> {book.pageCount || 'N/A'}
                </div>
                <div className="col s12 m3">
                  <strong>Ownership:</strong> {formatOwnershipStatus(book.ownershipStatus)}
                </div>
              </div>
              
              {book.description && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Description:</strong>
                  <p style={{ marginTop: '5px', marginBottom: '5px' }}>{book.description}</p>
                </div>
              )}
              
              {book.notes && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Notes:</strong>
                  <p style={{ marginTop: '5px', marginBottom: '0' }}>{book.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating, Reading Status, and Loan Information - Side by Side */}
      <div className="row" style={{ marginBottom: '10px' }}>
        {/* Rating Section */}
        <div className="col s12 m4">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-content">
              <span className="card-title" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Rating</span>
              {book.score ? (
                <div>
                  <div className="rating-stars" style={{ fontSize: '1.3rem', color: '#ffd700', marginBottom: '5px' }}>
                    {formatStarRating(book.score)}
                  </div>
                  {book.ratingNotes && (
                    <div>
                      <strong>Notes:</strong>
                      <p style={{ marginTop: '5px', marginBottom: '0' }}>{book.ratingNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="grey-text" style={{ marginBottom: '0' }}>No rating yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Reading Status Section */}
        <div className="col s12 m4">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-content">
              <span className="card-title" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Reading Status</span>
              {book.readingStatus ? (
                <p style={{ marginBottom: '0', fontSize: '1.1rem' }}>{formatReadingStatus(book.readingStatus)}</p>
              ) : (
                <p className="grey-text" style={{ marginBottom: '0' }}>No reading status set</p>
              )}
            </div>
          </div>
        </div>

        {/* Loan Information Section */}
        <div className="col s12 m4">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-content">
              <span className="card-title" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Loan Information</span>
              {book.loanee ? (
                <div>
                  <p style={{ marginBottom: '5px' }}><strong>Loaned to:</strong> {book.loanee}</p>
                  <p style={{ marginBottom: '0' }}><strong>Loan Date:</strong> {formatDate(book.loanDate)}</p>
                </div>
              ) : (
                <p className="grey-text" style={{ marginBottom: '0' }}>Not currently loaned</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
