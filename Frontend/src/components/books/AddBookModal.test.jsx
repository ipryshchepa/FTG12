import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBookModal from './AddBookModal';
import * as bookService from '../../services/bookService';

// Mock bookService
vi.mock('../../services/bookService', () => ({
  createBook: vi.fn()
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

// Mock Materialize Modal and FormSelect
const mockModalInstance = {
  open: vi.fn(),
  close: vi.fn(),
  destroy: vi.fn()
};

const mockFormSelectInstance = {
  destroy: vi.fn()
};

beforeEach(() => {
  global.M = {
    Modal: {
      init: vi.fn(() => mockModalInstance)
    },
    FormSelect: {
      init: vi.fn(() => mockFormSelectInstance)
    }
  };
});

describe('AddBookModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(<AddBookModal {...defaultProps} />);
    
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
  });

  it('should not render modal content when isOpen is false', () => {
    render(<AddBookModal {...defaultProps} isOpen={false} />);
    
    // Modal component still renders but Materialize doesn't open it
    expect(mockModalInstance.open).not.toHaveBeenCalled();
  });

  it('should render all form fields', () => {
    render(<AddBookModal {...defaultProps} />);
    
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Author/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ISBN/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Published Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Page Count/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ownership Status/i)).toBeInTheDocument();
  });

  it('should allow typing into text inputs', async () => {
    const user = userEvent.setup();
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    expect(titleInput).toHaveValue('Test Book');
  });

  it('should allow selecting ownership status from dropdown', async () => {
    const user = userEvent.setup();
    render(<AddBookModal {...defaultProps} />);
    
    const select = screen.getByLabelText(/Ownership Status/i);
    await user.selectOptions(select, 'WantToBuy');
    
    expect(select).toHaveValue('WantToBuy');
  });

  it('should show error when submitting with empty title', async () => {
    const user = userEvent.setup();
    render(<AddBookModal {...defaultProps} />);
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    // Wait a bit for validation to run
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // createBook should not have been called due to validation error
    expect(bookService.createBook).not.toHaveBeenCalled();
  });

  it('should show error when submitting with empty author', async () => {
    const user = userEvent.setup();
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    // Wait a bit for validation to run
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // createBook should not have been called due to validation error
    expect(bookService.createBook).not.toHaveBeenCalled();
  });

  it('should prevent title input exceeding 100 characters', async () => {
    const user = userEvent.setup();
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    const longTitle = 'a'.repeat(150);
   await user.type(titleInput, longTitle);
    
    // Due to maxLength attribute, input should be capped at 100 characters
    expect(titleInput.value.length).toBeLessThanOrEqual(100);
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    bookService.createBook.mockResolvedValue({ id: 1, title: 'Test Book' });
    
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const descriptionInput = screen.getByLabelText(/Description/i);
    await user.type(descriptionInput, 'A test book');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(bookService.createBook).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Book',
          author: 'Author McAuthorface',
          description: 'A test book',
          ownershipStatus: 'Own'
        })
      );
    });
  });

  it('should call onSuccess and onClose after successful submission', async () => {
    const user = userEvent.setup();
    bookService.createBook.mockResolvedValue({ id: 1, title: 'Test Book' });
    
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show success toast after successful submission', async () => {
    const user = userEvent.setup();
    bookService.createBook.mockResolvedValue({ id: 1, title: 'Test Book' });
    
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Book added successfully!', 'success');
    });
  });

  it('should handle error during submission', async () => {
    const user = userEvent.setup();
    bookService.createBook.mockRejectedValue(new Error('Network error'));
    
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Network error', 'error');
    });
    
    // Modal should stay open on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close modal without submitting when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(bookService.createBook).not.toHaveBeenCalled();
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    bookService.createBook.mockResolvedValue({ id: 1, title: 'Test Book' });
    
    const { rerender } = render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
    
    // Reopen modal
    rerender(<AddBookModal {...defaultProps} isOpen={true} />);
    
    // Form should be cleared
    const titleInputAfter = screen.getByLabelText(/Title/i);
    expect(titleInputAfter).toHaveValue('');
  });

  it('should disable form inputs while submitting', async () => {
    const user = userEvent.setup();
    
    // Make createBook take a while to resolve
    bookService.createBook.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ id: 1 }), 100))
    );
    
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    // Check that button shows "Adding..." text
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Adding.../i })).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should validate page count as positive number', async () => {
    const user = userEvent.setup();
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const pageCountInput = screen.getByLabelText(/Page Count/i);
    await user.type(pageCountInput, '-5');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Page count must be a positive number')).toBeInTheDocument();
    });
    
    expect(bookService.createBook).not.toHaveBeenCalled();
  });

  it('should validate published year', async () => {
    const user = userEvent.setup();
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const yearInput = screen.getByLabelText(/Published Year/i);
    await user.type(yearInput, '500');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Year must be between/i)).toBeInTheDocument();
    });
    
    expect(bookService.createBook).not.toHaveBeenCalled();
  });

  it('should convert empty optional fields to null in payload', async () => {
    const user = userEvent.setup();
    bookService.createBook.mockResolvedValue({ id: 1, title: 'Test Book' });
    
    render(<AddBookModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/Title/i);
    await user.type(titleInput, 'Test Book');
    
    const authorInput = screen.getByLabelText(/Author/i);
    await user.type(authorInput, 'Author McAuthorface');
    
    const submitButton = screen.getByRole('button', { name: /Add Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(bookService.createBook).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Book',
          author: 'Author McAuthorface',
          description: null,
          notes: null,
          isbn: null,
          publishedYear: null,
          pageCount: null
        })
      );
    });
  });
});
