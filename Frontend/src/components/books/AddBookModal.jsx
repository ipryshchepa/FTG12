import { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../shared/Modal';
import FormInput from '../shared/FormInput';
import FormSelect from '../shared/FormSelect';
import FormTextarea from '../shared/FormTextarea';
import Button from '../shared/Button';
import * as bookService from '../../services/bookService';
import { MAX_LENGTHS, OWNERSHIP_STATUS, OWNERSHIP_STATUS_OPTIONS } from '../../constants';
import { validateTitle, validateAuthor, validateYear } from '../../utils/validators';
import { useToast } from '../../hooks/useToast';
import './AddBookModal.css';

/**
 * AddBookModal component - Modal form for creating a new book
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onSuccess - Callback on successful book creation
 */
function AddBookModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useToast();

  const initialFormState = {
    title: '',
    author: '',
    description: '',
    notes: '',
    isbn: '',
    publishedYear: '',
    pageCount: '',
    ownershipStatus: OWNERSHIP_STATUS.OWN
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix validation errors', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare payload - convert empty strings to null for optional fields
      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim() || null,
        notes: formData.notes.trim() || null,
        isbn: formData.isbn.trim() || null,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear, 10) : null,
        pageCount: formData.pageCount ? parseInt(formData.pageCount, 10) : null,
        ownershipStatus: formData.ownershipStatus
      };

      await bookService.createBook(payload);
      
      showToast('Book added successfully!', 'success');
      handleReset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating book:', err);
      const errorMessage = err.message || 'Failed to add book. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Add New Book"
      maxWidth="650px"
    >
      <form onSubmit={handleSubmit}>
        <div className="add-book-form-row">
          <FormInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required={true}
            maxLength={MAX_LENGTHS.TITLE}
            error={errors.title}
          />

          <FormInput
            label="Author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required={true}
            maxLength={MAX_LENGTHS.AUTHOR}
            error={errors.author}
          />
        </div>

        <div className="add-book-form-row">
          <FormInput
            label="ISBN"
            name="isbn"
            value={formData.isbn}
            onChange={handleInputChange}
            maxLength={MAX_LENGTHS.ISBN}
            error={errors.isbn}
          />

          <FormSelect
            label="Ownership Status"
            name="ownershipStatus"
            value={formData.ownershipStatus}
            onChange={handleInputChange}
            options={OWNERSHIP_STATUS_OPTIONS}
            required={true}
            error={errors.ownershipStatus}
          />
        </div>

        <FormTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          maxLength={MAX_LENGTHS.DESCRIPTION}
          error={errors.description}
          rows={1}
        />

        <FormTextarea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          maxLength={MAX_LENGTHS.NOTES}
          error={errors.notes}
          rows={2}
        />

        <div className="add-book-form-row">
          <FormInput
            label="Published Year"
            name="publishedYear"
            type="number"
            value={formData.publishedYear}
            onChange={handleInputChange}
            error={errors.publishedYear}
          />

          <FormInput
            label="Page Count"
            name="pageCount"
            type="number"
            value={formData.pageCount}
            onChange={handleInputChange}
            error={errors.pageCount}
          />
        </div>

        <div className="modal-footer add-book-modal-footer">
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
            {submitting ? 'Adding...' : 'Add Book'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

AddBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default AddBookModal;
