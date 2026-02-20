import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RateBookModal from './RateBookModal';
import * as ratingService from '../../services/ratingService';

// Mock ratingService
vi.mock('../../services/ratingService', () => ({
  createOrUpdateRating: vi.fn()
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

// Mock Materialize Modal
const mockModalInstance = {
  open: vi.fn(),
  close: vi.fn(),
  destroy: vi.fn()
};

beforeEach(() => {
  global.M = {
    Modal: {
      init: vi.fn(() => mockModalInstance)
    }
  };
});

describe('RateBookModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    bookId: 123,
    existingRating: null,
    onSuccess: mockOnSuccess
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(<RateBookModal {...defaultProps} />);
    
    expect(screen.getByText('Rate Book')).toBeInTheDocument();
  });

  it('should render "Update Rating" title when existingRating is provided', () => {
    const props = {
      ...defaultProps,
      existingRating: { score: 7, notes: 'Good book' }
    };
    
    render(<RateBookModal {...props} />);
    
    expect(screen.getByText('Update Rating')).toBeInTheDocument();
  });

  it('should render 10 stars', () => {
    render(<RateBookModal {...defaultProps} />);
    
    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Rate')
    );
    
    expect(stars).toHaveLength(10);
  });

  it('should render stars as unselected initially', () => {
    render(<RateBookModal {...defaultProps} />);
    
    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Rate')
    );
    
    stars.forEach(star => {
      expect(star.textContent).toBe('☆');
    });
  });

  it('should display "Not rated" when no score selected', () => {
    render(<RateBookModal {...defaultProps} />);
    
    expect(screen.getByText('Not rated')).toBeInTheDocument();
  });

  it('should select stars when clicked', async () => {
    const user = userEvent.setup();
    render(<RateBookModal {...defaultProps} />);
    
    const star8 = screen.getByLabelText('Rate 8 out of 10');
    await user.click(star8);
    
    // Check that stars 1-8 are selected
    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Rate')
    );
    
    for (let i = 0; i < 8; i++) {
      expect(stars[i].textContent).toBe('★');
    }
    for (let i = 8; i < 10; i++) {
      expect(stars[i].textContent).toBe('☆');
    }
    
    // Check score display
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  it('should render notes textarea', () => {
    render(<RateBookModal {...defaultProps} />);
    
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  it('should allow typing in notes textarea', async () => {
    const user = userEvent.setup();
    render(<RateBookModal {...defaultProps} />);
    
    const notesTextarea = screen.getByLabelText(/Notes/i);
    await user.type(notesTextarea, 'Great book!');
    
    expect(notesTextarea).toHaveValue('Great book!');
  });

  it('should show character count for notes', () => {
    render(<RateBookModal {...defaultProps} />);
    
    // FormTextarea should display character count (0/1000)
    expect(screen.getByText(/0 \/ 1000/)).toBeInTheDocument();
  });

  it('should submit rating with score and notes', async () => {
    const user = userEvent.setup();
    ratingService.createOrUpdateRating.mockResolvedValue({});
    
    render(<RateBookModal {...defaultProps} />);
    
    // Select score 8
    const star8 = screen.getByLabelText('Rate 8 out of 10');
    await user.click(star8);
    
    // Enter notes
    const notesTextarea = screen.getByLabelText(/Notes/i);
    await user.type(notesTextarea, 'Great book');
    
    // Submit
    const saveButton = screen.getByRole('button', { name: /Save Rating/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(ratingService.createOrUpdateRating).toHaveBeenCalledWith(123, {
        score: 8,
        notes: 'Great book'
      });
    });
    
    expect(mockShowToast).toHaveBeenCalledWith('Rating saved successfully!', 'success');
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should submit rating without notes (notes as null)', async () => {
    const user = userEvent.setup();
    ratingService.createOrUpdateRating.mockResolvedValue({});
    
    render(<RateBookModal {...defaultProps} />);
    
    // Select score 9
    const star9 = screen.getByLabelText('Rate 9 out of 10');
    await user.click(star9);
    
    // Submit without notes
    const saveButton = screen.getByRole('button', { name: /Save Rating/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(ratingService.createOrUpdateRating).toHaveBeenCalledWith(123, {
        score: 9,
        notes: null
      });
    });
  });

  it('should show error when submitting without selecting a score', async () => {
    const user = userEvent.setup();
    render(<RateBookModal {...defaultProps} />);
    
    // Try to submit without selecting score
    const saveButton = screen.getByRole('button', { name: /Save Rating/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Please select a rating'),
        'error'
      );
    });
    
    expect(ratingService.createOrUpdateRating).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should pre-fill form with existing rating', () => {
    const props = {
      ...defaultProps,
      existingRating: { score: 7, notes: 'Good book' }
    };
    
    render(<RateBookModal {...props} />);
    
    // Check that 7 stars are selected
    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Rate')
    );
    
    for (let i = 0; i < 7; i++) {
      expect(stars[i].textContent).toBe('★');
    }
    
    // Check score display
    expect(screen.getByText('7/10')).toBeInTheDocument();
    
    // Check notes
    const notesTextarea = screen.getByLabelText(/Notes/i);
    expect(notesTextarea).toHaveValue('Good book');
  });

  it('should handle service error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Network error';
    ratingService.createOrUpdateRating.mockRejectedValue(new Error(errorMessage));
    
    render(<RateBookModal {...defaultProps} />);
    
    // Select score
    const star5 = screen.getByLabelText('Rate 5 out of 10');
    await user.click(star5);
    
    // Submit
    const saveButton = screen.getByRole('button', { name: /Save Rating/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(errorMessage, 'error');
    });
    
    // Modal should stay open
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<RateBookModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable form while submitting', async () => {
    const user = userEvent.setup();
    ratingService.createOrUpdateRating.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<RateBookModal {...defaultProps} />);
    
    // Select score
    const star6 = screen.getByLabelText('Rate 6 out of 10');
    await user.click(star6);
    
    // Submit
    const saveButton = screen.getByRole('button', { name: /Save Rating/i });
    await user.click(saveButton);
    
    // Buttons should be disabled while submitting
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
  });

  it('should show hover preview when hovering over stars', async () => {
    const user = userEvent.setup();
    render(<RateBookModal {...defaultProps} />);
    
    const star5 = screen.getByLabelText('Rate 5 out of 10');
    await user.hover(star5);
    
    // Stars 1-5 should appear selected during hover
    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Rate')
    );
    
    for (let i = 0; i < 5; i++) {
      expect(stars[i].textContent).toBe('★');
    }
  });

  it('should reset hover state when mouse leaves stars', async () => {
    const user = userEvent.setup();
    render(<RateBookModal {...defaultProps} />);
    
    const star5 = screen.getByLabelText('Rate 5 out of 10');
    await user.hover(star5);
    await user.unhover(star5);
    
    // All stars should be unselected
    const stars = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Rate')
    );
    
    stars.forEach(star => {
      expect(star.textContent).toBe('☆');
    });
  });

  it('should support keyboard navigation (Enter key)', async () => {
    const user = userEvent.setup();
    render(<RateBookModal {...defaultProps} />);
    
    const star7 = screen.getByLabelText('Rate 7 out of 10');
    star7.focus();
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('7/10')).toBeInTheDocument();
  });

  it('should support keyboard navigation (Space key)', async () => {
    const user = userEvent.setup();
    render(<RateBookModal {...defaultProps} />);
    
    const star4 = screen.getByLabelText('Rate 4 out of 10');
    star4.focus();
    await user.keyboard(' ');
    
    expect(screen.getByText('4/10')).toBeInTheDocument();
  });

  it('should clear form when modal is closed and reopened without existing rating', () => {
    const { rerender } = render(<RateBookModal {...defaultProps} isOpen={false} />);
    
    // Reopen with existing rating
    rerender(
      <RateBookModal
        {...defaultProps}
        isOpen={true}
        existingRating={{ score: 5, notes: 'Test' }}
      />
    );
    
    expect(screen.getByText('5/10')).toBeInTheDocument();
    
    // Close and reopen without existing rating
    rerender(<RateBookModal {...defaultProps} isOpen={false} existingRating={null} />);
    rerender(<RateBookModal {...defaultProps} isOpen={true} existingRating={null} />);
    
    expect(screen.getByText('Not rated')).toBeInTheDocument();
    const notesTextarea = screen.getByLabelText(/Notes/i);
    expect(notesTextarea).toHaveValue('');
  });
});
