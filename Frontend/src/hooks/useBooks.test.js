import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBooks } from './useBooks';
import * as bookService from '../services/bookService';

vi.mock('../services/bookService');

describe('useBooks Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    bookService.getAllBooks.mockImplementation(() => new Promise(() => {}));
    
    const { result } = renderHook(() => useBooks());

    expect(result.current.loading).toBe(true);
    expect(result.current.books).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should fetch books on mount', async () => {
    const mockBooks = [
      { id: 1, title: 'Book by Author McAuthorface', author: 'Author McAuthorface' }
    ];
    bookService.getAllBooks.mockResolvedValueOnce(mockBooks);

    const { result } = renderHook(() => useBooks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual(mockBooks);
    expect(result.current.error).toBeNull();
    expect(bookService.getAllBooks).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Failed to fetch books';
    bookService.getAllBooks.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useBooks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.books).toEqual([]);
  });

  it('should refresh books when refreshBooks is called', async () => {
    const mockBooks1 = [{ id: 1, title: 'First Book' }];
    const mockBooks2 = [{ id: 1, title: 'First Book' }, { id: 2, title: 'Second Book' }];
    
    bookService.getAllBooks
      .mockResolvedValueOnce(mockBooks1)
      .mockResolvedValueOnce(mockBooks2);

    const { result } = renderHook(() => useBooks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.books).toEqual(mockBooks1);

    result.current.refreshBooks();

    await waitFor(() => {
      expect(result.current.books).toEqual(mockBooks2);
    });

    expect(bookService.getAllBooks).toHaveBeenCalledTimes(2);
  });
});
