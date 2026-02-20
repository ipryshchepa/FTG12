import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../shared/Modal';
import FormSelect from '../shared/FormSelect';
import Button from '../shared/Button';
import { useToast } from '../../hooks/useToast';
import * as readingStatusService from '../../services/readingStatusService';
import { READING_STATUS_OPTIONS, READING_STATUS } from '../../constants';

/**
 * UpdateReadingStatusModal - Modal for updating a book's reading status
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {string|number} props.bookId - Book ID
 * @param {string} props.currentStatus - Current reading status
 * @param {Function} props.onSuccess - Callback on successful update
 */
function UpdateReadingStatusModal({ isOpen, onClose, bookId, currentStatus, onSuccess }) {
  const [status, setStatus] = useState(READING_STATUS.BACKLOG);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  // Initialize status from currentStatus prop
  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus || READING_STATUS.BACKLOG);
      setError('');
      setSubmitting(false);
    }
  }, [isOpen, currentStatus]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setError('');
  };

  const validateForm = () => {
    if (!status) {
      setError('Please select a reading status');
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
        status
      };

      await readingStatusService.updateReadingStatus(bookId, payload);
      
      showToast('Reading status updated', 'success');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error updating reading status:', err);
      const errorMessage = err.message || 'Failed to update reading status. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStatus(currentStatus || READING_STATUS.BACKLOG);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Reading Status" maxWidth="500px">
      <form onSubmit={handleSubmit}>
        <div style={{ minHeight: '200px', paddingBottom: '20px' }}>
          <FormSelect
            label="Reading Status"
            name="status"
            value={status}
            onChange={handleStatusChange}
            options={READING_STATUS_OPTIONS}
            required
            error={error}
          />
        </div>

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
            {submitting ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

UpdateReadingStatusModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  currentStatus: PropTypes.string,
  onSuccess: PropTypes.func
};

export default UpdateReadingStatusModal;
