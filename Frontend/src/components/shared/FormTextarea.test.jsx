import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormTextarea from './FormTextarea';

describe('FormTextarea Component', () => {
  it('should render label and textarea', () => {
    render(
      <FormTextarea
        label="Notes"
        name="notes"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  it('should display value', () => {
    render(
      <FormTextarea
        label="Notes"
        name="notes"
        value="Test notes"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();
  });

  it('should call onChange when value changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    
    render(
      <FormTextarea
        label="Notes"
        name="notes"
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByLabelText(/Notes/i);
    await user.type(textarea, 'New');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should display character count', () => {
    render(
      <FormTextarea
        label="Notes"
        name="notes"
        value="Hello"
        onChange={vi.fn()}
        maxLength={100}
      />
    );

    expect(screen.getByText('5 / 100 characters')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <FormTextarea
        label="Notes"
        name="notes"
        value=""
        onChange={vi.fn()}
        error="Notes are required"
      />
    );

    expect(screen.getByText('Notes are required')).toBeInTheDocument();
  });

  it('should apply invalid class when error exists', () => {
    render(
      <FormTextarea
        label="Notes"
        name="notes"
        value=""
        onChange={vi.fn()}
        error="Error"
      />
    );

    const textarea = screen.getByLabelText(/Notes/i);
    expect(textarea).toHaveClass('invalid');
  });

  it('should respect maxLength attribute', () => {
    render(
      <FormTextarea
        label="Notes"
        name="notes"
        value=""
        onChange={vi.fn()}
        maxLength={500}
      />
    );

    const textarea = screen.getByLabelText(/Notes/i);
    expect(textarea).toHaveAttribute('maxLength', '500');
  });

  it('should set number of rows', () => {
    render(
      <FormTextarea
        label="Notes"
        name="notes"
        value=""
        onChange={vi.fn()}
        rows={6}
      />
    );

    const textarea = screen.getByLabelText(/Notes/i);
    expect(textarea).toHaveAttribute('rows', '6');
  });
});
