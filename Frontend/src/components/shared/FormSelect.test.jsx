import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormSelect from './FormSelect';

describe('FormSelect Component', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ];

  const mockInstance = {
    destroy: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.M.FormSelect.init.mockReturnValue(mockInstance);
  });

  it('should initialize Materialize select', () => {
    render(
      <FormSelect
        label="Status"
        name="status"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    expect(global.M.FormSelect.init).toHaveBeenCalled();
  });

  it('should render label', () => {
    render(
      <FormSelect
        label="Status"
        name="status"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should render all options', () => {
    render(
      <FormSelect
        label="Status"
        name="status"
        value="option1"
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should show required indicator', () => {
    render(
      <FormSelect
        label="Status"
        name="status"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <FormSelect
        label="Status"
        name="status"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
        error="Status is required"
      />
    );

    expect(screen.getByText('Status is required')).toBeInTheDocument();
  });

  it('should destroy instance on unmount', () => {
    const { unmount } = render(
      <FormSelect
        label="Status"
        name="status"
        value=""
        onChange={vi.fn()}
        options={mockOptions}
      />
    );

    unmount();

    expect(mockInstance.destroy).toHaveBeenCalled();
  });
});
