import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoanBookModal from './LoanBookModal';
import * as loanService from '../../services/loanService';
import { MAX_LENGTHS } from '../../constants';

// Mock loanService
vi.mock('../../services/loanService', () => ({
  createLoan: vi.fn()
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

describe('LoanBookModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    bookId: 123,
    onSuccess: mockOnSuccess
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(<LoanBookModal {...defaultProps} />);
    
    expect(screen.getByRole('heading', { name: /Loan Book/i })).toBeInTheDocument();
  });

  it('should render borrower name input', () => {
    render(<LoanBookModal {...defaultProps} />);
    
    expect(screen.getByLabelText(/Borrower Name/i)).toBeInTheDocument();
  });

  it('should allow typing into borrower name input', async () => {
    const user = userEvent.setup();
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, 'Jane Doe');
    
    expect(input).toHaveValue('Jane Doe');
  });

  it('should show error when submitting with empty borrower name', async () => {
    render(<LoanBookModal {...defaultProps} />);
    
    const form = screen.getByRole('button', { name: /Loan Book/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(loanService.createLoan).not.toHaveBeenCalled();
      expect(screen.getByText('Borrower name is required')).toBeInTheDocument();
    });
  });

  it('should have maxLength attribute on input to prevent long names', () => {
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    expect(input).toHaveAttribute('maxlength', String(MAX_LENGTHS.BORROWED_TO));
  });

  it('should call createLoan with correct data when submitting valid form', async () => {
    const user = userEvent.setup();
    loanService.createLoan.mockResolvedValue({ id: 1, borrowedTo: 'Jane Doe' });
    
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, 'Jane Doe');
    
    const submitButton = screen.getByRole('button', { name: /Loan Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(loanService.createLoan).toHaveBeenCalledWith(123, { borrowedTo: 'Jane Doe' });
    });
  });

  it('should show success toast and call onSuccess after successful loan', async () => {
    const user = userEvent.setup();
    loanService.createLoan.mockResolvedValue({ id: 1, borrowedTo: 'Jane Doe' });
    
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, 'Jane Doe');
    
    const submitButton = screen.getByRole('button', { name: /Loan Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Book loaned to Jane Doe', 'success');
    });
    
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show specific error toast when book is already loaned (409)', async () => {
    const user = userEvent.setup();
    const error409 = new Error('Book is already loaned');
    error409.status = 409;
    loanService.createLoan.mockRejectedValue(error409);
    
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, 'Jane Doe');
    
    const submitButton = screen.getByRole('button', { name: /Loan Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Book is already loaned out', 'error');
      expect(screen.getByText('Book is already loaned out')).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show error toast for other errors', async () => {
    const user = userEvent.setup();
    loanService.createLoan.mockRejectedValue(new Error('Network error'));
    
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, 'Jane Doe');
    
    const submitButton = screen.getByRole('button', { name: /Loan Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Network error', 'error');
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should close modal without creating loan when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, 'Jane Doe');
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    expect(loanService.createLoan).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should disable form while submitting', async () => {
    const user = userEvent.setup();
    loanService.createLoan.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, 'Jane Doe');
    
    const submitButton = screen.getByRole('button', { name: /Loan Book/i });
    await user.click(submitButton);
    
    // Check that button is disabled during submission
    expect(screen.getByRole('button', { name: /Loaning.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
  });

  it('should reset form when modal opens', () => {
    const { rerender } = render(<LoanBookModal {...defaultProps} isOpen={false} />);
    
    rerender(<LoanBookModal {...defaultProps} isOpen={true} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    expect(input).toHaveValue('');
  });

  it('should clear error when user starts typing', async () => {
    const user =userEvent.setup();
    render(<LoanBookModal {...defaultProps} />);
    
    // Try to submit with empty field to trigger error
    const form = screen.getByRole('button', { name: /Loan Book/i }).closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Borrower name is required')).toBeInTheDocument();
    });
    
    // Start typing
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, 'J');
    
    // Error should be cleared
    expect(screen.queryByText('Borrower name is required')).not.toBeInTheDocument();
  });

  it('should trim whitespace from borrower name', async () => {
    const user = userEvent.setup();
    loanService.createLoan.mockResolvedValue({ id: 1, borrowedTo: 'Jane Doe' });
    
    render(<LoanBookModal {...defaultProps} />);
    
    const input = screen.getByLabelText(/Borrower Name/i);
    await user.type(input, '  Jane Doe  ');
    
    const submitButton = screen.getByRole('button', { name: /Loan Book/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(loanService.createLoan).toHaveBeenCalledWith(123, { borrowedTo: 'Jane Doe' });
    });
  });
});
