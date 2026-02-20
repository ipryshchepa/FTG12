import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../shared/Modal';
import FormTextarea from '../shared/FormTextarea';
import Button from '../shared/Button';
import * as ratingService from '../../services/ratingService';
import { MAX_LENGTHS, SCORE_MIN, SCORE_MAX } from '../../constants';
import { useToast } from '../../hooks/useToast';
import './RateBookModal.css';

/**
 * RateBookModal component - Modal for rating a book with star rating and notes
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {number} props.bookId - ID of the book to rate
 * @param {Object} props.existingRating - Existing rating object { score, notes }
 * @param {Function} props.onSuccess - Callback on successful rating
 */
function RateBookModal({ isOpen, onClose, bookId, existingRating, onSuccess }) {
  const { showToast } = useToast();
  const [score, setScore] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  // Initialize form with existing rating if provided
  useEffect(() => {
    if (isOpen) {
      if (existingRating) {
        setScore(existingRating.score || 0);
        setNotes(existingRating.notes || '');
      } else {
        setScore(0);
        setNotes('');
      }
      setError('');
      setHoveredStar(0);
    }
  }, [isOpen, existingRating]);

  const handleStarClick = (starNumber) => {
    setScore(starNumber);
    setError(''); // Clear error when user selects a score
  };

  const handleStarHover = (starNumber) => {
    setHoveredStar(starNumber);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate score
    if (!score || score < SCORE_MIN || score > SCORE_MAX) {
      setError(`Please select a rating between ${SCORE_MIN} and ${SCORE_MAX}`);
      showToast(`Please select a rating between ${SCORE_MIN} and ${SCORE_MAX}`, 'error');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        score,
        notes: notes.trim() || null
      };

      await ratingService.createOrUpdateRating(bookId, payload);
      
      showToast('Rating saved successfully!', 'success');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving rating:', err);
      const errorMessage = err.message || 'Failed to save rating. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const renderStars = () => {
    const stars = [];
    const displayScore = hoveredStar || score;

    for (let i = 1; i <= SCORE_MAX; i++) {
      const isSelected = i <= displayScore;
      stars.push(
        <span
          key={i}
          className={`star ${isSelected ? 'star-selected' : 'star-unselected'}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          role="button"
          tabIndex={0}
          aria-label={`Rate ${i} out of ${SCORE_MAX}`}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleStarClick(i);
            }
          }}
        >
          {isSelected ? '★' : '☆'}
        </span>
      );
    }

    return stars;
  };

  const modalTitle = existingRating ? 'Update Rating' : 'Rate Book';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="500px">
      <form onSubmit={handleSubmit}>
        <div className="star-rating-container">
          <label className="star-rating-label">
            Select Rating <span className="required-asterisk">*</span>
          </label>
          <div className="stars-wrapper">
            {renderStars()}
          </div>
          <div className="score-display">
            {score > 0 ? `${score}/${SCORE_MAX}` : 'Not rated'}
          </div>
          {error && <span className="helper-text red-text">{error}</span>}
        </div>

        <FormTextarea
          label="Notes"
          name="notes"
          value={notes}
          onChange={handleNotesChange}
          maxLength={MAX_LENGTHS.RATING_NOTES}
          rows={4}
          placeholder="Share your thoughts about this book (optional)"
        />

        <div className="modal-actions">
          <Button
            type="button"
            onClick={handleCancel}
            variant="text"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Rating'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

RateBookModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookId: PropTypes.number,
  existingRating: PropTypes.shape({
    score: PropTypes.number,
    notes: PropTypes.string
  }),
  onSuccess: PropTypes.func
};

export default RateBookModal;
