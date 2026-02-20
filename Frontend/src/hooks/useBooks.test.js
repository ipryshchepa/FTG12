import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBooks } from './useBooks';
import * as bookService from '../services/bookService';

vi.mock('../services/bookService');

describe('useBooks Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useBooks());

    expect(result.current.loading).toBe(false);
    expect(result.current.books).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.totalCount).toBe(0);
  });

  it('should fetch books when fetchBooks is called', async () => {
    const mockResponse = {
      items: [
        { id: 1, title: 'Book by Author McAuthorface', author: 'Author McAuthorface' }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10
    };
    bookService.getAllBooks.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBooks());

    await act(async () => {
      await result.current.fetchBooks();
    });

    expect(result.current.books).toEqual(mockResponse.items);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(bookService.getAllBooks).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Failed to fetch books';
    bookService.getAllBooks.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useBooks());

    await act(async () => {
      await result.current.fetchBooks();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.books).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it('should call fetchBooks with provided parameters', async () => {
    const mockResponse = {
      items: [{ id: 1, title: 'First Book' }],
      totalCount: 1,
      page: 2,
      pageSize: 5
    };
    
    bookService.getAllBooks.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBooks());

    const params = {
      page: 2,
      pageSize: 5,
      sortBy: 'Author',
      sortDirection: 'desc'
    };

    await act(async () => {
      await result.current.fetchBooks(params);
    });

    expect(bookService.getAllBooks).toHaveBeenCalledWith(params);
    expect(result.current.books).toEqual(mockResponse.items);
  });
});
