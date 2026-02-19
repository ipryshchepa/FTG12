import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage Component', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should display retry button when onRetry provided', () => {
    const mockOnRetry = vi.fn();
    render(<ErrorMessage message="Failed to load" onRetry={mockOnRetry} />);
    
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should not display retry button when onRetry not provided', () => {
    render(<ErrorMessage message="Failed to load" />);
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const mockOnRetry = vi.fn();
    render(<ErrorMessage message="Failed to load" onRetry={mockOnRetry} />);
    
    await user.click(screen.getByText('Retry'));
    
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
});
