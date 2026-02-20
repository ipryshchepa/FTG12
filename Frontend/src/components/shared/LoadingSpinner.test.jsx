import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.preloader-wrapper');
    expect(spinner).toBeInTheDocument();
  });

  it('should display message when provided', () => {
    render(<LoadingSpinner message="Loading books..." />);
    
    expect(screen.getByText('Loading books...')).toBeInTheDocument();
  });

  it('should not display message when not provided', () => {
    const { container } = render(<LoadingSpinner />);
    
    const message = container.querySelector('.loading-message');
    expect(message).not.toBeInTheDocument();
  });
});
