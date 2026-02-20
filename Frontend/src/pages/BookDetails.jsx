import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import * as bookService from '../services/bookService';
import * as loanService from '../services/loanService';
import { formatOwnershipStatus, formatReadingStatus, formatStarRating, formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import Button from '../components/shared/Button';
import FormInput from '../components/shared/FormInput';
import FormSelect from '../components/shared/FormSelect';
import FormTextarea from '../components/shared/FormTextarea';
import RateBookModal from '../components/books/RateBookModal';
import LoanBookModal from '../components/books/LoanBookModal';
import UpdateReadingStatusModal from '../components/books/UpdateReadingStatusModal';
import DeleteBookConfirmation from '../components/books/DeleteBookConfirmation';
import { useToast } from '../hooks/useToast';
import { useModal } from '../hooks/useModal';
import { validateTitle, validateAuthor, validateYear } from '../utils/validators';
import { MAX_LENGTHS, OWNERSHIP_STATUS_OPTIONS } from '../constants';

/**
 * Book Details page - displays complete book information
 */
function BookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const rateModal = useModal();
  const loanModal = useModal();
  const statusModal = useModal();
  const deleteModal = useModal();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchBookDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookService.getBookDetails(bookId);
      setBook(data);
      // Initialize form data
      const bookFormData = {
        title: data.title || '',
        author: data.author || '',
        description: data.description || '',
        notes: data.notes || '',
        isbn: data.isbn || '',
        publishedYear: data.publishedYear || '',
        pageCount: data.pageCount || '',
        ownershipStatus: data.ownershipStatus || ''
      };
      setFormData(bookFormData);
      setOriginalData(bookFormData);
    } catch (err) {
      if (err.status === 404) {
        setError('Book not found');
      } else {
        setError(err.message || 'Failed to load book details');
      }
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBookDetails();
  }, [bookId, fetchBookDetails]);

  const handleBack = () => {
    // Navigate back to the page we came from, or dashboard by default
    const from = location.state?.from;
    if (from) {
      navigate(from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setFormErrors({});
    setEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate title
    const titleError = validateTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    // Validate author
    const authorError = validateAuthor(formData.author);
    if (authorError) newErrors.author = authorError;

    // Validate optional fields
    if (formData.description && formData.description.length > MAX_LENGTHS.DESCRIPTION) {
      newErrors.description = `Description must not exceed ${MAX_LENGTHS.DESCRIPTION} characters`;
    }

    if (formData.notes && formData.notes.length > MAX_LENGTHS.NOTES) {
      newErrors.notes = `Notes must not exceed ${MAX_LENGTHS.NOTES} characters`;
    }

    if (formData.isbn && formData.isbn.length > MAX_LENGTHS.ISBN) {
      newErrors.isbn = `ISBN must not exceed ${MAX_LENGTHS.ISBN} characters`;
    }

    // Validate published year if provided
    if (formData.publishedYear) {
      const yearError = validateYear(formData.publishedYear);
      if (yearError) newErrors.publishedYear = yearError;
    }

    // Validate page count if provided
    if (formData.pageCount) {
      const pageCount = parseInt(formData.pageCount, 10);
      if (isNaN(pageCount) || pageCount < 1) {
        newErrors.pageCount = 'Page count must be a positive number';
      }
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Please fix validation errors', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare payload
      const payload = {
        id: parseInt(bookId, 10),
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim() || null,
        notes: formData.notes.trim() || null,
        isbn: formData.isbn.trim() || null,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear, 10) : null,
        pageCount: formData.pageCount ? parseInt(formData.pageCount, 10) : null,
        ownershipStatus: formData.ownershipStatus
      };

      await bookService.updateBook(bookId, payload);
      
      showToast('Book updated successfully!', 'success');
      setEditing(false);
      await fetchBookDetails(); // Refresh book data
    } catch (err) {
      console.error('Error updating book:', err);
      const errorMessage = err.message || 'Failed to update book. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = () => {
    rateModal.openModal();
  };

  const handleRateSuccess = () => {
    fetchBookDetails(); // Refresh book data to show updated rating
  };

  const handleLoan = () => {
    loanModal.openModal();
  };

  const handleLoanSuccess = () => {
    fetchBookDetails(); // Refresh book data to show loan information
  };

  const handleReturn = async () => {
    try {
      await loanService.returnBook(bookId);
      showToast(`Book returned from ${book.loanee}`, 'success');
      fetchBookDetails(); // Refresh book data
    } catch (err) {
      console.error('Error returning book:', err);
      const errorMessage = err.message || 'Failed to return book. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = () => {
    deleteModal.openModal();
  };

  const handleDeleteSuccess = () => {
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
      <div className="row" style={{ marginBottom: '20px' }}>
        <div className="col s12">
          <Button onClick={handleBack} variant="secondary">
            <i className="material-icons left">arrow_back</i>
            Back to Dashboard
          </Button>
          {!editing && (
            <>
              <Button 
                onClick={handleEdit} 
                variant="primary" 
                style={{ marginLeft: '15px' }}
                disabled={editing}
              >
                <i className="material-icons left">edit</i>
                Edit
              </Button>
              <Button 
                onClick={handleDelete} 
                variant="danger" 
                style={{ marginLeft: '15px' }}
                icon="delete"
                title="Delete this book"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Book Information Card */}
      <div className="row" style={{ marginBottom: '10px' }}>
        <div className="col s12">
          <div className="card">
            <div className="card-content" style={{ paddingBottom: '10px' }}>
              {editing ? (
                <>
                  {/* Edit Mode */}
                  <FormInput
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required={true}
                    maxLength={MAX_LENGTHS.TITLE}
                    error={formErrors.title}
                  />
                  
                  <FormInput
                    label="Author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required={true}
                    maxLength={MAX_LENGTHS.AUTHOR}
                    error={formErrors.author}
                  />
                  
                  <div className="row" style={{ marginBottom: '5px' }}>
                    <div className="col s12 m6">
                      <FormInput
                        label="ISBN"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleInputChange}
                        maxLength={MAX_LENGTHS.ISBN}
                        error={formErrors.isbn}
                      />
                    </div>
                    <div className="col s12 m6">
                      <FormSelect
                        label="Ownership Status"
                        name="ownershipStatus"
                        value={formData.ownershipStatus}
                        onChange={handleInputChange}
                        options={OWNERSHIP_STATUS_OPTIONS}
                        required={true}
                        error={formErrors.ownershipStatus}
                      />
                    </div>
                  </div>
                  
                  <div className="row" style={{ marginBottom: '5px' }}>
                    <div className="col s12 m6">
                      <FormInput
                        label="Published Year"
                        name="publishedYear"
                        type="number"
                        value={formData.publishedYear}
                        onChange={handleInputChange}
                        error={formErrors.publishedYear}
                      />
                    </div>
                    <div className="col s12 m6">
                      <FormInput
                        label="Page Count"
                        name="pageCount"
                        type="number"
                        value={formData.pageCount}
                        onChange={handleInputChange}
                        error={formErrors.pageCount}
                      />
                    </div>
                  </div>
                  
                  <FormTextarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength={MAX_LENGTHS.DESCRIPTION}
                    error={formErrors.description}
                    rows={3}
                  />
                  
                  <FormTextarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    maxLength={MAX_LENGTHS.NOTES}
                    error={formErrors.notes}
                    rows={3}
                  />
                  
                  <div style={{ marginTop: '30px', textAlign: 'right' }}>
                    <Button
                      onClick={handleCancel}
                      variant="text"
                      disabled={submitting}
                      style={{ marginRight: '15px' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant="primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
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
                </>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="card-title" style={{ fontSize: '1.2rem', margin: '0' }}>Rating</span>
                <Button
                  onClick={handleRate}
                  variant="primary"
                  size="small"
                  icon="star"
                  title={book.score ? 'Update rating' : 'Rate this book'}
                >
                  {book.score ? 'Update' : 'Rate'}
                </Button>
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="card-title" style={{ fontSize: '1.2rem', margin: '0' }}>Reading Status</span>
                <button
                  className="btn-small waves-effect waves-light blue"
                  onClick={statusModal.openModal}
                  title="Update reading status"
                >
                  <i className="material-icons">book</i>
                </button>
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="card-title" style={{ fontSize: '1.2rem', margin: '0' }}>Loan Information</span>
                {book.loanee ? (
                  <button
                    className="btn-small waves-effect waves-light blue"
                    onClick={handleReturn}
                    title="Return this book"
                  >
                    <i className="material-icons">assignment_return</i>
                  </button>
                ) : (
                  <button
                    className="btn-small waves-effect waves-light blue"
                    onClick={handleLoan}
                    title="Loan this book"
                  >
                    <i className="material-icons">person_add</i>
                  </button>
                )}
              </div>
              {book.loanee ? (
                <div>
                  <p style={{ marginBottom: '5px' }}><strong>Loaned to:</strong> {book.loanee}</p>
                  <p style={{ marginBottom: '0' }}><strong>Loan Date:</strong> {formatDate(book.loanDate)}</p>
                </div>
              ) : (
                <p className="grey-text" style={{ marginBottom: '0' }}>Not currently loaned</p>
              )}
              <div style={{ marginTop: '1rem' }}>
                <button
                  className="btn-small waves-effect waves-light grey"
                  onClick={() => navigate(`/books/${book.id}/history`)}
                  title="View loan history"
                >
                  <i className="material-icons left">history</i>
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RateBookModal
        isOpen={rateModal.isOpen}
        onClose={rateModal.closeModal}
        bookId={book?.id}
        existingRating={book?.score ? { score: book.score, notes: book.ratingNotes } : null}
        onSuccess={handleRateSuccess}
      />

      <LoanBookModal
        isOpen={loanModal.isOpen}
        onClose={loanModal.closeModal}
        bookId={book?.id}
        onSuccess={handleLoanSuccess}
      />

      <UpdateReadingStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.closeModal}
        bookId={book?.id}
        currentStatus={book?.readingStatus}
        onSuccess={fetchBookDetails}
      />

      <DeleteBookConfirmation
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        bookId={book?.id}
        bookTitle={book?.title}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

export default BookDetails;
