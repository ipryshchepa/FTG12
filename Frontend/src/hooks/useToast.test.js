import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast Hook', () => {
  beforeEach(() => {
    global.M.toast.mockClear();
  });

  it('should call M.toast with correct parameters for success', () => {
    const { result } = renderHook(() => useToast());

    result.current.showToast('Success message', 'success');

    expect(global.M.toast).toHaveBeenCalledWith({
      html: 'Success message',
      classes: 'green',
      displayLength: 4000
    });
  });

  it('should call M.toast with correct parameters for error', () => {
    const { result } = renderHook(() => useToast());

    result.current.showToast('Error message', 'error');

    expect(global.M.toast).toHaveBeenCalledWith({
      html: 'Error message',
      classes: 'red',
      displayLength: 4000
    });
  });

  it('should call M.toast with correct parameters for info', () => {
    const { result } = renderHook(() => useToast());

    result.current.showToast('Info message', 'info');

    expect(global.M.toast).toHaveBeenCalledWith({
      html: 'Info message',
      classes: 'blue',
      displayLength: 4000
    });
  });

  it('should default to info type', () => {
    const { result } = renderHook(() => useToast());

    result.current.showToast('Default message');

    expect(global.M.toast).toHaveBeenCalledWith({
      html: 'Default message',
      classes: 'blue',
      displayLength: 4000
    });
  });
});
