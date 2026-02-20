import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormInput from './FormInput';

describe('FormInput Component', () => {
  it('should render label and input', () => {
    render(
      <FormInput
        label="Book Title"
        name="title"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Book Title/i)).toBeInTheDocument();
  });

  it('should display value', () => {
    render(
      <FormInput
        label="Title"
        name="title"
        value="Test Book"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Test Book')).toBeInTheDocument();
  });

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(
      <FormInput
        label="Title"
        name="title"
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText(/Title/i);
    await user.type(input, 'New');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should show required indicator', () => {
    render(
      <FormInput
        label="Title"
        name="title"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <FormInput
        label="Title"
        name="title"
        value=""
        onChange={vi.fn()}
        error="Title is required"
      />
    );

    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('should apply invalid class when error exists', () => {
    render(
      <FormInput
        label="Title"
        name="title"
        value=""
        onChange={vi.fn()}
        error="Error"
      />
    );

    const input = screen.getByLabelText(/Title/i);
    expect(input).toHaveClass('invalid');
  });

  it('should respect maxLength attribute', () => {
    render(
      <FormInput
        label="Title"
        name="title"
        value=""
        onChange={vi.fn()}
        maxLength={100}
      />
    );

    const input = screen.getByLabelText(/Title/i);
    expect(input).toHaveAttribute('maxLength', '100');
  });
});
