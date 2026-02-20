import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DeleteBookConfirmation from './DeleteBookConfirmation';
import * as bookService from '../../services/bookService';

// Mock bookService
vi.mock('../../services/bookService', () => ({
  deleteBook: vi.fn()
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

describe('DeleteBookConfirmation Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    bookId: '123',
    bookTitle: 'Test Book',
    onSuccess: mockOnSuccess
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    expect(screen.getByRole('heading', { name: /Delete Book/i })).toBeInTheDocument();
  });

  it('should display book title in confirmation message', () => {
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    expect(screen.getByText(/Test Book/)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('should display warning about cascade deletion', () => {
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByText(/Book rating/i)).toBeInTheDocument();
    expect(screen.getByText(/Reading status/i)).toBeInTheDocument();
    expect(screen.getByText(/All loan history records/i)).toBeInTheDocument();
  });

  it('should render Cancel and Confirm Delete buttons', () => {
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should successfully delete book and call onSuccess', async () => {
    bookService.deleteBook.mockResolvedValueOnce();
    
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find(btn => btn.textContent.includes('Confirm Delete'));
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(bookService.deleteBook).toHaveBeenCalledWith('123');
      expect(mockShowToast).toHaveBeenCalledWith('Book deleted successfully', 'success');
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should show error message when deletion fails', async () => {
    const errorMessage = 'Failed to delete book';
    bookService.deleteBook.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find(btn => btn.textContent.includes('Confirm Delete'));
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(bookService.deleteBook).toHaveBeenCalledWith('123');
      expect(mockShowToast).toHaveBeenCalledWith(errorMessage, 'error');
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('should show loading state while deleting', async () => {
    bookService.deleteBook.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find(btn => btn.textContent.includes('Confirm Delete'));
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Deleting/i })).toBeInTheDocument();
    });
  });

  it('should disable buttons during deletion', async () => {
    bookService.deleteBook.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    const confirmButton = screen.getByText(/Confirm Delete/i);
    const cancelButton = screen.getByText(/Cancel/i);
    
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  it('should show error when bookId is missing', async () => {    
    render(<DeleteBookConfirmation {...defaultProps} bookId={null} />);
    
    const confirmButton = screen.getByText(/Confirm Delete/i);
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Book ID is required', 'error');
      expect(bookService.deleteBook).not.toHaveBeenCalled();
    });
  });

  it('should use default book title when not provided', () => {
    render(<DeleteBookConfirmation {...defaultProps} bookTitle={null} />);
    
    expect(screen.getByText(/this book/i)).toBeInTheDocument();
  });

  it('should handle deletion without onSuccess callback', async () => {
    bookService.deleteBook.mockResolvedValueOnce();
    
    render(<DeleteBookConfirmation {...defaultProps} onSuccess={null} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    });
    
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find(btn => btn.textContent.includes('Confirm Delete'));
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(bookService.deleteBook).toHaveBeenCalledWith('123');
      expect(mockShowToast).toHaveBeenCalledWith('Book deleted successfully', 'success');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should display warning icon in cascade deletion message', () => {
    render(<DeleteBookConfirmation {...defaultProps} />);
    
    const warningSection = screen.getByText(/This action cannot be undone/i).closest('p');
    expect(warningSection).toHaveClass('warning-text', 'red-text');
  });
});
