import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../shared/Modal';
import FormInput from '../shared/FormInput';
import Button from '../shared/Button';
import * as loanService from '../../services/loanService';
import { MAX_LENGTHS } from '../../constants';
import { useToast } from '../../hooks/useToast';

/**
 * LoanBookModal component - Modal for loaning out a book
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {number} props.bookId - ID of the book to loan
 * @param {Function} props.onSuccess - Callback on successful loan creation
 */
function LoanBookModal({ isOpen, onClose, bookId, onSuccess }) {
  const { showToast } = useToast();
  const [borrowedTo, setBorrowedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setBorrowedTo('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleBorrowerChange = (e) => {
    setBorrowedTo(e.target.value);
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    const trimmedBorrower = borrowedTo.trim();
    
    if (!trimmedBorrower) {
      setError('Borrower name is required');
      return false;
    }

    if (trimmedBorrower.length > MAX_LENGTHS.BORROWED_TO) {
      setError(`Borrower name must be ${MAX_LENGTHS.BORROWED_TO} characters or less`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        borrowedTo: borrowedTo.trim()
      };

      await loanService.createLoan(bookId, payload);
      
      showToast(`Book loaned to ${borrowedTo.trim()}`, 'success');
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form and close modal
      setBorrowedTo('');
      onClose();
    } catch (err) {
      console.error('Error creating loan:', err);
      
      // Check for 409 Conflict (book already loaned)
      if (err.status === 409 || err.message?.includes('409') || err.message?.includes('already loaned')) {
        const errorMessage = 'Book is already loaned out';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } else {
        const errorMessage = err.message || 'Failed to loan book. Please try again.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setBorrowedTo('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Loan Book" maxWidth="500px">
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Borrower Name"
          name="borrowedTo"
          value={borrowedTo}
          onChange={handleBorrowerChange}
          required
          maxLength={MAX_LENGTHS.BORROWED_TO}
          error={error}
        />

        <div className="modal-footer">
          <Button
            type="button"
            variant="text"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? 'Loaning...' : 'Loan Book'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

LoanBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.number,
  onSuccess: PropTypes.func
};

export default LoanBookModal;
