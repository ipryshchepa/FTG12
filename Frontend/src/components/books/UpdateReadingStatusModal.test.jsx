import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpdateReadingStatusModal from './UpdateReadingStatusModal';
import * as readingStatusService from '../../services/readingStatusService';
import { READING_STATUS } from '../../constants';

// Mock readingStatusService
vi.mock('../../services/readingStatusService', () => ({
  updateReadingStatus: vi.fn()
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
    },
    FormSelect: {
      init: vi.fn(() => ({
        destroy: vi.fn()
      }))
    }
  };
});

describe('UpdateReadingStatusModal Component', () => {
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
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    expect(screen.getByRole('heading', { name: /Update Reading Status/i })).toBeInTheDocument();
  });

  it('should render reading status dropdown', () => {
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    expect(screen.getByLabelText(/Reading Status/i)).toBeInTheDocument();
  });

  it('should have all status options in dropdown', () => {
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const dropdown = screen.getByLabelText(/Reading Status/i);
    const options = dropdown.querySelectorAll('option');
    
    // Should have placeholder + 3 status options
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue(''); // Placeholder
    expect(options[1]).toHaveValue(READING_STATUS.BACKLOG);
    expect(options[2]).toHaveValue(READING_STATUS.COMPLETED);
    expect(options[3]).toHaveValue(READING_STATUS.ABANDONED);
  });

  it('should pre-select current status when provided', () => {
    render(
      <UpdateReadingStatusModal
        {...defaultProps}
        currentStatus={READING_STATUS.COMPLETED}
      />
    );
    
    const dropdown = screen.getByLabelText(/Reading Status/i);
    expect(dropdown).toHaveValue(READING_STATUS.COMPLETED);
  });

  it('should default to Backlog when no current status provided', () => {
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const dropdown = screen.getByLabelText(/Reading Status/i);
    expect(dropdown).toHaveValue(READING_STATUS.BACKLOG);
  });

  it('should call updateReadingStatus with correct data when submitting', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockResolvedValue({ status: READING_STATUS.ABANDONED });
    
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const dropdown = screen.getByLabelText(/Reading Status/i);
    await user.selectOptions(dropdown, READING_STATUS.ABANDONED);
    
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(readingStatusService.updateReadingStatus).toHaveBeenCalledWith(123, {
        status: READING_STATUS.ABANDONED
      });
    });
  });

  it('should show success toast after successful update', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockResolvedValue({ status: READING_STATUS.COMPLETED });
    
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const dropdown = screen.getByLabelText(/Reading Status/i);
    await user.selectOptions(dropdown, READING_STATUS.COMPLETED);
    
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Reading status updated', 'success');
    });
  });

  it('should call onSuccess after successful update', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockResolvedValue({ status: READING_STATUS.COMPLETED });
    
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should close modal after successful update', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockResolvedValue({ status: READING_STATUS.COMPLETED });
    
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show error toast when update fails', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockRejectedValue(new Error('Network error'));
    
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Network error', 'error');
    });
  });

  it('should not close modal when update fails', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockRejectedValue(new Error('Network error'));
    
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalled();
    });
    
    // Modal should still be open (onClose not called)
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(readingStatusService.updateReadingStatus).not.toHaveBeenCalled();
  });

  it('should disable form while submitting', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    await user.click(submitButton);
    
    // Check button is disabled and shows loading text
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Updating...');
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelButton).toBeDisabled();
  });

  it('should reset form when modal reopens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <UpdateReadingStatusModal {...defaultProps} currentStatus={READING_STATUS.BACKLOG} />
    );
    
    const dropdown = screen.getByLabelText(/Reading Status/i);
    await user.selectOptions(dropdown, READING_STATUS.COMPLETED);
    
    // Close and reopen modal
    rerender(<UpdateReadingStatusModal {...defaultProps} isOpen={false} currentStatus={READING_STATUS.BACKLOG} />);
    rerender(<UpdateReadingStatusModal {...defaultProps} isOpen={true} currentStatus={READING_STATUS.BACKLOG} />);
    
    // Should reset to current status
    expect(dropdown).toHaveValue(READING_STATUS.BACKLOG);
  });

  it('should clear error when user changes selection', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockRejectedValue(new Error('Network error'));
    
    render(<UpdateReadingStatusModal {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /Update Status/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
    
    // Change selection should clear error
    const dropdown = screen.getByLabelText(/Reading Status/i);
    await user.selectOptions(dropdown, READING_STATUS.COMPLETED);
    
    expect(screen.queryByText('Network error')).not.toBeInTheDocument();
  });

  it('should handle all three status options', async () => {
    const user = userEvent.setup();
    readingStatusService.updateReadingStatus.mockResolvedValue({});
    
    const statuses = [
      READING_STATUS.BACKLOG,
      READING_STATUS.COMPLETED,
      READING_STATUS.ABANDONED
    ];
    
    for (const status of statuses) {
      vi.clearAllMocks();
      
      render(<UpdateReadingStatusModal {...defaultProps} />);
      
      const dropdown = screen.getByLabelText(/Reading Status/i);
      await user.selectOptions(dropdown, status);
      
      const submitButton = screen.getByRole('button', { name: /Update Status/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(readingStatusService.updateReadingStatus).toHaveBeenCalledWith(123, { status });
      });
      
      cleanup();
    }
  });
});
