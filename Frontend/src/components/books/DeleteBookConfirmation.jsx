import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useToast } from '../../hooks/useToast';
import * as bookService from '../../services/bookService';

/**
 * DeleteBookConfirmation Component
 * 
 * Displays a confirmation modal before deleting a book.
 * Warns the user about cascade deletion of related data.
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to call when modal closes
 * @param {string} bookId - The ID of the book to delete
 * @param {string} bookTitle - The title of the book to delete
 * @param {function} onSuccess - Function to call after successful deletion
 */
function DeleteBookConfirmation({ isOpen, onClose, bookId, bookTitle, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleConfirmDelete = async () => {
    if (!bookId) {
      showToast('Book ID is required', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      await bookService.deleteBook(bookId);
      showToast('Book deleted successfully', 'success');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Delete book error:', error);
      const message = error.message || 'Failed to delete book';
      showToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Book"
    >
      <div className="delete-book-confirmation">
        <p>
          Are you sure you want to delete <strong>&quot;{bookTitle}&quot;</strong>?
        </p>
        <p className="warning-text red-text">
          <i className="material-icons tiny">warning</i>
          {' '}
          This action cannot be undone. Deleting this book will also permanently remove:
        </p>
        <ul className="browser-default" style={{ marginLeft: '20px' }}>
          <li>Book rating (if any)</li>
          <li>Reading status</li>
          <li>All loan history records</li>
        </ul>
      </div>

      <div className="modal-actions">
        <Button
          type="button"
         variant="text"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleConfirmDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
        </Button>
      </div>
    </Modal>
  );
}

DeleteBookConfirmation.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.string,
  bookTitle: PropTypes.string,
  onSuccess: PropTypes.func,
};

DeleteBookConfirmation.defaultProps = {
  bookId: null,
  bookTitle: 'this book',
  onSuccess: null,
};

export default DeleteBookConfirmation;
